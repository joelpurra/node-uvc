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

module.exports = {
  Context: require("./context"),
  Controls: require("./controls"),
  Device: require("./device"),
  DeviceDescriptor: require("./device-descriptor"),
  DeviceHandle: require("./device-handle"),
  FrameStream: require("./frame-stream"),
  FrameStreamer: require("./frame-streamer"),
  LibUvc: require("./libuvc"),
  LibuvcStandardUnits: require("./libuvc-standard-units"),
};
