/**
 * Control.tsx
 * @author Leon Hölzel
 */
import React, { useState, useEffect } from "react";

function Control() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if(isDark)
      document.body.className = 'dark';
    else
      document.body.className = '';
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div>
      <h1>Hier ist test text</h1>
      <h1>Hier ist test text</h1>
      <h1>Hier ist test text</h1>
      <h1>Hier ist test text</h1>
      <h1>Hier ist test text</h1>
      <h1 >Hier ist test text!a</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

export default Control