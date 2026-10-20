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
 * @file AddScene.tsx
 */
import { useState, useCallback, useContext, useEffect } from 'react';
import Button from './Button';
import './Dialog.css';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';
import AdminPassword from './AdminPassword';
import CloseButton from './CloseButton';
import IconNote from '@/assets/IconNote';

interface AddSceneProps {
  onClose: () => void;
}

function AddScene({ onClose }: AddSceneProps) {
  const { t } = useContext(TranslationContext);
  const { emit } = useConnectionContext();
  const [name, setName] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [error, setError] = useState(false);

  // Save the scene
  const handleSave = () => {
    if (name !== '') {
      if (!isChecked) {
        emit('scene_add', { scene: { name, saved: false } });
        onClose();
      } else {
        setShowAdminPassword(true);
      }
    } else {
      // If the name is empty, the text box will be highlighted in red
      setError(true);
    }
  };

  // Remove the red outline again after a few seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(false), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  // Callback function for the AdminPassword component
  const handleAdminPasswordConfirm = useCallback(
    (token: string) => {
      emit('scene_add', { scene: { name, saved: true }, token });
      onClose();
    },
    [name, emit, onClose]
  );

  // Confirm with ENTER (the password prompt handles ENTER itself)
  useEffect(() => {
    if (showAdminPassword) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [name, isChecked, showAdminPassword]);

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      {showAdminPassword ? (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setShowAdminPassword(false)}
        />
      ) : (
        <div
          className='DialogContainer window'
          role='dialog'
          aria-modal='true'
          aria-label={t('as_title')}
        >
          <CloseButton onClose={onClose} />
          <div className='DialogContent'>
            <span className='DialogTitle'>{t('as_title')}</span>
            <input
              className={`textBox DialogTextBox ${error ? 'error-outline' : ''}`}
              type='text'
              placeholder='Name'
              aria-label='Name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus // Activate autofocus
            />
            <div className='DialogChecker'>
              <input
                type='checkbox'
                id='checkboxId'
                checked={isChecked}
                onChange={() => setIsChecked((prevChecked) => !prevChecked)}
              />
              <label htmlFor='checkboxId'>{t('as_checkbox')}</label>
            </div>
            <div className='DialogNote'>
              <IconNote
                color={'var(--secondary)'}
                size='20px'
              />
              <span>{t('as_note')}</span>
            </div>
          </div>
          <div className='DialogFooter'>
            <div className='controlButtons DialogButtons'>
              <Button
                onClick={handleSave}
                className='controlButton'
              >
                {t('as_save')}
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
      )}
    </>
  );
}

export default AddScene;
