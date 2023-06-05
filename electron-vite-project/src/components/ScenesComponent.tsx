import { useState, useEffect, useContext } from 'react'
import './ScenesComponent.css';
import '../assets/GridLines';
import GridLines from '../assets/GridLines';
import { TranslationContext } from "./TranslationContext";
import { useConnectionContext } from "../components/ConnectionContext";

function ScenesComponent({ sideId }: { sideId: number }) {

  //console.log('sideId: ' + sideId); // 0: Studio, 1: Scenes, 2: Show // Debug
  const { t } = useContext(TranslationContext);
  const { connected, on, off } = useConnectionContext();

    // <- Scene:
  interface SceneConfig {
    id: number;
    name: string;
  };

  const [height, setHeight] = useState(0);
  const [buttonText, setButtonText] = useState(t(''));
  const [repeatNumber, setRepeatNumber] = useState(6);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchScenes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/scenes');
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
    
    on("variable_update", eventListener);
  
    // Entfernen des Event-Listeners
    return () => off("variable_update", eventListener);
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

  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const addScene = () => {
    setScenes([
      ...scenes,
      {
        id: scenes.length + 1,
        name: 'Scene ' + scenes.length,
      },
    ]);
  };
  // :Scene End ->

  // <- Empty Scene:
  const extraButton = 1; // Anzahl der zusätzlichen Buttons

  const emptyScenesLength = Math.ceil((scenes.length + extraButton) / repeatNumber) * repeatNumber - scenes.length - extraButton + (repeatNumber * 3);

  const emptyScenes = Array.from(
    { length: emptyScenesLength },
    (_, index) => ({ id: scenes.length + extraButton + index + 1, name: 'Empty Scene' })
  );

  //console.log(emptyScenes);

  // :Empty Scene End ->
  
  return (
    <div className='scenesAlign'>
        <div className='grid-container' style={{ gridTemplateColumns: `repeat(${repeatNumber}, 1fr)` }}>
          {scenes.map((scene) => (
            <div key={scene.id} className='scenesBox' style={{ height: `${height}px` }}>
              <h2>{scene.name}</h2>
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
            >
              <GridLines height={height} />
            </div>
          ))}
        </div>
    </div>
  )
}

export default ScenesComponent
