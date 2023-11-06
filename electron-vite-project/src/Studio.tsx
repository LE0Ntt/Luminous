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
 * @file Studio.tsx
 */
import './index.css';
import './Studio.css';
import Button from './components/Button';
import Fader from './components/Fader';
import { useState, useEffect, useContext, useRef } from 'react';
import { useConnectionContext } from "./components/ConnectionContext";
import { TranslationContext } from './components/TranslationContext';
import { useNavigate } from 'react-router-dom';
import ScenesComponent from './components/ScenesComponent';
import BigView from './components/BigView';
import { useFaderContext } from './components/FaderContext';
import AddScene from './components/AddScene';
import lampImage from './assets/lamp.png';
import schein from './assets/schein3.png';
import schein2 from './assets/schein2.png';
import fillLight from './assets/fillLight.png';

const Studio = () => {
  const navigate = useNavigate();
  // FaderValues from FaderContext
  const { faderValues, setFaderValue } = useFaderContext();
  const { url } = useConnectionContext();
  // Language
  const { t } = useContext(TranslationContext);

  // Button to open Control
  const handleClick = (id: number) => {
    navigate('/control', { state: { id: id } });
  };

  const [bigView, setBigView] = useState(false);
  const [sliders, setSliders] = useState<SliderConfig[]>([]);
  const [addScene, setAddScene] = useState(false);
  const [, forceRender] = useState(false); // Used to force a rerender
  const [glowId, setGlowId] = useState<number | null>(null);
  const refsArray = useRef<(HTMLDivElement | null)[]>([]);

  const studioRows = 6;
  const studioColumns = 4;
  const selectedSliders = [
    { id: 5, row: 0, col: 0 , fake: false},
    { id: 5, row: 0, col: 1, fake: false},
    { id: 6, row: 0, col: 2, fake: false},
    { id: 6, row: 0, col: 3, fake: false},
    { id: 4, row: 1, col: 0, fake: false},
    { id: 4, row: 1, col: 1, fake: false},
    { id: 7, row: 1, col: 2, fake: false},
    { id: 7, row: 1, col: 3, fake: false},
    { id: 3, row: 2, col: 0, fake: false},
    { id: 3, row: 2, col: 1, fake: false},
    { id: 8, row: 2, col: 2, fake: false},
    { id: 8, row: 2, col: 3, fake: false},
    { id: 2, row: 3, col: 0, fake: false},
    { id: 2, row: 3, col: 1, fake: false},
    { id: 9, row: 3, col: 2, fake: false},
    { id: 9, row: 3, col: 3, fake: false},
    { id: 1, row: 4, col: 0, fake: false},
    { id: 1, row: 4, col: 1, fake: false},
    { id: 15, row: 4, col: 2, fake: false},
    { id: 17, row: 4, col: 3, fake: false},
  ]
// Creates an array with the number of rows and columns to be displayed in the Studio Overview
  const grid = Array(studioRows).fill(undefined).map(() => Array(studioColumns).fill(undefined)); 

  const solo = false;               // Solo button, will be adjustable later in LightFX (Control.tsx) # maybe this is not needed anymore and lagacy code
  const soloLights = [1, 2, 3];     // Takes over group ID of the lamps that are to be switched solo

  interface SliderConfig {
    id: number;
    name: string;
  };

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch(url + '/fader');
        const data = await response.json();
        setSliders(JSON.parse(data));
        loadFaderValues(JSON.parse(data)); // Loads the fader values from the database
      } catch (error) {
        console.log(error);
      }
    };

    fetchSliders();

    // Listen for changes to the display order
    const handleStorageChange = (event: CustomEvent<boolean>) => {
      if (event.type === 'reverseOrder') {
        forceRender(prev => !prev);
      }
    };
    window.addEventListener('reverseOrder', handleStorageChange as EventListener);
    return () => window.removeEventListener('reverseOrder', handleStorageChange as EventListener);
  }, []);

  // Loads the fader values from the database
  function loadFaderValues(sliders: any[]) {
    const array: any[][] = [];
    sliders.forEach(item => {
      const { id, sliderValue } = item;
      if (!array[id]) {
        array[id] = [];
      }
      if (item.attributes && item.attributes.channel) {
        item.attributes.channel.forEach((channelItem: any) => {
          const channelId = parseInt(channelItem.id, 10);
          const sliderValue = channelItem.sliderValue !== undefined ? channelItem.sliderValue : 0;
          array[id][channelId] = sliderValue;
          setFaderValue(id, channelId, sliderValue);
        });
      }
    });
  }

  // Focuses the fader when clicked in the overview
  const handleGlowAndFocus = (id: number) => {
    setGlowId(id);
    setTimeout(() => setGlowId(null), 500);
    refsArray.current[id]?.focus();
  };

  useEffect(() => {
    // Clean up refs and timeouts # this is ro prevent memory leaks
    return () => {
      refsArray.current = [];
      // if you have any timeouts, clear them here
    };
  }, []);
  


  return (
    <div className="studioLayout" style={{flexDirection: localStorage.getItem('reverseOrder') === 'true' ? 'row-reverse' : 'row'}}>
      <div className="scenesAndFaders">
        <div className='scenes window'>
          <ScenesComponent sideId={0} setAddScene={setAddScene} />
        </div>
        { !bigView && (
          <>
            <div className='mainfader window'>
              { sliders[0] && (
                <Fader
                  height={340}
                  id={0}
                  sliderGroupId={0}
                  name="Master"
                />
              )}
            </div>
            <div>
              <div className='faders window'>
                <div className="sliders">
                  { sliders.slice(1).map((slider) => (
                    <div
                      key={slider.id}
                      className='slidersHeight'
                      ref={(el) => (refsArray.current[slider.id] = el)}
                      tabIndex={-1} // Make div focusable
                      onFocus={() => {
                        // Scroll the element into view when it gains focus
                        refsArray.current[slider.id]?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                          inline: 'nearest'
                        });
                      }}
                      style={{
                        /* boxShadow: glowId === slider.id ? '0 0 5px 2px rgba(255, 255, 255, 0.2)' : '',
                        backgroundColor: glowId === slider.id ? 'rgba(255, 255, 255, 0.2)' : '', */
                        transform: glowId === slider.id ? 'scale(1.03) translateY(-5px)' : '',
                        transition: 'transform 0.3s ease-in-out', /* box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out, */
                        outline: 'none'
                      }}
                    >
                      <h2 style={{textShadow: glowId === slider.id ? '0 0 30px #fff' : ''}} className='faderText'>{slider.id}</h2>
                      <Fader
                        key={slider.id}
                        id={0}
                        sliderGroupId={slider.id}
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
                <Button
                  onClick={() => setBigView(true)}
                  className="buttonBigView"
                >
                  <svg className='centerIcon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm160-240q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104L415-359q-11 11-27 11t-28-12Z"/></svg>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className='overview window'>
        <div className='studio_overview window'>
          <div className='studio_overview_greenScreen'>
            <div className='studio_overview_infopanel studio_overview_infopanel_greenscreen' onClick={() => handleGlowAndFocus(13)} style={{ cursor: 'pointer' }}>
              <div className='studio_overview_infopanel_text'>Greenscreen</div>
              <div className='studio_overview_infopanel_brightness'>
                {(((faderValues[13][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0)=== "0" ? t("Off") : 
                (((faderValues[13][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0) + "%"}
              </div>
            </div>
            <div className='studio_overview_light'>
              <img src={schein2} alt="schein" className={'schein'} style={{top:`-35px`, opacity: 
                              (solo && !soloLights.includes(13)) ? 0 : (faderValues[13][0]/255) * (faderValues[0][0]/255)}} />
              <img src={fillLight} alt="Lamp" className='studio_overview_greenScreen_lamp' style={{top:`20px`}}/>
            </div>
            <div className='studio_overview_light'>
              <img src={schein2} alt="schein" className={'schein'} style={{top:`-35px`, opacity: 
                              (solo && !soloLights.includes(13)) ? 0 : (faderValues[13][0]/255) * (faderValues[0][0]/255)}} />
              <img src={fillLight} alt="Lamp" className='studio_overview_greenScreen_lamp' style={{top:`20px`}}/>
            </div>
            <div className='studio_overview_light'>
              <img src={schein2} alt="schein" className={'schein'} style={{top:`-35px`, opacity: 
                              (solo && !soloLights.includes(13)) ? 0 : (faderValues[13][0]/255) * (faderValues[0][0]/255)}} />
              <img src={fillLight} alt="Lamp" className='studio_overview_greenScreen_lamp' style={{top:`20px`}}/>
            </div>
            <div className='studio_overview_light'>
              <img src={schein2} alt="schein" className={'schein'} style={{top:`-35px`, opacity: 
                              (solo && !soloLights.includes(13)) ? 0 : (faderValues[13][0]/255) * (faderValues[0][0]/255)}} />
              <img src={fillLight} alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored' style={{top:`20px`}}/>
            </div>
            <div className='studio_overview_light'>
              <img src={schein2} alt="schein" className={'schein'} style={{top:`-35px`, opacity: 
                              (solo && !soloLights.includes(13)) ? 0 : (faderValues[13][0]/255) * (faderValues[0][0]/255)}} />
              <img src={fillLight} alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored' style={{top:`20px`}}/>
            </div>
            <div className='studio_overview_light'>
              <img src={schein2} alt="schein" className={'schein'} style={{top:`-35px`, opacity: 
                              (solo && !soloLights.includes(13)) ? 0 : (faderValues[13][0]/255) * (faderValues[0][0]/255)}} />
              <img src={fillLight} alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored' style={{top:`20px`}}/>
            </div>
          </div>
          <div className='studio_overview_lights'>
            <div style={{ 
              display: 'grid',
              gridTemplateRows: `repeat(${studioRows}, 1fr)`,
              gridTemplateColumns: `repeat(${studioColumns}, 1fr)`,
              gap: '5px',
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
                        <div className='studio_overview_light marginRight45'>
                        {slider && (
                          <>
                            <img src={schein} alt="schein" className={'schein'} style={{opacity: 
                              (solo && !soloLights.includes(slider.id)) ? 0 : (faderValues[slider.id][0]/255) * (faderValues[0][0]/255)}} />
                            <img src={lampImage} alt="Lamp" className='studio_overview_greenScreen_lamp'/>
                            <div className='studio_overview_infopanel' onClick={() => handleGlowAndFocus(slider.id)} style={{ cursor: 'pointer' }}>
                              <div className='studio_overview_infopanel_text'>#{slider.id}</div>
                              <div className='studio_overview_infopanel_brightness'>
                                {((solo && !soloLights.includes(slider.id)) ? 0 : 
                                ((faderValues[slider.id][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0)=== "0" ? t("Off") : 
                                (((faderValues[slider.id][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0) + "%"}
                              </div>
                            </div>
                          </>
                        )}
                        </div>
                      </div>
                  )} else  if (
                    selectedSlider &&
                    colIndex >= row.length / 2 &&
                    selectedSlider.fake === false
                  ) {
                    return (
                      <div key={`${rowIndex}-${colIndex}`}>
                        <div className='studio_overview_light marginLeft45'>
                        {slider && (
                          <>
                            <img src={schein} alt="schein" className={'schein'} style={{opacity: 
                              (solo && !soloLights.includes(slider.id)) ? 0 : (faderValues[slider.id][0]/255) * (faderValues[0][0]/255)}} />
                            <img src={lampImage} alt="Lamp" className='studio_overview_greenScreen_lamp lamp_mirrored'/>
                            <div className='studio_overview_infopanel' onClick={() => handleGlowAndFocus(slider.id)} style={{ cursor: 'pointer' }}>
                              <div className='studio_overview_infopanel_text'>#{slider.id}</div>
                              <div className='studio_overview_infopanel_brightness'>
                                {((solo && !soloLights.includes(slider.id)) ? 0 : 
                                ((faderValues[slider.id][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0)=== "0" ? t("Off") : 
                                (((faderValues[slider.id][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0) + "%"}
                              </div>
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
                        <div className='studio_overview_light'>
                        {slider && (
                          <div>
                            PROP
                          </div>
                        )}
                        </div>
                      </div> 
                    )
                  }
                  return <div key={`${rowIndex}-${colIndex}`} />;
                })
              )}
            </div>
          </div>
          <div className='studio_overview_testchart'>
            <div className='studio_overview_infopanel studio_overview_infopanel_greenscreen' onClick={() => handleGlowAndFocus(12)} style={{ cursor: 'pointer' }}>
              <div className='studio_overview_infopanel_text'>{t('testchart')}</div>
              <div className='studio_overview_infopanel_brightness'>
                {(((faderValues[12][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0)=== "0" ? t("Off") : 
                (((faderValues[12][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0) + "%"}
            </div>
            </div>
            <div className='studio_overview_infopanel studio_overview_infopanel_greenscreen' style={{top:`-20px`, cursor: 'pointer'}} onClick={() => handleGlowAndFocus(11)}>
              <div className='studio_overview_infopanel_text'>{t('testchart')}</div>
              <div className='studio_overview_infopanel_brightness'>
                {(((faderValues[11][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0)=== "0" ? t("Off") : 
                (((faderValues[11][0] * 10 / 255) * (faderValues[0][0] * 10 / 255))).toFixed(0) + "%"}
            </div>
            </div>
            <div className='studio_overview_light'>
              <img src={schein} alt="schein" className={'schein'} style={{top:`5px`, transform:`rotate(180deg)`, opacity: 
                              (solo && !soloLights.includes(11)) ? 0 : (faderValues[11][0]/255) * (faderValues[0][0]/255)}} />
              <img src={lampImage} alt="Lamp" className='studio_overview_testchart_lamp' style={{top:`-50px`}}/>
            </div>
            <div className='studio_overview_light'>
              <img src={schein} alt="schein" className={'schein'} style={{top:`5px`, transform:`rotate(180deg)`, opacity: 
                              (solo && !soloLights.includes(12)) ? 0 : (faderValues[12][0]/255) * (faderValues[0][0]/255)}} />
              <img src={lampImage} alt="Lamp" className='studio_overview_testchart_lamp' style={{top:`-50px`}}/>
            </div>
          </div>
        </div>
      </div>
      {bigView && <BigView onClose={() => setBigView(false)} />}
      {addScene && <AddScene onClose={() => setAddScene(false)} />}
    </div>
  )
};

export default Studio;