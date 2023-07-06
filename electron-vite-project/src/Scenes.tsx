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
 * @file Scenes.tsx
 */
import { useContext, useState } from 'react'
import { TranslationContext } from "./components/TranslationContext";
import './Scenes.css';
import Fader from './components/Fader';
import ScenesComponent from './components/ScenesComponent';
import Toggle from './components/Toggle';
import AddScene from './components/AddScene';
import DeleteScene from './components/DeleteScene';
import AdminPassword from './components/AdminPassword';

function Scenes() {
  const { t } = useContext(TranslationContext);
  const [addScene, setAddScene] = useState(false);
  const [deleteScene, setDeleteScene] = useState(false);
  const [deleteSceneAdmin, setDeleteSceneAdmin] = useState(false);
  const [saveSceneAdmin, setSaveSceneAdmin] = useState(false);
  
  const handleToggleChange = (status: boolean | ((prevState: boolean) => boolean)) => {
    localStorage.setItem('layer', `${status}`);
  };
  
  return (
    <div>
      <div className='window scenesMain'>
          <ScenesComponent sideId={1} setAddScene={setAddScene} setDeleteScene={setDeleteScene} setDeleteSceneAdmin={setDeleteSceneAdmin} setSaveSceneAdmin={setSaveSceneAdmin} />
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
      {addScene && <AddScene onClose={() => setAddScene(false)} />}
      {deleteScene && <DeleteScene onClose={() => setDeleteScene(false)} />}
      {deleteSceneAdmin && <AdminPassword onClose={() => setDeleteSceneAdmin(false)} isDelete />}
      {saveSceneAdmin && <AdminPassword onClose={() => setSaveSceneAdmin(false)} />}
    </div>
  );
}

export default Scenes;