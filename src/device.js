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

const ref = require("ref-napi");
const libuvc = require("@ffi-libraries/libuvc-v0.0.6");

const DeviceHandle = require("./device-handle");
const DeviceDescriptor = require("./device-descriptor");

module.exports = class Device {
  pointer = null;
  libuvc = null;

  constructor(libuvc, pointer) {
    assert(libuvc);
    assert(pointer);

    this.libuvc = libuvc;
    this.pointer = pointer;
  }

  async initialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.pointer, null);
  }

  async uninitialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.pointer, null);

    this.libuvc.functions.uvc_unref_device(this.pointer.deref());
    this.pointer = null;
  }

  async open() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.pointer, null);

    const deviceHandlePointer = ref.alloc(
      this.libuvc.types.uvc_device_handle_tPointer
    );

    const result = this.libuvc.functions.uvc_open(
      this.pointer.deref(),
      deviceHandlePointer
    );

    if (result !== 0) {
      throw new Error(`this.libuvc.functions.uvc_open(...): ${result}`);
    }

    const deviceHandle = new DeviceHandle(this.libuvc, deviceHandlePointer);

    return deviceHandle;
  }

  async getDescriptor() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.pointer, null);

    const deviceDescriptorPointer = ref.alloc(
      this.libuvc.types.uvc_device_descriptor_tPointer
    );

    const result = this.libuvc.functions.uvc_get_device_descriptor(
      this.pointer.deref(),
      deviceDescriptorPointer
    );

    if (result !== 0) {
      throw new Error(
        `this.libuvc.functions.uvc_get_device_descriptor(...): ${result}`
      );
    }

    const deviceDescriptor = new DeviceDescriptor(
      this.libuvc,
      deviceDescriptorPointer
    );

    return deviceDescriptor;
  }
};
