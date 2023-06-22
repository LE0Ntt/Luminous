import { useEffect, useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import Toggle from './Toggle';
import Fader from './Fader';
import { useConnectionContext } from './ConnectionContext';
import { useFaderContext } from './FaderContext';
import { useNavigate } from 'react-router-dom';

interface BigViewProps {
  onClose: () => void;
}

interface SliderConfig {
  id: number;
  sliderValue: number;
  name: string;
};

function BigView({ onClose }: BigViewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  // Button to open Control
  const handleClick = (id: number) => {
    navigate('/control', { state: { id: id } });
  };

  const { faderValues, setFaderValue } = useFaderContext(); // FaderContext Test
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
      setFaderValue(data.id, data.value);
    };
    
    on("variable_update", eventListener);
  
    return () => off("variable_update", eventListener);
  }, [on, off]); 


  
  return (
    <div>
      <div className="BigViewOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
      <div className="BigViewContainer">
        <Button
          onClick={() => handleClose()}
          className="buttonClose"
        >
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='BigViewLayer'>
          <span className='text-right'>Devices</span> <div className='toggleUniverse'><Toggle /></div><span className='text-left'>DMX Channel</span>
        </div>
        <div className='BigViewContent innerWindow'>
        { connected && (
          <div className="sliders">
            { sliders.slice(1).map((slider) => (
              <div key={slider.id} className='slidersHeight'>
                <h2 className='faderText'>{slider.id}</h2>
                <Fader
                  key={slider.id}
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
          )}
        </div>
        <div className='BigViewContent innerWindow'>
          Text 2
        </div>
      </div>
    </div>
  );
}

export default BigView;
