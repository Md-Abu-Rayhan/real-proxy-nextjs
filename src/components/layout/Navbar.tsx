"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Flame, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                    <a href="/residential-proxies" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Products <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Pricing <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Solutions <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Resources <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item">Apps</a>
                    <a href="#" className="nav-item">FAQ</a>
                </div>

                {/* Desktop Actions */}
                <div className="desktop-actions">
                    <a href="#" className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ff4d4d', fontWeight: '600', fontSize: '15px' }}>
                        <Flame size={18} fill="#ff4d4d" /> Proxy AI
                    </a>
                    <Link href="/login" className="nav-link-login" style={{ color: '#163561', fontWeight: '600', fontSize: '15px', padding: '0 10px' }}>Log In</Link>
                    <Link href="/register" className="btn-primary" style={{ padding: '8px 24px', fontSize: '14px', borderRadius: '8px' }}>
                        Sign Up
                    </Link>
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
                        <a href="/residential-proxies" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>Products</a>
                        <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>Pricing</a>
                        <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>Solutions</a>
                        <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>Resources</a>
                        <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>Apps</a>
                        <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px 0', fontWeight: '600', borderBottom: '1px solid #f8f9fa' }}>FAQ</a>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ff4d4d', fontWeight: '600' }}>
                                <Flame size={18} fill="#ff4d4d" /> Proxy AI
                            </a>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Link href="/login" className="btn-outline" style={{ padding: '12px', textAlign: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
                                    Log In
                                </Link>
                                <Link href="/register" className="btn-primary" style={{ padding: '12px', textAlign: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </div>
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
                    gap: 25px;
                    font-weight: 500;
                    font-size: 15px;
                    color: #163561;
                    align-items: center;
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
