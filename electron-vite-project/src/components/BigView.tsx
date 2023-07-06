/**
 * Luminous - A Web-Based Lighting Control System
 * 
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 * 
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 * 
 * @file BigView.tsx
 */
import { useContext, useEffect, useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import Toggle from './Toggle';
import Fader from './Fader';
import { useConnectionContext } from './ConnectionContext';
import { useFaderContext } from './FaderContext';
import { TranslationContext } from './TranslationContext';

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
  const { t } = useContext(TranslationContext);
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const { faderValues, setFaderValue } = useFaderContext(); // FaderContext Test
  const { connected, url } = useConnectionContext();
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

  // Toggle between DMX and Device channels
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
            <span className='text-right'>{t("bb_lights")}</span> <div className='toggleUniverse'><Toggle onClick={handleToggleChange} enabled={localStorage.getItem('dmx') === 'true'} /></div><span className='text-left'>DMX Channel</span>
          </div>
          { DMX ? (
            <>
              <div className='BigViewContent innerWindow'>
                <div className="universeLabel window">
                  U1
                </div>
              </div>
              <div className='BigViewContent innerWindow'>
                <div className="universeLabel window">
                  U2
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='BigViewContent innerWindow'>
                <div className="universeLabel window">
                  U1
                </div>
                
              </div>
              <div className='BigViewContent innerWindow'>
                <div className="universeLabel window">
                  U2
                </div>
              { connected && (
                <div className="sliders">
                  { sliders.slice(1).map((slider) => (
                    <div key={slider.id} className='slidersHeight'>
                      <h2 className='faderText'>{slider.id}</h2>
                      <Fader
                        key={slider.id}
                        id={0}
                        sliderGroupId={slider.id}
                        name={slider.name}
                      />
                    </div>
                  ))}
                </div>
                )}
              </div>
            </>
          )}
          <div className='mainfaderBigView innerWindow'>
          { sliders[0] && (
            <Fader
              height={714}
              id={0}
              sliderGroupId={0}
              name="Master"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BigView;
