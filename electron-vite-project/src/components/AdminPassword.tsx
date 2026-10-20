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
import { useContext, useEffect, useRef, useState } from 'react';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';
import Button from './Button';
import CloseButton from './CloseButton';
import IconNote from '@/assets/IconNote';

// Detail of the 'saveScene' and 'deleteScene' events dispatched without onConfirm
export interface AdminTokenDetail {
  token: string;
}

interface AdminPasswordProps {
  // Receives the token the server requires for admin-only requests and socket events
  onConfirm?: (token: string) => void;
  onClose: () => void;
  isDelete?: boolean;
}

function AdminPassword({ onConfirm, onClose, isDelete }: AdminPasswordProps) {
  const { url } = useConnectionContext();
  const { t } = useContext(TranslationContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  // Guards against double submits (ENTER + click), which would e.g. add a scene twice or delete the following scene
  const pendingRef = useRef(false);

  // Remove the red outline again after a few seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(false), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  // Logic for checking the password
  const handleConfirm = async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;

    try {
      const response = await fetch(url + '/check_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password }),
      });
      if (!response.ok) throw new Error(`Password check failed with status ${response.status}`);
      const data = await response.json();

      if (data.match === 'true') {
        const token: string = data.token ?? '';
        if (onConfirm !== undefined) {
          onConfirm(token);
        } else {
          document.body.dispatchEvent(new CustomEvent<AdminTokenDetail>(isDelete ? 'deleteScene' : 'saveScene', { detail: { token } }));
        }
        onClose();
        return; // Keep the guard set, the dialog is closing
      }
      // If the password is wrong, the text box will be highlighted in red
      setError(true);
    } catch (error) {
      console.error('Error:', error);
      setError(true);
    }
    pendingRef.current = false;
  };

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      <div
          className='DialogContainer window'
          role='dialog'
          aria-modal='true'
          aria-label={t('ap_title')}
        >
        <CloseButton onClose={onClose} />
        <div className='DialogContent'>
          <span className='DialogTitle'>{t('ap_title')}</span>
          <input
            className={`textBox DialogTextBox ${error ? 'error-outline' : ''}`}
            type='password'
            placeholder={t('ap_password')}
            aria-label={t('ap_password')}
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
