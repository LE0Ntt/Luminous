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
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';
import Button from './Button';
import IconNote from '@/assets/IconNote';

interface RecoverDialogProps {
  onClose: () => void;
}

function RecoverDialog({ onClose }: RecoverDialogProps) {
  const { emit } = useConnectionContext();
  const { t } = useContext(TranslationContext);

  // Reset or recover the workspace
  const handleAction = (actionType: 'reset' | 'recover') => {
    emit(actionType);
    onClose();
  };

  // Confirm with ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAction('reset');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
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
              onClick={() => handleAction('reset')}
              className='controlButton'
            >
              {t('rd_reset')}
            </Button>
            <Button
              onClick={() => handleAction('recover')}
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
