/**
 * Scenes.tsx
 * @author Leon Hölzel
 */
import React, { useContext } from 'react'
import './App.css'
import { TranslationContext } from "./components/TranslationContext";

function Scenes() {
  const { t } = useContext(TranslationContext);

  return (
    <div>
      <div className='window absolute w-[200px] h-[910px] left-[40px] top-[130px]'>
        <h1>{t("greeting")}</h1>
      </div>
      <div className='window absolute w-[1620px] h-[910px] left-[260px] top-[130px]'></div>
    </div>
  );
}

export default Scenes;