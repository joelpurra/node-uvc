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

module.exports = class LibuvcError extends Error {
  errno = null;

  constructor(libuvc, errno, message) {
    super(message);

    assert(typeof errno === "number");
    assert(typeof message === "string");
    assert(message.length > 0);

    this.errno = errno;

    Object.defineProperty(this, "code", {
      enumerable: true,
      value:
        String(libuvc.constants.uvc_error[this.errno]) || this.errno.toString(),
    });
  }

  toString() {
    return `${super.toString()} (${JSON.stringify(this.code)})`;
  }
};
