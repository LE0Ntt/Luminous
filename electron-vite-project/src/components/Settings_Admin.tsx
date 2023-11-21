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
import React, { useEffect, useState } from 'react';
import './Settings.css';

interface Setting2Props {
  currentPassword: string;
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  newPasswordConfirm: string;
  setNewPasswordConfirm: React.Dispatch<React.SetStateAction<string>>;
  handleSavePassword: () => void;
  t: (key: string) => string;
  errorMessage: string;
  successMessage: string;
  setIsOlaWindowOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Setting2: React.FC<Setting2Props> = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  newPasswordConfirm,
  setNewPasswordConfirm,
  handleSavePassword,
  t,
  errorMessage,
  successMessage,
  setIsOlaWindowOpen,
}) => {
  const [ip, setIP] = useState<string>('');
  const [port, setPort] = useState<string>('5000');

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

  const handleOctetChange = (index: number, value: string) => {
    const octets = ip.split('.');
    octets[index - 1] = value;
    setIP(octets.join('.'));
  };

  useEffect(() => {
    console.log('fetching ip');
    console.log(ip);
    const fullUrl = `${ip}:${port}`;
    /*     changeUrl(fullUrl); */
  }, [ip]);

  const octets = ip.split('.');

  const handlePortChange = (value: string) => {
    setPort(value);
  };

  return (
    <div className='SettingsOption'>
      <div className='SettingsSubTitle'>
        <span>{t('set_admin')}</span>
      </div>
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <span>{t('change_password')}</span>
        </div>
        <div className='ChangePassword'>
          <form className='SettingsTextBoxContainer'>
            <input
              className='SettingsTextBox'
              type='password'
              value={currentPassword}
              placeholder={t('set_current_pw')}
              onChange={(e) => setCurrentPassword(e.target.value)}
              onKeyDown={handleEnterNext}
            />
            <input
              className='SettingsTextBox'
              type='password'
              value={newPassword}
              placeholder={t('set_new_pw')}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={handleEnterNext}
            />
            <input
              className='SettingsTextBox'
              type='password'
              value={newPasswordConfirm}
              placeholder={t('set_conew_pw')}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              onKeyDown={handleEnterConfirm}
            />
          </form>
          <button
            className='SettingsButton controlButton'
            onClick={handleSavePassword}
          >
            {t('as_save')}
          </button>
          {errorMessage && <div className='PasswordMessage'>{errorMessage}</div>}
          {successMessage && <div className='PasswordMessage'>{successMessage}</div>}
        </div>
      </div>
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <span>OLA</span>
        </div>
        <button
          className='SettingsButton controlButton'
          onClick={() => setIsOlaWindowOpen(true)}
        >
          {t('set_ola')}
        </button>
      </div>
      {/* only for release not implemented */}
      {/* <div className='SettingContainer'>
        <div className='Heading'>
          <span>URL</span>
        </div>
        <div className='SettingsTextBoxContainer'>
          <div className='text'>
            {t('change_url_of_server')}
            <br />
          </div>
          <div>
            <label>{t('set_current_ip')}</label> <br />
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={octets[0]}
              onChange={(e) => handleOctetChange(1, e.target.value)}
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={octets[1]}
              onChange={(e) => handleOctetChange(2, e.target.value)}
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={octets[2]}
              onChange={(e) => handleOctetChange(3, e.target.value)}
            />
            .
            <input
              className='SettingsIPBox'
              maxLength={3}
              value={octets[3]}
              onChange={(e) => handleOctetChange(4, e.target.value)}
            />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Setting2;
