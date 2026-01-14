"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, Server } from 'lucide-react';

const ResidentialHero = () => {
    return (
        <section style={{
            padding: '100px 0',
            background: 'linear-gradient(135deg, #041026 0%, #0056b3 100%)',
            color: 'white',
            overflow: 'hidden'
        }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '50px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
                        <span style={{ color: '#ff4d4d' }}>●</span> 200M+ Global Residential IPs
                    </div>
                    <h1 style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '24px', color: 'white' }}>
                        Unlimited Speed and <span style={{ color: '#0086FF' }}>Anonymity</span> <br />
                        Residential Proxies
                    </h1>
                    <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', maxWidth: '540px', lineHeight: '1.6' }}>
                        Access global proxy pool, city-level targeting, supporting random and sticky sessions. High-quality IPs for your business scale.
                    </p>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button className="btn-primary" style={{ padding: '18px 44px', fontSize: '18px', borderRadius: '12px', background: '#0086FF', border: 'none' }}>
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
                    style={{ position: 'relative' }}
                >
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '32px',
                        padding: '40px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            {[
                                { icon: <Globe />, label: '190+ Countries', value: 'Global Reach' },
                                { icon: <Zap />, label: '99.9%', value: 'Success Rate' },
                                { icon: <Shield />, label: 'SOCKS5/HTTP(S)', value: 'Secure Protocols' },
                                { icon: <Server />, label: 'Unlimited', value: 'Concurrency' }
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', textAlign: 'left' }}>
                                    <div style={{ color: '#0086FF', marginBottom: '12px' }}>{item.icon}</div>
                                    <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>{item.label}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.6 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ResidentialHero;
