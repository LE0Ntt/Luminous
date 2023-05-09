import './App.css';
import Button from './components/Button';
import Fader from './components/Fader';
import './index.css';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const Home = () => {

  const [data, setData] = useState([{}]);

  useEffect(() => { //test um direkt was Ã¼ber api abzurufen
    fetch("http://localhost:5000/members").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  },  []);

  // Button test
  const handleClick = () => {
    console.log('Button clicked!');
  };

  // <- Slider:
  interface SliderConfig {
    id: number;
    initialVolume: number;
  };

  const [sliders, setSliders] = useState<SliderConfig[]>([{ id: 1, initialVolume: 50 }]);

  const [socketInstance, setSocketInstance] = useState<Socket>();
  // Connect to the socket.io server on the backend
  useEffect(() => {
    const socket = io("http://localhost:5000/test", {
      transports: ["websocket"],
      withCredentials: true
    });

    setSocketInstance(socket);

    socket.on("variable_update", (data) => {
      console.log(data);
    });

    return function cleanup() {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socketInstance) 
    socketInstance.on("variable_update", (data) => {
      console.log(data);
    });

    return function cleanup() {
      if (socketInstance) 
      socketInstance.off("variable_update");
    };
  }, [socketInstance]);

/*
  // When the component mounts, get the initial slider data from the server
  useEffect(() => {
    socket.on('initial_sliders', (initialSliders: SliderConfig[]) => {
      setSliders(initialSliders);
    });
  }, []);
*/
  // When a slider value changes, emit an event to the server with the updated value
  const handleVolumeChange = (id: number, volume: number) => {
    console.log({volume});
    if (socketInstance) 
      socketInstance.emit('slider_change', { id, volume });
  };

  // When the server sends an update for a slider value, update the corresponding slider
  useEffect(() => {
    console.log("update")
    if (socketInstance) 
      socketInstance.on('variable_update', (updatedSlider: SliderConfig) => {
        setSliders((prevSliders) =>
          prevSliders.map((slider) =>
            slider.id === updatedSlider.id ? updatedSlider : slider
          )
        );
      });
  }, [socketInstance]);

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
};

export default Home;