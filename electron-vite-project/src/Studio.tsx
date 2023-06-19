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
    setBigView(true);
  };

  const closeBigView = () => {
    setBigView(false);
  };
  // :Big View End ->

  // <- Studio Overview:
  const studioRows = 6;     // Anzahl der Reihen, werden später in Settings einstellbar sein
  const studioColumns = 4;  // Anzahl der Spalten, werden später in Settings einstellbar sein
  const selectedSliders = [ // Slider, die in der Studio Overview angezeigt werden sollen (werden später in Settings einstellbar sein)
    { id: 1, row: 0, col: 0 , fake: false},
    { id: 2, row: 0, col: 1 , fake: false},
    { id: 3, row: 3, col: 2 , fake: false},
    { id: 4, row: 0, col: 3 , fake: false},
    { id: 5, row: 1, col: 0 , fake: false},
    { id: 6, row: 1, col: 1 , fake: true},
    { id: 7, row: 1, col: 2 , fake: false},
    { id: 8, row: 1, col: 3 , fake: false},
    { id: 9, row: 2, col: 0 , fake: false},
    { id: 10, row: 2, col: 1 , fake: false},
    { id: 0, row: 2, col: 2 , fake: true},
  ]
// Erstellt ein Array mit der Anzahl der Reihen und Spalten, die in der Studio Overview angezeigt werden sollen
  const grid = Array(studioRows).fill(undefined).map(() => Array(studioColumns).fill(undefined)); 

  const solo = false;               // Solo Button, wird später in LightFX (Control.tsx) einstellbar sein
  const soloLights = [1, 2, 3];     // übernimmt Gruppen ID der Lampen, die solo geschaltet werden sollen
  // :Studio Overview End ->

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
  
    return () => off("variable_update", eventListener);
  }, [on, off]);


  /* <- Studio Overview 2: */
  // setzt den SliderValue auf den Wert, der vom Server kommt, bzw. in der Fader.tsx gesetzt wird
  const setSliderValue = (value: number, id: number) => {
    setSliders((prevSliders) => {
      return prevSliders.map((slider, index) => {
        if (index === id) {
          return { ...slider, sliderValue: value };
        }
        return slider;
      });
    }
    );
  };
  /* :Stuido Overview 2 Ende -> */

  return (
    <div>
      <select value={language} onChange={handleLanguageChange}>
        <option value="en">{t("English 🇬🇧")}</option>
        <option value="de">{t("German 🇩🇪")}</option>
      </select>
      <div className='scenes window'>
        <ScenesComponent sideId={0} />
      </div>
      <div className='overview window'>
        <div className='studio_overview window'>
          <div className='studio_overview_greenScreen'>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp'/>
              <div className='studio_overview_infopanel'></div>
            </div>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp'/>
              <div className='studio_overview_infopanel'></div>
            </div>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp'/>
              <div className='studio_overview_infopanel'></div>
            </div>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored'/>
              <div className='studio_overview_infopanel'></div>
            </div>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored'/>
              <div className='studio_overview_infopanel'></div>
            </div>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored'/>
              <div className='studio_overview_infopanel'></div>
            </div>
          </div>
          <div className='studio_overview_lights'>
          <div style={{ 
            display: 'grid',
            gridTemplateRows: `repeat(${studioRows}, 1fr)`,
            gridTemplateColumns: `repeat(${studioColumns}, 1fr)`,
            gap: '5px', // Abstand zwischen den Zellen
            width: '604px',
            height: '672px',
            alignItems: 'center',
            justifyItems: 'center',
          }}>
            {grid.map((row, rowIndex) => 
              row.map((_, colIndex) => {
                const selectedSlider = selectedSliders.find((s) => s.row === rowIndex && s.col === colIndex);
                const sliderId = selectedSlider ? selectedSlider.id : null;
                const slider = sliders.find((s) => s.id === sliderId);

                if (
                  selectedSlider &&
                  colIndex < row.length / 2 &&
                  selectedSlider.fake === false
                ) {
                  return (
                    <div key={`${rowIndex}-${colIndex}`}>
                      <div className='studio_overview_light mr-[45px]'> {/* mr-[45px] noch tailwind code */}
                      {slider && (
                        <>
                          <img src="/src/assets/schein3.png" alt="schein" className={'schein'} style={{opacity: (solo && !soloLights.includes(slider.id)) ? 0 : (slider.sliderValue/255) * (sliders[0].sliderValue/255)}} />
                          <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp'/>
                          <div className='studio_overview_infopanel'>
                            {rowIndex}{colIndex}
                            <div>#{slider.id}</div>
                            </div>
                        </>
                      )}
                      </div>
                    </div>
                )} else  if (
                  selectedSlider &&
                  colIndex >= row.length / 2 &&
                  selectedSlider.fake === false
                )  {
                return (
                  <div key={`${rowIndex}-${colIndex}`}>
                    <div className='studio_overview_light ml-[45px]'> {/* ml-[45px] noch tailwind code */}
                    {slider && (
                      <>
                        <img src="/src/assets/schein3.png" alt="schein" className={'schein'} style={{opacity: (solo && !soloLights.includes(slider.id)) ? 0 : (slider.sliderValue/255) * (sliders[0].sliderValue/255)}} />
                        <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored'/>
                        <div className='studio_overview_infopanel'>
                          {rowIndex}{colIndex}
                          <div>#{slider.id}</div>
                        </div>                        
                      </>
                    )}
                    </div>
                  </div> 
                )
              } else if (
                selectedSlider &&
                selectedSlider.fake === true
              ) {
                return (
                  <div key={`${rowIndex}-${colIndex}`}>
                    <div className='studio_overview_light ml-[45px]'> {/* ml-[45px] noch tailwind code */}
                    {slider && (
                      <div>
                        FAKE       
                      </div>
                    )}
                    </div>
                  </div> 
                )
              }
              // Standardfall: Leerzeichen für nicht ausgewählte Slider
              return <div key={`${rowIndex}-${colIndex}`} />;
            })
          )}
          </div>
          </div>
          <div className='studio_overview_testchart'>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_testchart_lamp'/>
              <div className='studio_overview_infopanel'></div>
            </div>
            <div className='studio_overview_light'>
              <img src="/src/assets/lamp.png" alt="Lamp" className='studio_overview_testchart_lamp'/>
              <div className='studio_overview_infopanel'></div>
            </div>
          </div>
        </div>
      </div>
      <div className='mainfader window'>
        { sliders[0] && (
          <Fader
            height={340}
            sliderValue={sliders[0].sliderValue}
            setSliderValue={(value: number) => setSliderValue(value, 0)}
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
                  setSliderValue={(value: number) => setSliderValue(value, slider.id)}
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