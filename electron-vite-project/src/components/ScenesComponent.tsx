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
}

interface ScenesComponentProps {
  sideId: number;
}

const ScenesComponent: React.FC<ScenesComponentProps> = ({ sideId }) => {
  const { t } = useContext(TranslationContext);
  const { connected, on, off, emit, url } = useConnectionContext();

  const [height, setHeight] = useState(0);
  const [buttonText, setButtonText] = useState(t(''));
  const [repeatNumber, setRepeatNumber] = useState(6);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchScenes = async () => {
      try {
        const response = await fetch(url + '/scenes');
        const data = await response.json();
        setScenes(JSON.parse(data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchScenes();
  }, []);

  useEffect(() => {
    const eventListener = (data: any) => {
      console.log("Received data from server:", data.value);
      setScenes((prevScenes) => {
        return prevScenes.map((scene, index) => {
          if (index === data.id) {
            return { ...scene, id: data.id, name: data.name };
          }
          return scene;
        });
      });
    };
    
    on("scene_update", eventListener);
  
    return () => off("scene_update", eventListener);
  }, [on, off]);

  useEffect(() => {
    if (sideId === 0) {
      setHeight(105);
      setButtonText(t("SaveCurrentConfiguration"));
      setRepeatNumber(5);
      setButtonDisabled(false);
    } else if (sideId === 1) {
      setHeight(202);
      setButtonText(t("AddNewScene"));
      setRepeatNumber(6);
      setButtonDisabled(false);
    } else if (sideId === 2) {
      setHeight(105);
      setButtonText('');
      setRepeatNumber(7);
      setButtonDisabled(true);
    }
  }, [sideId, t]);

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

  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const addScene = () => {
    setScenes([
      ...scenes,
      {
        id: scenes.length + 1,
        name: 'Scene ' + scenes.length,
        status: false,
      },
    ]);
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
            <button
              key={scene.id}
              className={`scenesBox ${scene.status ? 'on' : ''}`}
              style={{ height: `${height}px` }}
              onClick={() => toggleSceneStatus(scene.id)}
            >
              <h2>{scene.name}</h2>
            </button>
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
