import { useState, useContext } from "react";
import "./Settings.css";
import Button from "./Button";
import "../index.css";
import "./LightSettings.css";
import Toggle from "./Toggle";
import { TranslationContext } from "./TranslationContext";
import { useConnectionContext } from "./ConnectionContext";

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
  const { t, language, setLanguage } = useContext(TranslationContext);
  const { url } = useConnectionContext();

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "en" | "de");
  };

  const handleSavePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage("The new passwords do not match.");
      setSuccessMessage("");
      return;
    }

    fetch(url + "/changePassword", {
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
        setErrorMessage("An Error occurred while changing the password.");
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

        <div className="SettingsTitle">
          <span>{t("set_title")}</span>
        </div>

        <div className="SettingsContent innerWindow">
          <div className="SettingsOption">
            <div className="LightSettingsSubTitle">
              <span>{t("set_admin")}</span>
            </div>
            {errorMessage && <div className="ErrorMessage">{errorMessage}</div>}
            {successMessage && (
              <div className="SuccessMessage">{successMessage}</div>
            )}
            <div className="SettingsTextBoxContainer">
              <div>
                <label>Current Password</label> <br />
                <input
                  className="SettingsTextBox"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label>New Password</label> <br />
                <input
                  className="SettingsTextBox"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label>Confirm Password</label> <br />
                <input
                  className="SettingsTextBox"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
              </div>
              <br />
              <button
                className="SettingsSavePWButton controlButton"
                onClick={handleSavePassword}
              >
                Save
              </button>
            </div>
            
          </div>
          
          <div className="SettingsOption">
          <hr />
            <div className="LightSettingsSubTitle">
              <span>{t("set_language")}</span>
            </div>
            <div>
              <select
              className="SettingsLanguageSelection"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="en">{t("English 🇬🇧")}</option>
              <option value="de">{t("German 🇩🇪")}</option>
            </select>
            </div>
            
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
