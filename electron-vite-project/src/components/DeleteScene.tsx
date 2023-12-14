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
import { useContext, useEffect } from 'react';
import Button from './Button';
import './AddScene.css';
import { TranslationContext } from './TranslationContext';

interface DeleteSceneProps {
  onClose: () => void;
}

function DeleteScene({ onClose }: DeleteSceneProps) {
  const { t } = useContext(TranslationContext);

  const handleDelete = () => {
    document.body.dispatchEvent(new Event('deleteScene'));
    onClose();
  };

  // Confirm with ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      {/* Overlay to close the modal when clicked outside */}
      <div className='AddSceneContainer window'>
        <button
          className='buttonClose'
          onClick={onClose}
        >
          <div className='xClose'>
            <div className='xClose xiClose'></div>
          </div>
        </button>
        <div className='AddSceneContent'>
          <span className='AddSceneTitle'>{t('ds_title')}</span>
          <div className='AddSceneNote'>
            <span>❕ {t('ds_note')}</span>
          </div>
        </div>
        <div className='AddSceneFooter'>
          <div className='controlButtons AddSceneButtons'>
            <Button
              onClick={handleDelete}
              className='controlButton'
            >
              {t('ds_delete')}
            </Button>
            <Button
              onClick={onClose}
              className='controlButton'
            >
              {t('as_cancel')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteScene;
