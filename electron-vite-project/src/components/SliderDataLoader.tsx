import React, { useState, useEffect } from 'react';
import { useConnectionContext } from './ConnectionContext';

interface SliderConfig {
  attributes: any;
  universe: string;
  id: number;
  sliderValue: number;
  name: string;
}

interface SliderDataLoaderProps {
  children: (sliders: SliderConfig[], error: Error | null) => JSX.Element;
}

const SliderDataLoader: React.FC<SliderDataLoaderProps> = ({ children }) => {
  const [sliders, setSliders] = useState<SliderConfig[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { url } = useConnectionContext();

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch(url + '/fader');
        const data = await response.json();
        setSliders(JSON.parse(data));
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error('Ein unbekannter Fehler ist aufgetreten'));
        }
        console.log(error);
      }
    };

    fetchSliders();
  }, [url]);

  return children(sliders, error);
};

export default SliderDataLoader;
