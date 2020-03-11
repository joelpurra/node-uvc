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

const Bluebird = require("bluebird");

const {
  Context,
  Device,
  DeviceDescriptor,
  DeviceHandle,
  FrameStreamer,
  LibUvc
} = require("../../");

const main = async () => {
  const libuvc = new LibUvc();
  await libuvc.initialize();

  const context = new Context(libuvc, null, null);
  await context.initialize();

  const devices = context.getDeviceList();
  await Bluebird.map(devices, device => device.initialize());

  const deviceDescriptors = await Bluebird.map(devices, device =>
    device.getDescriptor()
  );

  await Bluebird.map(deviceDescriptors, deviceDescriptor =>
    deviceDescriptor.initialize()
  );

  console.log(deviceDescriptors);

  // Bluebird.each(deviceDeviceDescriptors, async deviceDeviceDescriptor => {
  // const device = new Device(
  //   libuvc,
  //   context,
  //   device.vendor.id,
  //   device.product.id,
  //   device.serialNumber,
  //   libuvc
  // );
  // await device.initialize();

  // const deviceHandle = new DeviceHandle(libuvc, device);
  // await deviceHandle.initialize();

  // await deviceHandle.uninitialize();
  // await device.uninitialize();
  // });

  await Bluebird.map(deviceDescriptors, deviceDescriptor =>
    deviceDescriptor.uninitialize()
  );
  await Bluebird.map(devices, device => device.uninitialize());
  await context.uninitialize();
  await libuvc.uninitialize();
};

const mainWrapper = async () => {
  try {
    await main();
  } catch (error) {
    console.error("main", error);

    process.exitCode = 1;
  }
};

try {
  mainWrapper();
} catch (error) {
  console.error("mainWrapper", error);

  process.exitCode = 1;
}
