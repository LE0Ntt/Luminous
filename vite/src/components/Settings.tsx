import { useState, useContext } from "react";
import "./Settings.css";
import Button from "./Button";
import "../index.css";
import Toggle from "./Toggle";
import { TranslationContext } from "./TranslationContext";
import { useConnectionContext } from './ConnectionContext';

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSavePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage("The new passwords do not match.");
      setSuccessMessage("");
      return;
    }

    fetch(url +"/changePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
        setErrorMessage("");
      })
      .catch((error) => {
        setErrorMessage("Error occurred while changing the password.");
        setSuccessMessage("");
        console.error(error);
      });
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  return (
    <div>
      <div className="SettingsOverlay" onClick={handleClose} />
      <div className="SettingsContainer">
        <Button onClick={handleClose} className="buttonClose">
          <div className="removeIcon centerIcon"></div>
        </Button>
        <div className="SettingsTitle">{t("set_title")}</div>
        <div className="SettingsContent innerWindow">
          {errorMessage && <div className="ErrorMessage">{errorMessage}</div>}
          {successMessage && (
            <div className="SuccessMessage">{successMessage}</div>
          )}
          <div className="SettingsOption">
            {t("set_admin")}
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
            <button onClick={handleSavePassword}>Save New Password</button>
          </div>
          <div className="SettingsOption">
            <hr />
            {t("set_language")}
          </div>
          <div className="SettingsOption">
            <hr />
            OLA
          </div>
          <div className="SettingsOption">
            <hr />
            {t("set_view")}
          </div>
          <div className="SettingsOption">
            <hr />
            {t("set_overview")}
          </div>
          <div className="SettingsOption"></div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
