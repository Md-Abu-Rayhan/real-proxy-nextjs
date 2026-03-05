"use client";

import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const triggerContactModal = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-contact-modal'));
    }
};

export const ContactModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-contact-modal', handleOpen);
        return () => window.removeEventListener('open-contact-modal', handleOpen);
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    backdropFilter: 'blur(4px)'
                }}
                onClick={() => setIsOpen(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        background: 'white',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative',
                        textAlign: 'center'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#64748b',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{
                        width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', color: '#3b82f6'
                    }}>
                        <MessageCircle size={32} />
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                        Get in Touch
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px' }}>
                        How would you like to contact our support team?
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <a
                            href="https://t.me/Real_proxy_Recharge"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                background: '#E3F2FD', // light blue
                                color: '#1E88E5',
                                padding: '16px',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.372 0 0 5.372 0 12C0 18.627 5.372 24 12 24C18.628 24 24 18.627 24 12C24 5.372 18.628 0 12 0ZM17.414 7.644L15.655 16.891C15.523 17.502 15.112 17.653 14.591 17.382L11.531 15.02L10.05 16.516C9.886 16.689 9.752 16.823 9.421 16.823L9.641 13.56L15.341 8.16C15.589 7.928 15.286 7.801 14.957 8.031L7.904 12.68L4.853 11.677C4.189 11.458 4.177 10.978 4.992 10.638L16.924 5.8C17.476 5.58 17.95 5.922 17.414 7.644Z" fill="currentColor" />
                            </svg>
                            Telegram
                        </a>

                        <a
                            href="https://wa.me/message/K4I5YCLO2D6TH1"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                background: '#E8F5E9', // light green
                                color: '#43A047',
                                padding: '16px',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.0004 0C5.37356 0 0 5.37356 0 12.0004C0 14.6302 0.84654 17.0674 2.2618 19.0988L0.74902 23.3621C0.686862 23.5359 0.725964 23.7314 0.852277 23.8687C0.950785 23.974 1.09117 24.0326 1.23594 24.0326C1.2828 24.0326 1.33038 24.0252 1.37683 24.0097L5.78926 22.5312C7.7562 23.7942 10.0931 24.4842 12.5701 24.4842C19.197 24.4842 24.5705 19.1106 24.5705 12.4838C24.5705 5.857 19.197 0.483441 12.5701 0.483441H12.0004V0ZM12.0004 2.05831H12.5701C18.3242 2.05831 22.5126 6.74668 22.5126 12.5008C22.5126 18.2549 18.3242 22.4433 12.5701 22.4433C10.282 22.4433 8.09337 21.6888 6.2625 20.3204L6.15177 20.2458L2.46979 21.4921L3.71536 17.8093L3.63351 17.6896C2.26053 15.8614 1.50314 13.6708 1.50314 11.3831C2.05828 5.62899 6.74665 2.05831 12.0004 2.05831ZM8.57502 6.84501C8.28186 6.84501 7.95758 6.94639 7.6416 7.22736C7.30607 7.52627 6.64367 8.16335 6.64367 9.45892C6.64367 10.7545 7.66983 12.0125 7.8203 12.214C7.94071 12.3875 9.68069 15.2285 12.5932 16.3683C15.0601 17.3323 15.5348 17.151 16.0366 17.0988C16.5385 17.0465 17.6521 16.4422 17.8827 15.7891C18.1132 15.136 18.1132 14.5835 18.0326 14.4715C17.9521 14.3596 17.751 14.285 17.4497 14.1352C17.1484 13.986 15.6525 13.2536 15.3712 13.1515C15.0901 13.0494 14.879 13.0044 14.6784 13.3033C14.4772 13.6022 13.9248 14.2492 13.7538 14.4507C13.5829 14.6522 13.4121 14.6749 13.1111 14.5249C12.8099 14.375 11.8344 14.0538 10.6865 13.0336C9.79251 12.2393 9.17834 11.2464 9.00693 10.9472C8.83617 10.6481 8.98906 10.4907 9.1415 10.3421C9.27838 10.2081 9.44284 10.0076 9.59343 9.83785C9.7439 9.66814 9.8037 9.544 9.90426 9.34444C10.0047 9.14488 9.94437 8.97334 9.8638 8.81404C9.78345 8.65475 9.17135 7.15064 8.93043 6.54341V6.52225C8.68285 5.922 8.44185 5.9926 8.242 5.98604C8.04163 5.97937 7.8203 5.9554 7.6094 5.9554C7.388 5.95538 7.03666 6.03575 6.7454 6.35378H6.745Z" fill="currentColor" />
                            </svg>
                            WhatsApp
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
