# [`node-uvc`](https://joelpurra.com/projects/node-uvc/) Stream webcam video to disk

Tests that a compatible camera is connected, stream 10 seconds of video (image frames), and saves them to a file on disk.

This is the [`libuvc` documentation example](https://ken.tossell.net/libuvc/doc/) by [Ken Tossell](https://ken.tossell.net/) converted to javascript in [`node-libuvc`](https://joelpurra.com/projects/node-libuvc/), but it saves the video to disk.

# Requirements

- Libraries:
  - [`node-libuvc`](https://joelpurra.com/projects/node-libuvc/) for the Node.js wrapper.
  - [`libuvc`](https://ken.tossell.net/libuvc/) for capturing the stream of images.
- Optional:
  - [`ffmpeg`](https://ffmpeg.org/) to convert from [Motion JPEG](https://en.wikipedia.org/wiki/Motion_JPEG) to a different format.
- A supported, and connected, UVC camera.

# Usage

See the terminal for some debugging output, and the output file `stream-disk.mjpeg`.

```shell
node stream-disk.js
```

# Output

The output file is `stream-disk.mjpeg`. See [file formats](../README.md#file-formats) for convenient conversions.

---

[`node-uvc`](https://joelpurra.com/projects/node-uvc/) Copyright &copy; 2020 [Joel Purra](https://joelpurra.com/). Released under [GNU Lesser General Public License version 3.0 (LGPL-3.0)](https://www.gnu.org/licenses/lgpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
