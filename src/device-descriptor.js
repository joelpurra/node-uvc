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

const getPointer = require("./utilities/get-pointer");
const getPointers = require("./utilities/get-pointers");

module.exports = class DeviceDescriptor {
  libuvc = null;
  vendorId = null;
  vendorName = null;
  productId = null;
  productName = null;
  serialNumber = null;
  complianceLevel = null;
  pointer = null;

  constructor(libuvc, pointer) {
    assert(libuvc);
    assert(pointer);

    this.libuvc = libuvc;
    this.pointer = pointer;
  }

  async initialize() {
    assert.notStrictEqual(this.pointer, null);

    const uvcDeviceDescriptor = this.pointer.deref().deref();

    this.vendorId = uvcDeviceDescriptor.idVendor;
    this.vendorName = uvcDeviceDescriptor.manufacturer;
    this.productId = uvcDeviceDescriptor.idProduct;
    this.productName = uvcDeviceDescriptor.product;
    this.serialNumber = uvcDeviceDescriptor.serialNumber;
    this.complianceLevel = uvcDeviceDescriptor.bcdUVC;
  }

  async uninitialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.pointer, null);

    this.vendorId = null;
    this.vendorName = null;
    this.productId = null;
    this.productName = null;
    this.serialNumber = null;
    this.complianceLevel = null;

    this.libuvc.functions.uvc_free_device_descriptor(this.pointer.deref());

    this.pointer = null;
  }

  toString() {
    assert.notStrictEqual(this.deviceDescriptor, null);

    return `DeviceDescriptor (vendor 0x${this.vendorId.toString(16)}${
      this.vendorName ? `, "${this.vendorName}"` : ""
    }, product  0x${this.productId.toString(16)}${
      this.productName ? `, "${this.productName}"` : ""
    }${this.serialNumber ? `, serial number ${this.serialNumber}` : ""})`;
  }

  toJSON(key) {
    assert.notStrictEqual(this.deviceDescriptor, null);

    const object = {
      vendor: {
        id: this.vendorId,
        name: this.vendorName
      },
      product: {
        id: this.productId,
        name: this.productName
      },
      serialNumber: this.serialNumber,
      complianceLevel: this.complianceLevel
    };

    return object;
  }
};
