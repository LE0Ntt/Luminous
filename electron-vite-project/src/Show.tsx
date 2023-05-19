/**
 * Show.tsx
 * @author Leon Hölzel
 */
import React from "react";
import { useConnectionContext } from "./ConnectionContext";


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
      <p>Connected: {connected ? "Yes" : "No"}</p>
      <p>Connected: {connected ? "Yes" : "No"}</p>
      <p>Connected: {connected ? "Yes" : "No"}</p>
      <p>Connected: {connected ? "Yes" : "No"}</p>
      <p>Connected: {connected ? "Yes" : "No"}</p>
      <p>Connected: {connected ? "Yes" : "No"}</p>
      <p>Connected: {connected ? "Yes" : "No"}</p>
      <button onClick={handleButtonClick}>Send Event</button>
    </div>
  );
};

export default Show;