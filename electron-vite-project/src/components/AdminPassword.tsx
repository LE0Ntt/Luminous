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
 * @file AdminPassword.tsx
 */
import { useContext, useEffect, useState } from 'react';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';
import Button from './Button';
import IconNote from '@/assets/IconNote';

interface AdminPasswordProps {
  onConfirm?: (isConfirmed: boolean) => void;
  onClose: () => void;
  isDelete?: boolean;
}

function AdminPassword({ onConfirm, onClose, isDelete }: AdminPasswordProps) {
  const { url } = useConnectionContext();
  const { t } = useContext(TranslationContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Logic for checking the password
  const handleConfirm = () => {
    fetch(url + '/check_password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.match === 'true') {
          if (onConfirm !== undefined) {
            onConfirm(true);
          } else {
            if (isDelete) {
              document.body.dispatchEvent(new Event('deleteScene'));
            } else {
              document.body.dispatchEvent(new Event('saveScene'));
            }
          }
          onClose();
        } else {
          // If the password is wrong, the text box will be highlighted in red
          setError(true);
          const timer = setTimeout(() => setError(false), 4000);
          return () => clearTimeout(timer);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // Confirm with ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        () => handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      <div className='DialogContainer window'>
        <button
          className='buttonClose'
          onClick={onClose}
        >
          <div className='xClose'>
            <div className='xClose xiClose'></div>
          </div>
        </button>
        <div className='DialogContent'>
          <span className='DialogTitle'>{t('ap_title')}</span>
          <input
            className={`textBox DialogTextBox ${error ? 'error-outline' : ''}`}
            type='password'
            placeholder={t('ap_password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
          />
          <p className='hide'>a</p> {/* Hidden element for spacing */}
          <div className='DialogNote'>
            <IconNote
              color={'var(--secondary)'}
              size='20px'
            />
            <span>{t('ap_note')}</span>
          </div>
        </div>
        <div className='DialogFooter'>
          <div className='controlButtons DialogButtons'>
            <Button
              onClick={() => handleConfirm()}
              className='controlButton'
            >
              {t('ap_confirm')}
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

export default AdminPassword;
