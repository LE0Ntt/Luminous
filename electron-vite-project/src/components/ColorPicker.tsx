import React, { useEffect, useRef } from 'react';

type ColorPickerProps = {
  pickerType: 'boxAndHue' | 'sliders' | 'kelvin' | 'wheel' | 'circleSlider'; // hier definieren Sie die erlaubten Werte für pickerType
};

const ColorPicker: React.FC<ColorPickerProps> = ({ pickerType }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const iro = (window as any).iro;

    if (iro && pickerRef.current) {
      let layout;

      switch (pickerType) {
        case 'kelvin':
          layout = [
            { component: iro.ui.Slider, options: { sliderType: 'kelvin' } }
          ]
          break;

        case 'wheel':
          layout = [{ component: iro.ui.Wheel, options: {} }]
          break;

        // ... Weitere Fälle hinzufügen ...
        
        default:
          layout = [{ component: iro.ui.Wheel, options: {} }];
      }

      const colorPicker = new iro.ColorPicker(pickerRef.current, {
        width: 320,
        color: "#f00",
        layout
      });

      // Event-Listener hinzufügen, um auf Farbänderungen zu reagieren
      colorPicker.on('color:change', (color: any) => {
        console.log(`RGB: ${color.rgbString}`); // RGB-Werte in der Konsole ausgeben
        // Hier können Sie mit den RGB-Werten arbeiten, z.B. in den State speichern
      });
    }
  }, [pickerType]);

  return <div ref={pickerRef}></div>;
};

export default ColorPicker;
