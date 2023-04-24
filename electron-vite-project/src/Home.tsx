import './App.css'
import Button from './components/Button'
import Fader from './components/Fader';
import './index.css'
import React, { useState } from 'react';

const Home = () => {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  const handleVolumeChange = (volume: number) => {
    console.log(`Volume changed to ${volume}%`);
  };
  

  return (
    <div>
      <div className='h-20 w-20'></div>
      <div>
        Home site.
        <Button onClick={handleClick}>Click me</Button>
        <div>
          <h1>Volume Slider</h1>
          <Fader initialVolume={50} onVolumeChange={handleVolumeChange} />
        </div>
      </div>
    </div>
  )
}

export default Home