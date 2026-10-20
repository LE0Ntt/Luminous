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
import React, { useState, useEffect, useContext, useCallback } from 'react';
import './ScenesComponent.css';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from './ConnectionContext';
import { eventBus } from './EventBus';
import { fetchServerJson } from '@/utils/api';
import type { AdminTokenDetail } from './AdminPassword';

interface SceneConfig {
  id: number;
  name: string;
  status: boolean;
  saved: boolean;
  out_of_sync: boolean;
}

interface ScenesComponentProps {
  sideId: number;
  setAddScene?: (addScene: boolean) => void;
  setDeleteScene?: (deleteScene: boolean) => void;
  setDeleteSceneAdmin?: (deleteSceneAdmin: boolean) => void;
  setSaveSceneAdmin?: (saveSceneAdmin: boolean) => void;
}

// Appearance depending on the page the component is shown on: 0 = Studio, 1 = Scenes, 2 = Show
const LAYOUTS: Record<number, { height: number; buttonTextKey: string; columns: number; buttonDisabled: boolean }> = {
  0: { height: 105, buttonTextKey: 'saveCurrentConfiguration', columns: 5, buttonDisabled: false },
  1: { height: 202, buttonTextKey: 'addNewScene', columns: 6, buttonDisabled: false },
  2: { height: 105, buttonTextKey: '', columns: 7, buttonDisabled: true },
};

// Calculate the number of empty scenes needed to fill the grid
const calculateEmptyScenes = (scenesLength: number, columns: number) => {
  const minRows = 4;
  const totalCells = Math.max(minRows * columns, Math.ceil((scenesLength + 1) / columns) * columns);
  return totalCells - scenesLength - 1;
};

const ScenesComponent: React.FC<ScenesComponentProps> = ({ sideId, setAddScene, setDeleteScene, setDeleteSceneAdmin, setSaveSceneAdmin }) => {
  const { t } = useContext(TranslationContext);
  const { on, off, emit, url, connected } = useConnectionContext();
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [scenesFetched, setScenesFetched] = useState(false);
  const { height, buttonTextKey, columns, buttonDisabled } = LAYOUTS[sideId] ?? LAYOUTS[1];
  const buttonText = buttonTextKey ? t(buttonTextKey) : '';
  const emptyScenes = calculateEmptyScenes(scenes.length, columns);

  // Get all scenes from the server with an API call and update the out_of_sync status as well
  const fetchScenes = useCallback(async () => {
    try {
      const data = await fetchServerJson<SceneConfig[]>(url + '/scenes');
      setScenes(
        data.map((scene) => ({
          ...scene,
          out_of_sync: scene.out_of_sync || false, // Default to false if not provided
        }))
      );
      setScenesFetched(true);
    } catch (error) {
      console.error(error);
    }
  }, [url]);

  // Fetch scenes from the server when connected
  useEffect(() => {
    if (connected) fetchScenes();
  }, [connected, fetchScenes]);

  // Listen for events to delete or save a scene
  useEffect(() => {
    // Saved scenes need the token from the password prompt, unsaved ones are deleted without it
    const getToken = (event: Event) => (event as CustomEvent<AdminTokenDetail | undefined>).detail?.token;

    const handleDeleteScene = (event: Event) => {
      const deleteID = sessionStorage.getItem('deleteID');
      if (deleteID !== null) emit('scene_delete', { id: JSON.parse(deleteID), token: getToken(event) });
    };

    const handleSaveScene = (event: Event) => {
      const saveID = sessionStorage.getItem('saveID');
      if (saveID !== null) emit('scene_save', { id: JSON.parse(saveID), token: getToken(event) });
    };

    document.body.addEventListener('saveScene', handleSaveScene);
    document.body.addEventListener('deleteScene', handleDeleteScene);

    return () => {
      document.body.removeEventListener('deleteScene', handleDeleteScene);
      document.body.removeEventListener('saveScene', handleSaveScene);
    };
  }, [emit]);

  // Listen for events to update the status of a scene and sync state
  useEffect(() => {
    const sceneUpdate = (data: { id: number; status: boolean }) => {
      setScenes((prevScenes) => prevScenes.map((scene) => (scene.id === data.id ? { ...scene, status: data.status } : scene)));
    };

    const handleOutOfSync = (data: { scene_id: number }) => {
      setScenes((prevScenes) => prevScenes.map((scene) => (scene.id === data.scene_id ? { ...scene, out_of_sync: true } : scene)));
    };

    const handleInSync = (data: { scene_id: number }) => {
      setScenes((prevScenes) => prevScenes.map((scene) => (scene.id === data.scene_id ? { ...scene, out_of_sync: false } : scene)));
    };

    on('scene_update', sceneUpdate);
    on('out_of_sync', handleOutOfSync);
    on('in_sync', handleInSync);
    on('scene_reload', fetchScenes);

    return () => {
      off('scene_update', sceneUpdate);
      off('out_of_sync', handleOutOfSync);
      off('in_sync', handleInSync);
      off('scene_reload', fetchScenes);
    };
  }, [on, off, fetchScenes]);

  // Toggle the status of a scene
  const toggleSceneStatus = (sceneId: number) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    const newStatus = !scene.status;
    const solo = localStorage.getItem('sceneSolo') === 'true';
    const fadeDuration = parseInt(sessionStorage.getItem('fadeDuration') || '0'); // The server only supports whole seconds

    emit('scene_update', { id: sceneId, status: newStatus, fadeTime: fadeDuration, solo });
    setScenes((prevScenes) => prevScenes.map((s) => (s.id === sceneId ? { ...s, status: newStatus } : s)));
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
  const onDragStart = useCallback((id: number) => {
    eventBus.emit('drag-start', id);
  }, []);

  const onDragEnd = useCallback((id: number) => {
    eventBus.emit('drag-end', id);
  }, []);

  return (
    <div className='scenesAlign'>
      <div
        className='grid-container'
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {scenes.map((scene) => (
          <div
            className={`scenesBox ${scene.status ? 'on' : ''}`}
            style={{ height: `${height}px` }}
            key={scene.id}
          >
            <button
              draggable={sideId === 2}
              onDragStart={() => onDragStart(scene.id)}
              onDragEnd={() => onDragEnd(scene.id)}
              className={`sceneButton ${sideId === 2 ? 'dragHover' : ''}`}
              onClick={() => toggleSceneStatus(scene.id)}
              aria-pressed={scene.status}
            >
              <h2>{scene.name}</h2>
              <div
                className={`sceneSync ${scene.out_of_sync ? 'visible' : ''}`}
                title={scene.out_of_sync ? t('sc_outOfSync') : undefined}
              ></div>
            </button>
            {sideId === 1 && (
              <div className='sceneButtons'>
                <button
                  className={`bookmark ${scene.saved ? 'saved' : 'notSaved'}`}
                  onClick={() => (scene.saved ? toggleSceneStatus(scene.id) : saveScene(scene.id))}
                  aria-label={`${scene.saved ? t('sc_toggle') : t('sc_save')}: ${scene.name}`}
                ></button>
                <button
                  className='sceneMiddleButton'
                  onClick={() => toggleSceneStatus(scene.id)}
                  aria-label={`${t('sc_toggle')}: ${scene.name}`}
                ></button>
                <button
                  className='delete'
                  onClick={() => deleteScene(scene.id, scene.saved)}
                  aria-label={`${t('sc_delete')}: ${scene.name}`}
                ></button>
              </div>
            )}
          </div>
        ))}
        {scenesFetched && (
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
