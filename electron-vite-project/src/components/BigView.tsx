import { useState } from 'react';
import './BigView.css';
import Button from './Button';
import CloseIcon from '../assets/IconRemove.svg'
import '../index.css';

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
            className="buttonBigView"
          >
            <img src={CloseIcon} alt="Close" className='centerIcon'/>
          </Button>
        <div className='BigViewContent innerWindow'>
          Text 1
        </div>
        <div className='BigViewContent innerWindow'>
          Text 2
        </div>
      </div>
    </div>
  );
}

export default BigView;
