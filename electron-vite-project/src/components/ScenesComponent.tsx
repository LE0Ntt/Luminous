import { useState } from 'react'
import './ScenesComponent.css';

function ScenesComponent({ height }: { height: number }) {

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
            <div key={scene.id} className='scenesBox' style={{ height: `${height}px` }}>
              <h2>{scene.name}</h2>
            </div>
          ))}
          <button 
        className='AddSceneButton '
        style={{ height: `${height}px` }}
        onClick={addScene}>Add Scene</button>
        </div>
    </div>
  )
}

export default ScenesComponent