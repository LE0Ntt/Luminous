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
 * @file LightsOn.tsx
 */
import { useContext, useEffect, useState } from 'react';
import Button from './Button';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';

interface LightsOnProps {
  onConfirm?: (isConfirmed: boolean) => void;
  onClose: () => void;
  isDelete?: boolean;
}

function LightsOn({ onConfirm, onClose, isDelete }: LightsOnProps) {
  const { url } = useConnectionContext();
  const { t } = useContext(TranslationContext);

  const handleConfirm = () => {};

  // Confirm with ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        () => handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Overlay to close the modal when clicked outside */}
      <div className='AddSceneContainer window'>
        <div className='AddSceneContent'>
          <span className='AddSceneTitle'>{t('lo_title')}</span>
          <p className='hide'>a</p> {/* Hidden element for spacing */}
          <div className='AddSceneNote'>
            <span>{t('lo_text')}</span>
          </div>
        </div>
        <div className='AddSceneFooter'>
          <div className='controlButtons AddSceneButtons'>
            <Button
              onClick={() => handleConfirm()}
              className='controlButton'
            >
              {t('lo_confirm')}
            </Button>
            <Button
              onClick={onClose}
              className='controlButton'
            >
              {t('lo_cancel')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LightsOn;
