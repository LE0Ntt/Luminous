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
 * @file DropDown.tsx
 */
import './DropDown.css';

export interface DropDownItem {
  text: string;
  icon: React.ElementType;
  onSelect: () => void;
}

type DropDownProps = {
  settings: DropDownItem[];
  settingSelection: (selectedSetting: DropDownItem) => void;
  open: boolean;
};

const DropDown: React.FC<DropDownProps> = ({ settings, settingSelection, open }) => {
  return (
    <div
      className={`dropdown ${open ? '' : 'closed'}`}
      role='menu'
    >
      {settings.map((setting) => (
        <button
          role='menuitem'
          key={setting.text}
          onClick={() => settingSelection(setting)}
        >
          <setting.icon />
          <span>{setting.text}</span>
        </button>
      ))}
    </div>
  );
};

export default DropDown;
