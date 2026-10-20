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
import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import './LightSettings.css';
import Button from './Button';
import { TranslationContext } from './TranslationContext';
import DeviceList from './DeviceList';
import { useConnectionContext } from './ConnectionContext';
import AdminPassword from './AdminPassword';
import CloseButton from './CloseButton';
import IconLight from '@/assets/IconLight';
import { fetchServerJson } from '@/utils/api';

// Channel types of each device type, used for the default DMX range and channel names
const LampTypeChannels: { [key: string]: string[] } = {
  RGBDim: ['main', 'r', 'g', 'b'],
  BiColor: ['main', 'bi'],
  Spot: ['main'],
  Fill: ['main'],
  HMI: ['main', 'power'],
  Misc: ['main'],
};

const DMX_CHANNELS = 512;
const DMX_TABLE_COLUMNS = 32;

// DMX channels used by the given channel list
const toChannelSet = (channels: { dmx_channel: string }[] = []) => new Set(channels.map((ch) => parseInt(ch.dmx_channel)));

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
  const [isDelete, setIsDelete] = useState(false); // False = update/create device, true = delete device

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
      const parsedData = await fetchServerJson<DeviceConfig[]>(url + '/fader');
      parsedData.shift(); // remove master
      setDevices(parsedData);
      setUnselectedDevices(parsedData);
    } catch (error) {
      console.error(error);
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
    const lightResponse = (data: { message: string }) => {
      if (data.message !== 'success') {
        console.warn(`${data.message.replace('_', ' ')}!`);
        const textBox = document.getElementsByClassName('deviceNumber')[0] as HTMLInputElement;
        if (textBox) {
          textBox.classList.add('error-outline');
          textBox.focus();
          setTimeout(() => {
            textBox.classList.remove('error-outline');
          }, 4000);
        }
      } else {
        deselectDevice();
      }
    };
    const lightDeleted = () => {
      deselectDevice();
    };

    on('light_response', lightResponse);
    on('light_deleted', lightDeleted);

    return () => {
      off('light_response', lightResponse);
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

      // Update selectedDevice's type to reflect in icon
      if (selectedDevice) {
        setSelectedDevice((prevDevice) => {
          if (!prevDevice) return undefined;
          return {
            ...prevDevice,
            device_type: value,
          };
        });
      }

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

  const deselectDevice = () => {
    setSelectedDevice(undefined);
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
      device_type: 'RGBDim',
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

  // DMX occupancy for the overview table, computed once instead of for each of the 512 cells
  const channelArraySet = useMemo(() => toChannelSet(channelArray), [channelArray]);
  const occupiedChannelSet = useMemo(
    () => toChannelSet(devices.filter((device) => device.universe === inputUniverse).flatMap((device) => device.attributes.channel)),
    [devices, inputUniverse]
  );
  const selectedDeviceChannelSet = useMemo(
    () => (!isNewDevice && selectedDevice ? toChannelSet(selectedDevice.attributes.channel) : new Set<number>()),
    [isNewDevice, selectedDevice]
  );

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
    (token: string) => {
      if (isDelete) {
        // send remove device request
        emit('light_delete', { id: selectedDevice?.id, token });
      } else {
        const commonBody = {
          name: inputName,
          number: inputNumber,
          device_type: inputType,
          universe: inputUniverse,
          attributes: {
            channel: channelArray.map(({ id, dmx_channel, channel_type }) => ({ id, dmx_channel, channel_type })),
          },
          token,
        };
        const body = isNewDevice ? commonBody : { ...commonBody, id: selectedDevice?.id };

        emit(isNewDevice ? 'light_add' : 'light_update', body);
      }
    },
    [isDelete, inputName, inputNumber, inputType, inputUniverse, channelArray, channelChangeArray, selectedDevice]
  );

  return (
    <>
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
        <div
          className='LightSettingsContainer'
          role='dialog'
          aria-modal='true'
          aria-label={t('ls_title')}
        >
          <CloseButton onClose={onClose} />
          <div className='SettingsTitle'>
            <IconLight />
            <span className='SettingsTitleText'>{t('ls_title')}</span>
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
                    onDeviceButtonClick={deselectDevice}
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
                  <label htmlFor='ls-universe'>{t('ls_universe')}</label>
                  <br />
                  <select
                    id='ls-universe'
                    className='LightSettingsTextBoxSmall textBox'
                    value={inputUniverse}
                    onChange={handleInputUniverse}
                  >
                    <option value='U1'>U1</option>
                    <option value='U2'>U2</option>
                  </select>
                </div>
                <div>
                  <label htmlFor='ls-device-number'>{t('ls_deviceNumber')}</label> <br />
                  <input
                    id='ls-device-number'
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
                  <label htmlFor='ls-device-name'>{t('ls_deviceName')}</label> <br />
                  <input
                    id='ls-device-name'
                    className='textBox'
                    type='text'
                    value={inputName}
                    onChange={handleInputName}
                    onKeyUp={handleKeyDown}
                    onFocus={handleFocus}
                  />
                </div>
                <div>
                  <label htmlFor='ls-device-type'>{t('ls_deviceType')}</label>
                  <br />
                  <select
                    id='ls-device-type'
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
                  <label htmlFor='ls-dmx-start'>{t('ls_start')}</label> <br />
                  <input
                    id='ls-dmx-start'
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
                  <label htmlFor='ls-dmx-range'>{t('ls_range')}</label> <br />
                  <input
                    id='ls-dmx-range'
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
                        aria-label={`DMX ${index + 1}`}
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
                          aria-label={`${t('ls_dmxSettings')} ${index + 1}`}
                          onKeyUp={handleKeyDown}
                          onFocus={handleFocus}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <hr style={{ marginTop: '30px' }} />
              <table className='LightSettingsDMXTable'>
                <tbody>
                  {Array.from({ length: DMX_CHANNELS / DMX_TABLE_COLUMNS }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: DMX_TABLE_COLUMNS }).map((_, cellIndex) => {
                        const cellNumber = rowIndex * DMX_TABLE_COLUMNS + cellIndex + 1;
                        const isInChannelArray = channelArraySet.has(cellNumber);
                        const isDMXDevice = occupiedChannelSet.has(cellNumber);
                        const isInSelectedDevice = selectedDeviceChannelSet.has(cellNumber);
                        let cellClass = 'LightSettingsDMXTableCell';
                        if (isDMXDevice && isInChannelArray && !isInSelectedDevice) {
                          cellClass += ' LightSettingsDMXTableCellOccupiedAndInChannel';
                        } else if (isInChannelArray) {
                          cellClass += ' LightSettingsDMXTableCellInChannel';
                        } else if (isDMXDevice) {
                          cellClass += ' LightSettingsDMXTableCellOccupied';
                        }
                        return (
                          <td
                            key={cellIndex}
                            className={cellClass}
                          >
                            {cellNumber}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </>
  );
}

export default LightSettings;
