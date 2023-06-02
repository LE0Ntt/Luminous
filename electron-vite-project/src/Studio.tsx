/**
 * Control.tsx
 * @author Leon Hölzel, Darwin Pietas
 */
import './index.css';
import './Studio.css';
import Button from './components/Button';
import Fader from './components/Fader';
import { useState, useEffect, useContext } from 'react';
import { useConnectionContext } from "./components/ConnectionContext";
import { TranslationContext } from './components/TranslationContext';
import ScenesComponent from './components/ScenesComponent';
import BigView from './components/BigView';

const Studio = () => {
  
  // Language
  const { t, language, setLanguage } = useContext(TranslationContext);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "en" | "de");
  };
  // Button test
  const handleClick = (id: number) => {
    console.log('Button clicked!' + id);
  };

  // <- Big View:

  const [bigView, setBigView] = useState(false);

  const openBigView = () => {
    console.log('Big View opened!');
    setBigView(true);
  };

  const closeBigView = () => {
    console.log('Big View closed!');
    setBigView(false);
  };
  // :Big View End ->

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
      <select value={language} onChange={handleLanguageChange}>
          <option value="en">{t("english")}</option>
          <option value="de">{t("german")}</option>
        </select>
      <div className='scenes window'>
        <ScenesComponent sideId={0} />
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
                  <svg className='rotateIcon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M160-200q-17 0-28.5-11.5T120-240q0-17 11.5-28.5T160-280h160q17 0 28.5 11.5T360-240q0 17-11.5 28.5T320-200H160Zm0-480q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h320q17 0 28.5 11.5T520-720q0 17-11.5 28.5T480-680H160Zm320 560q-17 0-28.5-11.5T440-160v-160q0-17 11.5-28.5T480-360q17 0 28.5 11.5T520-320v40h280q17 0 28.5 11.5T840-240q0 17-11.5 28.5T800-200H520v40q0 17-11.5 28.5T480-120ZM320-360q-17 0-28.5-11.5T280-400v-40H160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h120v-40q0-17 11.5-28.5T320-600q17 0 28.5 11.5T360-560v160q0 17-11.5 28.5T320-360Zm160-80q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520h320q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440H480Zm160-160q-17 0-28.5-11.5T600-640v-160q0-17 11.5-28.5T640-840q17 0 28.5 11.5T680-800v40h120q17 0 28.5 11.5T840-720q0 17-11.5 28.5T800-680H680v40q0 17-11.5 28.5T640-600Z"/></svg>
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
            <svg className='centerIcon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm160-240q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104L415-359q-11 11-27 11t-28-12Z"/></svg>
          </Button>
          {bigView && <BigView onClose={closeBigView} />}
        </div>
      </div>
    </div>
  )
};

export default Studio;