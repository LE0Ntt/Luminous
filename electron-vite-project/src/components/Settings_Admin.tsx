import React, { useEffect, useState } from 'react';
import Button from './Button';
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
      <div className='LightSettingsSubTitle'>
        <span>{t('set_admin')}</span>
      </div>
      <div className='SettingContainer h-[130px]'>
        <div className='Heading'>
          <span>{t('change_password')}</span>
        </div>
        <form className='SettingsTextBoxContainer'>
          <div>
            <label>{t('set_current_pw')}</label> <br />
            <input
              className='SettingsTextBox'
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label>{t('set_new_pw')}</label> <br />
            <input
              className='SettingsTextBox'
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label>{t('set_conew_pw')}</label> <br />
            <input
              className='SettingsTextBox'
              type='password'
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
          </div>
          <br />
          <Button
            className='SettingsSavePWButton controlButton'
            onClick={handleSavePassword}
          >
            {t('as_save')}
          </Button>
        </form>
        {errorMessage && <div className='ErrorMessage'>{errorMessage}</div>}
        {successMessage && <div className='SuccessMessage'>{successMessage}</div>}
      </div>
      <div className='SettingsOption'>
        <div className='LightSettingsSubTitle'>
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
