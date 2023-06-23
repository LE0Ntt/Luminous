import { useState, useContext } from "react";
import "./Settings.css";
import Button from "./Button";
import "../index.css";
import Toggle from "./Toggle";
import { TranslationContext } from "./TranslationContext";

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useContext(TranslationContext);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Die neuen Passwörter stimmen nicht überein.");
      setSuccessMessage("");
      return;
    }

    fetch("/checkPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Success") {
          fetch("/changePassword", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          })
            .then((response) => response.json())
            .then((data) => {
              setSuccessMessage(data.message);
              setErrorMessage("");
            })
            .catch((error) => {
              setErrorMessage("Fehler beim Ändern des Passworts.");
              setSuccessMessage("");
              console.error(error);
            });
        } else {
          setErrorMessage("Das eingegebene aktuelle Passwort ist falsch.");
          setSuccessMessage("");
        }
      })
      .catch((error) => {
        setErrorMessage("Fehler beim Überprüfen des Passworts.");
        setSuccessMessage("");
        console.error(error);
      });
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  return (
    <div>
      <div className="SettingsOverlay" onClick={handleClose} /> Overlay to close
      the modal when clicked outside
      <div className="SettingsContainer">
        <Button onClick={handleClose} className="buttonClose">
          <div className="removeIcon centerIcon"></div>
        </Button>
        <div className="SettingsTitle">{t("set_title")}</div>
        <div className="SettingsContent innerWindow">
          {errorMessage && (
            <div className="ErrorMessage">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="SuccessMessage">{successMessage}</div>
          )}
          <div className="SettingsOption">
            {t("set_admin")}
            <input
              type="password"
              placeholder="Aktuelles Passwort"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Neues Passwort"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Passwort bestätigen"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleSavePassword}>
              Neues Passwort speichern
            </button>
          </div>
          <div className="SettingsOption">
            <hr />
            {t("set_language")}
          </div>
          <div className="SettingsOption">OLA</div>
          <div className="SettingsOption">{t("set_view")}</div>
          <div className="SettingsOption">{t("set_overview")}</div>
          <div className="SettingsOption">
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
