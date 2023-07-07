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
import { useContext, useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import './AddScene.css';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';

interface AdminPasswordProps {
  onConfirm?: (isConfirmed: boolean) => void;
  onClose: () => void;
  isDelete?: boolean;
}

function AdminPassword({ onConfirm, onClose, isDelete }: AdminPasswordProps) {
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
        if(onConfirm !== undefined) {
          onConfirm(true);
        } else {
          if(isDelete) {
            document.body.dispatchEvent(new Event('deleteScene'))
            console.log('Delete scene');
          } else {
            document.body.dispatchEvent(new Event('saveScene'))
          }
        }
        handleClose();
      } else {
        console.log('Password wrong');
        // If the password is wrong, the text box will be highlighted in red
        const textBox = document.getElementsByClassName('AddSceneTextBox')[0] as HTMLInputElement;
        textBox.focus();
        textBox.style.outline = '2px solid red';
        textBox.style.outlineOffset =  "-1px";
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
          <input 
            className='LightSettingsTextBox AddSceneTextBox' 
            type="password" 
            placeholder={t("ap_password")} 
            value={password} 
            onChange={handlePasswordChange}
            autoFocus // Activate autofocus
          />
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
