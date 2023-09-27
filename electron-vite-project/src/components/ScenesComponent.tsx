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
import { useState, useEffect, useContext } from 'react'
import './ScenesComponent.css';
import '../assets/GridLines';
import GridLines from '../assets/GridLines';
import { TranslationContext } from "./TranslationContext";
import { useConnectionContext } from "../components/ConnectionContext";

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
  const { on, off, emit, url } = useConnectionContext();
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [height, setHeight] = useState(0);
  const [buttonText, setButtonText] = useState(t(''));
  const [repeatNumber, setRepeatNumber] = useState(6);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    fetchScenes();

    // Listen for the delete and save scene event
    const handleDeleteScene = () => {
      const deleteID = sessionStorage.getItem('deleteID');
      if (deleteID !== null)
        emit("scene_delete", { id: JSON.parse(deleteID) });
    };

    const handleSaveScene = () => {
      const saveID = sessionStorage.getItem('saveID');
      if (saveID !== null)
        emit("scene_save", { id: JSON.parse(saveID) });
    };
    document.body.addEventListener('saveScene', handleSaveScene);
    document.body.addEventListener('deleteScene', handleDeleteScene);
    return () => { 
      document.body.removeEventListener('deleteScene', handleDeleteScene);
      document.body.removeEventListener('saveScene', handleSaveScene); 
    };
  }, []);

  useEffect(() => {
    const sceneUpdate = (data: any) => {
      setScenes((prevScenes) => {
        return prevScenes.map((scene, index) => {
          if (index === data.id) {
            return { ...scene, status: data.status };
          }
          return scene;
        });
      });
    };
    
    const reloadScenes = () => {
      fetchScenes();
    };

    on("scene_update", sceneUpdate);
    on("scene_reload", reloadScenes);

    return () => {
      off("scene_update", sceneUpdate);
      off("scene_reload", reloadScenes);
    };
  }, [on, off]);

  // Change the appearance of the component depending on which page it is called from
  useEffect(() => {
    if (sideId === 0) { // Studio
      setHeight(105);
      setButtonText(t("SaveCurrentConfiguration"));
      setRepeatNumber(5);
      setButtonDisabled(false);
    } else if (sideId === 1) { // Scenes
      setHeight(202);
      setButtonText(t("AddNewScene"));
      setRepeatNumber(6);
      setButtonDisabled(false);
    } else if (sideId === 2) { // Show
      setHeight(105);
      setButtonText('');
      setRepeatNumber(7);
      setButtonDisabled(true);
    }
  }, [sideId, t]);

  // Get all scenes from the server with an API call
  const fetchScenes = async () => {
    try {
      const response = await fetch(url + '/scenes');
      const data = await response.json();
      setScenes(JSON.parse(data));
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSceneStatus = (sceneId: number) => { 
    const layer = localStorage.getItem('layer')  === 'true';
    setScenes((prevScenes) => {
      const fadeDuration = parseInt(sessionStorage.getItem('fadeDuration') || '0');
      // Update scenes with status false if layer is off
      if (!layer) {
        prevScenes.forEach((scene) => {
          if (scene.status) {
            emit("scene_update", { id: scene.id, status: false, fadeTime: fadeDuration });
          }
        });
      }
      // Update the desired scene with the new status
      const updatedScenes = prevScenes.map((scene) => {
        if (scene.id === sceneId) {
          const newStatus = !scene.status;
          emit("scene_update", { id: sceneId, status: newStatus, fadeTime: fadeDuration });
          return { ...scene, status: newStatus };
        }
        return scene;
      });

      return updatedScenes;
    });
  };

  const deleteScene = (sceneId: number, saved: boolean) => { 
    sessionStorage.setItem('deleteID', JSON.stringify(sceneId));
    if(!saved) {
      if(setDeleteScene) {
        setDeleteScene(true);
      }  
    } else {
      if(setDeleteSceneAdmin) {
        setDeleteSceneAdmin(true);
      } 
    }
  };

  const saveScene = (sceneId: number) => { 
    sessionStorage.setItem('saveID', JSON.stringify(sceneId));
    if(setSaveSceneAdmin) {
      setSaveSceneAdmin(true);
    }
  };

  const handleAddScene = () => {
    if(setAddScene) {
      setAddScene(true);
    }
  };

  const extraButton = 1;
  const emptyScenesLength = Math.ceil((scenes.length + extraButton) / repeatNumber) * repeatNumber - scenes.length - extraButton + (repeatNumber * 3);
  const emptyScenes = Array.from(
    { length: emptyScenesLength },
    (_, index) => ({ id: scenes.length + extraButton + index + 1, name: 'Empty Scene' })
  );

  return (
    <div className='scenesAlign'>
        <div className='grid-container' style={{ gridTemplateColumns: `repeat(${repeatNumber}, 1fr)` }}>
          {scenes.map((scene) => (
            <div className={`scenesBox ${scene.status ? 'on' : ''}`} style={{ height: `${height}px` }} key={scene.id}>
              <button
                className='sceneButton'
                onClick={() => toggleSceneStatus(scene.id)}
              >
                <h2>{scene.name}</h2>
              </button>
              {sideId === 1 && (
                <div className='sceneButtons'>
                  <button
                    className={`bookmark ${scene.saved ? 'saved' : 'notSaved'}`}
                    onClick={() => scene.saved ? toggleSceneStatus(scene.id) : saveScene(scene.id)}
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
          <button 
            className='AddSceneButton'
            disabled={buttonDisabled}
            style={{ height: `${height}px` }}
            onClick={handleAddScene}
          >
            <GridLines height={height} />
            {!buttonDisabled && <div className='AddSceneIcon'></div>}
            <div className='AddSceneButtonFont'>{buttonText}</div>
          </button>
          {emptyScenes.map((scene) => (
            <div 
              className='scenesEmpty'
              style={{ height: `${height}px` }}
              key={scene.id}
            >
              <GridLines height={height} />
            </div>
          ))}
        </div>
    </div>
  );
}

export default ScenesComponent;
