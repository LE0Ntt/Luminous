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
import IconAdmin from '@/assets/Icon_Admin';
import IconSettings from '@/assets/Icon_Settings';
import IconServer from '@/assets/IconServer';

interface Setting2Props {
  url: string;
  setIsOlaWindowOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Setting2: React.FC<Setting2Props> = ({ url, setIsOlaWindowOpen }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [ip, setIP] = useState<string>('');
  const [port, setPort] = useState<string>('5000');
  const { t } = useContext(TranslationContext);

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

  const handleSavePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setPasswordSuccess(false);
      setPasswordMessage(t('set_error_match'));
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
          if (data.message === 'changed_successfully') {
            setPasswordSuccess(true);
            setPasswordMessage(t('set_changed_successfully'));
          } else if (data.message === 'currrent_wrong') {
            setPasswordSuccess(false);
            setPasswordMessage(t('set_currrent_wrong'));
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
      <div className='SettingsTitle'>
        <span>{t('set_admin')}</span>
      </div>
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <IconSettings
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
          onClick={() => setIsOlaWindowOpen(true)}
        >
          {t('set_ola')}
        </Button>
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
