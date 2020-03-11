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

const { Transform } = require("stream");
const ref = require("ref-napi");

module.exports = class FrameStream extends Transform {
  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    });
  }

  _transform(framePointer, encoding, callback) {
    const frame = framePointer.deref();
    const image = ref.reinterpret(frame.data, frame.data_bytes, 0);

    const frameObject = {
      image: image,
      width: frame.width,
      height: frame.height,
      format: frame.format,
      step: frame.step,
      sequence: frame.sequence,
      captureTime: {
        seconds: frame.capture_time.tv_sec,
        microseconds: frame.capture_time.tv_usec
      }
    };

    return callback(null, frameObject);
  }
};
