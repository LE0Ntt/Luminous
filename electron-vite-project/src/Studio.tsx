/**
 * Control.tsx
 * @author Leon Hölzel, Darwin Pietas
 */
import './App.css';
import './index.css';
import './Studio.css';
import Button from './components/Button';
import Fader from './components/Fader';
import { useState, useEffect } from 'react';
import { useConnectionContext } from "./components/ConnectionContext";

const Studio = () => {
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
    initialVolume: number;
  };

  const { connected, on, off } = useConnectionContext();
  const [sliders, setSliders] = useState<SliderConfig[]>([]);

  // Add a new slider to the server and update the client with the new slider data
  const addSlider = () => {
    setSliders([
      ...sliders,
      {
        id: sliders.length + 1,
        initialVolume: 0,        // muss vom server vorgegeben werden
      },
    ]);
  };
  // :Slider End ->

  useEffect(() => {
    const eventListener = (data: any) => {
      console.log("Received data from server:", data.variable);
      // Hier kannst du den Slider-Wert aktualisieren
      const updatedSliders = sliders.map((slider, index) => {
        if (index === 0) {
          slider.initialVolume = data.variable;
        }
        return slider;
      });
      setSliders(updatedSliders);
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
      <div className='h-20 w-20'></div>
      <div className='scenes window'>
        <h1>Scenes</h1>
      </div>
      <div className='overview window'>
        <div className='studio_overview window'></div>
      </div>
      <div className='mainfader window'>
      </div>
      <div>
        <h1>Volume Sliders</h1>
        <button onClick={addSlider}>Add Slider</button>
        <div className='faders window'>
          <Button
            onClick={() => openBigView()}
            className="buttonBigView"
          >
            O
          </Button>
        { connected ? (
          <div className="sliders">
            {sliders.map((slider) => (
              <div key={slider.id} className='slidersHeight'>
                <h2 className='faderText'>{slider.id}</h2>
                <Fader
                  initialVolume={slider.initialVolume}
              
                />
                <Button 
                  onClick={() => handleClick(slider.id)} 
                  className="buttonOpenControl"
                >
                  C
                </Button>

              </div>
            ))}
          </div>
          ) : (
            <div>Not Connected</div>
          )}
        </div>
      </div>
    </div>
  )
};

export default Studio;