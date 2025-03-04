import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.json";
import esTranslation from "./locales/es/translation.json";
import hiTranslation from "./locales/hi/translation.json";
import guTranslation from "./locales/gu/translation.json";
import mlTranslation from "./locales/ml/translation.json";
import knTranslation from "./locales/kn/translation.json";
import taTranslation from "./locales/ta/translation.json";
import teTranslation from "./locales/te/translation.json";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enTranslation },
        es: { translation: esTranslation },
        hi: { translation: hiTranslation },
        gu: { translation: guTranslation },
        ml: { translation: mlTranslation },
        kn: { translation: knTranslation },
        ta: { translation: taTranslation },
        te: { translation: teTranslation },
    },
    lng: navigator.language || navigator.userLanguage,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
