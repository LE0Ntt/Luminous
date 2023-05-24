import React from 'react'
import { useState } from 'react'

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
    <div>ScenesComponent
        <button onClick={addScene}>Add Scene</button>
        <div className=''>
          {scenes.map((scene) => (
            <div key={scene.id} className='scenesBox'>
              <h2>{scene.name}</h2>
            </div>
          ))}
        </div>
    </div>
  )
}

export default ScenesComponent