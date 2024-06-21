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
import React, { useCallback, useContext, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { TranslationContext } from './components/TranslationContext';
import { useConnectionContext } from './components/ConnectionContext';
import { useLocation } from 'react-router-dom';
import { useFaderContext, useFaderValue } from './components/FaderContext';
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

let sendBuffer: { [key: string]: { deviceId: number; channelId: number; value: number } } = {};
let sendTimer: NodeJS.Timeout | null = null;

function sendDMXBuffered(emit: any, deviceId: number, channelId: number, value: number) {
  const key = `${deviceId}-${channelId}`;
  sendBuffer[key] = { deviceId, channelId, value };

  if (!sendTimer) {
    sendTimer = setTimeout(() => {
      const deviceDataArray = Object.values(sendBuffer).reduce((acc: any, { deviceId, channelId, value }) => {
        let device = acc.find((d: any) => d.deviceId === deviceId);
        if (!device) {
          device = { deviceId, channels: [] };
          acc.push(device);
        }
        device.channels.push({ channelId, value });
        return acc;
      }, []);
      emit('bulk_fader_values', deviceDataArray);
      sendBuffer = {};
      sendTimer = null;
    }, 20);
  }
}

function Control() {
  const { t } = useContext(TranslationContext);
  const { url, connected, emit, on, off } = useConnectionContext();
  const { setFaderValue, getFaderValue } = useFaderContext();
  const location = useLocation();

  const masterValue = useFaderValue(0, 1);
  const biColorValue = useFaderValue(0, 2);
  const redValue = useFaderValue(0, 3);
  const greenValue = useFaderValue(0, 4);
  const blueValue = useFaderValue(0, 5);

  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceConfig[]>([]);
  const [unselectedDevices, setUnselectedDevices] = useState<DeviceConfig[]>([]);
  const [firstLoad, setFirstLoad] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [addScene, setAddScene] = useState(false);
  const [saveSceneAdmin, setSaveSceneAdmin] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [height, setHeight] = useState(-3);
  const [selected, setSelected] = useState(false);
  const [deviceModified, setDeviceModified] = useState(false);
  const [supportFlags, setSupportFlags] = useState({ supportsBiColor: false, supportsRGB: false });
  const [allEffectChannels, setAllEffectChannels] = useState<Channel[]>([]);
  const [, forceRender] = useState(false);

  const prevValuesRef = useRef({
    main: masterValue,
    bi: biColorValue,
    r: redValue,
    g: greenValue,
    b: blueValue,
  });

  useLayoutEffect(() => {
    setSelected(selectedDevices.length > 0 && devices.length > 0);
  }, [selectedDevices, devices]);

  useLayoutEffect(() => {
    const fetchDevices = async (reset: boolean) => {
      try {
        const response = await fetch(url + '/fader');
        const data = await response.json();
        const parsedData = JSON.parse(data);
        parsedData.shift();
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

    setIsSolo(sessionStorage.getItem('controlSolo') === 'true');

    const savedSelectedDevices = JSON.parse(sessionStorage.getItem('selectedDevices') || '[]');
    const savedUnselectedDevices = JSON.parse(sessionStorage.getItem('unselectedDevices') || '[]');

    setSelectedDevices(savedSelectedDevices);
    setUnselectedDevices(savedUnselectedDevices);
    setFirstLoad(true);

    const timer = setTimeout(() => {
      setAnimation(true);
    }, 500);

    const lightRespone = (data: any) => {
      if (data.message === 'success') {
        fetchDevices(true);
      }
    };
    const lightDeleted = () => {
      fetchDevices(true);
    };

    const handleStorageChange = (event: CustomEvent<boolean>) => {
      if (event.type === 'designChange') {
        forceRender((prev) => !prev);
      }
    };

    window.addEventListener('designChange', handleStorageChange as EventListener);
    on('light_response', lightRespone);
    on('light_deleted', lightDeleted);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('designChange', handleStorageChange as EventListener);
      off('light_response', lightRespone);
      off('light_deleted', lightDeleted);
    };
  }, []);

  useEffect(() => {
    if (firstLoad && devices.length > 0) {
      sessionStorage.setItem('unselectedDevices', JSON.stringify(unselectedDevices));
      sessionStorage.setItem('selectedDevices', JSON.stringify(selectedDevices));

      if (selectedDevices.length == 0) {
        setHeight(-3);
      } else {
        setHeight(Math.min(selectedDevices.length * 71 + 36, 462));
      }
    }

    const id = location.state && location.state.id;
    if (id && !animation) {
      const foundDevice = unselectedDevices.find((device) => device.id === id);
      if (foundDevice) {
        setSelectedDevices([...selectedDevices, foundDevice]);
        setUnselectedDevices(unselectedDevices.filter((item) => item.id !== foundDevice.id));
      }
    }

    if (selectedDevices.length == 0 && isSolo) {
      toggleSolo();
    }
  }, [selectedDevices, unselectedDevices, devices]);

  const handleAddDevice = useCallback(
    (device: DeviceConfig) => {
      setSelectedDevices((current) => [...current, device]);
      setUnselectedDevices((current) => current.filter((item) => item.id !== device.id));
      setDeviceModified(true);
    },
    [selectedDevices, unselectedDevices]
  );

  const handleRemoveDevice = useCallback(
    (device: DeviceConfig) => {
      setSelectedDevices((current) => current.filter((s) => s.id !== device.id));
      setUnselectedDevices((current) => [...current, device]);
      setDeviceModified(true);
    },
    [selectedDevices, unselectedDevices]
  );

  const toggleSolo = () => {
    emit('controlSolo', { solo: !isSolo, devices: selectedDevices });
    sessionStorage.setItem('controlSolo', `${!isSolo}`);
    setIsSolo(!isSolo);
  };

  const handleColorChange = (newRed: number, newGreen: number, newBlue: number) => {
    setFaderValue(0, 3, newRed);
    setFaderValue(0, 4, newGreen);
    setFaderValue(0, 5, newBlue);
    let tempInKelvin = iro.Color.rgbToKelvin({ r: newRed, g: newGreen, b: newBlue });
    setFaderValue(0, 2, Math.min(255, Math.max(0, Math.round(((tempInKelvin - 2200) / 8800) * 255))));
  };

  useEffect(() => {
    const mainChanged = prevValuesRef.current.main !== masterValue;
    const rgbOrBiChanged = prevValuesRef.current.bi !== biColorValue || prevValuesRef.current.r !== redValue || prevValuesRef.current.g !== greenValue || prevValuesRef.current.b !== blueValue;

    prevValuesRef.current = {
      main: masterValue,
      bi: biColorValue,
      r: redValue,
      g: greenValue,
      b: blueValue,
    };

    selectedDevices.forEach((device) => {
      device.attributes.channel
        .filter((channel) => (mainChanged && channel.channel_type === 'main') || (rgbOrBiChanged && ['r', 'g', 'b', 'bi'].includes(channel.channel_type)))
        .forEach((channel) => {
          const controlIndex = getControlIndex(channel.channel_type);
          if (controlIndex !== undefined) {
            const newValue = getFaderValue(0, controlIndex);
            setFaderValue(device.id, channel.id, newValue);
            sendDMXBuffered(emit, device.id, channel.id, newValue);
          }
        });
    });
  }, [masterValue, biColorValue, redValue, greenValue, blueValue]);

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
          allChannels.push({
            ...channel,
            deviceId: device.id,
          });
        }
      }
    }

    allChannels = allChannels.sort((a, b) => a.deviceId - b.deviceId);
    setAllEffectChannels(allChannels);
    setSupportFlags({ supportsBiColor: biColorSupported, supportsRGB: rgbSupported });
  }, [selectedDevices]);

  const getControlIndex = (channelType: string): number | undefined => ({ main: 1, bi: 2, r: 3, g: 4, b: 5 }[channelType]);

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
        const channelValue = getFaderValue(device.id, channel.id);

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

  useEffect(() => {
    if (!supportFlags.supportsBiColor || supportFlags.supportsRGB) return;

    setTimeout(() => {
      const kelvinValue = Math.round((biColorValue / 255) * 8800 + 2200);
      const rgb = iro.Color.kelvinToRgb(kelvinValue);
      setFaderValue(0, 3, rgb.r);
      setFaderValue(0, 5, rgb.b);
    }, 100);
  }, [supportFlags]);

  useEffect(() => {
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

        if (controlIndex !== undefined && getFaderValue(device.id, channel.id) !== getFaderValue(0, controlIndex)) {
          device.upToDate = false;
          break;
        } else {
          device.upToDate = true;
        }
      }
    }
  }, [getFaderValue, selectedDevices, deviceModified]);

  const handleSyncClick = (device: DeviceConfig) => {
    device.attributes.channel.forEach((channel) => {
      const controlIndex = getControlIndex(channel.channel_type);

      if (controlIndex !== undefined) {
        const newValue = getFaderValue(0, controlIndex);
        setFaderValue(device.id, channel.id, newValue);
        emit('fader_value', { deviceId: device.id, value: newValue, channelId: channel.id });
        device.upToDate = true;
      }
    });
  };

  const [isFocused, setIsFocused] = useState(false);
  const scaledDisplayValue = (biColorValue / 255) * 100;
  const [inputValue, setInputValue] = useState<any>(Math.round(scaledDisplayValue) + '%');

  useEffect(() => {
    const finalDisplayValue = isFocused ? scaledDisplayValue.toFixed(1) : Math.round(scaledDisplayValue) + '%';
    setInputValue(finalDisplayValue);
  }, [scaledDisplayValue, isFocused, deviceModified]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 5) {
      setInputValue(value.replace(/[^0-9.,]+/g, ''));
    }
  };

  const handleInputConfirm = () => {
    let numericValue = parseFloat(inputValue.toString().replace(',', '.'));
    if (!isNaN(numericValue)) {
      numericValue = Math.max(0, Math.min(100, numericValue));
      setInputValue(Math.round(numericValue));
      const kelvin = Math.round((Math.round((numericValue / 100) * 255) / 255) * 8800 + 2200);
      const rgb = iro.Color.kelvinToRgb(kelvin);
      setFaderValue(0, 2, Math.round((numericValue / 100) * 255));
      setFaderValue(0, 3, rgb.r);
      setFaderValue(0, 5, rgb.b);
    } else {
      setInputValue(Math.round(scaledDisplayValue));
    }
    setIsFocused(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const handleFocus = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setTimeout(() => {
      event.target.select();
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
            <div className='lightFader innerWindow'>
              <Fader
                height={298}
                id={1}
                sliderGroupId={0}
                name={t('group')}
                className='noBorder'
              />
            </div>
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
            <div className='controlBiColor innerWindow'>
              <span className='controlTitle'>Bi-Color</span>
              <div className={`noSupportText noSupport ${!supportFlags.supportsBiColor ? '' : 'noSupportHidden'}`}>
                <span style={{ marginTop: '-110px' }}>{t('noSupport')}</span>
              </div>
              <div className='controlKelvinPicker'>
                <ColorPicker
                  pickerType='kelvin'
                  red={redValue}
                  green={greenValue}
                  blue={blueValue}
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
                  className='noTopSpace'
                />
                <Fader
                  id={4}
                  sliderGroupId={0}
                  name='G'
                  color='#59E066'
                  className='noTopSpace'
                />
                <div style={{ paddingLeft: '10px' }}>
                  <Fader
                    id={5}
                    sliderGroupId={0}
                    name='B'
                    color='#4271C6'
                    className='noBorder noTopSpace'
                  />
                </div>
              </div>
              <div className='controlColorPicker'>
                <ColorPicker
                  pickerType='wheel'
                  red={redValue}
                  green={greenValue}
                  blue={blueValue}
                  onColorChange={handleColorChange}
                />
              </div>
            </div>
            <div className='controlEffects innerWindow'>
              {!allEffectChannels.length ? (
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
                        paddingBottom: '5px',
                      }}
                    >
                      <Fader
                        key={channel.id}
                        id={channel.id}
                        sliderGroupId={channel.deviceId}
                        name={channel.channel_type}
                        number={channel.deviceId}
                        className={index === allEffectChannels.length - 1 ? 'noBorder' : ''}
                        height={269}
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
            newDesign={document.body.className.includes('defaultB')}
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
