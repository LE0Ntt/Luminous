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
  
  const handleSave= () => {
    console.log("clicked Save")
  };

  return (
    <div>
      <div className="AddSceneOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
      <div className="AddSceneContainer window">
        <Button
          onClick={() => handleClose()}
          className="buttonClose"
        >
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='AddSceneContent'>
          <span className='AddSceneTitle'>{t("as_title")}</span>
          <input className='LightSettingsTextBox AddSceneTextBox' type="text" placeholder="Name" />
          <div className='AddSceneChecker'>
            <input type="checkbox" value="Bike" />
            <label >{t("as_checkbox")}</label>
          </div>
          <div className='AddSceneNote'>
            <span>❕ {t("as_note")}</span>
          </div>
        </div>
        <div className='AddSceneFooter'>
          <div className="controlButtons AddSceneButtons">
            <Button 
              onClick={() => handleSave()} 
              className="controlButton"
            >
              {t("as_save")}
            </Button>
            <Button 
              onClick={() => handleClose()}
              className="controlButton"
            >
              {t("as_cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddScene;
