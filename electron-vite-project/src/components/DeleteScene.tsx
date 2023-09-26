/**
 * Luminous - A Web-Based Lighting Control System
 * 
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 * 
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 * 
 * @file DeleteScene.tsx
 */
import React, { useState, useContext } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import './AddScene.css';
import { TranslationContext } from './TranslationContext';

interface DeleteSceneProps {
  onClose: () => void;
}

function DeleteScene({ onClose }: DeleteSceneProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useContext(TranslationContext);
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const handleDelete = () => {
    document.body.dispatchEvent(new Event('deleteScene'))
    handleClose();
  };

  return (
    <div>
      <div className="AddSceneOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
      <div className="AddSceneContainer window">
        <Button onClick={handleClose} className="buttonClose">
          <div className="removeIcon centerIcon"></div>
        </Button>
        <div className="AddSceneContent">
          <span className="AddSceneTitle">{t('ds_title')}</span>
          <div className="AddSceneNote">
            <span>❕ {t('ds_note')}</span>
          </div>
        </div>
        <div className="AddSceneFooter">
          <div className="controlButtons AddSceneButtons">
            <Button onClick={handleDelete} className="controlButton">
              {t('ds_delete')}
            </Button>
            <Button onClick={handleClose} className="controlButton">
              {t('as_cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteScene;
