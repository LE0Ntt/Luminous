import { useContext, useState } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import './SettingsOla.css';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';
import { stringify } from 'postcss';

interface SettingsOlaProps {
  onConfirm?: (isConfirmed: boolean) => void;
  onClose: () => void;
  isDelete?: boolean;
}

function SettingsOla({ onConfirm, onClose, isDelete }: SettingsOlaProps) {
  const { url } = useConnectionContext();
  const { t } = useContext(TranslationContext);
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState('');
  const oldUrl = url.toString();
  const newUrl = oldUrl.slice(0, -5) + ":9090";
  



  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const handlePasswordChange = (event: { target: { value: any } }) => {
    setPassword(event.target.value);
  };

  const handleConfirm = () => {
    fetch(url + '/checkpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.match === 'true') {
          console.log('Password correct');
          if (onConfirm !== undefined) {
            onConfirm(true);
          } else {
            console.log(newUrl)
            const link = newUrl;
            window.open(newUrl, "_blank", "width=800,height=600");
          }
          handleClose();
        } else {
          console.log('Password wrong');
          // If the password is wrong, the text box will be highlighted in red
          const textBox = document.getElementsByClassName('SettingsOlaTextBox')[0] as HTMLInputElement;
          textBox.focus();
          textBox.style.outline = '2px solid red';
          textBox.style.outlineOffset = '-1px';
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <div className="SettingsOlaOverlay" onClick={handleClose} /> {/* Overlay to close the modal when clicked outside */}
      <div className="SettingsOlaContainer window">
        <Button onClick={() => handleClose()} className="buttonClose">
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='SettingsOlaContent'>
          <span className='SettingsOlaTitle'>{t("ap_title")}</span>
          <input
            className='LightSettingsTextBox SettingsOlaTextBox'
            type="password"
            placeholder={t("ap_password")}
            value={password}
            onChange={handlePasswordChange}
            autoFocus // Autofokus aktivieren
          />
          <p className='hide'>a</p> {/* Hidden element for spacing */}
          <div className='SettingsOlaNote'>
            <span>❕ {t("ap_note")}</span>
          </div>
        </div>
        <div className='SettingsOlaFooter'>
          <div className="controlButtons SettingsOlaButtons">
            <Button onClick={() => handleConfirm()} >
              {t("ap_confirm")}
            </Button>
            <Button onClick={() => handleClose()} >
              {t("as_cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsOla;
