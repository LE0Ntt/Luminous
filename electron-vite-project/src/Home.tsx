import './App.css'
import Button from './components/Button'
import Fader from './components/Fader';
import './index.css'
import React, { useState } from 'react';

const Home = () => {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  const [sliders, setSliders] = useState<SliderConfig[]>([
    { id: 1, initialVolume: 50 },
    { id: 2, initialVolume: 50 },
    { id: 3, initialVolume: 50 },
  ]);

  const handleVolumeChange = (id: number, volume: number) => {
    console.log(`Slider ${id} volume changed to ${volume}%`);
  };

  const addSlider = () => {
    setSliders([
      ...sliders,
      {
        id: sliders.length + 1,
        initialVolume: 50,
      },
    ]);
  };
  

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