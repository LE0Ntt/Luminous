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
}

const ScenesComponent: React.FC<ScenesComponentProps> = ({ sideId }) => {
  const { t } = useContext(TranslationContext);
  const { connected, on, off, emit, url } = useConnectionContext();
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [height, setHeight] = useState(0);
  const [buttonText, setButtonText] = useState(t(''));
  const [repeatNumber, setRepeatNumber] = useState(6);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    fetchScenes();
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
    setScenes((prevScenes) =>
      prevScenes.map((scene) => {
        if (scene.id === sceneId) {
          const newStatus = !scene.status;
          emit("scene_update", { id: sceneId, status: newStatus });
          return { ...scene, status: newStatus };
        }
        return scene;
      })
    );
  };

  const deleteScene = (sceneId: number) => { 
    emit("scene_delete", { id: sceneId });
  };

  const saveScene = (sceneId: number) => { 
    emit("scene_save", { id: sceneId });
  };

  const addScene = () => { 
    const scene: SceneConfig = {
      id: scenes.length,
      name: 'Scene' + (scenes.length + 1),
      status: false,
      saved: false
    }

    emit("scene_add", { scene: scene });
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
            <div className={`scenesBox ${scene.status ? 'on' : ''}`} style={{ height: `${height}px` }}>
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
                    onClick={() => deleteScene(scene.id)}
                  ></button>
                </div>
              )}
            </div>
          ))}
          <button 
            className='AddSceneButton'
            disabled={buttonDisabled}
            style={{ height: `${height}px` }}
            onClick={addScene}
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
