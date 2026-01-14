"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Flame } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderBottom: isScrolled ? 'none' : '1px solid #f0f0f0',
            zIndex: 1000,
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {/* Logo */}
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#0086FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>922</div>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#163561', letterSpacing: '-0.5px' }}>S5Proxy</span>
                </a>

                {/* Menu Items */}
                <div style={{ display: 'flex', gap: '25px', fontWeight: '500', fontSize: '15px', color: '#163561', alignItems: 'center' }}>
                    <a href="/residential-proxies" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Products <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Pricing <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Solutions <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Resources <ChevronDown size={14} /></a>
                    <a href="#" className="nav-item">Apps</a>
                    <a href="#" className="nav-item">FAQ</a>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ff4d4d', fontWeight: '600', fontSize: '15px' }}>
                        <Flame size={18} fill="#ff4d4d" /> Proxy For AI
                    </a>
                    <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '8px' }}>Log In / Sign Up</button>
                </div>
            </div>
            <style jsx>{`
        .nav-item:hover {
          color: var(--primary);
        }
        @media (max-width: 968px) {
            div:nth-child(2) { display: none !important; }
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
