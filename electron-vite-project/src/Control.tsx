import React, {  useRef, useContext, useEffect, useState } from "react";
import { TranslationContext } from "./components/TranslationContext";
import { useConnectionContext } from "./components/ConnectionContext";
import './Control.css';
import Fader from './components/Fader';
import DeviceList from './components/DeviceList';

function Control() {
  const { t } = useContext(TranslationContext);
  const { connected, on, off } = useConnectionContext();
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceConfig[]>([]);
  const [unselectedDevices, setUnselectedDevices] = useState<DeviceConfig[]>([]);
  const [firstLoad, setFirstLoad] = useState(false);

  // <- Device:
  interface DeviceConfig {
    id: number;
    deviceValue: number;
    name: string;
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try { 
        const response = await fetch('http://127.0.0.1:5000/fader');
        const data = await response.json();
        const parsedData = JSON.parse(data);
        parsedData.shift(); // remove master
        setDevices(parsedData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDevices();

    // Load saved selection from session storage
    const savedSelectedDevices = JSON.parse(sessionStorage.getItem('selectedDevices') || '[]');
    const savedUnselectedDevices = JSON.parse(sessionStorage.getItem('unselectedDevices') || '[]');

    setSelectedDevices(savedSelectedDevices);
    setUnselectedDevices(savedUnselectedDevices);
    setFirstLoad(true)
  }, []);

  useEffect(() => {
    // Save selection in session storage
    if(firstLoad && devices.length > 0) {
      sessionStorage.setItem('unselectedDevices', JSON.stringify(unselectedDevices));
      sessionStorage.setItem('selectedDevices', JSON.stringify(selectedDevices));

      setHeight(Math.min(selectedDevices.length * 71 + 36, 462));

      //Check if devices got changed on the server
      const isDifferent = devices.every((device) => {
        return unselectedDevices.includes(device) && selectedDevices.includes(device);
      });
      
      if(isDifferent || unselectedDevices.length + selectedDevices.length !== devices.length) {
        setUnselectedDevices(devices); 
        setSelectedDevices([])
        console.log("devices changed")
      }
    }
    
    //sessionStorage.setItem('selectedDevices', JSON.stringify(JSON.parse('[]'))) // zum reseten
    //sessionStorage.setItem('unselectedDevices', JSON.stringify(JSON.parse('[]'))) // zum reseten
  }, [selectedDevices, unselectedDevices, devices]);

  const handleAddDevice = (device: DeviceConfig) => {
    setSelectedDevices([...selectedDevices, device]);
    setUnselectedDevices(unselectedDevices.filter(item => item.id !== device.id));
  };

  const handleRemoveDevice = (device: DeviceConfig) => {
    setSelectedDevices(selectedDevices.filter((s) => s.id !== device.id));
    setUnselectedDevices([...unselectedDevices, device]);
  };

  // Since the more complex shape of the main window here cannot be displayed with normal divs due to the translucency and the height-adjustable property, we had to use an SVG. Hence also the following paths.
  const [height, setHeight] = useState(107);
  const pathFill   = `M10 17A10 10 0 0120 7h1820a10 10 0 0110 10v890a10 10 0 01-10 10H424a10 10 0 01-10-10V${height}a10 10 0 00-10-10H20a10 10 0 01-10-10V17z`;
  const pathStroke = `M1849.5 17v890a9.5 9.5 0 01-9.5 9.5H424a9.5 9.5 0 01-9.5-9.5V${height}c0-5.8-4.7-10.5-10.5-10.5H20a9.5 9.5 0 01-9.5-9.5V17A9.5 9.5 0 0120 7.5h1820a9.5 9.5 0 019.5 9.5z`;
  var devicesHeight = 907 - height;

  return (
    <div className="containerControl">
      { selectedDevices[0] && devices.length > 0 ? (
      <div>
        <div className="devices window" style={{ height: devicesHeight + 'px' }}>
          <DeviceList devices={unselectedDevices} isAddButton={true} onDeviceButtonClick={handleAddDevice} />
        </div>
        <div className="selectedDevices" style={{ height: height - 17 + 'px' }}>
          <DeviceList devices={selectedDevices} isAddButton={false} onDeviceButtonClick={handleRemoveDevice} />
        </div>

        <div className="innerContainer">
          <div className="lightFader innerWindow"></div>
          <div className="controlButtons innerWindow"></div>
          <div className="controlBiColor innerWindow"></div>
          <div className="controlRGB innerWindow"></div>
          <div className="controlEffects innerWindow"></div>
        </div>
        
        <svg className="controlMain" width="1860" height="930" viewBox="0 0 1860 930" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_b_873_8277)">
            <g filter="url(#filter1_d_873_8277)" shapeRendering="geometricPrecision">
              <path d={pathFill} fill="var(--fillMedium)" fillOpacity=".6"/>
              <path d={pathStroke} stroke="var(--onepStroke)"/>
            </g>
          </g>
          <defs>
            <filter id="filter0_b_873_8277" x="-90" y="-93" width="2040" height="1110" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feGaussianBlur in="BackgroundImageFix" stdDeviation="50"/>
              <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_873_8277"/>
              <feBlend in="SourceGraphic" in2="effect1_backgroundBlur_873_8277" result="shape"/>
            </filter>
            <filter id="filter1_d_873_8277" x="0" y="0" width="1860" height="930" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="3"/>
              <feGaussianBlur stdDeviation="5"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_873_8277"/>
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_873_8277" result="shape"/>
            </filter>
          </defs>
        </svg>
      </div>
      ) : (
        <div>
          <div className="noSelectWindow window">
            <div className="lightFader innerWindow"></div>
            <div className="controlButtons innerWindow"></div>
            <div className="controlBiColor innerWindow"></div>
            <div className="controlRGB innerWindow"></div>
            <div className="controlEffects innerWindow"></div>
          </div>
          <div className="devicesBig window">
            <DeviceList devices={unselectedDevices} isAddButton={true} onDeviceButtonClick={handleAddDevice} />
          </div>
      </div>
      )}
    </div>
  );
}

export default Control;