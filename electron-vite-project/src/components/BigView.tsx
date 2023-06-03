import { useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import Toggle from './Toggle';

interface BigViewProps {
  onClose: () => void;
}

function BigView({ onClose }: BigViewProps) {
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
        <Toggle/>
        <div className='BigViewContent innerWindow'>
          Text 1
        BT</div>
        <div className='BigViewContent innerWindow'>
          Text 2
        </div>
      </div>
    </div>
  );
}

export default BigView;
