"use client";

import Link from 'next/link';
import LanguageSelector from '@/components/common/LanguageSelector';

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
                <LanguageSelector />
            </div>
        </header>
    );
};

export default LoginHeader;
