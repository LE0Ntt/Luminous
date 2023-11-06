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
function ControlHandler(selectedDevices: any, red: number, green: number, blue: number, kelvin: number, master: number, setFaderValue: Function, emit: Function) {
  const values = { red, green, blue, kelvin, master };

  // https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
  function kelvinToRgb(temperature: any) {
    let temperatureNorm = temperature / 100;
    let red, green, blue;

    // Calculate red
    if (temperatureNorm <= 66) {
      red = 255;
    } else {
      red = temperatureNorm - 60;
      red = 329.698727446 * Math.pow(red, -0.1332047592);
      if (red < 0) red = 0;
      if (red > 255) red = 255;
    }

    // Calculate green
    if (temperatureNorm <= 66) {
      green = temperatureNorm;
      green = 99.4708025861 * Math.log(green) - 161.1195681661;
      if (green < 0) green = 0;
      if (green > 255) green = 255;
    } else {
      green = temperatureNorm - 60;
      green = 288.1221695283 * Math.pow(green, -0.0755148492);
      if (green < 0) green = 0;
      if (green > 255) green = 255;
    }

    // Calculate blue
    if (temperatureNorm >= 66) {
      blue = 255;
    } else {
      if (temperatureNorm <= 19) {
        blue = 0;
      } else {
        blue = temperatureNorm - 10;
        blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        if (blue < 0) blue = 0;
        if (blue > 255) blue = 255;
      }
    }

    return [Math.round(red), Math.round(green), Math.round(blue)];
  }

  function rgbToKelvin(r: number, g: number, b: number) {
    let minTemp = 1000;
    let maxTemp = 40000;
    const eps = 0.4;
    let temp;

    while (maxTemp - minTemp > eps) {
      temp = (maxTemp + minTemp) / 2;
      const rgbApprox = kelvinToRgb(temp);

      if (rgbApprox[2] / rgbApprox[0] >= b / r) {
        maxTemp = temp;
      } else {
        minTemp = temp;
      }
    }
    return Math.round(temp || 0);
  }

  let tempInKelvin = rgbToKelvin(red, green, blue);
  kelvin = ((tempInKelvin - 2220) / 8648) * 255;

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

      switch (device.device_type) {
        case 'RGBDim':
          switch (channel.id.toString()) {
            case '0':
              value = values.master || 0;
              break;
            case '1':
              value = values.red || 0;
              break;
            case '2':
              value = values.green || 0;
              break;
            case '3':
              value = values.blue || 0;
              break;
          }
          break;
        case 'BiColor':
          switch (channel.id.toString()) {
            case '0':
              value = values.master || 0;
              break;
            case '1':
              value = kelvin || 0;
              break;
          }
          break;
        case 'Spot':
        case 'Fill':
        case 'Misc':
          switch (channel.id.toString()) {
            case '0':
              value = values.master || 0;
              break;
          }
          break;
        default:
          console.log('Unbekannter Gerätetyp: ', device.deviceType);
          return;
      }

      if (value !== undefined) {
        deviceData.channels.push({ channelId: channel.id, value });
      }
    });

    dataToSend.push(deviceData);
  });

  emit('bulk_fader_values', dataToSend);
}

export default ControlHandler;
