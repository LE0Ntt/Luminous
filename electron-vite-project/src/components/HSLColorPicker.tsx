import React, { useRef, useState, useEffect } from 'react';

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface HSLColorPickerProps {
  onColorSelected?: (color: HSLColor) => void;
}

const HSLColorPicker: React.FC<HSLColorPickerProps> = ({ onColorSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [color, setColor] = useState<HSLColor>({ h: 0, s: 0, l: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const drawColorPicker = () => {
      const saturationGradient = ctx!.createLinearGradient(0, 0, width, 0);
      saturationGradient.addColorStop(0, 'white');
      saturationGradient.addColorStop(1, 'hsl(0, 100%, 50%)');
      ctx!.fillStyle = saturationGradient;
      ctx!.fillRect(0, 0, width, height);

      const lightnessGradient = ctx!.createLinearGradient(0, 0, 0, height);
      lightnessGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      lightnessGradient.addColorStop(1, 'black');
      ctx!.fillStyle = lightnessGradient;
      ctx!.fillRect(0, 0, width, height);
    };

    drawColorPicker();
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    updateColor(e);
  };

  const onMouseUp = () => {
    setIsMouseDown(false);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown) {
      updateColor(e);
    }
  };

  const updateColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const saturation = (x / canvas.width) * 100;
    const lightness = 100 - (y / canvas.height) * 100;

    setColor({ h: color.h, s: saturation, l: lightness });

    if (onColorSelected) {
      onColorSelected(color);
    }
  };

  const onHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = Number(e.target.value);
    setColor({ ...color, h: newHue });

    if (onColorSelected) {
      onColorSelected(color);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="300"
        height="300"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
      ></canvas>
      <input
        type="range"
        min="0"
        max="360"
        value={color.h}
        onChange={onHueChange}
      />
    </div>
  );
};

export default HSLColorPicker;
