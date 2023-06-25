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
import AddScene from './components/AddScene';

function Scenes() {
  const { t } = useContext(TranslationContext);
  const [addScene, setAddScene] = useState(false);

  const closeAddScene = () => {
    setAddScene(false);
  };
  
  const handleToggleChange = (status: boolean | ((prevState: boolean) => boolean)) => {
    localStorage.setItem('layer', `${status}`);
  };
  
  return (
    <div>
      <div className='window scenesMain'>
          <ScenesComponent sideId={1} setAddScene={setAddScene} />
      </div>
      <div className='window scenesMaster mainfader'>
        <div className='scenesMasterAlign'>
          <Fader
              height={700}
              sliderGroupId={0}
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
      {addScene && <AddScene onClose={closeAddScene} />}
    </div>
  );
}

export default Scenes;