"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Flame, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/common/LanguageSelector';

const Navbar = () => {
    const { t } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        // Initial check for login state
        const token = localStorage.getItem('auth_token');
        setIsLoggedIn(!!token);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        setIsLoggedIn(false);
        window.location.reload();
    };

    return (
        <nav className="navbar" style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderBottom: isScrolled ? 'none' : '1px solid #f0f0f0',
            zIndex: 1000,
            height: isScrolled ? '70px' : '80px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            width: '100%'
        }}>
            <div className="container nav-container">
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
                </Link>

                {/* Desktop Menu Items */}
                <div className="desktop-menu">
                    <a href="/residential-proxies" className="nav-item">{t.nav.products}</a>
                    <a href="#" className="nav-item">{t.nav.contact}</a>
                    <a href="/#faq-section" className="nav-item">{t.nav.faq}</a>
                </div>

                {/* Desktop Actions */}
                <div className="desktop-actions">
                    {isLoggedIn ? (
                        <>
                            <Link href="/dashboard/traffic-setup" className="nav-link-login" style={{ color: '#163561', fontWeight: '600', fontSize: '15px' }}>Dashboard</Link>
                            <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="nav-link-login" style={{ color: '#163561', fontWeight: '600', fontSize: '15px', padding: '0 10px' }}>{t.nav.login}</Link>
                            <Link href="/register" className="btn-primary" style={{ padding: '8px 24px', fontSize: '14px', borderRadius: '8px' }}>
                                {t.nav.signup}
                            </Link>
                        </>
                    )}
                    <LanguageSelector />
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ background: 'none', color: '#163561', border: 'none', cursor: 'pointer' }}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mobile-overlay"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            padding: '20px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            borderTop: '1px solid #f0f0f0',
                            zIndex: 999
                        }}
                    >
                        <a href="/residential-proxies" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>{t.nav.products}</a>
                        <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>{t.nav.contact}</a>
                        <a href="/#faq-section" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>{t.nav.faq}</a>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                            {isLoggedIn ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                    <Link href="/dashboard/traffic-setup" className="btn-primary" style={{ padding: '12px', textAlign: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <button onClick={handleLogout} className="btn-outline" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <Link href="/login" className="btn-outline" style={{ padding: '12px', textAlign: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
                                        {t.nav.login}
                                    </Link>
                                    <Link href="/register" className="btn-primary" style={{ padding: '12px', textAlign: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
                                        {t.nav.signup}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .desktop-menu {
                    display: flex;
                    gap: 30px;
                    font-weight: 500;
                    font-size: 15px;
                    color: #163561;
                    align-items: center;
                    margin-left: 50px;
                    margin-right: auto;
                }
                .desktop-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .nav-item:hover, .nav-link-login:hover {
                    color: var(--primary) !important;
                }
                .mobile-toggle {
                    display: none;
                }
                @media (max-width: 1100px) {
                    .desktop-menu { gap: 15px; font-size: 14px; }
                    .desktop-actions { gap: 10px; }
                }
                @media (max-width: 968px) {
                    .desktop-menu, .desktop-actions { display: none; }
                    .mobile-toggle { display: block; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
