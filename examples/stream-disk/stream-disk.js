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

const { once } = require("events");
const fs = require("fs");
const util = require("util");
const stream = require("stream");

const {
  Context,
  Controls,
  Device,
  DeviceHandle,
  FrameStreamer,
  LibUvc
} = require("../../");

const { Transform } = stream;
const finished = util.promisify(stream.finished);

const sleep = async s =>
  new Promise(resolve => {
    setTimeout(resolve, s * 1000);
  });

class FrameImageTransform extends Transform {
  constructor() {
    super({
      writableObjectMode: true
    });
  }

  _transform(frame, encoding, callback) {
    if (frame.sequence % 30 == 0) {
      console.log("* got image", frame.sequence);
    }

    return callback(null, frame.image);
  }
}

const main = async () => {
  const filename = "stream-disk.mjpeg";

  const libuvc = new LibUvc();
  await libuvc.initialize();

  const context = new Context(libuvc);
  await context.initialize();

  const device = await context.findDevice();
  await device.initialize();

  const deviceHandle = await device.open();
  await deviceHandle.initialize();

  const controls = new Controls(libuvc, deviceHandle);
  await controls.initialize();

  // https://ken.tossell.net/libuvc/doc/group__ctrl.html#gaa583133ed035c141c42061d5c13a36bf
  const UVC_AUTO_EXPOSURE_MODE_AUTO = 2;
  const UVC_AUTO_EXPOSURE_MODE_APERTURE_PRIORITY = 8;

  try {
    await controls.ae_mode.set(UVC_AUTO_EXPOSURE_MODE_AUTO);
  } catch (error) {
    if (error.code === "UVC_ERROR_PIPE") {
      await controls.ae_mode.set(UVC_AUTO_EXPOSURE_MODE_APERTURE_PRIORITY);
    } else {
      throw error;
    }
  }

  const frameStreamer = new FrameStreamer(
    libuvc,
    deviceHandle,
    libuvc.constants.uvc_frame_format.UVC_FRAME_FORMAT_MJPEG,
    640,
    480,
    30
  );
  const frameStream = await frameStreamer.initialize();

  const frameImageTransform = new FrameImageTransform();
  const fileWriteStream = fs.createWriteStream(filename);
  frameStream.pipe(frameImageTransform).pipe(fileWriteStream);

  console.log("Streaming...");

  await sleep(10);

  fileWriteStream.end();
  await finished(fileWriteStream);
  await frameStreamer.uninitialize();
  await controls.uninitialize();
  await deviceHandle.uninitialize();
  await device.uninitialize();
  await context.uninitialize();
  await libuvc.uninitialize();
};

const mainWrapper = async () => {
  try {
    await main();
  } catch (error) {
    console.error("main", error);

    process.exitCode = 1;
  }
};

try {
  mainWrapper();
} catch (error) {
  console.error("mainWrapper", error);

  process.exitCode = 1;
}
