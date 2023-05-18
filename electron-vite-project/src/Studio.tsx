/**
 * Control.tsx
 * @author Leon Hölzel, Darwin Pietas
 */
import './App.css';
import Button from './components/Button';
import Fader from './components/Fader';
import './index.css';
import './Studio.css';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

  const [sliders, setSliders] = useState<SliderConfig[]>([{ id: 1, initialVolume: 0 }]);

  //const [socketInstance, setSocketInstance] = useState<Socket>();
  const socketInstance = useRef<Socket>();
  // Connect to the socket.io server on the backend
  useEffect(() => {
    socketInstance.current = io(`http://${window.location.hostname}:5000/test`);

    socketInstance.current?.on("variable_update", (data) => {
      console.log(data);
    });
    // When the component mounts, get the initial slider data from the server
    socketInstance.current?.on('initial_sliders', (initialSliders: SliderConfig[]) => {
      setSliders(initialSliders);
    });
    return () => { socketInstance.current?.disconnect(); };
  }, []);

  // When a slider value changes, emit an event to the server with the updated value
  const handleVolumeChange = (id: number, volume: number) => {
    socketInstance.current?.emit('fader_value', { value: volume });
  };

  // Add a new slider to the server and update the client with the new slider data
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
        <h1>Volume Sliders</h1>
        <button onClick={addSlider}>Add Slider</button>
        <div className='faders window'>
        { socketInstance ? (
          <div className="sliders">
            {sliders.map((slider) => (
              <div key={slider.id}>
                <h2>Slider {slider.id}</h2>
                <Fader
                  initialVolume={slider.initialVolume}
                  onVolumeChange={(volume) => handleVolumeChange(slider.id, volume)}
                />
                <Button onClick={() => handleClick(slider.id)}>Button</Button>
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