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
 * @file ScenesComponent.tsx
 */
import React, { useState, useEffect, useContext, useCallback, useRef, useLayoutEffect } from 'react';
import './ScenesComponent.css';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from '../components/ConnectionContext';
import { eventBus } from './EventBus';

interface SceneConfig {
  id: number;
  name: string;
  status: boolean;
  saved: boolean;
}

interface ScenesComponentProps {
  sideId: number;
  setAddScene?: (addScene: boolean) => void;
  setDeleteScene?: (deleteScene: boolean) => void;
  setDeleteSceneAdmin?: (deleteSceneAdmin: boolean) => void;
  setSaveSceneAdmin?: (saveSceneAdmin: boolean) => void;
}

const ScenesComponent: React.FC<ScenesComponentProps> = ({ sideId, setAddScene, setDeleteScene, setDeleteSceneAdmin, setSaveSceneAdmin }) => {
  const { t } = useContext(TranslationContext);
  const { on, off, emit, url, connected } = useConnectionContext();
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [height, setHeight] = useState(0);
  const [buttonText, setButtonText] = useState(t(''));
  const [repeatNumber, setRepeatNumber] = useState(6);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [emptyScenes, setEmptyScenes] = useState(0);
  const scenesFetched = useRef(false);

  // Fetch scenes from the server when the component is mounted
  useLayoutEffect(() => {
    if (connected && scenes.length === 0) fetchScenes();
    setEmptyScenes(calculateEmptyScenes(scenes.length, repeatNumber));
  }, [connected, scenes.length, repeatNumber]);

  // Listen for events to delete or save a scene
  useEffect(() => {
    const handleDeleteScene = () => {
      const deleteID = sessionStorage.getItem('deleteID');
      if (deleteID !== null) emit('scene_delete', { id: JSON.parse(deleteID) });
    };

    const handleSaveScene = () => {
      const saveID = sessionStorage.getItem('saveID');
      if (saveID !== null) emit('scene_save', { id: JSON.parse(saveID) });
    };

    document.body.addEventListener('saveScene', handleSaveScene);
    document.body.addEventListener('deleteScene', handleDeleteScene);

    return () => {
      document.body.removeEventListener('deleteScene', handleDeleteScene);
      document.body.removeEventListener('saveScene', handleSaveScene);
    };
  }, [emit]);

  // Listen for events to update the status of a scene
  useEffect(() => {
    const sceneUpdate = (data: any) => {
      setScenes((prevScenes) => prevScenes.map((scene, index) => (index === data.id ? { ...scene, status: data.status } : scene)));
    };

    const reloadScenes = () => fetchScenes();

    on('scene_update', sceneUpdate);
    on('scene_reload', reloadScenes);

    return () => {
      off('scene_update', sceneUpdate);
      off('scene_reload', reloadScenes);
    };
  }, [on, off]);

  // Change the appearance of the component depending on which page it is called from
  useLayoutEffect(() => {
    if (sideId === 0) {
      // Studio
      setHeight(105);
      setButtonText(t('SaveCurrentConfiguration'));
      setRepeatNumber(5);
      setButtonDisabled(false);
    } else if (sideId === 1) {
      // Scenes
      setHeight(202);
      setButtonText(t('AddNewScene'));
      setRepeatNumber(6);
      setButtonDisabled(false);
    } else if (sideId === 2) {
      // Show
      setHeight(105);
      setButtonText('');
      setRepeatNumber(7);
      setButtonDisabled(true);
    }
  }, [sideId, t]);

  // Calculate the number of empty scenes needed to fill the grid
  const calculateEmptyScenes = (scenesLength: number, repeatNumber: number) => {
    const minRows = 4;
    const totalCells = Math.max(minRows * repeatNumber, Math.ceil((scenesLength + 1) / repeatNumber) * repeatNumber);
    return totalCells - scenesLength - 1;
  };

  // Get all scenes from the server with an API call
  const fetchScenes = async () => {
    try {
      const response = await fetch(url + '/scenes');
      const data = await response.json();
      setScenes(JSON.parse(data));
      scenesFetched.current = true;
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle the status of a scene
  const toggleSceneStatus = (sceneId: number) => {
    const solo = localStorage.getItem('sceneSolo') === 'true';
    setScenes((prevScenes) => {
      const fadeDuration = parseInt(sessionStorage.getItem('fadeDuration') || '0');

      // Update the status of the scene with the given id
      const updatedScenes = prevScenes.map((scene) => {
        if (scene.id === sceneId) {
          const newStatus = !scene.status;
          emit('scene_update', { id: sceneId, status: newStatus, fadeTime: fadeDuration, solo });
          return { ...scene, status: newStatus };
        }
        return scene;
      });

      return updatedScenes;
    });
  };

  // Delete a scene
  const deleteScene = (sceneId: number, saved: boolean) => {
    sessionStorage.setItem('deleteID', JSON.stringify(sceneId));
    if (!saved) {
      setDeleteScene?.(true);
    } else {
      setDeleteSceneAdmin?.(true);
    }
  };

  // Save a scene
  const saveScene = (sceneId: number) => {
    sessionStorage.setItem('saveID', JSON.stringify(sceneId));
    setSaveSceneAdmin?.(true);
  };

  // Drag and drop functionality for Show page
  const onDragStart = useCallback((e: React.DragEvent<HTMLButtonElement>, id: number) => {
    eventBus.emit('drag-start', id);
  }, []);

  const onDragEnd = useCallback((e: React.DragEvent<HTMLButtonElement>, id: number) => {
    eventBus.emit('drag-end', id);
  }, []);

  return (
    <div className='scenesAlign'>
      <div
        className='grid-container'
        style={{ gridTemplateColumns: `repeat(${repeatNumber}, 1fr)` }}
      >
        {scenes.map((scene) => (
          <div
            className={`scenesBox ${scene.status ? 'on' : ''}`}
            style={{ height: `${height}px` }}
            key={scene.id}
          >
            <button
              draggable={sideId === 2}
              onDragStart={(e) => onDragStart(e, scene.id)}
              onDragEnd={(e) => onDragEnd(e, scene.id)}
              className={`sceneButton ${sideId === 2 ? 'dragHover' : ''}`}
              onClick={() => toggleSceneStatus(scene.id)}
            >
              <h2>{scene.name}</h2>
            </button>
            {sideId === 1 && (
              <div className='sceneButtons'>
                <button
                  className={`bookmark ${scene.saved ? 'saved' : 'notSaved'}`}
                  onClick={() => (scene.saved ? toggleSceneStatus(scene.id) : saveScene(scene.id))}
                ></button>
                <button
                  className={`sceneMiddleButton`}
                  onClick={() => toggleSceneStatus(scene.id)}
                ></button>
                <button
                  className={`delete`}
                  onClick={() => deleteScene(scene.id, scene.saved)}
                ></button>
              </div>
            )}
          </div>
        ))}
        {scenesFetched.current && (
          <button
            className='AddSceneButton'
            disabled={buttonDisabled}
            style={{ height: `${height}px` }}
            onClick={() => setAddScene?.(true)}
          >
            <div className={`sceneBorder ${sideId === 1 ? 'borderBig' : 'borderSmall'}`}></div>
            {!buttonDisabled && <div className='addIcon AddSceneIcon'></div>}
            <div className='AddSceneButtonFont'>{buttonText}</div>
          </button>
        )}
        {Array.from({ length: emptyScenes }).map((_, index) => (
          <div
            className='scenesEmpty'
            style={{ height: `${height}px` }}
            key={`empty-${index}`}
          >
            <div className={`sceneBorder ${sideId === 1 ? 'borderBig' : 'borderSmall'}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenesComponent;
