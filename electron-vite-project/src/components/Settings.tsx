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
 * @file Settings.tsx
 */
import { useState, useContext, useEffect, useCallback } from "react";
import "./Settings.css";
import Button from "./Button";
import "../index.css";
import "./LightSettings.css";
import { TranslationContext } from "./TranslationContext";
import { useConnectionContext } from "./ConnectionContext";
import AdminPassword from "./AdminPassword";

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
  const { url, /* changeUrl */ } = useConnectionContext();
  const [isOlaWindowOpen, setIsOlaWindowOpen] = useState(false);
  const newUrl = url.toString().slice(0, -5) + ":9090";

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "en" | "de");
  };

  const handleSavePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage(t("set_error_match"));
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
        setErrorMessage(t("set_error_change"));
        setSuccessMessage("");
        console.error(error);
      }); 
  };

  const handleOpenOlaWindow = () => {
    setIsOlaWindowOpen(true);
  };

  const handleCloseOlaWindow = () => {
    setIsOlaWindowOpen(false);
  };

  const handleAdminPasswordConfirm = useCallback((isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
    if (isConfirmed) {
      window.electronAPI.openExternal(newUrl);
      handleClose();
    }
  }, []);

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const [selectedSetting, setSelectedSetting] = useState<string | null>('Setting1');

  const [ip, setIP] = useState<string>("");
  const [port, setPort] = useState<string>("5000");

  const handleOctetChange = (index: number, value: string) => {
    const octets = ip.split('.');
    octets[index - 1] = value;
    setIP(octets.join('.'));
  };

  useEffect(() => {
    console.log("fetching ip");
    console.log(ip);
    const fullUrl = `${ip}:${port}`;
/*     changeUrl(fullUrl); */
  }, [ip]);
  
  const octets = ip.split('.');

  const handlePortChange = (value: string) => {
    setPort(value);
  };

  return (
    <div>
      <div className="backgroundOverlay" onClick={handleClose} />
      {isOlaWindowOpen ? 
        <AdminPassword onConfirm={handleAdminPasswordConfirm} onClose={handleCloseOlaWindow} />
      :
        <>
          <div className="SettingsContainer">
            <Button onClick={handleClose} className="buttonClose">
              <div className="removeIcon centerIcon"></div>
            </Button>
            <div className="SettingsTitle">
              <span>{t("set_title")}</span>
            </div>
            <div className="SettingsContent">
              <div className="settings">
                <Button 
                  className={selectedSetting === 'Setting1' ? 'active' : ''} 
                  onClick={() => setSelectedSetting('Setting1')}
                >
                  <span>{t("set_admin")}</span>
                </Button>
                <Button 
                  className={selectedSetting === 'Setting2' ? 'active' : ''} 
                  onClick={() => setSelectedSetting('Setting2')}
                >
                  <span>{t("set_language")}</span>
                </Button>
                <Button
                  className={selectedSetting === 'Setting3' ? 'active' : ''}
                  onClick={() => setSelectedSetting('Setting3')}
                >
                  OLA
                </Button>
                {/* Füge hier weitere Settings hinzu */}
              </div>
              <div className="setting-content innerWindow">
                {selectedSetting === 'Setting1' ? (
                  <div className="SettingsOption">
                    <div className="LightSettingsSubTitle">
                      <span>{t("set_admin")}</span>
                    </div>
                    <div className="SettingContainer h-[130px]"> {/* Tailwind use */}
                      <div className="Heading">
                        <span>{t("change_password")}</span>
                      </div>
                      <div className="SettingsTextBoxContainer">
                        <div>
                          <label>{t("set_current_pw")}</label> <br />
                          <input
                            className="SettingsTextBox"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <label>{t("set_new_pw")}</label> <br />
                          <input
                            className="SettingsTextBox"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <label>{t("set_conew_pw")}</label> <br />
                          <input
                            className="SettingsTextBox"
                            type="password"
                            value={newPasswordConfirm}
                            onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          />
                        </div>
                        <br />
                        <Button
                          className="SettingsSavePWButton controlButton"
                          onClick={handleSavePassword}
                        >
                          {t("as_save")}
                        </Button>
                      </div>
                      {errorMessage && <div className="ErrorMessage">{errorMessage}</div>}
                      {successMessage && <div className="SuccessMessage">{successMessage}</div>}
                    </div>
                    <div className="SettingContainer">
                      <div className="Heading">
                        <span>URL</span>
                      </div>
                      <div className="SettingsTextBoxContainer">
                        <div className="text">
                            {t("change_url_of_server")}<br />
                        </div>
                        <div>
                          <label>{t("set_current_ip")}</label> <br />
                          <input
                            className="SettingsIPBox"
                            maxLength={3}
                            value={octets[0]}
                            onChange={(e) => handleOctetChange(1, e.target.value)}
                          />
                          .
                          <input
                            className="SettingsIPBox"
                            maxLength={3}
                            value={octets[1]}
                            onChange={(e) => handleOctetChange(2, e.target.value)}
                          />
                          .
                          <input
                            className="SettingsIPBox"
                            maxLength={3}
                            value={octets[2]}
                            onChange={(e) => handleOctetChange(3, e.target.value)}
                          />
                          .
                          <input
                            className="SettingsIPBox"
                            maxLength={3}
                            value={octets[3]}
                            onChange={(e) => handleOctetChange(4, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedSetting === 'Setting2' ? (
                  <div className="SettingsOption">
                    <div className="LightSettingsSubTitle">
                      <span>{t("set_language")}</span>
                    </div>
                    <div className="SettingsTextBoxContainer SettingsLanguageContainer">
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
                ) : selectedSetting === 'Setting3' ? (
                  <div className="SettingsOption">
                    <div className="LightSettingsSubTitle">
                      <span>OLA</span>
                    </div>
                    <button className="SettingsButton controlButton" onClick={handleOpenOlaWindow}>
                      {t("set_ola")}
                    </button>
                  </div> 
                ) : null}
              </div>
            </div>
          </div>
        </>
      }
    </div>
  );
}

export default Settings;
