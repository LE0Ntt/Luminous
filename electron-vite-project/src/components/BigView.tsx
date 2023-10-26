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
import { TranslationContext } from './TranslationContext';
import React from 'react';

interface BigViewProps {
  onClose: () => void;
}

interface SliderConfig {
  attributes: any;
  universe: string;
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

  const { url } = useConnectionContext();
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
      <div className="backgroundOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
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
                <div className="sliders">
                  {Array.from({ length: 512 }).map((_, index) => {
                    const mappedIndex = index + 1;
                    const matchedSlider = sliders.find((slider) =>
                      slider.universe === "U1" &&
                      slider.attributes.channel.some((channel: { dmx_channel: string; }) => parseInt(channel.dmx_channel) === mappedIndex)
                    );
                    if (matchedSlider) {
                      const matchedChannel = matchedSlider.attributes.channel.find((channel: { dmx_channel: string; }) => parseInt(channel.dmx_channel) === mappedIndex);
                      return (
                        <div key={index} className="sliderHeight">
                          <h2 className="faderText">{mappedIndex}</h2>
                          <Fader
                            key={index}
                            id={matchedChannel.id}
                            sliderGroupId={matchedSlider.id}
                            name={matchedSlider.name + " " + matchedChannel.channel_type}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="sliderHeight">
                          <h2 className="faderText">{mappedIndex}</h2>
                          <Fader
                            key={index}
                            id={mappedIndex}
                            sliderGroupId={692}
                            name="Channel"
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
              <div className='BigViewContent innerWindow'>
                <div className="universeLabel window">
                  U2
                </div>
                <div className="sliders">
                  {Array.from({ length: 512 }).map((_, index) => {
                    const mappedIndex = index + 1;
                    const matchedSlider = sliders.find((slider) =>
                      slider.universe === "U2" &&
                      slider.attributes.channel.some((channel: { dmx_channel: string; }) => parseInt(channel.dmx_channel) === mappedIndex)
                    );
                    if (matchedSlider) {
                      const matchedChannel = matchedSlider.attributes.channel.find((channel: { dmx_channel: string; }) => parseInt(channel.dmx_channel) === mappedIndex);
                      return (
                        <div key={index} className="sliderHeight">
                          <h2 className="faderText">{mappedIndex}</h2>
                          <Fader
                            key={index}
                            id={matchedChannel.id}
                            sliderGroupId={matchedSlider.id}
                            name={matchedSlider.name + " " + matchedChannel.channel_type}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="sliderHeight">
                          <h2 className="faderText">{mappedIndex}</h2>
                          <Fader
                            key={index}
                            id={mappedIndex}
                            sliderGroupId={693}
                            name="Channel"
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='BigViewContent innerWindow'>
                <div className="universeLabel window">
                  U1
                </div>
                <div className="sliders">
                  {sliders
                    .slice(1)
                    .filter((slider) => slider.universe === "U1")
                    .map((slider) => (
                      <React.Fragment key={slider.id}>
                        {slider.attributes.channel.map((channel: { id: number; channel_type: string }) => (
                          <div key={slider.id + '-' + channel.id} className={`sliderHeight ${channel.id !== 0 ? 'grayBackground' : ''}`}>
                            <h2 className="faderText">{slider.id}</h2>
                            <Fader
                              key={slider.id + '-' + channel.id}
                              id={channel.id}
                              sliderGroupId={slider.id}
                              name={channel.id !== 0 ? channel.channel_type : slider.name}
                            />
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                </div>
              </div>
              <div className='BigViewContent innerWindow'>
                <div className="universeLabel window">
                  U2
                </div>
                <div className="sliders">
                  {sliders
                    .slice(1)
                    .filter((slider) => slider.universe === "U2")
                    .map((slider) => (
                      <React.Fragment key={slider.id}>
                        {slider.attributes.channel.map((channel: { id: number; channel_type: string }) => (
                          <div key={slider.id + '-' + channel.id} className={`sliderHeight ${channel.id !== 0 ? 'grayBackground' : ''}`}>
                            <h2 className="faderText">{slider.id}</h2>
                            <Fader
                              key={slider.id + '-' + channel.id}
                              id={channel.id}
                              sliderGroupId={slider.id}
                              name={channel.id !== 0 ? channel.channel_type : slider.name}
                            />
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                </div>
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
