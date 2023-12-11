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
import React, { useContext, useEffect, useState } from 'react';
import { TranslationContext } from './components/TranslationContext';
import { useConnectionContext } from './components/ConnectionContext';
import { useLocation } from 'react-router-dom';
import './Control.css';
import Fader from './components/Fader';
import DeviceList from './components/DeviceList';
import Button from './components/Button';
import ColorPicker from './components/ColorPicker';
import { useFaderContext } from './components/FaderContext';
import AddScene from './components/AddScene';
import AdminPassword from './components/AdminPassword';
import ControlHandler from './components/ControlHandler';
import iro from '@jaames/iro';

// LightFX
function Control() {
  const { t } = useContext(TranslationContext);
  const { url, connected, emit, on, off } = useConnectionContext();
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceConfig[]>([]);
  const [unselectedDevices, setUnselectedDevices] = useState<DeviceConfig[]>([]);
  const [firstLoad, setFirstLoad] = useState(false);
  const [animiation, setAnimiation] = useState(false);
  const location = useLocation();
  const { faderValues, setFaderValue } = useFaderContext();
  const [addScene, setAddScene] = useState(false);
  const [saveSceneAdmin, setSaveSceneAdmin] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [prevFaderValues, setPrevFaderValues] = useState<number[]>([]);

  interface DeviceConfig {
    id: number;
    deviceValue: number;
    name: string;
    attributes: any;
    device_type: string;
    universe: string;
  }

  useEffect(() => {
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
      setAnimiation(true);
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
    if (id && !animiation) {
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

  const handleAddDevice = (device: DeviceConfig) => {
    setSelectedDevices([...selectedDevices, device]);
    setUnselectedDevices(unselectedDevices.filter((item) => item.id !== device.id));
  };

  const handleRemoveDevice = (device: DeviceConfig) => {
    setSelectedDevices(selectedDevices.filter((s) => s.id !== device.id));
    setUnselectedDevices([...unselectedDevices, device]);
  };

  // Since the more complex shape of the main window here cannot be displayed with normal divs due to the translucency and the height-adjustable property, we had to use an SVG. Hence also the following paths.
  const [height, setHeight] = useState(-3);
  const pathFill = `M10 17A10 10 0 0120 7h1820a10 10 0 0110 10v890a10 10 0 01-10 10H424a10 10 0 01-10-10V${height}a10 10 0 00-10-10H20a10 10 0 01-10-10V17z`;
  const pathStroke = `M1849.5 17v890a9.5 9.5 0 01-9.5 9.5H424a9.5 9.5 0 01-9.5-9.5V${height}c0-5.8-4.7-10.5-10.5-10.5H20a9.5 9.5 0 01-9.5-9.5V17A9.5 9.5 0 0120 7.5h1820a9.5 9.5 0 019.5 9.5z`;
  var devicesHeight = 907 - height;

  const selected = selectedDevices[0] && devices.length > 0;
  var deviceWindow = 'devices window' + (selected ? ' devicesSmall' : ''); // 5px upper right corner if selected
  deviceWindow = animiation ? deviceWindow + ' devicesAnimation' : deviceWindow;
  const mainAnimation = 'controlMain' + (animiation ? ' mainAnimation' : '');
  const hide = 'noSelectWindow window' + (selected ? ' hide' : '');
  const selectAnimation = 'selectedDevices' + (animiation ? ' devicesAnimation' : '');

  // Solo Button
  const toggleSolo = () => {
    emit('controlSolo', { solo: !isSolo, devices: selectedDevices });
    sessionStorage.setItem('controlSolo', `${!isSolo}`);
    setIsSolo(!isSolo);
  };

  // Color Picker
  const [red, setRed] = useState(faderValues[0][3]);
  const [green, setGreen] = useState(faderValues[0][4]);
  const [blue, setBlue] = useState(faderValues[0][5]);
  const [kelvin, setKelvin] = useState(faderValues[0][2]);

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

  // Give changed fader values to ControlHandler
  useEffect(() => {
    const controlValues = faderValues[0].slice(1);
    const changedFaders = controlValues.map((value, index) => {
      return prevFaderValues && prevFaderValues.length > 0 && value !== prevFaderValues[index];
    });
    ControlHandler(selectedDevices, controlValues, changedFaders, emit);
    setPrevFaderValues(controlValues);
  }, [faderValues]);

  // Misc fader support
  interface SliderConfig {
    attributes: any;
    universe: string;
    id: number;
    sliderValue: number;
    name: string;
  }

  const [sliders, setSliders] = useState<SliderConfig[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch(url + '/fader');
        const data = await response.json();
        setSliders(JSON.parse(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchSliders();
  }, []);

  const [effects, setEffects] = useState(true);

  useEffect(() => {
    let effectFound = false;

    for (const device of selectedDevices) {
      for (const channel of device.attributes.channel) {
        if (!['main', 'r', 'g', 'b', 'bi'].includes(channel.channel_type)) {
          setEffects(true);
          effectFound = true;
          break;
        }
      }

      if (effectFound) break;
    }

    if (!effectFound) setEffects(false);
  }, [selectedDevices]);

  return (
    <>
      {selected ? (
        <>
          <div
            className={selectAnimation}
            style={{ height: height - 17 + 'px' }}
          >
            <DeviceList
              devices={selectedDevices}
              isAddButton={false}
              onDeviceButtonClick={handleRemoveDevice}
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
              <div className='controlKelvinPicker'>
                <ColorPicker
                  pickerType='kelvin'
                  red={faderValues[0][3]}
                  green={faderValues[0][4]}
                  blue={faderValues[0][5]}
                  onColorChange={handleColorChange}
                />
              </div>
            </div>
            {/* RGB */}
            <div className='controlRGB innerWindow'>
              <span className='controlTitle'>RGB</span>
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
              <span className='controlTitle'>{t('effects')}</span>
              <div className='centeredWrapper'>{effects ? null : <span className='noSupport'>{t('noSupport')}</span>}</div>
              <div className='sliders slidersEffects'>
                {sliders
                  .slice(1)
                  .filter((slider) => selectedDevices.some((channel) => channel.id === slider.id))
                  .map((slider, index, filteredSliders) => {
                    const totalSliders = filteredSliders.length;
                    return (
                      <React.Fragment key={slider.id}>
                        {slider.attributes.channel
                          .filter(
                            (channel: { id: number; channel_type: string }) =>
                              channel.channel_type !== 'main' && channel.channel_type !== 'r' && channel.channel_type !== 'g' && channel.channel_type !== 'b' && channel.channel_type !== 'bi'
                          )
                          .map((channel: { id: number; channel_type: string }, channelIndex: number, filteredChannels: string | any[]) => {
                            const isLastFader = index === totalSliders - 1 && channelIndex === filteredChannels.length - 1;
                            return (
                              <div key={slider.id + '-' + channel.id}>
                                <h2 className='faderText'>{slider.id}</h2>
                                <Fader
                                  key={slider.id + '-' + channel.id}
                                  id={channel.id}
                                  sliderGroupId={slider.id}
                                  name={channel.id !== 0 ? channel.channel_type : slider.name}
                                  className={isLastFader ? 'noBorder' : ''}
                                />
                              </div>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
              </div>
            </div>
          </div>
          {/* Background */}
          <svg
            className={mainAnimation}
            width='1860'
            height='930'
            viewBox='0 0 1860 930'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g filter='url(#filter0_b_873_8277)'>
              <g
                filter='url(#filter1_d_873_8277)'
                shapeRendering='geometricPrecision'
              >
                <path
                  d={pathFill}
                  fill='var(--fillMedium)'
                />
                <path
                  d={pathStroke}
                  stroke='var(--onepStroke)'
                />
              </g>
            </g>
            <defs>
              <filter
                id='filter0_b_873_8277'
                x='-90'
                y='-93'
                width='2040'
                height='1110'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'
              >
                <feFlood
                  floodOpacity='0'
                  result='BackgroundImageFix'
                />
                <feGaussianBlur
                  in='BackgroundImageFix'
                  stdDeviation='50'
                />
                <feComposite
                  in2='SourceAlpha'
                  operator='in'
                  result='effect1_backgroundBlur_873_8277'
                />
                <feBlend
                  in='SourceGraphic'
                  in2='effect1_backgroundBlur_873_8277'
                  result='shape'
                />
              </filter>
              <filter
                id='filter1_d_873_8277'
                x='0'
                y='0'
                width='1860'
                height='930'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'
              >
                <feFlood
                  floodOpacity='0'
                  result='BackgroundImageFix'
                />
                <feColorMatrix
                  in='SourceAlpha'
                  values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                  result='hardAlpha'
                />
                <feOffset dy='3' />
                <feGaussianBlur stdDeviation='5' />
                <feComposite
                  in2='hardAlpha'
                  operator='out'
                />
                <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0' />
                <feBlend
                  in2='BackgroundImageFix'
                  result='effect1_dropShadow_873_8277'
                />
                <feBlend
                  in='SourceGraphic'
                  in2='effect1_dropShadow_873_8277'
                  result='shape'
                />
              </filter>
            </defs>
          </svg>
        </>
      ) : (
        <>
          <div className='noSelectWindow'>
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
            <div className='noDevice'>
              <p dangerouslySetInnerHTML={{ __html: t('noDevices') }}></p>
            </div>
          </div>
        </>
      )}
      <div
        className={deviceWindow}
        style={{ height: devicesHeight + 'px' }}
      >
        <DeviceList
          devices={unselectedDevices}
          isAddButton={true}
          onDeviceButtonClick={handleAddDevice}
        />
      </div>
      <div className={hide}></div>
      {addScene && <AddScene onClose={() => setAddScene(false)} />}
      {saveSceneAdmin && <AdminPassword onClose={() => setSaveSceneAdmin(false)} />}
    </>
  );
}

export default Control;
