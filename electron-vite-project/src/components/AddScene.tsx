import { useContext, useEffect, useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import './AddScene.css';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';

interface addSceneProps {
  onClose: () => void;
}


function AddScene({ onClose }: addSceneProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useContext(TranslationContext);
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const { connected, url } = useConnectionContext();
  
  return (
    <div>
      <div className="BigViewOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
        <div className="BigViewContainer AddSceneContainer">
          <Button
            onClick={() => handleClose()}
            className="buttonClose"
          >
            <div className='removeIcon centerIcon'></div>
          </Button>
          <div className='BigViewLayer'>
            <span className='text-right'>{t("bb_lights")}</span>
          </div>
          test
        </div>
      </div>
  );
}

export default AddScene;
