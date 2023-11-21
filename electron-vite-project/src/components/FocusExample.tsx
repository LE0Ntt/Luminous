import React, { useState, useRef } from 'react';

const FocusExample: React.FC = () => {
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGlowAndFocus = () => {
    // Apply the box-shadow to simulate a glow
    setGlowStyle({
      boxShadow: '0 0 30px 10px rgba(74, 77, 165, 0.80)', // Or any color you like
      transition: 'box-shadow 0.5s ease-in-out',
    });

    // Set focus to the input element
    inputRef.current?.focus();

    // Remove the box-shadow after a short delay to make it blink
    setTimeout(() => setGlowStyle({}), 500);
  };

  return (
    <div>
      <button onClick={handleGlowAndFocus}>Click to Focus & Glow</button>
      <input
        ref={inputRef}
        type='text'
        style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ccc',
          boxShadow: 'none',
          outline: 'none',
          ...glowStyle, // Apply the dynamic glow style
        }}
      />
    </div>
  );
};

export default FocusExample;
