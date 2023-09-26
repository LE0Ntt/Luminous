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
 * @file Help.tsx
 */
import { useState, useContext } from "react";
import "./Settings.css";
import Button from "./Button";
import "../index.css";
import { TranslationContext } from "./TranslationContext";
import { useConnectionContext } from "./ConnectionContext";

interface SettingsProps {
  onClose: () => void;
}

function Help({ onClose }: SettingsProps) {
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

  return (
    <div>
      <div className="LightSettingsOverlay" onClick={handleClose} /> Overlay to
      close the modal when clicked outside
      <div className="LightSettingsContainer">
        <Button onClick={() => handleClose()} className="buttonClose">
          <div className="removeIcon centerIcon"></div>
        </Button>
        <div className="SettingsTitle">
          <span>{t("help")}</span>
        </div>
        <div className="SettingsContent innerWindow">
          <div className="SettingsOption ">
          <span>{t("help_text")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
