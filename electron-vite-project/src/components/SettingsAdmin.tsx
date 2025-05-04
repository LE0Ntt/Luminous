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

  // URL Settings
  useEffect(() => {
    const urlParts = url.split(':');
    if (urlParts.length > 1) {
      setIP(urlParts[1].substring(2).split('/')[0]); // Extract IP
      if (urlParts[2]) {
        setPort(urlParts[2].split('/')[0]); // Extract port if exists
      }
    }
  }, [url]);

  const handleOctetChange = (index: number, value: string) => {
    const octets = ip.split('.');
    if (index >= 1 && index <= 4) {
      // Ensure index is within the correct range
      octets[index - 1] = value;
      setIP(octets.join('.'));
    }
  };

  // not in use at the moment, port is hardcoded
  const handlePortChange = (value: string) => {
    setPort(value);
  };

  const saveNewURL = () => {
    const newURL = `http://${ip}:${port}`;
    console.log('New URL:', newURL);
    changeUrl(newURL);
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
        window.electronAPI.showAlert(t('set_alertWrongFile'));
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
      window.electronAPI.showAlert(t('set_alertNoFile'));
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(url + '/upload_db', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        window.electronAPI.showAlert(t('set_alertSuccess'));
      } else {
        window.electronAPI.showAlert(t('set_alertError'));
      }
    } catch (error) {
      console.error('Error uploading the file:', error);
      window.electronAPI.showAlert(t('set_alertError'));
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
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  // Reset the database
  const handleReset = async () => {
    try {
      const response = await fetch(`${url}/reset_db`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      window.electronAPI.showAlert(t('set_resetSuccess'));
    } catch (error) {
      console.error('Error resetting the database:', error);
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
              onClick={() => (window as any).electronAPI.send('open-OLA', url.toString().slice(0, -5) + ':9090')}
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
          <div className='SettingsTextBox textBox SettingsIPBoxContainer'>
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[0]}
              onChange={(e) => handleOctetChange(1, e.target.value)}
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[1]}
              onChange={(e) => handleOctetChange(2, e.target.value)}
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[2]}
              onChange={(e) => handleOctetChange(3, e.target.value)}
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={ip.split('.')[3]}
              onChange={(e) => handleOctetChange(4, e.target.value)}
            />
            :
            <input
              className='SettingsIPBox'
              maxLength={4}
              value={port}
              onChange={(e) => handlePortChange(e.target.value)}
            />
          </div>
          <Button
            className='SettingsButton controlButton'
            onClick={saveNewURL}
          >
            {t('as_saveURL')}
          </Button>
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
