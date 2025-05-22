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
import { useState, useEffect, useRef, useCallback } from 'react';
import './Studio.css';
import Button from './components/Button';
import Fader from './components/Fader';
import { useConnectionContext } from './components/ConnectionContext';
import { useNavigate } from 'react-router-dom';
import { useFaderContext } from './components/FaderContext';
import ScenesComponent from './components/ScenesComponent';
import BigView from './components/BigView';
import AddScene from './components/AddScene';
import ScrollButton from './components/ScrollButton';
import StudioOverview from './components/StudioOverview';
import IconLightFX from '@/assets/IconLightFX';
import IconExpand from './assets/IconExpand';

const Studio = () => {
  const navigate = useNavigate();
  const { url, connected, on, off } = useConnectionContext();
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
    device_type: string;
  }

  // Open a device in the control (LightFX)
  const handleOpenControl = useCallback(
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

  const loadFaderValues = useCallback((sliders: SliderConfig[]) => {
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
  }, []);

  // Fetch sliders on connection
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

  // Highlight fader of device selected in overview
  const handleGlowAndFocus = useCallback((idRaw: number | string) => {
    const id = Number(idRaw);
    setGlowId(id);
    setTimeout(() => setGlowId(null), 700);
    refsArray.current[id]?.focus();
  }, []);

  return (
    <>
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
                        onClick={() => handleOpenControl(slider.id)}
                        className='buttonOpenControl'
                      >
                        <IconLightFX className='centerIcon' />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setBigView(true)}
                  className='buttonBigView'
                >
                  <IconExpand />
                </Button>
              </div>
            </>
          )}
        </div>
        <StudioOverview
          handleGlowAndFocus={handleGlowAndFocus}
          devices={sliders}
        />
      </div>
      {bigView && <BigView onClose={() => setBigView(false)} />}
      {addScene && <AddScene onClose={() => setAddScene(false)} />}
    </>
  );
};

export default Studio;
