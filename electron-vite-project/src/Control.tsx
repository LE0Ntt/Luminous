import React, { useContext } from "react";
import { TranslationContext } from "./TranslationContext";

function Control() {
  const { t, language, setLanguage } = useContext(TranslationContext);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "en" | "de");
  };
  
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "de" : "en");
  };

  return (
    <div>
      <h1>{t("testText")}</h1>
      <h1>{t("testText")}</h1>
      <h1>{t("testText")}</h1>
      <h1>{t("testText")}</h1>
      <h1>{t("testText")}</h1>
      <h1>{t("greeting")}</h1>
      <button onClick={toggleLanguage}>{t("buttonLabel")}</button>
      <select value={language} onChange={handleLanguageChange}>
        <option value="en">{t("english")}</option>
        <option value="de">{t("german")}</option>
      </select>
    </div>
  );
}


export default Control;