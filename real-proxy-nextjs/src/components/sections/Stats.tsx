"use client";

import React from 'react';

const Stats = () => {
    const stats = [
        { label: 'Active IPs', value: '200M+' },
        { label: 'Countries Covered', value: '190+' },
        { label: 'Success Rate', value: '99.9%' },
        { label: 'Latency', value: '<0.6s' },
    ];

    return (
        <section style={{ padding: '60px 0', backgroundColor: '#F8FAFC' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: '#0086FF', marginBottom: '8px' }}>{stat.value}</div>
                            <div style={{ color: '#163561', fontWeight: '600', fontSize: '14px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                @media (max-width: 768px) {
                    div:first-child { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </section>
    );
};

export default Stats;
