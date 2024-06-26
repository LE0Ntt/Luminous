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
import { useState, useCallback } from 'react';
import './Scenes.css';
import Fader from './components/Fader';
import ScenesComponent from './components/ScenesComponent';
import Toggle from './components/Toggle';
import AddScene from './components/AddScene';
import DeleteScene from './components/DeleteScene';
import AdminPassword from './components/AdminPassword';

function Scenes() {
  const [addScene, setAddScene] = useState(false);
  const [deleteScene, setDeleteScene] = useState(false);
  const [deleteSceneAdmin, setDeleteSceneAdmin] = useState(false);
  const [saveSceneAdmin, setSaveSceneAdmin] = useState(false);
  const [fadeDuration, setFadeDuration] = useState(() => sessionStorage.getItem('fadeDuration') || '0');
  const [fadeDisplayValue, setFadeDisplayValue] = useState(fadeDuration + ' s');

  // Set toggle status in localStorage
  const handleToggleChange = useCallback((status: boolean) => {
    localStorage.setItem('sceneSolo', `${status}`);
  }, []);

  // Confirm with ENTER
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  }, []);

  // Check if the input value is a number
  const handleFadeDuration = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 4) {
      const numbersOnly = value.replace(/[^0-9.,]+/g, '');
      setFadeDuration(numbersOnly);
      setFadeDisplayValue(numbersOnly);
    }
  }, []);

  // Only allow numbers between 0 and 60
  const handleFadeConfirm = useCallback(() => {
    let numericValue = parseFloat(fadeDuration.replace(',', '.'));
    if (isNaN(numericValue)) {
      numericValue = parseFloat(sessionStorage.getItem('fadeDuration') || '0');
    }
    numericValue = Math.max(0, Math.min(60, numericValue));
    setFadeDuration(numericValue.toString());
    sessionStorage.setItem('fadeDuration', numericValue.toString());
    setFadeDisplayValue(numericValue + ' s');
  }, [fadeDuration]);

  // On fade input focus
  const handleFocus = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFadeDisplayValue(fadeDuration); // Display the actual value without 's'
      // Delay to the next tick
      setTimeout(() => {
        event.target.select(); // Select the input text
      }, 0);
    },
    [fadeDuration]
  );

  return (
    <>
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
        <Fader
          height={590}
          sliderGroupId={0}
          id={0}
          name='Master'
          className='noBorder'
        />
      </div>
      <div className='window scenesSolo'>
        <div className='scenesSoloAlign'>
          <div className='toggleScenes'>
            <Toggle
              onClick={handleToggleChange}
              enabled={localStorage.getItem('sceneSolo') === 'true'}
            />
          </div>
          <span>SOLO</span>
        </div>
      </div>
      <div className='window scenesSolo scenesFade'>
        <div className='scenesSoloAlign'>
          <span>FADE</span>
          <input
            className='scenesFadeInput textBox'
            type='text'
            value={fadeDisplayValue}
            onChange={handleFadeDuration}
            onKeyDown={handleKeyDown}
            onBlur={handleFadeConfirm}
            onFocus={handleFocus}
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
    </>
  );
}

export default Scenes;
