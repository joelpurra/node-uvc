# [Node.js library for USB Video Class (UVC) devices](https://joelpurra.com/projects/node-uvc/) (`node-uvc`)

Node.js library for [USB Video Class](https://en.wikipedia.org/wiki/USB_video_device_class) (UVC) devices. Used to write software for webcams, camcorders, etcetera.

[UVC-compliant devices](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices) include webcams, digital camcorders, transcoders, analog video converters and still-image cameras.

- To change settings of your UVC camera from the command line, use [`uvcc`](https://joelpurra.com/projects/uvcc).

## Features

- None so far?

## Installation

Requires [Node.js](https://nodejs.org/) (`node` and `npm` commands). Published on npm as [`uvc`](https://www.npmjs.com/package/uvc).

```shell
npm install --save uvc
```

## Usage

```javascript
// TODO
```

## Development

Get the source code from the [`node-uvc` repository](https://github.com/joelpurra/node-uvc).

Follow [git-flow](https://danielkummer.github.io/git-flow-cheatsheet/) and use [git-flow-avh](https://github.com/petervanderdoes/gitflow-avh).

```shell
# Make sure git-flow is initialized.
git flow init -d

npm run --silent test
```

## See also

- [`uvcc`](https://joelpurra.com/projects/uvcc) for a command line interface (CLI).
- [USB Video Class](https://en.wikipedia.org/wiki/USB_video_device_class) on Wikipedia.
- [List of USB video class devices](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices) on Wikipedia.
- The [`@ffi-libraries/libuvc-v0.0.6`](https://github.com/node-ffi-libraries/node-ffi-library-libuvc-v0.0.6) Node.js wrapper for [`libuvc`](https://ken.tossell.net/libuvc/).
- The [`v4l-utils`](https://linuxtv.org/wiki/index.php/V4l-utils) for [video4linux](https://www.linuxtv.org) ([Wikipedia](https://en.wikipedia.org/wiki/Video4Linux)), which includes [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).

---

[`node-uvc`](https://joelpurra.com/projects/node-uvc/) Copyright &copy; 2020, 2021 [Joel Purra](https://joelpurra.com/). Released under [GNU Lesser General Public License version 3.0 (LGPL-3.0)](https://www.gnu.org/licenses/lgpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
