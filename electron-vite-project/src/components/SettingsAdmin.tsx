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
 * @file Settings_Admin.tsx
 */
import React, { useContext, useEffect, useState } from 'react';
import './Settings.css';
import { TranslationContext } from './TranslationContext';
import Button from './Button';
import IconServer from '@/assets/IconServer';
import IconKey from '@/assets/IconKey';
import { useConnectionContext } from './ConnectionContext';
import IconNetwork from '@/assets/IconNetwork';
import { showAlert } from '@/utils/platform';
import { isValidIpv4, isValidPort } from '@/utils/helpers';

interface Setting2Props {
  connected: boolean;
}

const Setting2: React.FC<Setting2Props> = ({ connected }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const defaultIP = '0.0.0.0'; // placeholder ip to avoid empty string, and error inside the console
  const [ip, setIP] = useState<string>(defaultIP);
  const [port, setPort] = useState<string>('5000');
  const [urlError, setUrlError] = useState(false);
  const { t } = useContext(TranslationContext);
  const { changeUrl, url } = useConnectionContext();

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

  // Password Settings
  const handleSavePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setPasswordSuccess(false);
      setPasswordMessage(t('set_error_match'));
    } else {
      fetch(url + '/change_password', {
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
          if (data.message === 'changed_successfully') {
            setPasswordSuccess(true);
            setPasswordMessage(t('set_changed_successfully'));
          } else if (data.message === 'currrent_wrong') {
            setPasswordSuccess(false);
            setPasswordMessage(t('set_current_wrong'));
          } else if (data.message === 'no_match') {
            setPasswordSuccess(false);
            setPasswordMessage(t('set_error_match'));
          } else {
            setPasswordSuccess(true);
            setPasswordMessage(data.message);
          }
        })
        .catch((error) => {
          setPasswordSuccess(false);
          setPasswordMessage(t('set_error_change'));
          console.error(error);
        });
    }

    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  useEffect(() => {
    if (passwordMessage) {
      const timer = setTimeout(() => {
        setPasswordMessage('');
      }, 4000); // Reset message after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  // URL Settings (the web version uses relative URLs, the page itself is served by the server)
  useEffect(() => {
    try {
      const { hostname, port: urlPort } = new URL(url || window.location.origin);
      if (isValidIpv4(hostname)) setIP(hostname);
      setPort(urlPort || '80');
    } catch (error) {
      console.error('Could not parse the server URL:', error);
    }
  }, [url]);

  const handleOctetChange = (index: number, value: string) => {
    const octets = ip.split('.');
    if (index >= 1 && index <= 4) {
      // Ensure index is within the correct range
      octets[index - 1] = value.replace(/\D/g, '');
      setIP(octets.join('.'));
      setUrlError(false);
    }
  };

  const handlePortChange = (value: string) => {
    setPort(value.replace(/\D/g, ''));
    setUrlError(false);
  };

  const saveNewURL = () => {
    if (!isValidIpv4(ip) || !isValidPort(port)) {
      setUrlError(true);
      return;
    }
    changeUrl(`http://${ip}:${port}`);
  };

  // The Electron app opens OLA in its own window, the browser in a new tab
  const openOLA = () => {
    if (window.electronAPI) {
      window.electronAPI.send('open-OLA');
    } else {
      const { hostname } = new URL(url || window.location.origin);
      window.open(`http://${hostname}:9090/`, '_blank', 'noopener,noreferrer');
    }
  };

  // ----- Database Settings -----
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Check if the dropped file is a .db file
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].name.endsWith('.db') && files.length == 1) {
        setSelectedFile(files[0]);
        setIsDragActive(false);
      } else {
        showAlert(t('set_alertWrongFile'));
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  // Upload the selected file
  const handleUpload = async () => {
    if (!selectedFile) {
      showAlert(t('set_alertNoFile'));
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(url + '/upload_db', {
        method: 'POST',
        body: formData,
      });
      showAlert(t(response.ok ? 'set_alertSuccess' : 'set_alertError'));
    } catch (error) {
      console.error('Error uploading the file:', error);
      showAlert(t('set_alertError'));
    }
  };

  // Download the database file
  const handleBackup = async () => {
    try {
      const response = await fetch(`${url}/download_db`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = 'database.db';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading the file:', error);
      showAlert(t('set_downloadError'));
    }
  };

  // Reset the database (the server keeps a backup of the old one)
  const handleReset = async () => {
    if (!window.confirm(t('set_resetConfirm'))) return;

    try {
      const response = await fetch(`${url}/reset_db`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      showAlert(t('set_resetSuccess'));
    } catch (error) {
      console.error('Error resetting the database:', error);
      showAlert(t('set_resetError'));
    }
  };

  return (
    <div className='SettingsOption'>
      <div className='SettingsTitle SettingsTitleInner'>
        <span>{t('set_admin')}</span>
      </div>
      <hr style={{ marginTop: '45px' }} />
      {connected && (
        <>
          <div className='SettingContainer'>
            <div className='SettingsSubTitle'>
              <IconKey
                color={'var(--primary)'}
                size='20px'
              />
              <span className='relative top-[-6px]'>{t('change_password')}</span>
            </div>
            <div className='ChangePassword'>
              <form className='SettingsTextBoxContainer'>
                <input
                  className='SettingsTextBox textBox'
                  type='password'
                  value={currentPassword}
                  placeholder={t('set_current_pw')}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onKeyDown={handleEnterNext}
                />
                <input
                  className='SettingsTextBox textBox'
                  type='password'
                  value={newPassword}
                  placeholder={t('set_new_pw')}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={handleEnterNext}
                />
                <input
                  className='SettingsTextBox textBox'
                  type='password'
                  value={newPasswordConfirm}
                  placeholder={t('set_conew_pw')}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  onKeyDown={handleEnterConfirm}
                />
              </form>
              <Button
                className='SettingsButton controlButton'
                onClick={handleSavePassword}
              >
                {t('as_save')}
              </Button>
              {passwordMessage && <div className={`PasswordMessage ${passwordSuccess ? 'successMessage' : 'errorMessage'}`}>{passwordMessage}</div>}
            </div>
          </div>
          <hr />
          <div className='SettingContainer'>
            <div className='SettingsSubTitle'>
              <IconServer
                color={'var(--primary)'}
                size='20px'
              />
              <span className='relative top-[-6px]'>OLA</span>
            </div>
            <Button
              className='SettingsButton controlButton'
              onClick={openOLA}
            >
              {t('set_ola')}
            </Button>
          </div>
          <hr />
        </>
      )}
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <IconNetwork
            color={'var(--primary)'}
            size='20px'
          />
          <span className='relative top-[-6px]'>{t('change_URL')}</span>
        </div>
        <div className='SettingsTextBoxContainer2'>
          <div className={`SettingsTextBox textBox SettingsIPBoxContainer ${urlError ? 'error-outline' : ''}`}>
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[0] ?? ''}
              onChange={(e) => handleOctetChange(1, e.target.value)}
              aria-label={`IP ${t('set_octet')} 1`}
              inputMode='numeric'
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[1] ?? ''}
              onChange={(e) => handleOctetChange(2, e.target.value)}
              aria-label={`IP ${t('set_octet')} 2`}
              inputMode='numeric'
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[2] ?? ''}
              onChange={(e) => handleOctetChange(3, e.target.value)}
              aria-label={`IP ${t('set_octet')} 3`}
              inputMode='numeric'
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[3] ?? ''}
              onChange={(e) => handleOctetChange(4, e.target.value)}
              aria-label={`IP ${t('set_octet')} 4`}
              inputMode='numeric'
            />
            :
            <input
              className='SettingsIPBox'
              maxLength={4}
              value={port}
              onChange={(e) => handlePortChange(e.target.value)}
              aria-label='Port'
              inputMode='numeric'
            />
          </div>
          <Button
            className='SettingsButton controlButton'
            onClick={saveNewURL}
          >
            {t('as_saveURL')}
          </Button>
          {urlError && (
            <span
              className='errorMessage self-center'
              role='alert'
            >
              {t('set_invalidURL')}
            </span>
          )}
        </div>
      </div>
      {connected && (
        <>
          <hr />
          <div className='SettingContainer'>
            <div className='SettingsSubTitle'>
              <IconServer
                color={'var(--primary)'}
                size='20px'
              />
              <span className='relative top-[-6px]'>{t('set_db')}</span>
            </div>
            <div className='dbSettings'>
              <Button
                className='SettingsButton controlButton'
                onClick={handleBackup}
              >
                {t('set_saveDB')}
              </Button>
              <Button
                className='SettingsButton controlButton'
                onClick={handleReset}
              >
                {t('set_resetDB')}
              </Button>
              <div className='uploadDBContainer'>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className='dropzone'
                  style={{ backgroundColor: isDragActive ? 'var(--colorButton)' : '' }}
                >
                  {selectedFile ? (
                    <p>
                      {t('set_selectedFile')}: {selectedFile.name}
                    </p>
                  ) : (
                    <p>{t('set_dropHere')}</p>
                  )}
                </div>
                <Button
                  className='SettingsButton controlButton'
                  onClick={handleUpload}
                >
                  {t('set_uploadDB')}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Setting2;
