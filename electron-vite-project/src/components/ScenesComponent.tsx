import { useState } from 'react'
import './ScenesComponent.css';

function ScenesComponent() {

    // <- Scene:
  interface SceneConfig {
    id: number;
    name: string;
  };

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
  
  return (
    <div className='scenesAlign'>
        <div className='grid-container'>
          {scenes.map((scene) => (
            <div key={scene.id} className='scenesBox'>
              <h2>{scene.name}</h2>
            </div>
          ))}
          <button 
        className='AddSceneButton'
        onClick={addScene}>Add Scene</button>
        </div>
    </div>
  )
}

export default ScenesComponent