/**
 * Scenes.tsx
 * @author Leon Hölzel
 */
import React, { useContext } from 'react'
import './App.css';
import './Scenes.css';
import { TranslationContext } from "./components/TranslationContext";
import Fader from './components/Fader';

function Scenes() {
  const { t } = useContext(TranslationContext);

  return (
    <div>
      <div className='window scenesMain'>
        <div className='scenesMainAlign'>
          Hier sind dann die Szenen
        </div>
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
          <label className="switch">
            <input type="checkbox"/>
            <span className="layerToggle round"></span>
          </label>
          LAYER
        </div>
      </div>
    </div>
  );
}

export default Scenes;