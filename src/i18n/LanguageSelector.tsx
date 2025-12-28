import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { Language } from './translations';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      {/* Language Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="text-sm font-medium text-slate-200">{currentLang.name}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors ${
                  language === lang.code ? 'bg-slate-700' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium text-slate-200">{lang.name}</span>
                {language === lang.code && (
                  <svg className="w-4 h-4 text-emerald-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
