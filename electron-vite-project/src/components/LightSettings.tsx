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
import { TranslationContext } from './TranslationContext';
import DeviceList from './DeviceList';
import { useConnectionContext } from './ConnectionContext';
import AdminPassword from './AdminPassword';
import IconLight from '@/assets/Icon_Light';
import IconAbout from '@/assets/Icon_About';

interface SettingsProps {
  onClose: () => void;
}

function LightSettings({ onClose }: SettingsProps) {
  const [isNewDevice, setIsNewDevice] = useState(false);
  const { t } = useContext(TranslationContext);
  const { url, emit, on, off } = useConnectionContext();
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>();
  const [unselectedDevices, setUnselectedDevices] = useState<DeviceConfig[]>([]);
  const [inputName, setInputName] = useState('');
  const [inputDMXstart, setInputDMXstart] = useState('');
  const [inputDMXrange, setInputDMXrange] = useState('');
  const [rangeChanged, setRangeChanged] = useState(false);
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
    HMI: ['main', 'power'],
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

  // Confirm input with ENTER
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  };

  // Load on mount
  useEffect(() => {
    fetchDevices();

    // If a device is updated, reload the devices
    const lightRespone = (data: any) => {
      console.log(data.message === 'success' ? 'Device successfully updated' : `${data.message.replace('_', ' ')}!`);
      if (data.message !== 'success') {
        const textBox = document.getElementsByClassName('deviceNumber')[0] as HTMLInputElement;
        if (textBox) {
          textBox.classList.add('error-outline');
          textBox.focus();
          setTimeout(() => {
            textBox.classList.remove('error-outline');
          }, 4000);
        }
      } else {
        deselectDivice();
      }
    };
    const lightDeleted = () => {
      deselectDivice();
    };

    on('light_response', lightRespone);
    on('light_deleted', lightDeleted);

    return () => {
      off('light_response', lightRespone);
      off('light_deleted', lightDeleted);
    };
  }, []);

  // Save the device with ENTER if no input is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = document.activeElement && document.activeElement.tagName === 'INPUT';

      if (e.key === 'Enter' && !isInputActive && selectedDevice) {
        handleUpdateDevice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDevice]);

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
      setRangeChanged(true);
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
    if (valueChannels && !rangeChanged) {
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
    deselectDivice();
  };

  const deselectDivice = () => {
    setSelectedDevice(undefined);
    //!isNewDevice && setUnselectedDevices([...unselectedDevices, device]); // instead of fetching
    setIsNewDevice(false);
    setChannelChangeArray([]);
    setChannelArray([]);
    setInputDMXstart('0');
    setRangeChanged(false);
    fetchDevices();
  };

  const handleCreateDevice = () => {
    setIsNewDevice(true);
    const lastDevice = devices.length > 0 ? devices[devices.length - 1] : null;

    const newDevice: DeviceConfig = {
      id: Math.min(lastDevice ? lastDevice.id + 1 : 1, 691), // Last device ID + 1
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
    setInputNumber(newDevice.id.toString() || '1');
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

  const handleRemoveDevice = () => {
    if (isNewDevice) {
      setSelectedDevice(undefined);
    } else {
      setIsDelete(true);
      setShowAdminPassword(true);
    }
  };

  const handleFocus = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Delay to the next tick
    setTimeout(() => {
      event.target.focus();
      event.target.select(); // Select the input text
    }, 0);
  };

  // Callback function for the admin password component
  const handleAdminPasswordConfirm = useCallback(
    (isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
      if (isConfirmed) {
        if (istDelete) {
          // send remove device request
          emit('light_delete', { id: selectedDevice?.id });
        } else {
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

          emit(isNewDevice ? 'light_add' : 'light_update', body);
        }
      }
    },
    [istDelete, inputName, inputNumber, inputType, inputUniverse, channelArray, channelChangeArray, selectedDevice]
  );

  return (
    <div className='LightSettingsOverParent'>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      {showAdminPassword ? (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setShowAdminPassword(false)}
        />
      ) : (
        <div className={`LightSettingsContainer ${selectedDevice ? '' : 'ContainerGap'}`}>
          <button
            className='buttonClose'
            onClick={onClose}
          >
            <div className='xClose'>
              <div className='xClose xiClose'></div>
            </div>
          </button>
          <div className='SettingsTitle'>
            <IconAbout />
            <span className='relative left-[10px] top-[-2px]'>{t('ls_title')}</span>
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
                  <label>{t('ls_universe')}</label>
                  <br />
                  <select
                    className='LightSettingsTextBoxSmall textBox'
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
                    className='LightSettingsTextBoxSmall deviceNumber textBox'
                    type='text'
                    value={inputNumber}
                    onChange={handleInputNumber}
                    onBlur={handleNumberConfirm}
                    onKeyUp={handleKeyDown}
                    onFocus={handleFocus}
                  />
                </div>
                <div>
                  <label>{t('ls_deviceName')}</label> <br />
                  <input
                    className='textBox'
                    type='text'
                    value={inputName}
                    onChange={handleInputName}
                    onKeyUp={handleKeyDown}
                    onFocus={handleFocus}
                  />
                </div>
                <div>
                  <label>{t('ls_deviceType')}</label>
                  <br />
                  <select
                    className='textBox'
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
                  <label>{t('ls_start')}</label> <br />
                  <input
                    className='LightSettingsTextBoxSmall textBox'
                    type='text'
                    value={inputDMXstart}
                    onChange={handleInputDMXstart}
                    onBlur={handleDMXstartConfirm}
                    onKeyUp={handleKeyDown}
                    onFocus={handleFocus}
                  />
                </div>
                <div>
                  <label>{t('ls_range')}</label> <br />
                  <input
                    className='LightSettingsTextBoxSmall textBox'
                    type='text'
                    value={inputDMXrange}
                    onChange={handleInputDMXrange}
                    onBlur={handleDMXrangeConfirm}
                    onKeyUp={handleKeyDown}
                    onFocus={handleFocus}
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
                          onFocus={handleFocus}
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
                            onFocus={handleFocus}
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
                onClick={() => handleUpdateDevice()}
                className='LightSettingsSaveButton controlButton'
              >
                {t('ls_saveDevice')}
              </Button>
              <Button
                onClick={() => handleRemoveDevice()}
                className='LightSettingsDeleteButton  LightSettingsSaveButton controlButton'
              >
                {t('ls_deleteDevice')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LightSettings;
