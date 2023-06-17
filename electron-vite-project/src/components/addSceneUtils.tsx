interface Scene {
    id: number;
    name: string;
    status: boolean;
    saved: boolean;
}

export const addScene = (scenes: Scene[], emit: any) => {
    const scene = {
      id: scenes.length,
      name: 'Scene' + (scenes.length + 1),
      status: false,
      saved: false
    }
  
    emit("scene_add", { scene });
  };
  