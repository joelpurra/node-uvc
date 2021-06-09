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

const Device = require("./device");

const getPointer = require("./utilities/get-pointer");
const getPointers = require("./utilities/get-pointers");
const { maxNumberOfUvcDevices } = require("./utilities/constants");

module.exports = class Context {
  libuvc = null;
  usbContext = null;
  uvcContext = null;

  constructor(libuvc, uvcContext = null, usbContext = null) {
    assert(libuvc);

    this.libuvc = libuvc;
    this.uvcContext = uvcContext;
    this.usbContext = usbContext;
  }

  async initialize() {
    assert.notStrictEqual(this.libuvc, null);

    if (this.uvcContext === null) {
      this.uvcContext = ref.alloc(this.libuvc.types.uvc_context_tPointer);
    }

    {
      const result = this.libuvc.functions.uvc_init(
        this.uvcContext,
        this.usbContext
      );

      if (result !== 0) {
        throw new Error(`this.libuvc.functions.uvc_init(...): ${result}`);
      }
    }
  }

  async uninitialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.uvcContext, null);

    this.libuvc.functions.uvc_exit(this.uvcContext.deref());
    this.uvcContext = null;
  }

  async getDeviceList() {
    assert.notStrictEqual(this.context, null);

    // TODO: better ffi-generate support for lists.
    const deviceListPointer = Buffer.alloc(
      maxNumberOfUvcDevices * ref.types.size_t.size
    );

    const result = this.libuvc.functions.uvc_get_device_list(
      this.uvcContext.deref(),
      deviceListPointer
    );

    if (result !== 0) {
      throw new Error(
        `this.libuvc.functions.uvc_get_device_list(...): ${result}`
      );
    }

    const pointerToDevicePointer = (pointer) =>
      ref.get(pointer, 0, this.libuvc.types.uvc_device_tPointer);

    const devicePointers = getPointers(maxNumberOfUvcDevices, deviceListPointer)
      .map(pointerToDevicePointer)
      .filter((devicePointer) => !ref.isNull(devicePointer.deref()));

    const devices = devicePointers.map(
      (devicePointer) => new Device(this.libuvc, devicePointer)
    );

    return devices;
  }

  async findDevice(vendorId = 0, productId = 0, serialNumber = null) {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.uvcContext, null);

    const devicePointer = ref.alloc(this.libuvc.types.uvc_device_tPointer);

    const result = this.libuvc.functions.uvc_find_device(
      this.uvcContext.deref(),
      devicePointer,
      vendorId,
      productId,
      serialNumber
    );

    if (result !== 0) {
      throw new Error(`this.libuvc.functions.uvc_find_device(...): ${result}`);
    }

    const device = new Device(this.libuvc, devicePointer);

    return device;
  }
};
