/**
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 *
 * @file ControlHandler.tsx
 */
function ControlHandler(selectedDevices: any, faderValues: number[], changedFaders: boolean[], emit: Function) {
  const [master, kelvin, red, green, blue] = faderValues;
  const [masterChanged, kelvinChanged, redChanged, greenChanged, blueChanged] = changedFaders;
  const values = { red, green, blue, kelvin, master };

  interface ChannelData {
    channelId: number;
    value: number;
  }

  interface DeviceData {
    deviceId: number;
    channels: ChannelData[];
  }

  let dataToSend: DeviceData[] = [];

  selectedDevices.forEach((device: any) => {
    let deviceData: DeviceData = {
      deviceId: device.id,
      channels: [],
    };

    device.attributes.channel.forEach((channel: any) => {
      let value: number | undefined;
      let valueChanged = false;

      const channelValueMap = {
        RGBDim: {
          '0': { value: values.master, changed: masterChanged },
          '1': { value: values.red, changed: redChanged },
          '2': { value: values.green, changed: greenChanged },
          '3': { value: values.blue, changed: blueChanged },
        },
        BiColor: {
          '0': { value: values.master, changed: masterChanged },
          '1': { value: values.kelvin, changed: kelvinChanged },
        },
        Spot: { '0': { value: values.master, changed: masterChanged } },
        Fill: { '0': { value: values.master, changed: masterChanged } },
        HMI: { '0': { value: values.master, changed: masterChanged } },
        Misc: { '0': { value: values.master, changed: masterChanged } },
      };

      const channelSettings = (channelValueMap as any)[device.device_type]?.[channel.id.toString()];
      if (channelSettings) {
        value = channelSettings.value || 0;
        valueChanged = channelSettings.changed;
      }

      if (value !== undefined && valueChanged) {
        deviceData.channels.push({ channelId: channel.id, value });
      }
    });

    dataToSend.push(deviceData);
  });

  emit('bulk_fader_values', dataToSend);
}

export default ControlHandler;
