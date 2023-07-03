import React from "react";
import './DeviceList.css';
import Button from "./Button";

type DeviceConfig = {
  id: number;
  deviceValue: number;
  name: string;
  attributes: any;
  device_type: string;
  universe: string;
};

type DeviceListProps = {
  devices: DeviceConfig[];
  onDeviceButtonClick: (device: DeviceConfig) => void;
  isAddButton: boolean;
};

const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onDeviceButtonClick,
  isAddButton,
}) => {
  // No scrollbar for selected list until devices exceed max height
  var deviceListClass = "deviceList";
  if(isAddButton) {
    deviceListClass = "deviceList overflow-scroll";
  } else {
    deviceListClass = devices.length > 6 ? "deviceList overflow-scroll" : "deviceList overflow-hidden right-padding";
  }

  // Sort list by ID
  const sortedDevices = [...devices].sort((a, b) => a.id - b.id);

  return (
    <div className={deviceListClass}>
      <ul>
        {sortedDevices.map((device, index) => (
          <React.Fragment key={device.id}>
            <li style={{ /* Make the first and last element smaller but still arrange the content correctly */
            height: index === 0 || index === devices.length - 1 ? '50px' : '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: index === 0 && devices.length > 1 ? '10px' : '0',
            marginTop: index === devices.length - 1 && devices.length > 1 ? '10px' : '0'
            }}>
              <div className="circle"></div>
              <div className="nameNumberBox">
                <span className="number">{device.id}</span>
                <span title={device.name} className="name">{device.name}</span>
              </div>
              <Button
                onClick={() => onDeviceButtonClick(device)}
                className="addremoveButton"
              >
                <div className={`centerIcon ${isAddButton ? 'addIcon' : 'removeIcon'}`}></div>
              </Button>
            </li>
            {index !== devices.length - 1 && <hr />} {/* Separator line for all elements except the last */}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;