/**
 * Control.tsx
 * @author Leon Hölzel, Darwin Pietas
 */
import './App.css';
import './index.css';
import './Studio.css';
import Button from './components/Button';
import Fader from './components/Fader';
import { useState, useEffect, useContext } from 'react';
import { useConnectionContext } from "./components/ConnectionContext";
import { TranslationContext } from './components/TranslationContext';
import ScenesComponent from './components/ScenesComponent';

const Studio = () => {
  
  // Language
  const { t } = useContext(TranslationContext);
  // Button test
  const handleClick = (id: number) => {
    console.log('Button clicked!' + id);
  };

  const openBigView = () => {
    console.log('Big View opened!');
  };

  // <- Slider:
  interface SliderConfig {
    id: number;
    sliderValue: number;
    name: string;
  };

  const { connected, on, off } = useConnectionContext();
  const [sliders, setSliders] = useState<SliderConfig[]>([]);

  // Add a new slider to the server and update the client with the new slider data
  const addSlider = () => {
    setSliders([
      ...sliders,
      {
        id: sliders.length + 1,
        sliderValue: 0,
        name: "",
      },
    ]);
  };
  // :Slider End ->

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
  }, []);

  useEffect(() => {
    const eventListener = (data: any) => {
      console.log("Received data from server:", data.value);
      setSliders((prevSliders) => {
        return prevSliders.map((slider, index) => {
          if (index === data.id) {
            return { ...slider, sliderValue: data.value };
          }
          return slider;
        });
      });
    };
    
    on("variable_update", eventListener);
  
    // Funktion zum Entfernen des Event-Listeners
    const removeEventListener = () => {
      off("variable_update", eventListener);
    };
  
    return removeEventListener;
  }, [on, off]);

  return (
    <div>
      <div className='h-20 w-20'></div> {/* Tailwind code, muss noch geändert werden */}
      <div className='scenes window'>
        <ScenesComponent />
      </div>
      <div className='overview window'>
        <div className='studio_overview window'></div>
      </div>
      <div className='mainfader window'>
        { sliders[0] && (
          <Fader
            height={340}
            sliderValue={sliders[0].sliderValue}
            id={0}
            name="Master"
          />
        )}
      </div>
      <div>
        <button onClick={addSlider}>Add Slider</button>
        <div className='faders window'>
        { connected ? (
          <div className="sliders">
            { sliders.slice(1).map((slider) => (
              <div key={slider.id} className='slidersHeight'>
                <h2 className='faderText'>{slider.id}</h2>
                <Fader
                  key={slider.id}
                  sliderValue={slider.sliderValue}
                  id={slider.id}
                  name={slider.name}
                />
                <Button 
                  onClick={() => handleClick(slider.id)} 
                  className="buttonOpenControl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="25" viewBox="0 96 960 960" width="25" className='rotateIcon'><path d="M150 854q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T150 794h187q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T337 854H150Zm0-496q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T150 298h353q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T503 358H150Zm306.825 578Q444 936 435.5 927.375T427 906V741q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T487 741v53h323q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T810 854H487v52q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625Zm-120-248Q324 688 315.5 679.375T307 658v-52H150q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T150 546h157v-54q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T367 492v166q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625ZM457 606q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T457 546h353q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T810 606H457Zm165.825-165Q610 441 601.5 432.375T593 411V246q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T653 246v52h157q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T810 358H653v53q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625Z"/></svg>
                </Button>

              </div>
            ))}
          </div>
          ) : (
            <div className='notConnected'>{t("notConnected")}</div>
          )}
          <Button
            onClick={() => openBigView()}
            className="buttonBigView"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="25" viewBox="0 96 960 960" width="25" className='centerIcon'><path d="M180 936q-24 0-42-18t-18-42V276q0-24 18-42t42-18h249q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T429 276H180v600h600V627q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T840 627v249q0 24-18 42t-42 18H180Zm181.13-241.391Q353 686 352.5 674q-.5-12 8.5-21l377-377H549q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T549 216h261q12.75 0 21.375 8.625T840 246v261q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625-12.825 0-21.325-8.625T780 507V319L403 696q-8.442 8-20.721 8t-21.149-9.391Z"/></svg>
          </Button>
        </div>
      </div>
    </div>
  )
};

export default Studio;