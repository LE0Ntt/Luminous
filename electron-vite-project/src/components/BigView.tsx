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

  const handleToggleChange = (status: boolean | ((prevState: boolean) => boolean)) => {
    localStorage.setItem('dmx', `${status}`);
    setDMX(status);
  };

  // On first render, set the DMX value to localStorage
  useEffect (() => {
    setDMX(localStorage.getItem('dmx') === 'true');
  }, []);  
  
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
                      sliderGroupId={1}
                      name={slider.name}
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
