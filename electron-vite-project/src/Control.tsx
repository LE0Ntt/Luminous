import React, {  useRef, useContext, useEffect, useState } from "react";
import { TranslationContext } from "./components/TranslationContext";
import { useConnectionContext } from "./components/ConnectionContext";
import './Control.css';
import Fader from './components/Fader';

function Control() {
  const { t } = useContext(TranslationContext);
  const { connected, on, off } = useConnectionContext();
  const [sliders, setSliders] = useState<SliderConfig[]>([]);
  const [selectedSliders, setSelectedSliders] = useState<SliderConfig[]>([]);
  const [unselectedSliders, setUnselectedSliders] = useState<SliderConfig[]>([]);
  const [firstLoad, setFirstLoad] = useState(false);
  
  // <- Slider:
  interface SliderConfig {
    id: number;
    sliderValue: number;
    name: string;
  };

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/fader');
        const data = await response.json();
        setSliders(JSON.parse(data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchSliders();

    // Load saved selection from local storage
    const savedSelectedSliders = JSON.parse(localStorage.getItem('selectedSliders') || '[]');
    const savedUnselectedSliders = JSON.parse(localStorage.getItem('unselectedSliders') || '[]');

    setSelectedSliders(savedSelectedSliders);
    setUnselectedSliders(savedUnselectedSliders);
    setFirstLoad(true)
  }, []);

  useEffect(() => {
    // Save selection in local storage
    if(firstLoad && sliders.length > 0) {
      localStorage.setItem('unselectedSliders', JSON.stringify(unselectedSliders));
      localStorage.setItem('selectedSliders', JSON.stringify(selectedSliders));

      setHeight(selectedSliders.length * 70 + 60);

      //Check if sliders got changed on the server
      const isDifferent = sliders.every((slider) => {
        return unselectedSliders.includes(slider) && selectedSliders.includes(slider);
      });
      
      if(isDifferent || unselectedSliders.length + selectedSliders.length !== sliders.length) {
        setUnselectedSliders(sliders); 
        setSelectedSliders([])
        console.log("sliders changed")
      }
    }
      
    //localStorage.setItem('selectedSliders', JSON.stringify(JSON.parse('[]'))) // zum reseten
    //localStorage.setItem('unselectedSliders', JSON.stringify(JSON.parse('[]'))) // zum reseten
  }, [selectedSliders, unselectedSliders, sliders]);

  const handleAddSlider = (slider: SliderConfig) => {
    setSelectedSliders([...selectedSliders, slider]);
    setUnselectedSliders(unselectedSliders.filter(item => item.id !== slider.id));
  };

  const handleRemoveSlider = (slider: SliderConfig) => {
    setSelectedSliders(selectedSliders.filter((s) => s.id !== slider.id));
    setUnselectedSliders([...unselectedSliders, slider]);
  };

  // Since the more complex shape of the main window here cannot be displayed with normal divs due to the translucency and the height-adjustable property, we had to use an SVG. Hence also the following paths.
  const [height, setHeight] = useState(200);
  const pathFill   = `M10 17A10 10 0 0120 7h1820a10 10 0 0110 10v890a10 10 0 01-10 10H424a10 10 0 01-10-10V${height}a10 10 0 00-10-10H20a10 10 0 01-10-10V17z`;
  const pathStroke = `M1849.5 17v890a9.5 9.5 0 01-9.5 9.5H424a9.5 9.5 0 01-9.5-9.5V${height}c0-5.8-4.7-10.5-10.5-10.5H20a9.5 9.5 0 01-9.5-9.5V17A9.5 9.5 0 0120 7.5h1820a9.5 9.5 0 019.5 9.5z`;
  var devicesHeight = 907 - height;

  return (
    <div>
      { selectedSliders[0] ? (
      <div>
        <div className="devices window" style={{ height: devicesHeight + 'px' }}>
          <ul>
            {unselectedSliders.map((slider, index) => (
              <React.Fragment key={slider.id}>
                <li style={{ borderBottom: '1px solid black', height: '70px', display: 'flex', alignItems: 'center' }}>
                  <span>{slider.name}</span>
                  <button
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleAddSlider(slider)}
                  >
                    +
                  </button>
                </li>
                {index !== unselectedSliders.length - 1 && <hr />}
              </React.Fragment>
            ))}
          </ul>
        </div>
        <div className="selectedDevices" style={{ height: height - 17 + 'px' }}>
        <ul>
            {selectedSliders.map((slider, index) => (
              <React.Fragment key={slider.id}>
                <li style={{ borderBottom: '1px solid black', height: '70px', display: 'flex', alignItems: 'center' }}>
                  <span>{slider.name}</span>
                  <button
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleRemoveSlider(slider)}
                  >
                    -
                  </button>
                </li>
                {index !== selectedSliders.length - 1 && <hr />}
              </React.Fragment>
            ))}
          </ul>
        </div>

        <svg className="controlMain" width="1860" height="930" viewBox="0 0 1860 930" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_b_873_8277)">
            <g filter="url(#filter1_d_873_8277)" shapeRendering="geometricPrecision">
              <path d={pathFill} fill="#F6F6F6" fillOpacity=".6"/>
              <path d={pathStroke} stroke="#fff"/>
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
          </div>
          <div className="devicesBig window">
          <ul>
            {unselectedSliders.map((slider, index) => (
              <React.Fragment key={slider.id}>
                <li style={{ borderBottom: '1px solid black', height: '70px', display: 'flex', alignItems: 'center' }}>
                  <span>{slider.name}</span>
                  <button
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleAddSlider(slider)}
                  >
                    +
                  </button>
                </li>
                {index !== unselectedSliders.length - 1 && <hr />}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
      )}
    </div>
  );
}


export default Control;