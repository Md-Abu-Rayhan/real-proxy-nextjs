"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

export const PromoTelegramBadge = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                whileHover={{ y: -2, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 9999,
                    width: 'fit-content',
                    maxWidth: 'calc(100vw - 40px)',
                    boxSizing: 'border-box'
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #0088CC 0%, #0066B3 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '30px',
                        padding: '5px 10px 5px 6px',
                        boxShadow: '0 8px 24px rgba(0, 136, 204, 0.4), 0 4px 10px rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'blur(10px)',
                        color: '#FFFFFF',
                        fontFamily: 'inherit',
                        width: 'fit-content'
                    }}
                >
                    <a
                        href="https://t.me/Real_proxy_Recharge"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            textDecoration: 'none',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {/* Telegram Icon */}
                        <div
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.372 0 0 5.372 0 12C0 18.627 5.372 24 12 24C18.628 24 24 18.627 24 12C24 5.372 18.628 0 12 0ZM17.414 7.644L15.655 16.891C15.523 17.502 15.112 17.653 14.591 17.382L11.531 15.02L10.05 16.516C9.886 16.689 9.752 16.823 9.421 16.823L9.641 13.56L15.341 8.16C15.589 7.928 15.286 7.801 14.957 8.031L7.904 12.68L4.853 11.677C4.189 11.458 4.177 10.978 4.992 10.638L16.924 5.8C17.476 5.58 17.95 5.922 17.414 7.644Z" fill="#FFFFFF" />
                            </svg>
                        </div>

                        <span>Need Promo Code? <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Telegram</span></span>
                        <ExternalLink size={11} style={{ opacity: 0.9, flexShrink: 0 }} />
                    </a>

                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsVisible(false);
                        }}
                        aria-label="Close"
                        style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: 'none',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: 0
                        }}
                    >
                        <X size={10} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
