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
  const { t } = useContext(TranslationContext);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  return (
    <div>
      <div className="SettingsOverlay" onClick={handleClose} /> Overlay to close
      the modal when clicked outside
      <div className="SettingsContainer">
        <Button onClick={() => handleClose()} className="buttonClose">
          <div className="removeIcon centerIcon"></div>
        </Button>
        <div className="SettingsTitle">
          {t("set_title")}
        </div>
        <div className="SettingsContent innerWindow">
         <div className="SettingsOption"> {t("set_admin")}</div>
         <div className="SettingsOption"> {t("set_language")}</div>
         <div className="SettingsOption"> OLA </div>
         <div className="SettingsOption"> {t("set_view")}</div>
         <div className="SettingsOption"> {t("set_overview")}</div>
         <div className="SettingsOption"> update </div>
    
         
        </div>
      </div>
    </div>
  );
}
export default Settings;
