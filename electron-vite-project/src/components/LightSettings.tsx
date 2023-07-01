import { useState, useContext, useEffect, ChangeEvent } from 'react';
import './LightSettings.css';
import Button from './Button';
import '../index.css';
import { TranslationContext } from './TranslationContext'
import DeviceList from './DeviceList';
import { useConnectionContext } from './ConnectionContext';

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
  const [inputName, setInputName] = useState('New Device');
  const [inputDMXstart, setInputDMXstart] = useState('');
  const [inputDMXrange, setInputDMXrange] = useState('');
  const [inputUniverse, setInputUniverse] = useState('U1');
  const [inputType, setInputType] = useState('RGBDim');
  const [inputNumber, setInputNumber] = useState('');

  interface DeviceConfig {
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
    const fetchDevices = async () => {
      try { 
        const response = await fetch(url + '/fader');
        const data = await response.json();
        const parsedData = JSON.parse(data);
        parsedData.shift(); // remove master
        setDevices(parsedData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDevices();
  }, []);

  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
  };

  const handleInputNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputNumber(event.target.value);
  };

  const handleInputDMXstart = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputDMXstart(event.target.value);
  };

  const handleInputDMXrange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputDMXrange(event.target.value);
  };

  const handleInputUniverse = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputUniverse(e.target.value);
  };

  const handleInputType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputType(e.target.value);
  };

  const handleSelectDevice = (device: DeviceConfig) => {
    setSelectedDevice(device);
    setUnselectedDevices(unselectedDevices.filter(item => item.id !== device.id));
    setIsNewDevice(false);
  };

  const handleDeselectDevice = (device: DeviceConfig) => {
    setSelectedDevice(undefined);
    setUnselectedDevices([...unselectedDevices, device]);
    setIsNewDevice(false);
  };

  const handleCreateDevice = () => {
    setIsNewDevice(true);

    const newDevice: DeviceConfig = {
      id: devices.length + 1, // oder nur devices.length?
      deviceValue: 0,
      name: t("ls_newDevice"),
    };
  
    setSelectedDevice(newDevice);
  };

  // const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
  //   setInputDMXrange(event.target.value);
  // };

  // const handleTypeChange = (event: { target: { value: SetStateAction<string>; }; }) => {
  //   setInputType(event.target.value);
  // };

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
  
  // ...
  
  useEffect(() => {
    createInitialChannelArray();
  }, [inputDMXrange, inputDMXstart, inputType]);

  const handleChannelChange = (index: number, type: any, channel: string) => {
    const updatedChannelArray = [...channelArray];
    updatedChannelArray[index] = { id: index, channel_type: type, dmx_channel: channel };
    setChannelArray(updatedChannelArray);
  }

  const [channelArray, setChannelArray] = useState<Array<{ id: number; dmx_channel: string; channel_type: string }>>([]);

  const handleChannelTypeChange = (index: number, event: ChangeEvent<HTMLSelectElement>) => {
    const selectedChannelType = event.target.value;

    setChannelArray(prevChannelArray => {
      const updatedChannelArray = [...prevChannelArray];
      updatedChannelArray[index] = {
        id: index,
        dmx_channel: String(parseInt(inputDMXstart) + index),
        channel_type: selectedChannelType
      };
      return updatedChannelArray;
    });
  };

  const handleUpdateDevice = () => {
    console.log(channelArray)
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
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const handleRemoveDevice = () => {
    alert('Remove device');
  };

  const LampTypeChannels:{ [key: string]: string[] } = {
    'RGBDim':  ['main', 'r', 'g', 'b'],
    'BiColor': ['main', 'bi'],
    'Spot':    ['main'],
    'Fill':    ['main'],
    'Misc':    ['main']
  };

  return (
    <div>
      <div className="LightSettingsOverlay" onClick={handleClose} /> Overlay to close the modal when clicked outside
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
              <DeviceList devices={devices} isAddButton={true} onDeviceButtonClick={handleSelectDevice} />
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
                      <option value="1">U1</option>
                      <option value="2">U2</option>
                    </select>
                  </div>
                  <div>
                    <label>{t("ls_deviceNumber")}</label> <br />
                    <input className='LightSettingsTextBoxSmall' type="number" value={inputNumber} onChange={handleInputNumber} />
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
                {isNewDevice ? (
                  <div>
                    <div className='LightSettingsSubTitle'>
                      <span>{t("ls_dmxSettings")}</span>
                    </div>
                    <div className='LightSettingsDMXContainer'>
                      {Array.from({ length: parseInt(inputDMXrange) }, (_, index) => (
                        <div className="LightSettingsDMXBox" key={index}>
                          <div className="LightSettingsDMXBoxLeft">
                            {LampTypeChannels[inputType]?.[index] ? (
                              <span>{LampTypeChannels[inputType][index]}</span>
                            ) : (
                              <input
                                type="text"
                                value={channelArray[index]?.channel_type || 'misc'}
                                onChange={(e) => handleChannelChange(index, e.target.value, channelArray[index]?.dmx_channel)}
                                style={{ width: '100%', textAlign: "center" }}
                              />
                            )}
                          </div>
                          <div className="LightSettingsDMXBoxRight">
                            <input
                              type="number"
                              value={channelArray[index]?.dmx_channel || ''}
                              onChange={(e) => handleChannelChange(index, channelArray[index]?.channel_type, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    No new device
                    <div style={{fontSize:"250px"}}>𓀐𓂸</div>

                    <select className='LightSettingsTextBox' >
                      <option value="1">r</option>
                      <option value="2">g</option>
                      <option value="3">b</option>
                    </select>
                  </div>
                )}
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
