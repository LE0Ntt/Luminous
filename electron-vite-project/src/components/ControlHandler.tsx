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
function ControlHandler(selectedDevices: any, faderValues: number[], emit: Function) {
  const [master, kelvin, red, green, blue] = faderValues;
  const values = { red, green, blue, kelvin, master };

  interface ChannelData {
    channelId: number;
    value: number;
  }

  interface DeviceData {
    deviceId: number;
    channels: ChannelData[];
  }

  const channelValueMap = {
    RGBDim: {
      '0': { value: values.master },
      '1': { value: values.red },
      '2': { value: values.green },
      '3': { value: values.blue },
    },
    BiColor: {
      '0': { value: values.master },
      '1': { value: values.kelvin },
    },
    Spot: { '0': { value: values.master } },
    Fill: { '0': { value: values.master } },
    HMI: { '0': { value: values.master } },
    Misc: { '0': { value: values.master } },
  };

  const dataToSend = selectedDevices.map((device: any) => {
    const deviceData: DeviceData = {
      deviceId: device.id,
      channels: device.attributes.channel
        .map((channel: any) => {
          const channelSettings = (channelValueMap as any)[device.device_type]?.[channel.id.toString()];
          return channelSettings ? { channelId: channel.id, value: channelSettings.value || 0 } : null;
        })
        .filter((channel: any) => channel !== null),
    };

    return deviceData;
  });

  emit('bulk_fader_values', dataToSend);
}

export default ControlHandler;
