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
 * LightFX component
 */
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TranslationContext } from './components/TranslationContext';
import { useConnectionContext } from './components/ConnectionContext';
import { useLocation } from 'react-router-dom';
import { useFaderValue, useFaderContext } from './components/FaderContext';
import './Control.css';
import Fader from './components/Fader';
import DeviceList from './components/DeviceList';
import Button from './components/Button';
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
  attributes: { channel: Channel[] };
  device_type: string;
  universe: string;
  upToDate?: boolean;
}

let sendBuffer: { [key: string]: { deviceId: number; channelId: number; value: number } } = {};
let sendTimer: NodeJS.Timeout | null = null;

// Buffer DMX values and send them in bulk
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

// LightFX
function Control() {
  const { t } = useContext(TranslationContext);
  const { url, connected, emit, on, off } = useConnectionContext();
  const { setFaderValue, getFaderValue } = useFaderContext();
  const location = useLocation();
  const programmaticUpdateRef = useRef(false);
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
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);
  const [allEffectChannels, setAllEffectChannels] = useState<Channel[]>([]);
  const prevFaderRef = useRef<[number, number, number, number, number]>([0, 0, 0, 0, 0]);
  const pickerRef = useRef<iro.ColorPicker | null>(null);
  const [, forceRender] = useState(false);
  const isDraggingBi = useRef(false);
  const [isBiColorHovered, setIsBiColorHovered] = useState(false);
  const mainFaderValue = useFaderValue(0, 1);
  const biColorFaderValue = useFaderValue(0, 2);
  const redFaderValue = useFaderValue(0, 3);
  const greenFaderValue = useFaderValue(0, 4);
  const blueFaderValue = useFaderValue(0, 5);

  // Update selected state
  useLayoutEffect(() => {
    setSelected(selectedDevices.length > 0 && devices.length > 0);
  }, [selectedDevices, devices]);

  // Fetch devices from the server
  const fetchDevices = async () => {
    try {
      const response = await fetch(url + '/fader');
      const data = await response.json();
      const parsedData: DeviceConfig[] = JSON.parse(data);
      parsedData.shift();
      setDevices(parsedData);
      syncDeviceLists(parsedData);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync selected and unselected devices with session storage
  const syncDeviceLists = (newDevices: DeviceConfig[]) => {
    const savedSel: DeviceConfig[] = JSON.parse(sessionStorage.getItem('selectedDevices') || '[]');
    const savedUnsel: DeviceConfig[] = JSON.parse(sessionStorage.getItem('unselectedDevices') || '[]');

    const updSel = savedSel.filter((d) => newDevices.some((n) => n.id === d.id)).map((d) => ({ ...d, ...newDevices.find((n) => n.id === d.id)! }));
    const updUns = savedUnsel.filter((d) => newDevices.some((n) => n.id === d.id)).map((d) => ({ ...d, ...newDevices.find((n) => n.id === d.id)! }));

    const fresh = newDevices.filter((n) => !updSel.concat(updUns).some((d) => d.id === n.id));

    setSelectedDevices(updSel);
    setUnselectedDevices([...updUns, ...fresh]);

    sessionStorage.setItem('selectedDevices', JSON.stringify(updSel));
    sessionStorage.setItem('unselectedDevices', JSON.stringify([...updUns, ...fresh]));
  };

  useLayoutEffect(() => {
    if (connected) fetchDevices();

    setIsSolo(sessionStorage.getItem('controlSolo') === 'true');

    setSelectedDevices(JSON.parse(sessionStorage.getItem('selectedDevices') || '[]'));
    setUnselectedDevices(JSON.parse(sessionStorage.getItem('unselectedDevices') || '[]'));
    setFirstLoad(true);

    const timer = setTimeout(() => setAnimation(true), 500);
    const handleStorageChange = (e: CustomEvent<boolean>) => {
      if (e.type === 'designChange') forceRender((p) => !p);
    };

    window.addEventListener('designChange', handleStorageChange as EventListener);
    on('light_response', fetchDevices);
    on('light_deleted', fetchDevices);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('designChange', handleStorageChange as EventListener);
      off('light_response', fetchDevices);
      off('light_deleted', fetchDevices);
    };
  }, [connected]);

  // Sync sessionStorage + handle Studio-inserts + reset Solo
  useEffect(() => {
    if (firstLoad && devices.length) {
      sessionStorage.setItem('selectedDevices', JSON.stringify(selectedDevices));
      sessionStorage.setItem('unselectedDevices', JSON.stringify(unselectedDevices));

      setHeight(selectedDevices.length === 0 ? -3 : Math.min(selectedDevices.length * 71 + 36, 462));
    }

    const id = location.state && location.state.id;
    if (id && !animation) {
      const found = unselectedDevices.find((d) => d.id === id);
      if (found) {
        setSelectedDevices([...selectedDevices, found]);
        setUnselectedDevices(unselectedDevices.filter((i) => i.id !== found.id));
        setDeviceModified(true);
      }
    }

    if (!selectedDevices.length && isSolo) toggleSolo();
  }, [selectedDevices, unselectedDevices, devices]);

  const handleAddDevice = useCallback(
    (d: DeviceConfig) => {
      setSelectedDevices((c) => [...c, d]);
      setUnselectedDevices((c) => c.filter((i) => i.id !== d.id));
      setDeviceModified(true);
    },
    [selectedDevices, unselectedDevices]
  );

  const handleRemoveDevice = useCallback(
    (d: DeviceConfig) => {
      setSelectedDevices((c) => c.filter((s) => s.id !== d.id));
      setUnselectedDevices((c) => [...c, d]);
      setDeviceModified(true);
    },
    [selectedDevices, unselectedDevices]
  );

  const toggleSolo = () => {
    emit('control_solo', { solo: !isSolo, devices: selectedDevices });
    sessionStorage.setItem('controlSolo', `${!isSolo}`);
    setIsSolo(!isSolo);
  };

  const handleBiSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value); // 0–255
    setFaderValue(0, 2, v);

    const kelvin = (v / 255) * 8800 + 2200;
    const rgb = iro.Color.kelvinToRgb(kelvin);
    setFaderValue(0, 3, rgb.r);
    setFaderValue(0, 4, rgb.g);
    setFaderValue(0, 5, rgb.b);
  };

  // Color Picker
  const handleColorChange = (r: number, g: number, b: number) => {
    setRed(r);
    setGreen(g);
    setBlue(b);
    setFaderValue(0, 3, r);
    setFaderValue(0, 4, g);
    setFaderValue(0, 5, b);
    if (isDraggingBi.current) return;
    const kelvin = iro.Color.rgbToKelvin({ r, g, b });
    setFaderValue(0, 2, Math.min(255, Math.max(0, Math.round(((kelvin - 2200) / 8800) * 255))));
  };

  useEffect(() => {
    setRed(redFaderValue);
    setGreen(greenFaderValue);
    setBlue(blueFaderValue);
    pickerRef.current?.color.set({ r: redFaderValue, g: greenFaderValue, b: blueFaderValue });
  }, [redFaderValue, greenFaderValue, blueFaderValue]);

  // Update fader values when selected devices change
  useEffect(() => {
    if (programmaticUpdateRef.current) {
      programmaticUpdateRef.current = false;
      return;
    }

    const prev = prevFaderRef.current;
    const curr: [number, number, number, number, number] = [mainFaderValue, biColorFaderValue, redFaderValue, greenFaderValue, blueFaderValue];

    const mainChanged = prev[0] !== curr[0];
    const rgbOrBiChanged = [1, 2, 3, 4].some((i) => prev[i] !== curr[i]);

    if (!mainChanged && !rgbOrBiChanged) return;

    prevFaderRef.current = curr;

    selectedDevices.forEach((device) => {
      device.attributes.channel
        .filter((c) => (mainChanged && c.channel_type === 'main') || (rgbOrBiChanged && ['r', 'g', 'b', 'bi'].includes(c.channel_type)))
        .forEach((channel) => {
          const idx = getControlIndex(channel.channel_type);
          if (idx === undefined) return;
          const newVal = curr[idx];
          setFaderValue(device.id, channel.id, newVal);
          sendDMXBuffered(emit, device.id, channel.id, newVal);
        });
    });
  }, [mainFaderValue, biColorFaderValue, redFaderValue, greenFaderValue, blueFaderValue, selectedDevices, setFaderValue, emit]);

  // Check support for effects, bi-color and RGB
  useEffect(() => {
    let bi = false,
      rgb = false;
    let channels: Channel[] = [];

    selectedDevices.forEach((d) =>
      d.attributes.channel.forEach((c) => {
        if (c.channel_type === 'bi') bi = true;
        else if (['r', 'g', 'b'].includes(c.channel_type)) {
          rgb = true;
          bi = true;
        } else if (!['main', 'r', 'g', 'b', 'bi'].includes(c.channel_type)) channels.push({ ...c, deviceId: d.id });
      })
    );

    channels = channels.sort((a, b) => a.deviceId - b.deviceId);
    setAllEffectChannels(channels);
    setSupportFlags({ supportsBiColor: bi, supportsRGB: rgb });
  }, [selectedDevices]);

  const getControlIndex = useCallback((type: string): number | undefined => (({ main: 0, bi: 1, r: 2, g: 3, b: 4 } as any)[type]), []);
  
  // Update fader values for selected devices
  const updateFaderValuesForSelectedDevices = useCallback(() => {
    programmaticUpdateRef.current = true;

    const flags: any = {
      mainSet: false,
      biSet: false,
      rSet: false,
      gSet: false,
      bSet: false,
    };
    const nextPrev: [number, number, number, number, number] = [...prevFaderRef.current]; // Use ref here

    selectedDevices.forEach((d) =>
      d.attributes.channel.forEach((c) => {
        const val = getFaderValue(d.id, c.id);
        const idx = getControlIndex(c.channel_type);

        if (c.channel_type === 'main' && !flags.mainSet) {
          setFaderValue(0, 1, val);
          if (idx !== undefined) nextPrev[idx] = val;
          flags.mainSet = true;
        } else if (['r', 'g', 'b'].includes(c.channel_type) && !flags[c.channel_type + 'Set']) {
          setFaderValue(0, c.channel_type === 'r' ? 3 : c.channel_type === 'g' ? 4 : 5, val);
          if (idx !== undefined) nextPrev[idx] = val;
          flags[c.channel_type + 'Set'] = true;
          flags.biSet = true;
        } else if (c.channel_type === 'bi' && !flags.biSet) {
          if (isDraggingBi.current) return;
          setFaderValue(0, 2, val);
          if (idx !== undefined) nextPrev[idx] = val;
          flags.biSet = true;
        }
      })
    );

    prevFaderRef.current = nextPrev;
  }, [selectedDevices, getFaderValue, setFaderValue, getControlIndex]);

  const mountWheel = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || pickerRef.current) return;
      pickerRef.current = iro.ColorPicker(node, {
        width: 320,
        layout: [{ component: iro.ui.Wheel, options: {} }],
        color: { r: red, g: green, b: blue },
      });
      pickerRef.current!.on('color:change', (c: { rgb: { r: number; g: number; b: number } }) => handleColorChange(c.rgb.r, c.rgb.g, c.rgb.b));
    },
    [red, green, blue, selectedDevices]
  );

  useEffect(() => {
    if (!selected) pickerRef.current = null;
  }, [selected]);

  // Update fader values for selected devices when modified
  useEffect(() => {
    if (deviceModified) {
      updateFaderValuesForSelectedDevices();
      setDeviceModified(false);
    }

    const updated = selectedDevices.map((d) => {
      const up = d.attributes.channel
        .filter((c) => ['main', 'bi', 'r', 'g', 'b'].includes(c.channel_type))
        .every((c) => {
          const idx = getControlIndex(c.channel_type);
          if (idx === undefined) return true;
          return getFaderValue(d.id, c.id) === [mainFaderValue, biColorFaderValue, redFaderValue, greenFaderValue, blueFaderValue][idx];
        });
      return { ...d, upToDate: up };
    });

    if (JSON.stringify(updated) !== JSON.stringify(selectedDevices)) setSelectedDevices(updated);
  }, [mainFaderValue, biColorFaderValue, redFaderValue, greenFaderValue, blueFaderValue, selectedDevices, deviceModified, updateFaderValuesForSelectedDevices, getFaderValue]);

  const handleSyncClick = useCallback(
    (deviceToSync: DeviceConfig) => {
      const updated = selectedDevices.map((d) => {
        if (d.id !== deviceToSync.id) return d;

        d.attributes.channel.forEach((c) => {
          const idx = getControlIndex(c.channel_type);
          if (idx === undefined) return;
          const val = [mainFaderValue, biColorFaderValue, redFaderValue, greenFaderValue, blueFaderValue][idx];
          setFaderValue(d.id, c.id, val);
          emit('fader_value', {
            deviceId: d.id,
            value: val,
            channelId: c.id,
          });
        });
        return { ...d, upToDate: true };
      });

      setSelectedDevices(updated);
    },
    [mainFaderValue, biColorFaderValue, redFaderValue, greenFaderValue, blueFaderValue, selectedDevices, emit, setFaderValue]
  );

  const [isFocused, setIsFocused] = useState(false);
  const scaledDisplay = (biColorFaderValue / 255) * 100;
  const [inputValue, setInputValue] = useState<any>(Math.round(scaledDisplay) + '%');

  // Update input value when display value changes
  useEffect(() => {
    setInputValue(isFocused ? scaledDisplay.toFixed(1) : Math.round(scaledDisplay) + '%');
  }, [scaledDisplay, isFocused, deviceModified]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.length <= 5) setInputValue(value.replace(/[^0-9.,]+/g, ''));
  };

  const handleInputConfirm = () => {
    if (isDraggingBi.current) return;
    let num = parseFloat(inputValue.toString().replace(',', '.'));
    if (!isNaN(num)) {
      num = Math.max(0, Math.min(100, num));
      setInputValue(Math.round(num));
      const kelvin = (((num / 100) * 255) / 255) * 8800 + 2200;
      const rgb = iro.Color.kelvinToRgb(kelvin);
      setFaderValue(0, 3, rgb.r);
      setFaderValue(0, 4, rgb.g);
      setFaderValue(0, 5, rgb.b);
      setFaderValue(0, 2, Math.min(255, Math.max(0, Math.round(((kelvin - 2200) / 8800) * 255))));
      isDraggingBi.current = true;
      resetIsDraggingBi();
    } else setInputValue(Math.round(scaledDisplay));
    setIsFocused(false);
  };

  // Confirm with ENTER
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setTimeout(() => e.target.select(), 50);
  };

  const resetIsDraggingBi = () => {
    setTimeout(() => {
      isDraggingBi.current = false;
    }, 50);
  };

  /* ---------- initial reference sync ---------- */
  useEffect(() => {
    if (firstLoad && selectedDevices.length) {
      updateFaderValuesForSelectedDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstLoad]);

  // Handle wheel and keyboard events for Bi-Color fader
  useEffect(() => {
    const updateBiColorValue = (delta: number) => {
      const newValue = Math.max(0, Math.min(biColorFaderValue + delta, 255));
      if (newValue === biColorFaderValue) return;
      setFaderValue(0, 2, newValue);
      const kelvin = (newValue / 255) * 8800 + 2200;
      const rgb = iro.Color.kelvinToRgb(kelvin);
      setFaderValue(0, 3, rgb.r);
      setFaderValue(0, 4, rgb.g);
      setFaderValue(0, 5, rgb.b);
      isDraggingBi.current = true;
      resetIsDraggingBi();
    };

    const handleWheel = (event: WheelEvent) => {
      if (!isBiColorHovered) return;
      event.preventDefault();
      const step = event.ctrlKey ? 10 : 1;
      updateBiColorValue(-Math.sign(event.deltaY) * step);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isBiColorHovered || ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return; // Ignore if input is focused
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const step = event.ctrlKey ? 10 : 1;
        const direction = event.key === 'ArrowUp' || event.key === 'ArrowRight' ? 1 : -1;
        updateBiColorValue(direction * step);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBiColorHovered, biColorFaderValue, setFaderValue]);

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
                height={298}
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
                onClick={toggleSolo}
                className={`controlButton ${isSolo ? 'isSolo' : ''}`}
              >
                SOLO
              </Button>
            </div>
            {/* Bi-Color */}
            <div
              className='controlBiColor innerWindow'
              onMouseEnter={() => setIsBiColorHovered(true)}
              onMouseLeave={() => setIsBiColorHovered(false)}
            >
              <span className='controlTitle'>Bi-Color</span>
              <div className={`noSupportText noSupport ${!supportFlags.supportsBiColor ? '' : 'noSupportHidden'}`}>
                <span style={{ marginTop: '-110px' }}>{t('noSupport')}</span>
              </div>
              <input
                type='range'
                min={0}
                max={255}
                step={1}
                value={biColorFaderValue}
                onChange={handleBiSliderChange}
                className='biRange'
                onMouseDown={() => (isDraggingBi.current = true)}
                onMouseUp={resetIsDraggingBi}
                onTouchStart={() => (isDraggingBi.current = true)}
                onTouchEnd={resetIsDraggingBi}
              />
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
                <div ref={mountWheel} />
              </div>
            </div>
            {/* Effects */}
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
                  {allEffectChannels.map((ch, i) => (
                    <div
                      key={ch.deviceId + '-' + ch.id}
                      style={{
                        marginLeft: i === 0 ? '-10px' : '',
                        paddingLeft: i === allEffectChannels.length - 1 ? '10px' : '',
                        paddingBottom: '5px',
                      }}
                    >
                      <Fader
                        key={ch.id}
                        id={ch.id}
                        sliderGroupId={ch.deviceId}
                        name={ch.channel_type}
                        number={ch.deviceId}
                        className={i === allEffectChannels.length - 1 ? 'noBorder' : ''}
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
            height={Math.max(height, 30)}
            defaultB={document.body.className.includes('defaultB')}
            defaultC={document.body.className.includes('defaultC')}
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
          isAddButton
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