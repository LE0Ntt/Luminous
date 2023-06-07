import { useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import Toggle from './Toggle';

interface SettingsProps {
  onClose: () => void;
}

function BigView({ onClose }: SettingsProps) {
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
              <div className="BigViewOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
      <div className="BigViewContainer">
        <Button
          onClick={() => handleClose()}
          className="buttonClose"
        >
          <div className='removeIcon centerIcon'></div>
        </Button>
      </div>
    </div>
  );
}

export default BigView;
