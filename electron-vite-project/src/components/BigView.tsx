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
import React, { useContext, useEffect, useRef, useState } from 'react';
import './BigView.css';
import Toggle from './Toggle';
import Fader from './Fader';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';
import ScrollButton from './ScrollButton';

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
  const [renderedFaders, setRenderedFaders] = useState(20); // Number of DMX faders to render

  const universes = ['U1', 'U2'];
  // Initialize refs for scroll buttons for each universe
  const scrollRefs = useRef(
    universes.reduce((acc, universe) => {
      acc[universe] = React.createRef<HTMLDivElement>();
      return acc;
    }, {} as { [key: string]: React.RefObject<HTMLDivElement> })
  ).current;

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

  // Render DMX faders in steps to prevent lag
  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;

    if (DMX) {
      intervalId = setInterval(() => {
        setRenderedFaders((current) => {
          const nextCount = current + 164; // Step size
          if (nextCount >= 512) {
            clearInterval(intervalId);
            return 512;
          }
          return nextCount;
        });
      }, 300);
    } else {
      setRenderedFaders(20);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [DMX]);

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      <div className='BigViewContainer BigViewBackdrop' />
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
        {universes.map((universe) => (
          <div
            className='BigViewContent innerWindow'
            key={universe}
          >
            <div className='universeLabel window'>{universe}</div>
            <ScrollButton
              scrollRef={scrollRefs[universe]}
              elementWidth={102}
              elementsInView={16}
              direction='prev'
            />
            <ScrollButton
              scrollRef={scrollRefs[universe]}
              elementWidth={102}
              elementsInView={16}
              direction='next'
            />
            <div
              className='sliders'
              ref={scrollRefs[universe]}
            >
              {DMX
                ? Array.from({ length: renderedFaders }).map((_, index) => {
                    const mappedIndex = index + 1;
                    const matchedSlider = sliders.find(
                      (slider) => slider.universe === universe && slider.attributes.channel.some((channel: { dmx_channel: string }) => parseInt(channel.dmx_channel) === mappedIndex)
                    );
                    const matchedChannel = matchedSlider ? matchedSlider.attributes.channel.find((channel: { dmx_channel: string }) => parseInt(channel.dmx_channel) === mappedIndex) : null;
                    return (
                      <div
                        key={index}
                        style={{
                          marginLeft: index === 0 ? '-10px' : '',
                          paddingLeft: index === 511 ? '10px' : '',
                        }}
                      >
                        <Fader
                          key={index}
                          id={matchedChannel ? matchedChannel.id : mappedIndex}
                          sliderGroupId={matchedSlider ? matchedSlider.id : universe === 'U1' ? 692 : 693}
                          name={matchedSlider ? matchedSlider.name + ' ' + matchedChannel.channel_type : 'Channel'}
                          number={mappedIndex}
                          className={index === 511 ? 'noBorder' : ''}
                        />
                      </div>
                    );
                  })
                : sliders
                    .slice(1)
                    .filter((slider) => slider.universe === universe)
                    .map((slider, sliderIndex, filteredSliders) => (
                      <div
                        key={slider.id}
                        className={slider.attributes.channel.length > 1 ? 'faderGroup' : ''}
                        style={{ marginLeft: sliderIndex === 0 && slider.attributes.channel.length > 1 ? '-8px' : '' }}
                      >
                        {slider.attributes.channel.map((channel: { id: number; channel_type: string }, channelIndex: number) => (
                          <div
                            key={slider.id + '-' + channel.id}
                            className={`${channel.id !== 0 ? 'grayBackground' : ''}`}
                            style={{
                              marginLeft: sliderIndex === 0 && channelIndex === 0 && slider.attributes.channel.length == 1 ? '-10px' : '',
                              paddingLeft: sliderIndex === filteredSliders.length - 1 && slider.attributes.channel.length == 1 ? '10px' : '',
                            }}
                          >
                            <Fader
                              key={slider.id + '-' + channel.id}
                              id={channel.id}
                              sliderGroupId={slider.id}
                              name={channel.id !== 0 ? channel.channel_type : slider.name}
                              number={slider.id}
                              className={sliderIndex === filteredSliders.length - 1 && slider.attributes.channel.length == 1 ? 'noBorder' : ''}
                              color={channel.channel_type === 'r' ? '#CA2C2C' : channel.channel_type === 'g' ? '#59E066' : channel.channel_type === 'b' ? '#4271C6' : ''}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
            </div>
          </div>
        ))}
        <div className='mainfaderBigView innerWindow'>
          {sliders[0] && (
            <Fader
              height={700}
              id={0}
              sliderGroupId={0}
              name='Master'
              className='noBorder'
            />
          )}
        </div>
      </div>
    </>
  );
}

export default BigView;
