import './App.css'
import Button from './components/Button'
import Fader from './components/Fader';
import './index.css'
import React, { useState } from 'react';

const Home = () => {

  // Button test
  const handleClick = () => {
    console.log('Button clicked!');
  };


  // <- Slider:
  interface SliderConfig {
    id: number;
    initialVolume: number;
  }

  // erstellt Slider am anfang (momentan einen Test Slider)
  const [sliders, setSliders] = useState<SliderConfig[]>([
    { id: 1, initialVolume: 50 },
  ]);

  // gibt Slider Wert in der Console aus
  const handleVolumeChange = (id: number, volume: number) => {
    console.log(`Slider ${id} volume changed to ${volume}%`);
  };

  // erstellt neuen Slider
  const addSlider = () => {
    setSliders([
      ...sliders,
      {
        id: sliders.length + 1,
        initialVolume: 50,        // muss vom server vorgegeben werden
      },
    ]);
  };
  // :Slider End ->

  return (
    <div>
      <div className='h-20 w-20'></div>
      <div>
        Home site.
        <Button onClick={handleClick}>Click me</Button>
        <h1>Volume Sliders</h1>
      <button onClick={addSlider}>Add Slider</button>
      <div className="sliders">
        {sliders.map((slider) => (
          <div key={slider.id}>
            <h2>Slider {slider.id}</h2>
            <Fader
              initialVolume={slider.initialVolume}
              onVolumeChange={(volume) => handleVolumeChange(slider.id, volume)}
            />
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}

export default Home