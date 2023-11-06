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
import { useContext, useState } from 'react';
import { TranslationContext } from './components/TranslationContext';
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
  const [fadeDuration, setFadeDuration] = useState(() => {
    const storedValue = sessionStorage.getItem('fadeDuration');
    return storedValue ? storedValue : '0';
  });

  const handleToggleChange = (status: boolean | ((prevState: boolean) => boolean)) => {
    localStorage.setItem('layer', `${status}`);
  };

  // Confirm with ENTER
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  };

  // Check if the input value is a number
  const handleFadeDuration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 4) {
      setFadeDuration(value.replace(/[^0-9.,]+/g, ''));
    }
  };

  // Only allow numbers between 0 and 60
  const handleFadeConfirm = () => {
    let numericValue = parseFloat(fadeDuration.replace(',', '.'));
    if (!isNaN(numericValue)) {
      numericValue = Math.max(0, Math.min(60, numericValue));
      setFadeDuration(numericValue.toString());
      sessionStorage.setItem('fadeDuration', numericValue.toString());
    } else {
      setFadeDuration(sessionStorage?.getItem('fadeDuration') || '0'); // Reset value if input is NaN
    }
  };

  return (
    <div>
      <div className='window scenesMain'>
        <ScenesComponent
          sideId={1}
          setAddScene={setAddScene}
          setDeleteScene={setDeleteScene}
          setDeleteSceneAdmin={setDeleteSceneAdmin}
          setSaveSceneAdmin={setSaveSceneAdmin}
        />
      </div>
      <div className='window scenesMaster mainfader'>
        <div className='scenesMasterAlign'>
          <Fader
            height={610}
            sliderGroupId={0}
            id={0}
            name='Master'
          />
        </div>
      </div>
      <div className='window scenesLayer'>
        <div className='scenesLayerAlign'>
          <Toggle
            onClick={handleToggleChange}
            enabled={localStorage.getItem('layer') === 'true'}
          />
          {t('layer')}
        </div>
      </div>
      <div className='window scenesLayer scenesFade'>
        <div className='scenesLayerAlign'>
          <span>FADE</span>
          <input
            className='scenesFadeInput'
            type='text'
            value={fadeDuration}
            onChange={handleFadeDuration}
            onKeyDown={handleKeyDown}
            onBlur={handleFadeConfirm}
          />
        </div>
      </div>
      {addScene && <AddScene onClose={() => setAddScene(false)} />}
      {deleteScene && <DeleteScene onClose={() => setDeleteScene(false)} />}
      {deleteSceneAdmin && (
        <AdminPassword
          onClose={() => setDeleteSceneAdmin(false)}
          isDelete
        />
      )}
      {saveSceneAdmin && <AdminPassword onClose={() => setSaveSceneAdmin(false)} />}
    </div>
  );
}

export default Scenes;
