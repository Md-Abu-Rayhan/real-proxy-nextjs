"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const PromoBanner = () => {

    const router = useRouter();
    const { t } = useLanguage();

    return (
        <div className="promo-banner" style={{
            background: 'linear-gradient(90deg, #981A00 0%, #FF4D4D 100%)',
            color: 'white',
            padding: '10px 0',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 1001,
            position: 'relative'
        }}>
            <div className="container promo-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span className="promo-text">{t.promo.discount}</span>
                <button
                    onClick={() => {
                        const token = localStorage.getItem('auth_token');
                        if (token) {
                            router.push('/dashboard/traffic-setup');
                        } else {
                            router.push('/register');
                        }
                    }}
                    className="promo-btn"
                    style={{
                        backgroundColor: 'white',
                        color: '#981A00',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontWeight: '700',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {t.promo.buyNow}
                </button>
                <div className="promo-timer" style={{ display: 'flex', gap: '5px', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <span>{t.promo.ends}</span>
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0 4px', borderRadius: '2px' }}>02</span>:
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0 4px', borderRadius: '2px' }}>14</span>:
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0 4px', borderRadius: '2px' }}>55</span>
                </div>
            </div>
            <style jsx>{`
                .promo-banner {
                    width: 100%;
                    overflow: hidden;
                }
                @media (max-width: 768px) {
                    .promo-container { gap: 10px !important; padding: 0 10px !important; }
                    .promo-text { font-size: 12px; }
                }
                @media (max-width: 480px) {
                    .promo-banner { padding: 6px 0; }
                    .promo-container { gap: 5px !important; }
                    .promo-text { font-size: 11px; }
                    .promo-timer { font-size: 11px; }
                }
            `}</style>
        </div>
    );
};

export default PromoBanner;
