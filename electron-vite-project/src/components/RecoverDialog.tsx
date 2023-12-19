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
 * @file RecoverDialog.tsx
 */
import { useContext, useEffect } from 'react';
import Button from './Button';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';

interface RecoverDialogProps {
  onClose: () => void;
}

function RecoverDialog({ onClose }: RecoverDialogProps) {
  const { emit } = useConnectionContext();
  const { t } = useContext(TranslationContext);

  const handleReset = () => {
    emit('reset');
    onClose();
  };

  const handleRecover = () => {
    emit('recover');
    onClose();
  };

  // Confirm with ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleReset();
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
        style={{ cursor: 'default' }}
      />
      <div className='AddSceneContainer window'>
        <div className='AddSceneContent'>
          <span className='AddSceneTitle'>{t('rd_title')}</span>
          <p className='hide'>a</p> {/* Hidden element for spacing */}
          <div className='AddSceneNote'>
            <span>{t('rd_text')}</span>
          </div>
        </div>
        <div className='AddSceneFooter'>
          <div className='controlButtons AddSceneButtons'>
            <Button
              onClick={handleReset}
              className='controlButton'
            >
              {t('rd_reset')}
            </Button>
            <Button
              onClick={handleRecover}
              className='controlButton'
            >
              {t('rd_recover')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default RecoverDialog;
