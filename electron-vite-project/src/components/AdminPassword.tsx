import { SetStateAction, useContext, useEffect, useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import './AddScene.css';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';

interface AdminPasswordProps {
  onConfirm: (isConfirmed: boolean) => void;
  onClose: () => void;
}

function AdminPassword({ onConfirm, onClose }: AdminPasswordProps) {
  const { url } = useConnectionContext();
  const { t } = useContext(TranslationContext);
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState('');
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }
  
  const handlePasswordChange = (event: { target: { value: any; }; }) => {
    setPassword(event.target.value);
  };
  
  const handleConfirm = () => {
    fetch(url + '/checkpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({password: password})
    })
    .then(response => response.json())
    .then(data => {
      if(data.match === 'true') {
        console.log('Password correct');
        onConfirm(true);
        handleClose();
      } else {
        console.log('Password wrong');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <div>
      <div className="AddSceneOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
      <div className="AddSceneContainer window">
        <Button onClick={() => handleClose()} className="buttonClose">
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='AddSceneContent'>
          <span className='AddSceneTitle'>{t("ap_title")}</span>
          <input className='LightSettingsTextBox AddSceneTextBox' type="password" placeholder={t("ap_password")} value={password} onChange={handlePasswordChange}/>
          <p className='hide'>a</p> {/* Hidden element for spacing */}
          <div className='AddSceneNote'>
            <span>❕ {t("ap_note")}</span>
          </div>
        </div>
        <div className='AddSceneFooter'>
          <div className="controlButtons AddSceneButtons">
            <Button onClick={() => handleConfirm()} className="controlButton">
              {t("ap_confirm")}
            </Button>
            <Button onClick={() => handleClose()} className="controlButton">
              {t("as_cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPassword;
