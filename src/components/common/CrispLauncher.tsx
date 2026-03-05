"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

const CrispLauncher = () => {
    const [isCrispLoaded, setIsCrispLoaded] = useState(false);

    useEffect(() => {
        const checkCrisp = setInterval(() => {
            if (window.$crisp) {
                // Hide the default Crisp launcher
                window.$crisp.push(['set', 'chat:hide', [true]]);
                setIsCrispLoaded(true);
                clearInterval(checkCrisp);
            }
        }, 500);

        return () => clearInterval(checkCrisp);
    }, []);

    const toggleChat = () => {
        if (window.$crisp) {
            window.$crisp.push(['do', 'chat:toggle']);
        }
    };

    return (
        <button
            onClick={toggleChat}
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#1972F5', // Crisp Blue
                boxShadow: '0 4px 12px rgba(25, 114, 245, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 9999,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(25, 114, 245, 0.6)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 114, 245, 0.4)';
            }}
        >
            <MessageSquare size={28} fill="white" />
            <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '14px',
                height: '14px',
                backgroundColor: '#44ce3b', // Online Green
                borderRadius: '50%',
                border: '2px solid white'
            }} />
        </button>
    );
};

export default CrispLauncher;
