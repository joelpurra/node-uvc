/*
This file is part of node-uvc -- Library for USB Video Class (UVC) devices.
Copyright (C) 2020 Joel Purra <https://joelpurra.com/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const assert = require("assert");
const stream = require("stream");
const util = require("util");

const ffi = require("ffi-napi");
const ref = require("ref-napi");
const libuvc = require("@ffi-libraries/libuvc-v0.0.6");

const FrameStream = require("./frame-stream");

const finished = util.promisify(stream.finished);
const js_void = ref.types.void;
const js_voidPointer = ref.refType(js_void);

module.exports = class FrameStreamer {
  libuvc = null;
  deviceHandle = null;
  format = null;
  width = 0;
  height = 0;
  fps = 0;
  deviceHandle = null;
  frameStream = null;
  onFrameCallback = null;

  constructor(libuvc, deviceHandle, format, width, height, fps) {
    assert(libuvc);
    assert(deviceHandle);
    assert(format > 0);
    assert(width > 0);
    assert(height > 0);
    assert(fps > 0);

    this.libuvc = libuvc;
    this.deviceHandle = deviceHandle;
    this.format = format;
    this.width = width;
    this.height = height;
    this.fps = fps;
  }

  async initialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.deviceHandle, null);
    assert.strictEqual(this.frameStream, null);
    assert.strictEqual(this.onFrameCallback, null);

    const controlBlockFormatSize = ref.alloc(
      this.libuvc.types.uvc_stream_ctrl_t
    );

    {
      const result = this.libuvc.functions.uvc_get_stream_ctrl_format_size(
        this.deviceHandle.deviceHandle.deref(),
        controlBlockFormatSize,
        this.format,
        this.width,
        this.height,
        this.fps
      );

      if (result !== 0) {
        throw new Error(
          `this.libuvc.functions.uvc_get_stream_ctrl_format_size(...): ${result}`
        );
      }
    }

    {
      this.frameStream = new FrameStream();
      this.onFrameCallback = ffi.Callback(
        "void",
        [this.libuvc.types.uvc_frame_tPointer, js_voidPointer],
        (frame, userPointer) => this.frameStream.write(frame)
      );

      // NOTE: keeping state in the class rather than in the user pointer.
      // Creation: const userPointer = ref.alloc("Object", anything);
      // Consumption in callback: const anything = ref.readObject(userPointer, 0);
      const userPointer = ref.NULL_POINTER;

      // NOTE: Stream setup flags, currently undefined. Set this to zero. The lower bit is reserved for backward compatibility.
      // https://ken.tossell.net/libuvc/doc/group__streaming.html#gaa7edf40956feeca14794f6cd6462e316
      const streamSetupFlags = 0;

      const result = this.libuvc.functions.uvc_start_streaming(
        this.deviceHandle.deviceHandle.deref(),
        controlBlockFormatSize,
        this.onFrameCallback,
        userPointer,
        streamSetupFlags
      );

      if (result !== 0) {
        throw new Error(
          `this.libuvc.functions.uvc_start_streaming(...): ${result}`
        );
      }
    }

    return this.frameStream;
  }

  async uninitialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.deviceHandle, null);
    assert.notStrictEqual(this.onFrameCallback, null);
    assert.notStrictEqual(this.frameStream, null);

    this.libuvc.functions.uvc_stop_streaming(
      this.deviceHandle.deviceHandle.deref()
    );

    this.onFrameCallback = null;

    this.frameStream.end();

    // TODO: figure out why the application crashes silently when waiting to finish the writable part of the transform stream.
    await finished(this.frameStream, {
      writable: false,
    });

    this.frameStream = null;
  }
};
