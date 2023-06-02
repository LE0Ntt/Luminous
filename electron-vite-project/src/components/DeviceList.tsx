import React from "react";
import './DeviceList.css';

type DeviceConfig = {
  id: number;
  deviceValue: number;
  name: string;
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
  // No scrollbar for selected list
  var deviceListClass = "deviceList";
  if(isAddButton) {
    deviceListClass = "deviceList overflow-scroll";
  } else {
    deviceListClass = devices.length > 6 ? "deviceList overflow-scroll" : "deviceList overflow-hidden right-padding";
  }

  return (
    <div className={deviceListClass}>
      <ul>
        {devices.map((device, index) => (
          <React.Fragment key={device.id}>
            <li style={{ /* Make the first and last element smaller but still arrange the content correctly */
            height: index === 0 || index === devices.length - 1 ? '50px' : '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: index === 0 || index === devices.length - 1 ? 'flex-start' : 'center',
            marginBottom: index === 0 && devices.length > 1 ? '10px' : '0',
            marginTop: index === devices.length - 1 && devices.length > 1 ? '10px' : '0',
            }}>
              <div className="circle"></div>
              <span>{device.name}</span>
              <button style={{ marginLeft: 'auto' }} onClick={() => onDeviceButtonClick(device)}>
                <span>{isAddButton ? "+" : "-"}</span>
              </button>
            </li>
            {index !== devices.length - 1 && <hr />} {/* Separator line for all elements except the last */}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;