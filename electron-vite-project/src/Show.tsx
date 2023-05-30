/**
 * Show.tsx
 * @author Leon Hölzel
 */
import React from "react";
import { useConnectionContext } from "./components/ConnectionContext";
import "./Show.css";
import "./App.css";
import "./Color.css";
import Fader from "./components/Fader";


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
      <div className="window showScenes"></div>
      <div className="window showSaves"></div>
      <div className="window showControls">
        <div className="showControlButtons"></div>
        <div className="showControlTimeline"></div>
        <div className="showControlMaster">
          <div className="showMasterAlign">
          <Fader
            height={290}
            sliderValue={255}
            id={0}
            name='Master'
          /> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Show;