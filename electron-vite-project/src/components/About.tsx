import { useState, useContext, useEffect } from "react";
import "./Settings.css";
import Button from "./Button";
import "../index.css";
import Toggle from "./Toggle";
import { TranslationContext } from "./TranslationContext";
import DeviceList from "./DeviceList";
import { useConnectionContext } from "./ConnectionContext";
import packageJson from "../../package.json";

interface SettingsProps {
  onClose: () => void;
}

function About({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const version: string = packageJson.version;

  return (
    <div>
      <div className="LightSettingsOverlay" onClick={handleClose} /> Overlay to
      close the modal when clicked outside
      <div className="LightSettingsContainer">
        <Button onClick={() => handleClose()} className="buttonClose">
          <div className="removeIcon centerIcon"></div>
        </Button>
        <div className="SettingsTitle">
          <span>{t("dd_about")}</span>
        </div>
        <div className="AboutContainer">
          <div className="AboutTextBoxContainer">
            <div className="logoBig"></div>
            <small><i>Multi-client DMX light control app with MIDI support</i></small><br /><br />
            <span>Version {version}</span><br />
            <span>Leon Hölzel, Darwin Pietas, Marvin Plate, Andree Tomek</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
