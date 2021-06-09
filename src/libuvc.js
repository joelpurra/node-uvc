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

const { fromPairs } = require("lodash");

const ref = require("ref-napi");
const { load } = require("@ffi-libraries/libuvc-v0.0.6");

const Device = require("./device");

const getPointer = require("./utilities/get-pointer");
const getPointers = require("./utilities/get-pointers");
const { maxNumberOfUvcDevices } = require("./utilities/constants");

module.exports = class LibUvc {
  library = null;

  // TODO: dynamically select the header file for the current operating system.
  headerFile = "./include/libuvc/libuvc.h";

  header = null;

  async initialize() {
    assert.strictEqual(this.library, null);
    assert.strictEqual(this.header, null);

    this.library = await load();
    const headerLoader = this.library.headers[this.headerFile];
    this.header = await headerLoader();

    Object.defineProperties(this, {
      constants: {
        configurable: true,
        get: () => this.header.constants,
      },
      functions: {
        configurable: true,
        get: () => this.header.functions,
      },
      types: {
        configurable: true,
        get: () => this.header.types,
      },
    });
  }

  async uninitialize() {
    assert.notStrictEqual(this.library, null);
    assert.notStrictEqual(this.header, null);

    delete this.constants;
    delete this.functions;
    delete this.types;

    this.header = null;
    this.library = null;
  }
};
