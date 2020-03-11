# [`node-uvc`](https://joelpurra.com/projects/node-uvc/) Display all camera details

Detects cameras, iterates over all available camera details, and prints them to screen.

# Requirements

- Libraries:
  - [`@ffi-libraries/libuvc-v0.0.6`](https://github.com/node-ffi-libraries/node-ffi-library-libuvc-v0.0.6) for the Node.js wrapper.
  - [`libuvc`](https://ken.tossell.net/libuvc/) for capturing the stream of images.
- Optional:
  - One or more supported, and connected, UVC cameras.

# Usage

```shell
node display-details.js
```

# Output

An unstructured set of available data for all available UVC cameras.
