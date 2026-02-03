"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, Server } from 'lucide-react';

const ResidentialHero = () => {
    return (
        <section className="res-hero-section">
            <div className="container res-hero-container">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="res-hero-content"
                >
                    <div className="badge-wrapper">
                        <span className="dot">●</span> 200M+ Global Residential IPs
                    </div>
                    <h1 className="res-title">
                        Unlimited Speed and <span style={{ color: '#0086FF' }}>Anonymity</span> <br />
                        Residential Proxies
                    </h1>
                    <p className="res-desc">
                        Access global proxy pool, city-level targeting, supporting random and sticky sessions. High-quality IPs for your business scale.
                    </p>

                    <div className="res-actions">
                        <button
                            className="btn-primary"
                            style={{ padding: '18px 44px', fontSize: '18px', borderRadius: '12px', background: '#0086FF', border: 'none' }}
                            onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Get Started
                        </button>
                        <button className="btn-outline" style={{ padding: '18px 44px', fontSize: '18px', borderRadius: '12px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                            View Pricing
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="res-hero-visual"
                >
                    <div className="res-visual-card">
                        <div className="res-stats-grid">
                            {[
                                { icon: <Globe />, label: '190+ Countries', value: 'Global Reach' },
                                { icon: <Zap />, label: '99.9%', value: 'Success Rate' },
                                { icon: <Shield />, label: 'SOCKS5/HTTP(S)', value: 'Secure Protocols' },
                                { icon: <Server />, label: 'Unlimited', value: 'Concurrency' }
                            ].map((item, i) => (
                                <div key={i} className="res-stat-item">
                                    <div style={{ color: '#0086FF', marginBottom: '12px' }}>{item.icon}</div>
                                    <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>{item.label}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.6 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
            <style jsx>{`
                .res-hero-section {
                    padding: 100px 0;
                    background: linear-gradient(135deg, #041026 0%, #0056b3 100%);
                    color: white;
                    overflow: hidden;
                }
                .res-hero-container {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 60px;
                    align-items: center;
                }
                .badge-wrapper {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background-color: rgba(255,255,255,0.1);
                    padding: 6px 16px;
                    border-radius: 50px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    font-weight: 600;
                }
                .dot { color: #ff4d4d; }
                .res-title { font-size: 56px; line-height: 1.1; margin-bottom: 24px; color: white; }
                .res-desc { font-size: 20px; color: rgba(255,255,255,0.8); marginBottom: 40px; max-width: 540px; line-height: 1.6; }
                .res-actions { display: flex; gap: 20px; }
                .res-visual-card {
                    background-color: rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 32px;
                    padding: 40px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 40px 80px rgba(0,0,0,0.3);
                }
                .res-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .res-stat-item {
                    padding: 20px;
                    background-color: rgba(255,255,255,0.05);
                    border-radius: 20px;
                    text-align: left;
                }

                @media (max-width: 1024px) {
                    .res-hero-container { grid-template-columns: 1fr; text-align: center; }
                    .res-hero-content { display: flex; flex-direction: column; align-items: center; }
                    .res-desc { max-width: 100%; }
                    .res-actions { justify-content: center; }
                    .res-title { font-size: 42px; }
                }

                @media (max-width: 768px) {
                    .res-hero-section { padding: 60px 0; }
                    .res-title { font-size: 32px; }
                    .res-desc { font-size: 16px; }
                    .res-actions { flex-direction: column; width: 100%; }
                    .res-actions button { width: 100%; padding: 15px !important; }
                    .res-visual-card { padding: 24px 16px; }
                    .res-stats-grid { gap: 12px; }
                    .res-stat-item { padding: 15px; }
                }
            `}</style>
        </section>
    );
};

export default ResidentialHero;
