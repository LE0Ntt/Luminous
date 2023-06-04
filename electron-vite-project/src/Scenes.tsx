/**
 * Scenes.tsx
 * @author Leon Hölzel
 */
import { useContext } from 'react'
import './Scenes.css';
import { TranslationContext } from "./components/TranslationContext";
import Fader from './components/Fader';
import ScenesComponent from './components/ScenesComponent';
import Toggle from './components/Toggle';

function Scenes() {
  const { t } = useContext(TranslationContext);

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
          <Toggle/>
          LAYER
        </div>
      </div>
    </div>
  );
}

export default Scenes;