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
 * @file LightSettings.tsx
 */
import { useState, useContext, useEffect, useCallback } from 'react';
import './LightSettings.css';
import Button from './Button';
import '../index.css';
import { TranslationContext } from './TranslationContext'
import DeviceList from './DeviceList';
import { useConnectionContext } from './ConnectionContext';
import AdminPassword from './AdminPassword';

interface SettingsProps {
  onClose: () => void;
}

function LightSettings({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>();
  const [unselectedDevices, setUnselectedDevices] = useState<DeviceConfig[]>([]);
  const [inputName, setInputName] = useState('');
  const [inputDMXstart, setInputDMXstart] = useState('');
  const [inputDMXrange, setInputDMXrange] = useState('');
  const [inputUniverse, setInputUniverse] = useState('');
  const [inputType, setInputType] = useState('');
  const [inputNumber, setInputNumber] = useState('');
  const [channelArray, setChannelArray] = useState<Array<{ id: number; dmx_channel: string; channel_type: string }>>([]);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [istDelete, setIsDelete] = useState(false); // False = update/create device, true = delete device

  const LampTypeChannels:{ [key: string]: string[] } = {
    'RGBDim':  ['main', 'r', 'g', 'b'],
    'BiColor': ['main', 'bi'],
    'Spot':    ['main'],
    'Fill':    ['main'],
    'Misc':    ['main']
  };

  interface DeviceConfig {
    attributes: any;
    device_type: string;
    universe: string;
    id: number;
    deviceValue: number;
    name: string;
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try { 
      const response = await fetch(url + '/fader');
      const data = await response.json();
      const parsedData = JSON.parse(data);
      parsedData.shift(); // remove master
      setDevices(parsedData);
      setUnselectedDevices(parsedData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Limit the name to 20 characters
    const inputValue = event.target.value.length > 20 ? event.target.value.slice(0, 20) : event.target.value;
    setInputName(inputValue);
  };

  const handleInputNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers between 1 and 691 for the device number. Limit from MotorMix: 7*99-2
    const inputValue = event.target.value === '' ? 1 : parseInt(event.target.value);
    setInputNumber(inputValue.toString());
    if (inputValue > 691) {
      setInputNumber("691");
    } else if (inputValue < 1) {
      setInputNumber("1");
    }
  };

  const handleInputDMXstart = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers between 1 and (512 - (DMX range + 1)) for the DMX start channel
    const inputValue = event.target.value === '' ? 1 : parseInt(event.target.value);
    setInputDMXstart(inputValue.toString());
  
    const maxDMXrange = 513 - parseInt(inputDMXrange);
    if (inputValue < 1) {
      setInputDMXstart("1");
    } else if (inputValue > maxDMXrange) {
      setInputDMXstart(maxDMXrange.toString());
    }
  };
  
  const handleInputDMXrange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers between 1 and (512 - (DMX start + 1)) for the DMX range
    const inputValue = event.target.value === '' ? 1 : parseInt(event.target.value);
    setInputDMXrange(inputValue.toString());
  
    const maxDMXstart = 513 - parseInt(inputDMXstart);
    if (inputValue < 1) {
      setInputDMXrange("1");
    } else if (inputValue > maxDMXstart) {
      setInputDMXrange(maxDMXstart.toString());
    }
  };

  const handleInputUniverse = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputUniverse(e.target.value);
  };

  const handleInputType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setInputType(value);

    // Set the DMX range to the number of channels of the selected device type
    const valueChannels = LampTypeChannels[value];
    if ( valueChannels) {
      setInputDMXrange(valueChannels.length.toString());
    }
  };

  const handleSelectDevice = (device: DeviceConfig) => {
    setSelectedDevice(device);
    setUnselectedDevices(devices.filter(item => item.id !== device.id));
    setIsNewDevice(false);
    setInputName(device.name);
    setInputDMXstart(device.attributes.channel[0].dmx_channel);
    setInputDMXrange(device.attributes.channel.length.toString());
    setInputUniverse(device.universe);
    setInputType(device.device_type);
    setInputNumber(device.id.toString());
  };

  const handleDeselectDevice = (device: DeviceConfig) => {
    setSelectedDevice(undefined);
    setUnselectedDevices([...unselectedDevices, device]);
    setIsNewDevice(false);
  };

  const handleCreateDevice = () => {
    setIsNewDevice(true);

    const newDevice: DeviceConfig = {
      id: devices.length + 1,
      deviceValue: 0,
      name: t("ls_newDevice"),
      attributes: undefined,
      device_type: '',
      universe: ''
    };
    
    setInputName(t("ls_newDevice"));
    setSelectedDevice(newDevice);
    setInputDMXstart('1');
    setInputDMXrange('4');
    setInputUniverse('U1');
    setInputType('RGBDim');
    setInputNumber(newDevice?.id.toString() || '1');
  };

  // Set the initial channel array
  const createInitialChannelArray = () => {
    const initialChannels = Array.from({ length: parseInt(inputDMXrange) }, (_, index) => {
      const startChannel = parseInt(inputDMXstart) + index;
      return {
        id: index,
        channel_type: LampTypeChannels[inputType]?.[index] || 'misc',
        dmx_channel: startChannel.toString()
      };
    });
    setChannelArray(initialChannels);
  };
  
  useEffect(() => {
    createInitialChannelArray();
  }, [inputDMXrange, inputDMXstart, inputType]);

  const handleChannelChange = (index: number, type: any, channel: string) => {
    // Only allow numbers between 1 and 512 for the channel
    var inputValue = channel === '' ? 1 : parseInt(channel);
    
    if (inputValue > 512) {
      inputValue = 512;
    } else if (inputValue < 1) {
      inputValue = 1;
    }

    channel = inputValue.toString()

    // Limit the name to 20 characters
    type = type.length > 20 ? type.slice(0, 20) : type;
    

    const updatedChannelArray = [...channelArray];
    updatedChannelArray[index] = { id: index, channel_type: type, dmx_channel: channel };
    setChannelArray(updatedChannelArray);
  }

  const handleUpdateDevice = () => {
    setIsDelete(false);
    setShowAdminPassword(true);
  };

  const updateDevice = () => {
    if(isNewDevice) { // Create new device
      fetch(url + '/addlight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: inputName, 
          number: inputNumber, 
          device_type: inputType, 
          universe: inputUniverse,
          attributes: {
            channel: channelArray.map(channel => ({
              id: channel.id,
              dmx_channel: channel.dmx_channel,
              channel_type: channel.channel_type
            }))
          }
        })
      })
      .then(response => response.json())
      .then(data => {
        if(data.message === 'success') {
          console.log('Device successfully updated');
          setSelectedDevice(undefined);
          fetchDevices();
        } else if(data.message === 'number_in_use'){
          console.log('Number already in use');
          const textBox = document.getElementsByClassName('deviceNumber')[0] as HTMLInputElement;
          textBox.focus();
          textBox.style.outline = '2px solid red';
          textBox.style.outlineOffset =  "-1px";
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    } else { // If device already exists update it
      fetch(url + '/updatelight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: selectedDevice?.id,
          name: inputName, 
          number: inputNumber, 
          device_type: inputType, 
          universe: inputUniverse,
          attributes: {
            channel: channelArray.map(channel => ({
              id: channel.id,
              dmx_channel: channel.dmx_channel,
              channel_type: channel.channel_type
            }))
          }
        })
      })
      .then(response => response.json())
      .then(data => {
        if(data.message === 'success') {
          console.log('Device successfully updated');
          setSelectedDevice(undefined);
          fetchDevices();
        } else if(data.message === 'device_not_found'){
          console.log('Device not found');
          const textBox = document.getElementsByClassName('deviceNumber')[0] as HTMLInputElement;
          textBox.focus();
          textBox.style.outline = '2px solid red';
          textBox.style.outlineOffset =  "-1px";
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    } 
  };

  const handleRemoveDevice = () => {
    if(isNewDevice) {
      setSelectedDevice(undefined);
    } else {
      setIsDelete(true);
      setShowAdminPassword(true);
    }
  };

  const removeDevice = () => {
    // send remove device request
    fetch(url + '/removelight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: selectedDevice?.id
      })
    })
    .then(response => response.json())
    .then(data => {
      setSelectedDevice(undefined);
      fetchDevices();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  // Callback function for the admin password component
  const handleAdminPasswordConfirm = useCallback((isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
    if(isConfirmed) {;
      if(istDelete) {
        removeDevice();
      } else {
        updateDevice();
      }
    }
  }, [istDelete, inputName, inputNumber, inputType, inputUniverse, channelArray, selectedDevice]);

  if(showAdminPassword)
   return (
    <div className='LightSettingsOverParent'>
      <AdminPassword onConfirm={handleAdminPasswordConfirm} onClose={() => setShowAdminPassword(false)} />
    </div>
  )

  return (
    <div className='LightSettingsOverParent'>
      <div className="LightSettingsOverlay" onClick={handleClose} />
      <div className="LightSettingsContainer">
        <Button
          onClick={() => handleClose()}
          className="buttonClose"
        > 
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='LightSettingsTitle'>
          <span>{t("ls_title")}</span>
        </div>
        <div className='LightSettingsListContainer'>
          <div className='LightSettingsSelected innerWindow'>
            {selectedDevice === undefined ? (
              <>
                <Button
                    onClick={() => handleCreateDevice()}
                    className="LightSettingsSelectedButton"
                  > {t("ls_addDevice")}
                </Button>
              </>
              ):(
                <div className='LightSettingsSelectedDevice'>
                  <DeviceList devices={[selectedDevice]} isAddButton={false} onDeviceButtonClick={handleDeselectDevice} />
                </div>
              )
            }
          </div>
          <div className='LightSettingsList innerWindow'>
            <DeviceList devices={unselectedDevices} isAddButton={true} onDeviceButtonClick={handleSelectDevice} />
          </div>  
        </div>
        {selectedDevice !== undefined && (
          <div className='LightSettingsWindow innerWindow'>
            <div className='LightSettingsWindowUpper'>
              <div className='LightSettingsSubTitle'>
                <span>{t("ls_basicSettings")}</span>
              </div>
              <div className='LightSettingsTextBoxContainer'>
                <div>
                  <label>Universe:</label><br />
                  <select className='LightSettingsTextBoxSmall' value={inputUniverse} onChange={handleInputUniverse} >
                    <option value="U1">U1</option>
                    <option value="U2">U2</option>
                  </select>
                </div>
                <div>
                  <label>{t("ls_deviceNumber")}</label> <br />
                  <input className='LightSettingsTextBoxSmall deviceNumber' type="number" value={inputNumber} onChange={handleInputNumber} />
                </div>
                <div>
                  <label>{t("ls_deviceName")}</label> <br />
                  <input className='LightSettingsTextBox' type="text" value={inputName} onChange={handleInputName} />
                </div>
                <div>
                  <label>{t("ls_deviceType")}</label><br />
                  <select className='LightSettingsTextBox' value={inputType} onChange={handleInputType} >
                    {Object.keys(LampTypeChannels).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>DMX Start</label> <br />
                  <input className='LightSettingsTextBoxSmall' type="number" value={inputDMXstart} onChange={handleInputDMXstart} />
                </div>
                <div>
                  <label>DMX Range</label> <br />
                  <input className='LightSettingsTextBoxSmall' type="number" value={inputDMXrange} onChange={handleInputDMXrange} />
                </div>
              </div>
            </div>
            <hr />
            <div className="LightSettingsWindowMid">
              <div>
                <div className='LightSettingsSubTitle1'>
                  <span>{t("ls_dmxSettings")}</span>
                </div>
                <div className='LightSettingsDMXContainer'>
                  {Array.from({ length: parseInt(inputDMXrange) }, (_, index) => (
                    <div className="LightSettingsDMXBox" key={index}>
                      <div className="LightSettingsDMXBoxLeft">
                        <input
                          type="number"
                          value={channelArray[index]?.dmx_channel || ''}
                          onChange={(e) => handleChannelChange(index, channelArray[index]?.channel_type, e.target.value)}
                          className='LightSettingsChannelInput'
                        />
                        
                      </div>
                      <div className="LightSettingsDMXBoxRight">
                        {LampTypeChannels[inputType]?.[index] ? (
                          <span>{LampTypeChannels[inputType][index]}</span>
                        ) : (
                          <input
                            type="text"
                            value={channelArray[index]?.channel_type || 'misc'}
                            onChange={(e) => handleChannelChange(index, e.target.value, channelArray[index]?.dmx_channel)}
                            className='LightSettingsChannelInput'
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='LightSettingsWindowLower'>
              <Button 
                onClick={() => handleRemoveDevice()} 
                className="LightSettingsDeleteButton controlButton"
              >
                {t("ls_deleteDevice")}
              </Button>
              <Button 
                onClick={() => handleUpdateDevice()} 
                className="LightSettingsSaveButton controlButton"
              >
                {t("ls_saveDevice")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LightSettings;
