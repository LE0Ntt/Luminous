import React from "react";
import './DeviceList.css';

type SliderConfig = {
  id: number;
  sliderValue: number;
  name: string;
};

type DeviceListProps = {
  sliders: SliderConfig[];
  onDeviceButtonClick: (slider: SliderConfig) => void;
  isAddButton: boolean;
};

const DeviceList: React.FC<DeviceListProps> = ({
  sliders,
  onDeviceButtonClick,
  isAddButton,
}) => {
  // No scrollbar for selected list
  var deviceListClass = "deviceList";
  if(isAddButton) {
    deviceListClass = "deviceList overflow-scroll";
  } else {
    deviceListClass = sliders.length > 6 ? "deviceList overflow-scroll" : "deviceList overflow-hidden right-padding";
  }

  return (
    <div className={deviceListClass}>
      <ul>
        {sliders.map((slider, index) => (
          <React.Fragment key={slider.id}>
            <li style={{ /* Make the first and last element smaller but still arrange the content correctly */
            height: index === 0 || index === sliders.length - 1 ? '50px' : '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: index === 0 || index === sliders.length - 1 ? 'flex-start' : 'center',
            marginBottom: index === 0 && sliders.length > 1 ? '10px' : '0',
            marginTop: index === sliders.length - 1 && sliders.length > 1 ? '10px' : '0',
            }}>
              <div className="circle"></div>
              <span>{slider.name}</span>
              <button style={{ marginLeft: 'auto' }} onClick={() => onDeviceButtonClick(slider)}>
                <span>{isAddButton ? "+" : "-"}</span>
              </button>
            </li>
            {index !== sliders.length - 1 && <hr />} {/* Separator line for all elements except the last */}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;