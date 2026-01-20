"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const LanguageSelector = () => {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { language, setLanguage } = useLanguage();

    const displayLang = language === 'en' ? 'EN-English' : 'BN-Bangla';

    return (
        <div
            onClick={() => setIsLangOpen(!isLangOpen)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px', color: '#163561', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
        >
            <img src="https://static.922proxy.com/img/langu_earth.png" alt="Globe" style={{ width: '18px', height: '18px' }} />
            <span style={{ minWidth: '80px', textAlign: 'center' }}>{displayLang}</span>
            <img src="https://static.922proxy.com/img/index_new/select_down.png" alt="Down" style={{ width: '10px', height: '6px', marginLeft: '2px', transform: isLangOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />

            {isLangOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: '120px',
                    overflow: 'hidden'
                }}>
                    <div
                        onClick={(e) => { e.stopPropagation(); setLanguage('en'); setIsLangOpen(false); }}
                        style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: language === 'en' ? '#F8FBFF' : 'white', color: language === 'en' ? '#0086FF' : '#333', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FBFF'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = language === 'en' ? '#F8FBFF' : 'white'}
                    >
                        EN-English
                    </div>
                    <div
                        onClick={(e) => { e.stopPropagation(); setLanguage('bn'); setIsLangOpen(false); }}
                        style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: language === 'bn' ? '#F8FBFF' : 'white', color: language === 'bn' ? '#0086FF' : '#333', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FBFF'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = language === 'bn' ? '#F8FBFF' : 'white'}
                    >
                        BN-Bangla
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
