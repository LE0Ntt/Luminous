import { useState, useContext, useEffect } from 'react';
import './LightSettings.css';
import Button from './Button';
import '../index.css';
import Toggle from './Toggle';
import { TranslationContext } from './TranslationContext'
import DeviceList from './DeviceList';
import { useConnectionContext } from './ConnectionContext';

interface SettingsProps {
  onClose: () => void;
}

function LightSettings({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>();
  const [unselectedDevices, setUnselectedDevices] = useState<DeviceConfig[]>([]);


  interface DeviceConfig {
    id: number;
    deviceValue: number;
    name: string;
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  useEffect(() => {
    const fetchDevices = async () => {
      try { 
        const response = await fetch(url + '/fader');
        const data = await response.json();
        const parsedData = JSON.parse(data);
        parsedData.shift(); // remove master
        setDevices(parsedData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDevices();
  }, []);

  const handleSelectDevice = (device: DeviceConfig) => {
    setSelectedDevice(device);
    setUnselectedDevices(unselectedDevices.filter(item => item.id !== device.id));
  };

  const handleDeselectDevice = (device: DeviceConfig) => {
    setSelectedDevice(undefined);
    setUnselectedDevices([...unselectedDevices, device]);
  };

  const handleCreateDevice = () => {
    
  };

  const handleRemoveDevice = () => {
    
  };

  return (
    <div>
      <div className="LightSettingsOverlay" onClick={handleClose} /> Overlay to close the modal when clicked outside
        <div className="LightSettingsContainer">
          <Button
            onClick={() => handleClose()}
            className="buttonClose"
          > 
          <div className='removeIcon centerIcon'></div>
          </Button>
          <div className='LightSettingsTitle'>
            <span>{t("ls_title")}</span>
          </div>
          <div className='LightSettingsListContainer'>
            <div className='LightSettingsSelected innerWindow'>
              {selectedDevice === undefined ? (
                <>
                  <span className='LightSettingsAddDevice'>{t("ls_addDevice")}</span>
                  <Button
                      onClick={() => handleCreateDevice()}
                      className="LightSettingsSelectedButton addremoveButton"
                    >
                      <div className={"centerIcon addIcon"}></div>
                  </Button>
                </>
                ):(
                  <div className='LightSettingsSelectedDevice'>
                    <DeviceList devices={[selectedDevice]} isAddButton={false} onDeviceButtonClick={handleDeselectDevice} />
                  </div>
                )
              }
            </div>
            <div className='LightSettingsList innerWindow'>
              <DeviceList devices={devices} isAddButton={true} onDeviceButtonClick={handleSelectDevice} />
            </div>  
          </div>
          <div className='LightSettingsWindow innerWindow'>
            <div className='LightSettingsWindowUpper'>
              Test Upper
            </div>
            <hr />
            <div className='LightSettingsWindowMid'>
              Test Mid
            </div>
            <div className='LightSettingsWindowLower'>
              <Button 
                onClick={() => handleRemoveDevice()} 
                className="LightSettingsDeleteButton controlButton"
              >
                {t("ls_deleteDevice")}
              </Button>
              <Button 
                onClick={() => handleCreateDevice()} 
                className="LightSettingsSaveButton controlButton"
              >
                {t("ls_saveDevice")}
              </Button>
            </div>
          </div>
      </div>
    </div>
  
);
}
export default LightSettings;
