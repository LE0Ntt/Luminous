/**
 * Control.tsx
 * @author Leon Hölzel, Darwin Pietas
 */
import './App.css';
import './index.css';
import './Studio.css';
import Button from './components/Button';
import Fader from './components/Fader';
import { useState } from 'react';
import { useConnectionContext } from "./components/ConnectionContext";

const Studio = () => {
  // Button test
  const handleClick = (id: number) => {
    console.log('Button clicked!' + id);
  };

  // <- Slider:
  interface SliderConfig {
    id: number;
    initialVolume: number;
  };

  const { connected } = useConnectionContext();
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
        { connected ? (
          <div className="sliders">
            {sliders.map((slider) => (
              <div key={slider.id}>
                <h2 className='faderText'>{slider.id}</h2>
                <Fader
                  initialVolume={slider.initialVolume}
                />
                <Button 
                  onClick={() => handleClick(slider.id)} 
                  className="buttonOpenControl"
                >
                  B
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