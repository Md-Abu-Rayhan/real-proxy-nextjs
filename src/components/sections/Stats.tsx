"use client";

import React from 'react';

const Stats = () => {
    const stats = [
        { label: 'Active IPs', value: '10M+' },
        { label: 'Countries Covered', value: '190+' },
        { label: 'Success Rate', value: '99.9%' },
        { label: 'Latency', value: '<0.6s' },
    ];

    return (
        <section className="stats-section">
            <div className="container">
                <div className="stats-grid">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .stats-section {
                    padding: 60px 0;
                    background-color: #F8FAFC;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                .stat-card {
                    text-align: center;
                    padding: 20px;
                }
                .stat-value {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0086FF;
                    margin-bottom: 8px;
                }
                .stat-label {
                    color: #163561;
                    font-weight: 600;
                    font-size: 14px;
                }

                @media (max-width: 968px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 30px;
                    }
                }
                @media (max-width: 480px) {
                    .stats-section { padding: 40px 0; }
                    .stats-grid { gap: 15px; }
                    .stat-value { font-size: 24px; }
                    .stat-label { font-size: 11px; }
                    .stat-card { padding: 10px; }
                }
            `}</style>
        </section>
    );
};

export default Stats;
