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

const { intersection, without } = require("lodash");

const ref = require("ref-napi");
const libuvc = require("@ffi-libraries/libuvc-v0.0.6");

const assertLibuvcResult = require("./utilities/assert-libuvc-result");

module.exports = class DeviceHandle {
  libuvc = null;
  deviceHandle = null;

  constructor(libuvc, deviceHandle) {
    assert(libuvc);
    assert(deviceHandle);

    this.libuvc = libuvc;
    this.deviceHandle = deviceHandle;
  }

  async initialize() {
    assert.notStrictEqual(this.deviceHandle, null);
  }

  async uninitialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.deviceHandle, null);

    this.libuvc.functions.uvc_close(this.deviceHandle.deref());
    this.deviceHandle = null;
  }

  async getControlLength(unit, control) {
    assert(unit >= 0);
    assert(control >= 0);

    return this.libuvc.functions.uvc_get_ctrl_len(
      this.deviceHandle.deref(),
      unit,
      control
    );
  }
};
