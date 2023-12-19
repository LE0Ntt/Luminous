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
import IconNote from '@/assets/IconNote';

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
      <div className='DialogContainer window'>
        <div className='DialogContent'>
          <span className='DialogTitle'>{t('rd_title')}</span>
          <div className='DialogIcon' />
          <div className='DialogNote'>
            <IconNote
              color={'var(--secondary)'}
              size='20px'
            />
            <span>{t('rd_text')}</span>
          </div>
        </div>
        <div className='DialogFooter'>
          <div className='controlButtons DialogButtons'>
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
