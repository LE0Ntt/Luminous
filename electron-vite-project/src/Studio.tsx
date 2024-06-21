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
 * @file Studio.tsx
 */
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import './Studio.css';
import Button from './components/Button';
import Fader from './components/Fader';
import { useConnectionContext } from './components/ConnectionContext';
import { TranslationContext } from './components/TranslationContext';
import { useNavigate } from 'react-router-dom';
import { FaderProvider, useFaderContext } from './components/FaderContext';
import ScenesComponent from './components/ScenesComponent';
import BigView from './components/BigView';
import AddScene from './components/AddScene';
import ScrollButton from './components/ScrollButton';
import StudioOverview from './components/StudioOverview';

const Studio = () => {
  const navigate = useNavigate();
  const { url, connected, on, off } = useConnectionContext();
  const { t } = useContext(TranslationContext);
  const { setFaderValue } = useFaderContext();

  const [bigView, setBigView] = useState(false);
  const [sliders, setSliders] = useState<SliderConfig[]>([]);
  const [addScene, setAddScene] = useState(false);
  const [, forceRender] = useState(false);
  const [glowId, setGlowId] = useState<number | null>(null);
  const refsArray = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  interface SliderConfig {
    attributes: any;
    universe: string;
    id: number;
    sliderValue: number;
    name: string;
  }

  const handleClick = useCallback(
    (id: number) => {
      navigate('/control', { state: { id: id } });
    },
    [navigate]
  );

  const fetchSliders = useCallback(async () => {
    try {
      const response = await fetch(url + '/fader');
      const data = await response.json();
      setSliders(JSON.parse(data));
      loadFaderValues(JSON.parse(data));
    } catch (error) {
      console.log(error);
    }
  }, [url]);

  const loadFaderValues = useCallback(
    (sliders: SliderConfig[]) => {
      sliders.forEach((item) => {
        const { id } = item;
        if (item.attributes && item.attributes.channel) {
          item.attributes.channel.forEach((channelItem: any) => {
            const channelId = parseInt(channelItem.id, 10);
            const sliderValue = channelItem.sliderValue !== undefined ? channelItem.sliderValue : 0;
            setFaderValue(id, channelId, sliderValue);
          });
        }
      });
    },
    [setFaderValue]
  );

  useEffect(() => {
    if (connected) {
      fetchSliders();
    }

    const handleStorageChange = (event: CustomEvent<boolean>) => {
      if (event.type === 'reverseOrder') {
        forceRender((prev) => !prev);
      }
    };

    const lightResponse = (data: any) => {
      if (data.message === 'success') {
        fetchSliders();
      }
    };

    const lightDeleted = () => {
      fetchSliders();
    };

    window.addEventListener('reverseOrder', handleStorageChange as EventListener);
    on('light_response', lightResponse);
    on('light_deleted', lightDeleted);

    return () => {
      window.removeEventListener('reverseOrder', handleStorageChange as EventListener);
      off('light_response', lightResponse);
      off('light_deleted', lightDeleted);
      refsArray.current = [];
    };
  }, [connected, fetchSliders, on, off]);

  const handleGlowAndFocus = useCallback((id: number) => {
    setGlowId(id);
    setTimeout(() => setGlowId(null), 700);
    refsArray.current[id]?.focus();
  }, []);

  return (
    <FaderProvider>
      <div
        className='studioLayout'
        style={{ flexDirection: localStorage.getItem('reverseOrder') === 'true' ? 'row-reverse' : 'row' }}
      >
        <div className='scenesAndFaders'>
          <div className='scenes window'>
            <ScenesComponent
              sideId={0}
              setAddScene={setAddScene}
            />
          </div>
          {!bigView && (
            <>
              <div className='mainfader window'>
                {sliders[0] && (
                  <Fader
                    height={313}
                    id={0}
                    sliderGroupId={0}
                    name='Master'
                    className='noBorder'
                  />
                )}
              </div>
              <div className='faders window'>
                <ScrollButton
                  scrollRef={scrollRef}
                  elementWidth={102}
                  elementsInView={8}
                  direction='prev'
                />
                <ScrollButton
                  scrollRef={scrollRef}
                  elementWidth={102}
                  elementsInView={8}
                  direction='next'
                />
                <div
                  ref={scrollRef}
                  className='sliders'
                >
                  {sliders.slice(1).map((slider, sliderIndex) => (
                    <div
                      key={slider.id}
                      className={'faderContainer' + (glowId === slider.id ? ' faderGlow' : '')}
                      ref={(el) => (refsArray.current[slider.id] = el)}
                      tabIndex={-1}
                      onFocus={() => {
                        refsArray.current[slider.id]?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                          inline: 'nearest',
                        });
                      }}
                      style={{
                        marginLeft: sliderIndex === 0 ? '-10px' : '',
                        paddingLeft: sliderIndex === sliders.length - 2 ? '10px' : '',
                      }}
                    >
                      <Fader
                        key={slider.id}
                        id={0}
                        sliderGroupId={slider.id}
                        name={slider.name}
                        number={slider.id}
                        className={sliderIndex === sliders.length - 2 ? 'noBorder bottomSpace' : 'bottomSpace'}
                      />
                      <Button
                        onClick={() => handleClick(slider.id)}
                        className='buttonOpenControl'
                      >
                        <svg
                          className='centerIcon'
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                        >
                          <path d='m19,20c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-4c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v4Zm-12,0c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-8c0-.28.1-.52.29-.71.19-.19.43-.29.71-.29s.52.1.71.29c.19.19.29.43.29.71v8Zm14-8c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29h-4c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71c.19-.19.43-.29.71-.29h1V4c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v7h1c.28,0,.52.1.71.29.19.19.29.43.29.71Zm-6,4c0,.28-.1.52-.29.71s-.43.29-.71.29h-1v3c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-3h-1c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71.43-.29.71-.29h4c.28,0,.52.1.71.29s.29.43.29.71Zm-2-4c0,.28-.1.52-.29.71s-.43.29-.71.29-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71V4c0-.28.1-.52.29-.71.19-.19.43-.29.71-.29s.52.1.71.29.29.43.29.71v8Zm-4-4c0,.28-.1.52-.29.71s-.43.29-.71.29h-4c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71.43-.29.71-.29h1v-3c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v3h1c.28,0,.52.1.71.29s.29.43.29.71Z' />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setBigView(true)}
                  className='buttonBigView'
                >
                  <svg
                    className='centerIcon'
                    xmlns='http://www.w3.org/2000/svg'
                    height='24'
                    viewBox='0 -960 960 960'
                    width='24'
                  >
                    <path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm160-240q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104L415-359q-11 11-27 11t-28-12Z' />
                  </svg>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {bigView && <BigView onClose={() => setBigView(false)} />}
      {addScene && <AddScene onClose={() => setAddScene(false)} />}
    </FaderProvider>
  );
};

export default Studio;
