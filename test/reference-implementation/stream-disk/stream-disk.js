/* Software License Agreement (BSD License)
 *
 * Copyright (C) 2010-2015 Ken Tossell
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of the author nor other contributors may be
 *    used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

// #include "libuvc/libuvc.h"
// #include <stdio.h>

const { once } = require("events");
const fs = require("fs");
const util = require("util");
const stream = require("stream");

const ffi = require("ffi-napi");
const ref = require("ref-napi");

const libuvc = require("libuvc");

const finished = util.promisify(stream.finished);
const voidPtr = ref.refType(ref.types.void);

const sleep = async s =>
  new Promise(resolve => {
    setTimeout(resolve, s * 1000);
  });

/* This callback function runs once per frame. Use it to perform any
 * quick processing you need, or have it put the frame into your application's
 * input queue. If this function takes too long, you'll start losing frames. */
async function /* void */ cb(/* uvc_frame_t * */ frame, /* void * */ ptr) {
  const fileWriteStream = ref.readObject(ptr, 0);
  const frameDeref = frame.deref();
  const mjpeg = ref.reinterpret(frameDeref.data, frameDeref.data_bytes, 0);

  if (!fileWriteStream.write(mjpeg)) {
    await once(fileWriteStream, "drain");
  }
}

async function /* int */ main(/* int */ argc, /* char ** */ argv) {
  const filename = "stream-disk.mjpeg";
  const /* uvc_context_t * */ ctx = ref.alloc(libuvc.uvc_context_tPtr);
  const /* uvc_device_t * */ dev = ref.alloc(libuvc.uvc_device_tPtr);
  const /* uvc_device_handle_t * */ devh = ref.alloc(
      libuvc.uvc_device_handle_tPtr
    );
  const /* uvc_stream_ctrl_t */ ctrl = ref.alloc(libuvc.uvc_stream_ctrl_t);
  let /* uvc_error_t */ res;
  /* Initialize a UVC service context. Libuvc will set up its own libusb
   * context. Replace NULL with a libusb_context pointer to run libuvc
   * from an existing libusb context. */
  res = libuvc.libuvc.uvc_init(/* & */ ctx, null);
  if (res < 0) {
    libuvc.libuvc.uvc_perror(res, "uvc_init");
    return res;
  }
  console.log("UVC initialized");
  /* Locates the first attached UVC device, stores in dev */
  res = libuvc.libuvc.uvc_find_device(
    ctx.deref(),
    /* & */ dev,
    0,
    0,
    null
  ); /* filter devices: vendor_id, product_id, "serial_num" */
  if (res < 0) {
    libuvc.libuvc.uvc_perror(res, "uvc_find_device"); /* no devices found */
  } else {
    console.log("Device found");
    /* Try to open the device: requires exclusive access */
    res = libuvc.libuvc.uvc_open(dev.deref(), /* & */ devh);
    if (res < 0) {
      libuvc.libuvc.uvc_perror(res, "uvc_open"); /* unable to open device */
    } else {
      console.log("Device opened");
      /* Print out a message containing all the information that libuvc
       * knows about the device */
      libuvc.libuvc.uvc_print_diag(devh.deref(), null);
      /* Try to negotiate a 640x480 30 fps YUYV stream profile */
      res = libuvc.libuvc.uvc_get_stream_ctrl_format_size(
        devh.deref(),
        /* & */ ctrl /* result stored in ctrl */,
        libuvc.CONSTANTS.uvc_frame_format
          .UVC_FRAME_FORMAT_MJPEG /* MJPEG for writing to disk */,
        640,
        480,
        30 /* width, height, fps */
      );
      /* Print out the result */
      libuvc.libuvc.uvc_print_stream_ctrl(/* & */ ctrl, null);
      if (res < 0) {
        libuvc.libuvc.uvc_perror(
          res,
          "get_mode"
        ); /* device doesn't provide a matching stream */
      } else {
        /* Start the video stream. The library will call user function cb:
         *   cb(frame, (void*) user_ptr)
         */
        const callback = ffi.Callback(
          "void",
          [libuvc.uvc_frame_tPtr, voidPtr],
          cb
        );
        const fileWriteStream = fs.createWriteStream(filename);
        const user_ptr = ref.alloc("Object", fileWriteStream);
        res = libuvc.libuvc.uvc_start_streaming(
          devh.deref(),
          /* & */ ctrl,
          callback,
          user_ptr,
          0
        );
        if (res < 0) {
          fileWriteStream.end();
          await finished(fileWriteStream);
          libuvc.libuvc.uvc_perror(
            res,
            "start_streaming"
          ); /* unable to start stream */
        } else {
          console.log("Streaming...");
          libuvc.libuvc.uvc_set_ae_mode(
            devh.deref(),
            1
          ); /* e.g., turn on auto exposure */
          await sleep(10); /* stream for 10 seconds */
          fileWriteStream.end();
          await finished(fileWriteStream);
          /* End the stream. Blocks until last callback is serviced */
          libuvc.libuvc.uvc_stop_streaming(devh.deref());
          console.log("Done streaming.");
        }
      }
      /* Release our handle on the device */
      libuvc.libuvc.uvc_close(devh.deref());
      console.log("Device closed");
    }
    /* Release the device descriptor */
    libuvc.libuvc.uvc_unref_device(dev.deref());
  }
  /* Close the UVC context. This closes and cleans up any existing device handles,
   * and it closes the libusb context if one was not provided. */
  libuvc.libuvc.uvc_exit(ctx.deref());
  console.log("UVC exited");
  return 0;
}

async function mainWrapper() {
  try {
    await main();
  } catch (error) {
    console.log("main", error);

    process.exitCode = 1;
  }
}

try {
  mainWrapper();
} catch (error) {
  console.error("mainWrapper", error);

  process.exitCode = 1;
}
