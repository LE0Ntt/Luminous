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
 * @file DeviceList.tsx
 */
import React from 'react';
import './DeviceList.css';
import Button from './Button';

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

const DeviceList: React.FC<DeviceListProps> = ({ devices, onDeviceButtonClick, isAddButton }) => {
  // No scrollbar for selected list until devices exceed max height
  var deviceListClass = 'deviceList';
  if (isAddButton) {
    deviceListClass = 'deviceList overflow-scroll';
  } else {
    deviceListClass = devices.length > 6 ? 'deviceList overflow-scroll' : 'deviceList overflow-hidden right-padding';
  }

  // Get the class for the device type icon
  function getClassByDeviceType(deviceType: string) {
    switch (deviceType) {
      case 'RGBDim':
        return 'rgbIcon';
      case 'BiColor':
        return 'biIcon';
      case 'Spot':
        return 'spotIcon';
      case 'Fill':
        return 'fillIcon';
      case 'HMI':
        return 'spotIcon';
      case 'Misc':
        return 'miscIcon';
      default:
        return '';
    }
  }

  // Sort list by ID
  const sortedDevices = [...devices].sort((a, b) => a.id - b.id);

  return (
    <div className={deviceListClass}>
      <ul>
        {sortedDevices.map((device, index) => (
          <React.Fragment key={device.id}>
            <li
              style={{
                /* Make the first and last element smaller but still arrange the content correctly */
                height: index === 0 || index === devices.length - 1 ? '50px' : '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: index === 0 && devices.length > 1 ? '10px' : '0',
                marginTop: index === devices.length - 1 && devices.length > 1 ? '10px' : '0',
              }}
            >
              <div className={`circle ${getClassByDeviceType(device.device_type)}`}></div>
              <div className='nameNumberBox'>
                <span className='number'>{device.id}</span>
                <span
                  title={device.name}
                  className='name'
                >
                  {device.name}
                </span>
              </div>
              <Button
                onClick={() => onDeviceButtonClick(device)}
                className='addremoveButton'
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
