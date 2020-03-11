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
const LibuvcStandardUnits = require("./libuvc-standard-units");

module.exports = class Controls {
  libuvc = null;
  deviceHandle = null;
  libuvcStandardUnits = null;

  constructor(libuvc, deviceHandle) {
    assert(libuvc);
    assert(deviceHandle);

    this.libuvc = libuvc;
    this.deviceHandle = deviceHandle;
  }

  static getTypeArray(control) {
    return Object.entries(control.fields)
      .map(
        ([name, field]) => `${field.signed ? "" : "u"}int${field.length * 8}`
      )
      .map(type => ref.alloc(type));
  }

  valueGetterGenerator = (name, control) => () => {
    const valueGetter = this.libuvc.functions[`uvc_get_${name}`];
    const valueGetterArguments = [
      this.deviceHandle.deviceHandle.deref(),
      ...Controls.getTypeArray(control),
      this.libuvc.constants.uvc_req_code.UVC_GET_CUR
    ];
    const result = valueGetter(...valueGetterArguments);

    assertLibuvcResult(
      this.libuvc,
      result,
      `Error getting value for control ${JSON.stringify(name)}.`
    );

    const values = valueGetterArguments
      .slice(1, -1)
      .map(value => value.deref());

    return values;
  };

  valueSetterGenerator = name => value => {
    const valueSetter = this.libuvc.functions[`uvc_set_${name}`];
    const setterArguments = [this.deviceHandle.deviceHandle.deref()].concat(
      value
    );
    const result = valueSetter(...setterArguments);

    assertLibuvcResult(
      this.libuvc,
      result,
      `Error setting value ${JSON.stringify(
        value
      )} for control ${JSON.stringify(name)}.`
    );
  };

  async initialize() {
    assert.notStrictEqual(this.deviceHandle, null);
    assert.strictEqual(this.libuvcStandardUnits, null);

    this.libuvcStandardUnits = new LibuvcStandardUnits();
    await this.libuvcStandardUnits.initialize();

    for (const [name, control] of Object.entries(
      this.libuvcStandardUnits.controls
    )) {
      const longName = control.control.toLowerCase();

      this[longName] = {
        // NOTE: asynchronous getter.
        get: async () => this.valueGetterGenerator(name, control)(),
        // NOTE: asynchronous setter.
        set: async value => this.valueSetterGenerator(name)(value)

        // TODO: fix ffi-generate to output the uvc_ct_ctrl_selector constants, then use them for uvc_get_ctrl(...).
        // TODO: move/copy uvc_ct_ctrl_selector to standard-units.yaml?
        // TODO: use uvc_ct_ctrl_selector for the "regular" control value getters/setters?
        // min: minGetterGenerator(name),
        // max: maxGetterGenerator(name),
        // def: defGetterGenerator(name),
        // info: infoGetterGenerator(name)
      };
    }

    // TODO: seal self to avoid accidental controls.typo = 999;
    Object.seal(this);
  }

  async uninitialize() {
    assert.notStrictEqual(this.libuvc, null);
    assert.notStrictEqual(this.deviceHandle, null);
    assert.notStrictEqual(this.libuvcStandardUnits, null);

    await this.libuvcStandardUnits.uninitialize();
    this.libuvcStandardUnits = null;
  }
};
