import { useState } from 'react';
import './Settings.css';
import Button from './Button';
import '../index.css';
import Toggle from './Toggle';

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  return (
    <div>
      <div className="SettingsOverlay" onClick={handleClose} /> Overlay to close the modal when clicked outside
        <div className="SettingsContainer">
          <Button
            onClick={() => handleClose()}
            className="buttonClose"
          > 
          <div className='removeIcon centerIcon'></div>
          </Button>
          <div className='SettingsLayer innerWindow'>
            <span>Settings</span>
          </div>
          <div className='SettingsContent innerWindow'>
            Test text
          </div>
      </div>
    </div>
  
);
}
export default Settings;
