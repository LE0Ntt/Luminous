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
 * @file Settings.tsx
 */
import { useState, useContext, useEffect, useCallback } from 'react';
import './Settings.css';
import Button from './Button';
import '../index.css';
import './LightSettings.css';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from './ConnectionContext';
import AdminPassword from './AdminPassword';
import Toggle from './Toggle'; // maybe not in use anymore
import Setting1 from './Settings_General';
import Setting2 from './Settings_Admin';
import IconSettings from '@/assets/Icon-Settings';
import IconAdmin from '@/assets/Icon_Admin';
import './Titlebar.css';

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { t, language, setLanguage } = useContext(TranslationContext);
  const { url /* changeUrl */ } = useConnectionContext();
  const [isOlaWindowOpen, setIsOlaWindowOpen] = useState(false);
  const newUrl = url.toString().slice(0, -5) + ':9090';

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'de');
  };

  const handleSavePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage(t('set_error_match'));
      setSuccessMessage('');
    } else {
      fetch(url + '/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
          newPasswordConfirm: newPasswordConfirm,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setSuccessMessage(data.message);
          setErrorMessage('');
        })
        .catch((error) => {
          setErrorMessage(t('set_error_change'));
          setSuccessMessage('');
          console.error(error);
        });
    }

    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  // Confirm with ENTER
  const handleEnterConfirm = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSavePassword();
      event.currentTarget.blur(); // Remove focus from the input
    }
  };

  // Next input on ENTER
  const handleEnterNext = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const form = event.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.elements) as HTMLInputElement[];
        const index = inputs.indexOf(event.currentTarget);
        const nextInput = inputs[index + 1];
        if (nextInput) {
          nextInput.focus();
          event.preventDefault();
        }
      }
    }
  };

  const handleAdminPasswordConfirm = useCallback((isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
    if (isConfirmed) {
      window.electronAPI.openExternal(newUrl);
      handleClose();
    }
  }, []);

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const [selectedSetting, setSelectedSetting] = useState<string | null>('Setting1');

  const handleToggleChange = () => {
    const newSetting = localStorage.getItem('reverseOrder') !== 'true';
    localStorage.setItem('reverseOrder', String(newSetting));
    window.dispatchEvent(new CustomEvent<boolean>('reverseOrder', { detail: newSetting }));
  };

  return (
    <div>
      <div
        className='backgroundOverlay'
        onClick={handleClose}
      />
      {isOlaWindowOpen ? (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setIsOlaWindowOpen(false)}
        />
      ) : (
        <>
          <div className='SettingsContainer'>
            <Button
              onClick={handleClose}
              className='buttonClose'
            >
              <div className='removeIcon centerIcon'></div>
            </Button>
            <div className='SettingsTitle'>
              <span>{t('set_title')}</span>
            </div>
            <div className='SettingsContent'>
              <div className='settings'>
                <Button
                  className={selectedSetting === 'Setting1' ? 'active' : ''}
                  onClick={() => setSelectedSetting('Setting1')}
                >
                  <div className='settingsButtonContent'>
                    <IconSettings color={selectedSetting === 'Setting1' ? 'var(--primarySwitched)' : 'var(--primary)'} />
                    <span>{t('set_general')}</span>
                  </div>
                </Button>
                <Button
                  className={selectedSetting === 'Setting2' ? 'active' : ''}
                  onClick={() => setSelectedSetting('Setting2')}
                >
                  <div className='settingsButtonContent'>
                    <IconAdmin color={selectedSetting === 'Setting2' ? 'var(--primarySwitched)' : 'var(--primary)'} />
                    <span>{t('set_admin')}</span>
                  </div>
                </Button>
                {/* Füge hier weitere Settings hinzu */}
              </div>
              <div className='SettingContent innerWindow'>
                {selectedSetting === 'Setting1' ? (
                  <Setting1
                    t={t}
                    language={language}
                    handleLanguageChange={handleLanguageChange}
                  />
                ) : selectedSetting === 'Setting2' ? (
                  <Setting2
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    newPasswordConfirm={newPasswordConfirm}
                    setNewPasswordConfirm={setNewPasswordConfirm}
                    handleSavePassword={handleSavePassword}
                    t={t}
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                    setIsOlaWindowOpen={setIsOlaWindowOpen}
                  />
                ) : selectedSetting === 'Setting3' ? (
                  <div className='SettingsOption'>not used</div>
                ) : selectedSetting === 'Setting4' ? (
                  <div className='SettingsOption'>not used</div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Settings;
