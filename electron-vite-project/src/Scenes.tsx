/**
 * Scenes.tsx
 * @author Leon Hölzel
 */
import { useContext, useEffect, useState } from 'react'
import './Scenes.css';
import { TranslationContext } from "./components/TranslationContext";
import Fader from './components/Fader';
import ScenesComponent from './components/ScenesComponent';
import Toggle from './components/Toggle';
import { useConnectionContext } from './components/ConnectionContext';

function Scenes() {
  const { t } = useContext(TranslationContext);
  
  const handleToggleChange = (status: boolean | ((prevState: boolean) => boolean)) => {
    localStorage.setItem('layer', `${status}`);
  };
  
  const { url } = useConnectionContext();
  useEffect(() => {
    fetch(url + '/addlight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
                            name: "lamp", 
                            number: "1", 
                            device_type: "lamp", 
                            universe: "1", 
                            attributes: 
                              { channel: [
                                { 
                                  id: "1", 
                                  dmx_channel: "1", 
                                  channel_type: "bi" 
                                },
                                {
                                  id: "2",
                                  dmx_channel: "2",
                                  channel_type: "uni"
                                },
                              ]
                            }
                          })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }, []);
  
  return (
    <div>
      <div className='window scenesMain'>
          <ScenesComponent sideId={1} />
      </div>
      <div className='window scenesMaster mainfader'>
        <div className='scenesMasterAlign'>
          <Fader
              height={684}
              sliderValue={255}
              id={0}
              name='Master'
            />  
        </div>
      </div>
      <div className='window scenesLayer'>
        <div className='scenesLayerAlign'>
          <Toggle onClick={handleToggleChange} enabled={localStorage.getItem('layer') === 'true'} />
          {t("layer")}
        </div>
      </div>
    </div>
  );
}

export default Scenes;