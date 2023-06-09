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
import { useNavigate } from 'react-router-dom';
import ScenesComponent from './components/ScenesComponent';
import BigView from './components/BigView';

const Studio = () => {
  const navigate = useNavigate();

  // Language
  const { t, language, setLanguage } = useContext(TranslationContext);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "en" | "de");
  };
  // Button to open Control
  const handleClick = (id: number) => {
    navigate('/control', { state: { id: id } });
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

  interface SliderConfig {
    id: number;
    sliderValue: number;
    name: string;
  };

  const { connected, on, off, url } = useConnectionContext();
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
  
    // Entfernen des Event-Listeners
    return () => off("variable_update", eventListener);
  }, [on, off]);

  return (
    <div>
      <select value={language} onChange={handleLanguageChange}>
        <option value="en">{t("english")}</option>
        <option value="de">{t("german")}</option>
        <option value="fr">{t("french")}</option>
        <option value="cn">{t("chinese")}</option>
        <option value="ru">{t("russian")}</option>
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
                  <svg className='centerIcon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m19,20c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-4c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v4Zm-12,0c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-8c0-.28.1-.52.29-.71.19-.19.43-.29.71-.29s.52.1.71.29c.19.19.29.43.29.71v8Zm14-8c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29h-4c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71c.19-.19.43-.29.71-.29h1V4c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v7h1c.28,0,.52.1.71.29.19.19.29.43.29.71Zm-6,4c0,.28-.1.52-.29.71s-.43.29-.71.29h-1v3c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-3h-1c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71.43-.29.71-.29h4c.28,0,.52.1.71.29s.29.43.29.71Zm-2-4c0,.28-.1.52-.29.71s-.43.29-.71.29-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71V4c0-.28.1-.52.29-.71.19-.19.43-.29.71-.29s.52.1.71.29.29.43.29.71v8Zm-4-4c0,.28-.1.52-.29.71s-.43.29-.71.29h-4c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71.43-.29.71-.29h1v-3c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v3h1c.28,0,.52.1.71.29s.29.43.29.71Z"/></svg>
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