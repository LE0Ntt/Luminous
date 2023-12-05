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
import Toggle from './Toggle';
import Fader from './Fader';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';

interface BigViewProps {
  onClose: () => void;
}

interface SliderConfig {
  attributes: any;
  universe: string;
  id: number;
  sliderValue: number;
  name: string;
}

function BigView({ onClose }: BigViewProps) {
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();
  const [sliders, setSliders] = useState<SliderConfig[]>([]);
  const [DMX, setDMX] = useState(() => localStorage.getItem('dmx') === 'true'); // DMX or Device channels

  // Fetch slider data from the server on mount
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

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      {/* Overlay to close the modal when clicked outside */}
      <div className='BigViewContainer'>
        <button
          className='buttonClose'
          onClick={onClose}
        >
          <div className='xClose'>
            <div className='xClose xiClose'></div>
          </div>
        </button>
        <div className='BigViewLayer'>
          <span className='text-right'>{t('bb_lights')}</span>
          <div className='toggleUniverse'>
            <Toggle
              onClick={handleToggleChange}
              enabled={localStorage.getItem('dmx') === 'true'}
            />
          </div>
          <span className='text-left'>DMX Channel</span>
        </div>
        {['U1', 'U2'].map((universe) => (
          <div
            className='BigViewContent innerWindow'
            key={universe}
          >
            <div className='universeLabel window'>{universe}</div>
            <div className='sliders'>
              {DMX
                ? Array.from({ length: 512 }).map((_, index) => {
                    const mappedIndex = index + 1;
                    const matchedSlider = sliders.find(
                      (slider) => slider.universe === universe && slider.attributes.channel.some((channel: { dmx_channel: string }) => parseInt(channel.dmx_channel) === mappedIndex)
                    );
                    const matchedChannel = matchedSlider ? matchedSlider.attributes.channel.find((channel: { dmx_channel: string }) => parseInt(channel.dmx_channel) === mappedIndex) : null;
                    return (
                      <div
                        key={index}
                        className='sliderHeight'
                      >
                        <h2 className='faderText'>{mappedIndex}</h2>
                        <Fader
                          key={index}
                          id={matchedChannel ? matchedChannel.id : mappedIndex}
                          sliderGroupId={matchedSlider ? matchedSlider.id : universe === 'U1' ? 692 : 693}
                          name={matchedSlider ? matchedSlider.name + ' ' + matchedChannel.channel_type : 'Channel'}
                          className={index === 511 ? 'noBorder' : ''}
                        />
                      </div>
                    );
                  })
                : sliders
                    .slice(1)
                    .filter((slider) => slider.universe === universe)
                    .map((slider, sliderIndex, filteredSliders) =>
                      slider.attributes.channel.map((channel: { id: number; channel_type: string }, channelIndex: number) => (
                        <div
                          key={slider.id + '-' + channel.id}
                          className={`sliderHeight ${channel.id !== 0 ? 'grayBackground' : ''}`}
                        >
                          <h2 className='faderText'>{slider.id}</h2>
                          <Fader
                            key={slider.id + '-' + channel.id}
                            id={channel.id}
                            sliderGroupId={slider.id}
                            name={channel.id !== 0 ? channel.channel_type : slider.name}
                            className={sliderIndex === filteredSliders.length - 1 && channelIndex === slider.attributes.channel.length - 1 ? 'noBorder' : ''}
                          />
                        </div>
                      ))
                    )}
            </div>
          </div>
        ))}
        <div className='mainfaderBigView innerWindow'>
          {sliders[0] && (
            <Fader
              height={714}
              id={0}
              sliderGroupId={0}
              name='Master'
            />
          )}
        </div>
      </div>
    </>
  );
}

export default BigView;
