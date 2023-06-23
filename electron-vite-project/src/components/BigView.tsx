import { useEffect, useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import Toggle from './Toggle';
import Fader from './Fader';
import { useConnectionContext } from './ConnectionContext';
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

  const { connected, on, off, url } = useConnectionContext();
  const [sliders, setSliders] = useState<SliderConfig[]>([]);
  const [DMX, setDMX] = useState(false);

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

  
  const handleToggleChange = (status: boolean | ((prevState: boolean) => boolean)) => {
    localStorage.setItem('dmx', `${status}`);
    setDMX(status);
  };

  // On first render, set the DMX value to localStorage
  useEffect (() => {
    setDMX(localStorage.getItem('dmx') === 'true');
  }, []);  

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
          <span className='text-right'>Devices</span> <div className='toggleUniverse'><Toggle onClick={handleToggleChange} enabled={localStorage.getItem('dmx') === 'true'} /></div><span className='text-left'>DMX Channel</span>
        </div>
        { DMX ? (
          <>
            <div className='BigViewContent innerWindow'>
              <p>U1</p>
            </div>
            <div className='BigViewContent innerWindow'>
              <p>U2</p>
            </div>
          </>
        ) : (
          <>
            <div className='BigViewContent innerWindow'>
              <p>Drag faders into this quick selection</p>
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
                      sliderValue={slider.sliderValue}
                      setSliderValue={(value: number) => setSliderValue(value, slider.id)}
                    />
                  </div>
                ))}
              </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BigView;
