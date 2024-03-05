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
 * @file Control.tsx
 */
import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { TranslationContext } from './components/TranslationContext';
import { useConnectionContext } from './components/ConnectionContext';
import { useLocation } from 'react-router-dom';
import { useFaderContext } from './components/FaderContext';
import './Control.css';
import Fader from './components/Fader';
import DeviceList from './components/DeviceList';
import Button from './components/Button';
import ColorPicker from './components/ColorPicker';
import AddScene from './components/AddScene';
import AdminPassword from './components/AdminPassword';
import iro from '@jaames/iro';
import ControlWindow from './assets/ControlWindow';

interface Channel {
  id: number;
  channel_type: 'main' | 'bi' | 'r' | 'g' | 'b';
  sliderValue: number;
  deviceId: number;
}

interface DeviceConfig {
  id: number;
  deviceValue: number;
  name: string;
  attributes: {
    channel: Channel[];
  };
  device_type: string;
  universe: string;
  upToDate?: boolean;
}

// LightFX
function Control() {
  const { t } = useContext(TranslationContext);
  const { url, connected, emit, on, off } = useConnectionContext();
  const { faderValues, setFaderValue } = useFaderContext();
  const location = useLocation();
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceConfig[]>([]);
  const [unselectedDevices, setUnselectedDevices] = useState<DeviceConfig[]>([]);
  const [firstLoad, setFirstLoad] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [addScene, setAddScene] = useState(false);
  const [saveSceneAdmin, setSaveSceneAdmin] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [height, setHeight] = useState(-3);
  const [selected, setSelected] = useState(selectedDevices[0] && devices.length > 0);
  const [deviceModified, setDeviceModified] = useState(false); // Device added or removed
  const [supportFlags, setSupportFlags] = useState({ supportsBiColor: false, supportsRGB: false });
  const [red, setRed] = useState(faderValues[0][3]);
  const [green, setGreen] = useState(faderValues[0][4]);
  const [blue, setBlue] = useState(faderValues[0][5]);
  const [allEffectChannels, setAllEffectChannels] = useState<Channel[]>([]);
  const [prevFaderValues, setPrevFaderValues] = useState<number[]>([]);

  // update selected state
  useLayoutEffect(() => {
    setSelected(selectedDevices[0] && devices.length > 0);
  }, [selectedDevices, devices]);

  // Before first render
  useLayoutEffect(() => {
    // Get devices from server
    const fetchDevices = async (reset: boolean) => {
      try {
        const response = await fetch(url + '/fader');
        const data = await response.json();
        const parsedData = JSON.parse(data);
        parsedData.shift(); // remove master
        setDevices(parsedData);

        if (reset || savedUnselectedDevices.length == 0) {
          setUnselectedDevices(parsedData);
          setSelectedDevices([]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (connected) fetchDevices(false);

    // Load saved solo state from session storage
    setIsSolo(sessionStorage.getItem('controlSolo') === 'true');

    // Load saved selection from session storage
    const savedSelectedDevices = JSON.parse(sessionStorage.getItem('selectedDevices') || '[]');
    const savedUnselectedDevices = JSON.parse(sessionStorage.getItem('unselectedDevices') || '[]');

    setSelectedDevices(savedSelectedDevices);
    setUnselectedDevices(savedUnselectedDevices);
    setFirstLoad(true);

    // Prevent transition animation before height has loaded
    const timer = setTimeout(() => {
      setAnimation(true);
    }, 500);

    // If a device is updated, reload the devices
    const lightRespone = (data: any) => {
      if (data.message === 'success') {
        fetchDevices(true); // reload devices
      }
    };
    const lightDeleted = () => {
      fetchDevices(true);
    };

    on('light_response', lightRespone);
    on('light_deleted', lightDeleted);

    return () => {
      clearTimeout(timer);
      off('light_response', lightRespone);
      off('light_deleted', lightDeleted);
    };
  }, []);

  // On any change of devices
  useEffect(() => {
    // Save selection in session storage
    if (firstLoad && devices.length > 0) {
      sessionStorage.setItem('unselectedDevices', JSON.stringify(unselectedDevices));
      sessionStorage.setItem('selectedDevices', JSON.stringify(selectedDevices));

      if (selectedDevices.length == 0) {
        setHeight(-3);
      } else {
        setHeight(Math.min(selectedDevices.length * 71 + 36, 462));
      }
    }

    // Add a device if it was added from Studio
    const id = location.state && location.state.id; // Device ID from Studio
    if (id && !animation) {
      const foundDevice = unselectedDevices.find((device) => device.id === id);
      if (foundDevice) {
        setSelectedDevices([...selectedDevices, foundDevice]);
        setUnselectedDevices(unselectedDevices.filter((item) => item.id !== foundDevice.id));
      }
    }

    // Deactivate solo if no device is selected
    if (selectedDevices.length == 0 && isSolo) {
      toggleSolo();
    }
  }, [selectedDevices, unselectedDevices, devices]);

  // Add a device to the selected devices
  const handleAddDevice = useCallback(
    (device: DeviceConfig) => {
      setSelectedDevices((current) => [...current, device]);
      setUnselectedDevices((current) => current.filter((item) => item.id !== device.id));
      setDeviceModified(true);
    },
    [selectedDevices, unselectedDevices]
  );

  // Remove a device from the selected devices
  const handleRemoveDevice = useCallback(
    (device: DeviceConfig) => {
      setSelectedDevices((current) => current.filter((s) => s.id !== device.id));
      setUnselectedDevices((current) => [...current, device]);
      setDeviceModified(true);
    },
    [selectedDevices, unselectedDevices]
  );

  // Solo Button
  const toggleSolo = () => {
    emit('controlSolo', { solo: !isSolo, devices: selectedDevices });
    sessionStorage.setItem('controlSolo', `${!isSolo}`);
    setIsSolo(!isSolo);
  };

  // Color Picker
  const handleColorChange = (newRed: number, newGreen: number, newBlue: number) => {
    setRed(newRed);
    setGreen(newGreen);
    setBlue(newBlue);
    setFaderValue(0, 3, newRed);
    setFaderValue(0, 4, newGreen);
    setFaderValue(0, 5, newBlue);
    let tempInKelvin = iro.Color.rgbToKelvin({ r: newRed, g: newGreen, b: newBlue });
    setFaderValue(0, 2, Math.min(255, Math.max(0, Math.round(((tempInKelvin - 2200) / 8800) * 255))));
  };

  // Update and emit fader values for all affected devices based on control state (split into main, and RGBbi)
  useEffect(() => {
    const mainChanged = prevFaderValues[1] !== faderValues[0][1];
    const rgbOrBiChanged = [2, 3, 4, 5].some((index) => prevFaderValues[index] !== faderValues[0][index]);
    setPrevFaderValues([...faderValues[0]]);

    const deviceDataArray = selectedDevices
      .map((device) => {
        const channels = device.attributes.channel
          .filter((channel) => (mainChanged && channel.channel_type === 'main') || (rgbOrBiChanged && ['r', 'g', 'b', 'bi'].includes(channel.channel_type)))
          .map((channel) => {
            const controlIndex = getControlIndex(channel.channel_type);
            if (controlIndex !== undefined) {
              const newValue = faderValues[0][controlIndex];
              setFaderValue(device.id, channel.id, newValue);
              return { channelId: channel.id, value: newValue };
            }
            return null;
          })
          .filter((channel) => channel !== null);

        return channels.length > 0 ? { deviceId: device.id, channels } : null;
      })
      .filter((device) => device !== null);

    if (deviceDataArray.length > 0) {
      emit('bulk_fader_values', deviceDataArray);
    }
  }, [faderValues[0][1], faderValues[0][2], faderValues[0][3], faderValues[0][4], faderValues[0][5]]);

  // Check if effects, bi-color or RGB are supported
  useEffect(() => {
    let biColorSupported = false;
    let rgbSupported = false;
    let allChannels = [];

    for (const device of selectedDevices) {
      for (const channel of device.attributes.channel) {
        if (channel.channel_type === 'bi') {
          biColorSupported = true;
        } else if (['r', 'g', 'b'].includes(channel.channel_type)) {
          rgbSupported = true;
          biColorSupported = true;
        } else if (!['main', 'r', 'g', 'b', 'bi'].includes(channel.channel_type)) {
          // Effects
          allChannels.push({
            ...channel,
            deviceId: device.id,
          });
        }
      }
    }

    allChannels = allChannels.sort((a, b) => a.deviceId - b.deviceId); // Sort by device ID
    setAllEffectChannels(allChannels);
    setSupportFlags({ supportsBiColor: biColorSupported, supportsRGB: rgbSupported });
  }, [selectedDevices]);

  // Get the control index (faderValues[0][x]) for the given channel type
  const getControlIndex = (channelType: string): number | undefined => ({ main: 1, bi: 2, r: 3, g: 4, b: 5 }[channelType]);

  // Update faderValues[0] for selected devices
  const updateFaderValuesForSelectedDevices = () => {
    const flags: { mainSet: boolean; biSet: boolean; rSet: boolean; gSet: boolean; bSet: boolean; [key: string]: boolean } = {
      mainSet: false,
      biSet: false,
      rSet: false,
      gSet: false,
      bSet: false,
    };

    selectedDevices.forEach((device) => {
      device.attributes.channel.forEach((channel) => {
        const channelValue = faderValues[device.id][channel.id];

        if (channel.channel_type === 'main' && !flags.mainSet) {
          setFaderValue(0, 1, channelValue);
          flags.mainSet = true;
        } else if (['r', 'g', 'b'].includes(channel.channel_type) && !flags[channel.channel_type + 'Set']) {
          setFaderValue(0, channel.channel_type === 'r' ? 3 : channel.channel_type === 'g' ? 4 : 5, channelValue);
          flags[channel.channel_type + 'Set'] = true;
          flags.biSet = true;
        } else if (channel.channel_type === 'bi' && !flags.biSet) {
          setFaderValue(0, 2, channelValue);
          flags.biSet = flags.rSet = flags.gSet = flags.bSet = true;
        }
      });
    });
  };

  // Calculate the RGB values from the Kelvin value on first load or when added
  useEffect(() => {
    setTimeout(() => {
      const kelvinValue = Math.round((faderValues[0][2] / 255) * 8800 + 2200);
      const rgb = iro.Color.kelvinToRgb(kelvinValue);
      setFaderValue(0, 3, rgb.r);
      setFaderValue(0, 5, rgb.b);
    }, 100);
  }, [selectedDevices]);

  // Check if the selected devices channels are up to date with the corresponding fader values of the control
  useEffect(() => {
    // Transfer fader values from selected devices to the control when a device is added or removed
    if (deviceModified) {
      updateFaderValuesForSelectedDevices();
      setDeviceModified(false);
    }

    for (const device of selectedDevices) {
      if (selectedDevices.length === 1) {
        device.upToDate = true;
        updateFaderValuesForSelectedDevices();
        return;
      }

      for (const channel of device.attributes.channel) {
        const controlIndex = getControlIndex(channel.channel_type);

        if (controlIndex !== undefined && faderValues[device.id][channel.id] !== faderValues[0][controlIndex]) {
          device.upToDate = false;
          break;
        } else {
          device.upToDate = true;
        }
      }
    }
  }, [faderValues, selectedDevices, deviceModified]);

  // Sync the selected devices channels with the corresponding fader values of the control
  const handleSyncClick = (device: DeviceConfig) => {
    device.attributes.channel.forEach((channel) => {
      const controlIndex = getControlIndex(channel.channel_type);

      if (controlIndex !== undefined) {
        const newValue = faderValues[0][controlIndex];
        setFaderValue(device.id, channel.id, newValue);
        emit('fader_value', { deviceId: device.id, value: newValue, channelId: channel.id });
        device.upToDate = true;
      }
    });
  };

  // Bi-Color input field handling --- Does not fix low resolution though ---
  const [isFocused, setIsFocused] = useState(false); // Focus on value input
  const scaledDisplayValue = (faderValues[0][2] / 255) * 100; // (0 to 100%)
  const [inputValue, setInputValue] = useState<any>(Math.round(scaledDisplayValue) + '%');

  // Update input value when display value changes
  useEffect(() => {
    const finalDisplayValue = isFocused ? scaledDisplayValue.toFixed(1) : Math.round(scaledDisplayValue) + '%';
    setInputValue(finalDisplayValue);
  }, [scaledDisplayValue, isFocused, deviceModified]);

  // Check if the input value is a number
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 5) {
      setInputValue(value.replace(/[^0-9.,]+/g, ''));
    }
  };

  // Check if the input is valid and set the fader value
  const handleInputConfirm = () => {
    let numericValue = parseFloat(inputValue.toString().replace(',', '.'));
    if (!isNaN(numericValue)) {
      numericValue = Math.max(0, Math.min(100, numericValue));
      setInputValue(Math.round(numericValue));
      // scaled value to kelvin and set fader values
      const kelvin = Math.round((Math.round((numericValue / 100) * 255) / 255) * 8800 + 2200);
      const rgb = iro.Color.kelvinToRgb(kelvin);
      setFaderValue(0, 3, rgb.r);
      setFaderValue(0, 5, rgb.b);
    } else {
      setInputValue(Math.round(scaledDisplayValue)); // Reset value if input is NaN
    }
    setIsFocused(false);
  };

  // Confirm with ENTER
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  };

  // On value input focus
  const handleFocus = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setTimeout(() => {
      event.target.select(); // Select the input text
    }, 50);
  };

  return (
    <>
      {selected ? (
        <>
          <div
            className={'selectedDevices' + (animation ? ' devicesAnimation' : '')}
            style={{ height: height - 17 + 'px' }}
          >
            <DeviceList
              devices={selectedDevices}
              isAddButton={false}
              onDeviceButtonClick={handleRemoveDevice}
              onSyncClick={handleSyncClick}
            />
          </div>
          <div className='innerContainer'>
            {/* Masterfader/Groupfader */}
            <div className='lightFader innerWindow'>
              <Fader
                height={327}
                id={1}
                sliderGroupId={0}
                name={t('group')}
                className='noBorder'
              />
            </div>
            {/* Control Buttons */}
            <div className='controlButtons innerWindow'>
              <Button
                onClick={() => setAddScene(true)}
                className='controlButton'
              >
                {t('saveAsScene')}
              </Button>
              <Button
                onClick={() => toggleSolo()}
                className={`controlButton ${isSolo ? 'isSolo' : ''}`}
              >
                SOLO
              </Button>
            </div>
            {/* Bi-Color */}
            <div className='controlBiColor innerWindow'>
              <span className='controlTitle'>Bi-Color</span>
              <div className={`noSupportText noSupport ${!supportFlags.supportsBiColor ? '' : 'noSupportHidden'}`}>
                <span style={{ marginTop: '-110px' }}>{t('noSupport')}</span>
              </div>
              <div className='controlKelvinPicker'>
                <ColorPicker
                  pickerType='kelvin'
                  red={faderValues[0][3]}
                  green={faderValues[0][4]}
                  blue={faderValues[0][5]}
                  onColorChange={handleColorChange}
                />
              </div>
              <input
                type='text'
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleInputConfirm}
                onKeyDown={handleKeyDown}
                className='inputNum'
              />
            </div>
            {/* RGB */}
            <div className='controlRGB innerWindow'>
              <span className='controlTitle'>RGB</span>
              <div className={`noSupportText noSupport ${!supportFlags.supportsRGB ? '' : 'noSupportHidden'}`}>
                <span>{t('noSupport')}</span>
              </div>
              <div className='controlRGBFader'>
                <Fader
                  id={3}
                  sliderGroupId={0}
                  name='R'
                  color='#CA2C2C'
                  className='noBorder'
                />
                <Fader
                  id={4}
                  sliderGroupId={0}
                  name='G'
                  color='#59E066'
                  className='noBorder'
                />
                <Fader
                  id={5}
                  sliderGroupId={0}
                  name='B'
                  className='noBorder'
                />
              </div>
              <div className='controlColorPicker'>
                <ColorPicker
                  pickerType='wheel'
                  red={red}
                  green={green}
                  blue={blue}
                  onColorChange={handleColorChange}
                />
              </div>
            </div>
            {/* Effects */}
            <div className='controlEffects innerWindow'>
              {!(allEffectChannels.length > 0) ? (
                <>
                  <span className='controlTitle'>{t('effects')}</span>
                  <div className='centeredWrapper'>
                    <span className='noSupportText'>{t('noSupport')}</span>
                  </div>
                </>
              ) : (
                <div className='sliders slidersEffects'>
                  {allEffectChannels.map((channel, index) => (
                    <div
                      key={channel.deviceId + '-' + channel.id}
                      style={{
                        marginLeft: index === 0 ? '-10px' : '',
                        paddingLeft: index === allEffectChannels.length - 1 ? '10px' : '',
                      }}
                    >
                      <h2 className='faderText'>{channel.deviceId}</h2>
                      <Fader
                        key={channel.id}
                        id={channel.id}
                        sliderGroupId={channel.deviceId}
                        name={channel.channel_type}
                        className={index === allEffectChannels.length - 1 ? 'noBorder' : ''}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ControlWindow
            className={'controlMain' + (animation ? ' mainAnimation' : '')}
            height={height}
          />
        </>
      ) : (
        <>
          <div className='noSelectWindow'>
            <div className='noSupport noDevice noSupportText noSupportShadow'>
              <p dangerouslySetInnerHTML={{ __html: t('noDevices') }}></p>
            </div>
            <div className='lightFader innerWindow'></div>
            <div className='controlButtons innerWindow'></div>
            <div className='controlBiColor innerWindow'>
              <span className='controlTitle'>Bi-Color</span>
            </div>
            <div className='controlRGB innerWindow'>
              <span className='controlTitle'>RGB</span>
            </div>
            <div className='controlEffects innerWindow'>
              <span className='controlTitle'>{t('effects')}</span>
            </div>
          </div>
        </>
      )}
      <div
        className={`devices window ${selected ? 'devicesSmall' : ''} ${animation ? 'devicesAnimation' : ''}`}
        style={{ height: 907 - height + 'px' }}
      >
        <DeviceList
          devices={unselectedDevices}
          isAddButton={true}
          onDeviceButtonClick={handleAddDevice}
        />
      </div>
      <div className={'noSelectWindow window' + (selected ? ' hide' : '')}></div>
      {addScene && <AddScene onClose={() => setAddScene(false)} />}
      {saveSceneAdmin && <AdminPassword onClose={() => setSaveSceneAdmin(false)} />}
    </>
  );
}

export default Control;
