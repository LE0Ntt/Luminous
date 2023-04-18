/*
import React, { useRef, useState, useEffect } from 'react';

interface CIExyColor {
  x: number;
  y: number;
}

interface CIEColorPickerProps {
  onColorSelected?: (color: CIExyColor) => void;
}

const CIEColorPicker: React.FC<CIEColorPickerProps> = ({ onColorSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [color, setColor] = useState<CIExyColor>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const drawColorPicker = () => {
      const imageData = ctx!.createImageData(width, height);
      const data = imageData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const xy = {
            x: x / width,
            y: y / height,
          };

          // Convert CIE xy to RGB
          const Y = 1.0;
          const X = (Y / xy.y) * xy.x;
          const Z = (Y / xy.y) * (1 - xy.x - xy.y);

          const r = X * 3.2406 - Y * 1.5372 - Z * 0.4986;
          const g = -X * 0.9689 + Y * 1.8758 + Z * 0.0415;
          const b = X * 0.0557 - Y * 0.2040 + Z * 1.0570;

          data[index] = r * 255;
          data[index + 1] = g * 255;
          data[index + 2] = b * 255;
          data[index + 3] = 255;
        }
      }

      ctx!.putImageData(imageData, 0, 0);
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
    const newX = x / canvas.width;
    const newY = y / canvas.height;

    setColor({ x: newX, y: newY });

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
      </div>
      );
    };
    
export default CIEColorPicker;
*/

import React, { useRef, useState, useEffect } from 'react';
import { rgbToXyY, xyYToRgb } from './components/colorUtils';

interface CIExyColor {
  x: number;
  y: number;
  Y: number;
}

const CIEColorPicker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectedColor, setSelectedColor] = useState<CIExyColor>({ x: 0.5, y: 0.5, Y: 1.0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const { x: cx, y: cy, Y } = rgbToXyY(x, y, 255);
        const rgb = xyYToRgb(cx, cy, selectedColor.Y);

        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [selectedColor]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    handleMouseMove(e);
    console.debug("testing....")
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { x: cx, y: cy, Y } = rgbToXyY(x, y, 255);

      setSelectedColor({ x: cx, y: cy, Y });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={256}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    />
  );
};

export default CIEColorPicker;
