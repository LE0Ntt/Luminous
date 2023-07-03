function ControlHandler(selectedDevices: any, red: number, green: number, blue: number, kelvin: number, master: number, setFaderValue: Function, emit: Function) {
  const values = {red, green, blue, kelvin, master};
  console.log(selectedDevices)
  selectedDevices.forEach((device: any) => {
    device.attributes.channel.forEach((channel: any) => {
      let value;
      switch(device.deviceType) {
        case "RGBDim":
          switch(channel.id.toString()) {
            case '0': value = values.master || 0; break;
            case '1': value = values.red || 0; break;
            case '2': value = values.green || 0; break;
            case '3': value = values.blue || 0; break;
          }
          console.log('setFaderValue', device.id, channel.id, value)
          setFaderValue(device.id, channel.id, value);
          emit('setFaderValue', { deviceId: device.id, channelId: channel.id, value });
          break;
        case "BiColor":
          switch(channel.id.toString()) {
            case '0': value = values.master || 0; break;
            case '1': value = values.red || 0; break; // muss noch durch kelvin ersetzt werden
          }
          console.log('setFaderValue', device.id, channel.id, value)
          setFaderValue(device.id, channel.id, value);
          break;
        default:
          console.log("Unbekannter Gerätetyp: ", device.deviceType);
      }
    });
});

}

export default ControlHandler;