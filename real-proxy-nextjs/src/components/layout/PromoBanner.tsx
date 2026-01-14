"use client";

import React from 'react';

const PromoBanner = () => {
    return (
        <div style={{
            background: 'linear-gradient(90deg, #981A00 0%, #FF4D4D 100%)',
            color: 'white',
            padding: '8px 0',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 1001,
            position: 'relative'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span>🎄 HAPPY CHRISTMAS 🎄</span>
                <span>Up to 80% Discount! Don't miss out.</span>
                <a href="#" style={{
                    backgroundColor: 'white',
                    color: '#981A00',
                    padding: '2px 12px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '12px'
                }}>BUY NOW</a>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <span>Ends in:</span>
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0 4px', borderRadius: '2px' }}>02</span>:
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0 4px', borderRadius: '2px' }}>14</span>:
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0 4px', borderRadius: '2px' }}>55</span>
                </div>
            </div>
        </div>
    );
};

export default PromoBanner;
