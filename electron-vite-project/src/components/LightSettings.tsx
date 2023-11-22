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
import { TranslationContext } from './TranslationContext';
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
  const [channelChangeArray, setChannelChangeArray] = useState<Array<{ id: number; dmx_channel: string; channel_type: string }>>([]);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [istDelete, setIsDelete] = useState(false); // False = update/create device, true = delete device

  const LampTypeChannels: { [key: string]: string[] } = {
    RGBDim: ['main', 'r', 'g', 'b'],
    BiColor: ['main', 'bi'],
    Spot: ['main'],
    Fill: ['main'],
    Misc: ['main'],
  };

  interface DeviceConfig {
    attributes: any;
    device_type: string;
    universe: string;
    id: number;
    deviceValue: number;
    name: string;
  }

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

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
  console.log(document.activeElement && document.activeElement.tagName);
  // Confirm input with ENTER
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  };

  // Save the device with ENTER if no input is focused
  useEffect(() => {
    fetchDevices();

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = document.activeElement && document.activeElement.tagName === 'INPUT';

      if (e.key === 'Enter' && !isInputActive) {
        handleUpdateDevice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Confirm with ENTER
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  };

  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Limit the name to 20 characters
    const inputValue = event.target.value.length > 20 ? event.target.value.slice(0, 20) : event.target.value;
    setInputName(inputValue);
  };

  // Check if the input value is a number
  const handleInputNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 3) {
      setInputNumber(value.replace(/[^0-9]+/g, ''));
    }
  };

  // Only allow numbers between 1 and 691 for the device number. Limit from MotorMix: 7*99-2
  const handleNumberConfirm = () => {
    let numericValue = parseFloat(inputNumber);
    if (!isNaN(numericValue)) {
      numericValue = Math.max(1, Math.min(691, numericValue));
      setInputNumber(Math.round(numericValue).toString());
    } else {
      setInputNumber(selectedDevice?.id.toString() || (devices.length + 1).toString()); // Reset value if input is NaN
    }
  };

  const handleInputDMXstart = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 3) {
      setInputDMXstart(value.replace(/[^0-9]+/g, ''));
    }
  };

  // Only allow numbers between 1 and (512 - (DMX range + 1)) for the DMX start channel
  const handleDMXstartConfirm = () => {
    let numericValue = parseFloat(inputDMXstart);
    if (!isNaN(numericValue)) {
      numericValue = Math.max(1, Math.min(513 - parseInt(inputDMXrange), numericValue));
      setInputDMXstart(Math.round(numericValue).toString());
    } else {
      setInputDMXstart(selectedDevice?.attributes?.channel[0]?.dmx_channel?.toString() || '1'); // Reset value if input is NaN
    }
  };

  const handleInputDMXrange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 3) {
      setInputDMXrange(value.replace(/[^0-9]+/g, ''));
    }
  };

  // Only allow numbers between 1 and (512 - (DMX start + 1)) for the DMX range
  const handleDMXrangeConfirm = () => {
    let numericValue = parseFloat(inputDMXrange);
    if (!isNaN(numericValue)) {
      numericValue = Math.max(1, Math.min(513 - parseInt(inputDMXstart), numericValue));
      setInputDMXrange(Math.round(numericValue).toString());
    } else {
      setInputDMXrange(selectedDevice?.attributes?.channel?.length?.toString() || '4'); // Reset value if input is NaN
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
    if (valueChannels) {
      setInputDMXrange(valueChannels.length.toString());
    }
  };

  const handleSelectDevice = (device: DeviceConfig) => {
    setSelectedDevice(device);
    setUnselectedDevices(devices.filter((item) => item.id !== device.id));
    setIsNewDevice(false);
    setInputName(device.name);
    setInputDMXstart(device.attributes.channel[0].dmx_channel);
    setInputDMXrange(device.attributes.channel.length.toString());
    setInputUniverse(device.universe);
    setInputType(device.device_type);
    setInputNumber(device.id.toString());
    setChannelArray([]);
    setChannelChangeArray([]);
  };

  const handleDeselectDevice = (device: DeviceConfig) => {
    setSelectedDevice(undefined);
    !isNewDevice && setUnselectedDevices([...unselectedDevices, device]);
    setIsNewDevice(false);
    setChannelChangeArray([]);
    setChannelArray([]);
    setInputDMXstart('0');
  };

  const handleCreateDevice = () => {
    setIsNewDevice(true);

    const newDevice: DeviceConfig = {
      id: devices.length + 1,
      deviceValue: 0,
      name: t('ls_newDevice'),
      attributes: undefined,
      device_type: '',
      universe: '',
    };

    setInputName(t('ls_newDevice'));
    setSelectedDevice(newDevice);
    setInputDMXstart('1');
    setInputDMXrange('4');
    setInputUniverse('U1');
    setInputType('RGBDim');
    setInputNumber(newDevice?.id.toString() || '1');
  };

  // Set the initial channel array and update it
  const createInitialChannelArray = () => {
    const initialChannels = Array.from({ length: parseInt(inputDMXrange) }, (_, index) => {
      const startChannel = inputDMXstart === '' ? 1 + index : parseInt(inputDMXstart) + index;
      const channel = selectedDevice?.attributes?.channel?.[index];
      const defaultChannelType = LampTypeChannels[inputType]?.[index] || 'misc';

      return {
        id: index,
        channel_type: channelChangeArray[index]?.channel_type || channel?.channel_type || defaultChannelType,
        dmx_channel: channelChangeArray[index]?.dmx_channel || channel?.dmx_channel || startChannel.toString(),
      };
    });

    setChannelArray(initialChannels);
  };

  useEffect(() => {
    createInitialChannelArray();
  }, [inputDMXrange, inputDMXstart, inputType, inputNumber]);

  const handleChannelChange = (index: number, type: any, channel: string) => {
    // Only allow 3 digit numbers for the channel input
    channel = type.length > 3 ? channel.replace(/[^0-9]+/g, '').slice(0, 3) : channel.replace(/[^0-9]+/g, '');

    // Limit the name to 20 characters
    type = type.length > 20 ? type.slice(0, 20) : type;

    const updatedChannelArray = [...channelArray];
    updatedChannelArray[index] = { id: index, channel_type: type, dmx_channel: channel };
    setChannelArray(updatedChannelArray);
    setChannelChangeArray((prevChannelChangeArray) => {
      const newChannelChangeArray = [...prevChannelChangeArray];
      newChannelChangeArray[index] = { id: index, channel_type: type, dmx_channel: channel };
      return newChannelChangeArray;
    });
  };

  // Only allow numbers between 1 and 512 for the channel
  const handleChannelConfirm = (index: number, type: any, channel: string) => {
    let numericValue = parseFloat(channel);
    if (!isNaN(numericValue)) {
      numericValue = Math.max(1, Math.min(512, numericValue));
      channel = Math.round(numericValue).toString();
    } else {
      channel = (parseInt(channelArray[index - 1]?.dmx_channel) + 1).toString() || '1'; // Reset value if input is NaN
    }

    const updatedChannelArray = [...channelArray];
    updatedChannelArray[index] = { id: index, channel_type: type, dmx_channel: channel };
    setChannelArray(updatedChannelArray);
    setChannelChangeArray((prevChannelChangeArray) => {
      const newChannelChangeArray = [...prevChannelChangeArray];
      newChannelChangeArray[index] = { id: index, channel_type: type, dmx_channel: channel };
      return newChannelChangeArray;
    });
  };

  const handleUpdateDevice = () => {
    setIsDelete(false);
    setShowAdminPassword(true);
  };

  const handleResponse = (data: { message: string }, textBoxClass: string) => {
    console.log(data.message === 'success' ? 'Device successfully updated' : `${data.message.replace('_', ' ')}!`);
    if (data.message !== 'success') {
      const textBox = document.getElementsByClassName(textBoxClass)[0] as HTMLInputElement;
      textBox.focus();
      textBox.style.outline = '2px solid red';
      textBox.style.outlineOffset = '-1px';
    } else {
      setSelectedDevice(undefined);
      setIsNewDevice(false);
      setChannelChangeArray([]);
      setChannelArray([]);
      setInputDMXstart('0');
      fetchDevices();
    }
  };

  const sendDeviceData = (
    path: string,
    body:
      | {
          name: string;
          number: string;
          device_type: string;
          universe: string;
          attributes: { channel: { id: number; dmx_channel: string; channel_type: string }[] };
        }
      | {
          id: number | undefined;
          name: string;
          number: string;
          device_type: string;
          universe: string;
          attributes: { channel: { id: number; dmx_channel: string; channel_type: string }[] };
        }
  ) => {
    fetch(`${url}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => handleResponse(data, 'deviceNumber'))
      .catch((error) => console.error('Error:', error));
  };

  const updateDevice = () => {
    const commonBody = {
      name: inputName,
      number: inputNumber,
      device_type: inputType,
      universe: inputUniverse,
      attributes: {
        channel: channelArray.map(({ id, dmx_channel, channel_type }) => ({ id, dmx_channel, channel_type })),
      },
    };
    const body = isNewDevice ? commonBody : { ...commonBody, id: selectedDevice?.id };
    sendDeviceData(isNewDevice ? 'addlight' : 'updatelight', body);
  };

  const handleRemoveDevice = () => {
    if (isNewDevice) {
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: selectedDevice?.id,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setSelectedDevice(undefined);
        setIsNewDevice(false);
        setChannelChangeArray([]);
        setChannelArray([]);
        setInputDMXstart('0');
        fetchDevices();
      })
      .catch((error) => console.error('Error:', error));
  };

  // Callback function for the admin password component
  const handleAdminPasswordConfirm = useCallback(
    (isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
      if (isConfirmed) {
        if (istDelete) {
          removeDevice();
        } else {
          updateDevice();
        }
      }
    },
    [istDelete, inputName, inputNumber, inputType, inputUniverse, channelArray, channelChangeArray, selectedDevice]
  );

  return (
    <div className='LightSettingsOverParent'>
      <div
        className='backgroundOverlay'
        onClick={handleClose}
      />
      {showAdminPassword ? (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setShowAdminPassword(false)}
        />
      ) : (
        <div className={`LightSettingsContainer ${selectedDevice ? '' : 'ContainerGap'}`}>
          <Button
            onClick={() => handleClose()}
            className='buttonClose'
          >
            <div className='removeIcon centerIcon'></div>
          </Button>
          <div className='SettingsTitle'>
            <span>{t('ls_title')}</span>
          </div>
          <div className='LightSettingsListContainer'>
            <div className='LightSettingsSelected innerWindow'>
              <Button
                onClick={() => handleCreateDevice()}
                className={`LightSettingsSelectedButton ${selectedDevice ? 'transitionButton' : ''}`}
              >
                {t('ls_addDevice')}
              </Button>
              {selectedDevice && (
                <div className='LightSettingsSelectedDevice'>
                  <DeviceList
                    devices={[selectedDevice]}
                    isAddButton={false}
                    onDeviceButtonClick={handleDeselectDevice}
                  />
                </div>
              )}
            </div>
            <div className='LightSettingsList innerWindow'>
              <DeviceList
                devices={unselectedDevices}
                isAddButton={true}
                onDeviceButtonClick={handleSelectDevice}
              />
            </div>
          </div>
          <div className={`innerWindow LightSettingsWindow ${selectedDevice ? '' : 'LightSettingsWindowInvisible'}`}>
            <div className='LightSettingsWindowUpper'>
              <div className='SettingsSubTitle'>
                <span>{t('ls_basicSettings')}</span>
              </div>
              <div className='LightSettingsTextBoxContainer'>
                <div>
                  <label>Universe:</label>
                  <br />
                  <select
                    className='LightSettingsTextBoxSmall'
                    value={inputUniverse}
                    onChange={handleInputUniverse}
                  >
                    <option value='U1'>U1</option>
                    <option value='U2'>U2</option>
                  </select>
                </div>
                <div>
                  <label>{t('ls_deviceNumber')}</label> <br />
                  <input
                    className='LightSettingsTextBoxSmall deviceNumber'
                    type='text'
                    value={inputNumber}
                    onChange={handleInputNumber}
                    onBlur={handleNumberConfirm}
                    onKeyUp={handleKeyDown}
                  />
                </div>
                <div>
                  <label>{t('ls_deviceName')}</label> <br />
                  <input
                    className='LightSettingsTextBox'
                    type='text'
                    value={inputName}
                    onChange={handleInputName}
                    onKeyUp={handleKeyDown}
                  />
                </div>
                <div>
                  <label>{t('ls_deviceType')}</label>
                  <br />
                  <select
                    className='LightSettingsTextBox'
                    value={inputType}
                    onChange={handleInputType}
                  >
                    {Object.keys(LampTypeChannels).map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>DMX Start</label> <br />
                  <input
                    className='LightSettingsTextBoxSmall'
                    type='text'
                    value={inputDMXstart}
                    onChange={handleInputDMXstart}
                    onBlur={handleDMXstartConfirm}
                    onKeyUp={handleKeyDown}
                  />
                </div>
                <div>
                  <label>DMX Range</label> <br />
                  <input
                    className='LightSettingsTextBoxSmall'
                    type='text'
                    value={inputDMXrange}
                    onChange={handleInputDMXrange}
                    onBlur={handleDMXrangeConfirm}
                    onKeyUp={handleKeyDown}
                  />
                </div>
              </div>
            </div>
            <hr />
            <div className='LightSettingsWindowMid'>
              <div>
                <div className='LightSettingsSubTitle SettingsSubTitle'>
                  <span>{t('ls_dmxSettings')}</span>
                </div>
                <div className='LightSettingsDMXContainer'>
                  {Array.from({ length: parseInt(inputDMXrange) }, (_, index) => (
                    <div
                      className='LightSettingsDMXBox'
                      key={index}
                    >
                      <div className='LightSettingsDMXBoxLeft'>
                        <input
                          type='text'
                          value={channelArray[index]?.dmx_channel || ''}
                          onChange={(e) => handleChannelChange(index, channelArray[index]?.channel_type, e.target.value)}
                          className='LightSettingsChannelInput'
                          onKeyUp={handleKeyDown}
                          onBlur={(e) => handleChannelConfirm(index, channelArray[index]?.channel_type, e.target.value)}
                        />
                      </div>
                      <div className='LightSettingsDMXBoxRight'>
                        {LampTypeChannels[inputType]?.[index] ? (
                          <span>{LampTypeChannels[inputType][index]}</span>
                        ) : (
                          <input
                            type='text'
                            value={channelArray[index]?.channel_type || ''}
                            onChange={(e) => handleChannelChange(index, e.target.value, channelArray[index]?.dmx_channel)}
                            className='LightSettingsChannelInput'
                            onKeyUp={handleKeyDown}
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
                className='LightSettingsDeleteButton controlButton'
              >
                {t('ls_deleteDevice')}
              </Button>
              <Button
                onClick={() => handleUpdateDevice()}
                className='LightSettingsSaveButton controlButton'
              >
                {t('ls_saveDevice')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LightSettings;
