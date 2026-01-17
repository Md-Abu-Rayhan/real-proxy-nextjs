"use client";

import React from 'react';
import Link from 'next/link';

const LoginHeader = () => {
    return (
        <header style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderBottom: '1px solid #f0f0f0',
            width: '100%'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
                </Link>

                {/* Language Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#163561', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                    <img src="https://static.922proxy.com/img/langu_earth.png" alt="Globe" style={{ width: '18px', height: '18px' }} />
                    <span>EN-English</span>
                    <img src="https://static.922proxy.com/img/index_new/select_down.png" alt="Down" style={{ width: '10px', height: '6px', marginLeft: '2px' }} />
                </div>
            </div>
        </header>
    );
};

export default LoginHeader;
