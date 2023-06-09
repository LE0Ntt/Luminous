/**
 * Show.tsx
 * @author Leon Hölzel
 */
import { useConnectionContext } from "./components/ConnectionContext";
import "./Show.css";
import "./Color.css";
import Fader from "./components/Fader";
import ScenesComponent from "./components/ScenesComponent";


function Show() {
  const { connected, emit, on } = useConnectionContext();

  const handleButtonClick = () => {
    emit("myEvent", { message: "Hello, server!" });
  };

  on("serverEvent", (data) => {
    console.log("Received data from server:", data);
  });

  return (
    <div>
      <div className="window showScenes">
        <ScenesComponent sideId={2} />
      </div>
      <div className="window showSaves"></div>
      <div className="window showControls">
        <div className="showControlButtons innerWindow"></div>
        <div className="showControlTimeline innerWindow"></div>
        <div className="showControlMaster innerWindow">
          <div className="showMasterAlign">
          <Fader
            height={290}
            sliderValue={255}
            id={0}
            name='Value'
          /> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Show;