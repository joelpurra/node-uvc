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
const fs = require("fs");
const { join } = require("path");
const { promisify } = require("util");

const { fromPairs, intersection, without, sortBy } = require("lodash");
const YAML = require("yaml");

const ref = require("ref-napi");
const libuvc = require("@ffi-libraries/libuvc-v0.0.6");

const assertLibuvcResult = require("./utilities/assert-libuvc-result");
const { DH_CHECK_P_NOT_SAFE_PRIME } = require("constants");

module.exports = class LibuvcStandardUnits {
  standardUnitsYamlPath = null;
  license = null;
  standardUnits = null;
  controls = null;

  constructor(standardUnitsYamlPath) {
    this.standardUnitsYamlPath = standardUnitsYamlPath
      ? standardUnitsYamlPath
      : join(__dirname, "..", "data", "standard-units.yaml");

    this.readFile = promisify(fs.readFile);
  }

  async initialize() {
    assert.notStrictEqual(this.standardUnitsYamlPath, null);
    assert.strictEqual(this.license, null);
    assert.strictEqual(this.standardUnits, null);
    assert.strictEqual(this.controls, null);

    const standardUnitsYamlFile = await this.readFile(
      this.standardUnitsYamlPath
    );
    const standardUnitsYaml = YAML.parseAllDocuments(
      standardUnitsYamlFile.toString()
    );

    this.license = Object.freeze(standardUnitsYaml[0].contents.toJSON());
    this.standardUnits = Object.freeze(standardUnitsYaml[1].contents.toJSON());

    // TODO: use Object.fromEntries().
    this.controls = fromPairs(
      sortBy(
        Object.entries(this.standardUnits.units)
          .map(([unitName, unit]) =>
            Object.entries(unit.controls).map(([controlName, control]) => {
              const { controls, ...unitWithoutControls } = unit;

              return [
                controlName,
                {
                  ...control,
                  unit: {
                    ...unitWithoutControls,
                  },
                },
              ];
            })
          )
          .reduce(
            (controls, unitControls) => controls.concat(unitControls),
            []
          ),
        ([controlName, control]) => controlName
      )
    );
  }

  async uninitialize() {
    assert.notStrictEqual(this.license, null);
    assert.notStrictEqual(this.standardUnits, null);
    assert.notStrictEqual(this.controls, null);

    this.license = null;
    this.standardUnits = null;
    this.controls = null;
  }
};
