"use client";

import React from 'react';
import { CheckCircle2, Download, ShoppingCart, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="hero-section" style={{
            padding: '80px 0',
            background: 'radial-gradient(circle at 70% 30%, rgba(0, 134, 255, 0.05) 0%, transparent 50%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            <div className="container hero-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-content"
                >
                    <h1 className="hero-title" style={{ lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1.5px' }}>
                        The World's <span style={{ color: '#0086FF' }}>#1</span> Residential <br className="mobile-hide" />
                        Proxy Service Provider
                    </h1>
                    <p className="hero-description" style={{ color: '#666', marginBottom: '40px', maxWidth: '540px', lineHeight: '1.6' }}>
                        Access 200M+ real residential IPs from 190+ countries. 99.9% uptime, lightning fast speed, and industry-leading security.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }} className="benefit-list">
                        <div className="benefit-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                            <CheckCircle2 size={20} color="#28A745" /> 200M+ Stable Residential IPs
                        </div>
                        <div className="benefit-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                            <CheckCircle2 size={20} color="#28A745" /> City-level targeting coverage 190+ countries
                        </div>
                        <div className="benefit-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                            <CheckCircle2 size={20} color="#28A745" /> Compatible with all browsers and tools
                        </div>
                    </div>

                    <div className="hero-actions">
                        <button className="btn-primary hero-btn" style={{ padding: '18px 44px', borderRadius: '12px' }}>
                            <ShoppingCart size={20} /> Buy Now
                        </button>
                        <button className="btn-outline hero-btn" style={{ padding: '18px 44px', borderRadius: '12px', border: '2px solid #0086FF' }}>
                            <Download size={20} /> Free Download
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ position: 'relative' }}
                    className="hero-visual"
                >
                    {/* Visual elements / Badge placeholders */}
                    <div className="visual-card" style={{
                        width: '100%',
                        backgroundColor: '#fff',
                        borderRadius: '32px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '30px',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div className="stats-mini" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '800', fontSize: '24px', color: '#163561' }}>4.8/5</div>
                                <div style={{ fontSize: '12px', color: '#8898AA', fontWeight: '600', marginTop: '4px' }}>TRUSTPILOT</div>
                            </div>
                            <div className="divider" style={{ width: '1px', height: '30px', backgroundColor: '#eee', alignSelf: 'center' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '800', fontSize: '24px', color: '#163561' }}>High</div>
                                <div style={{ fontSize: '12px', color: '#8898AA', fontWeight: '600', marginTop: '4px' }}>PERFORMANCE</div>
                            </div>
                            <div className="divider" style={{ width: '1px', height: '30px', backgroundColor: '#eee', alignSelf: 'center' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '800', fontSize: '24px', color: '#163561' }}>G2</div>
                                <div style={{ fontSize: '12px', color: '#8898AA', fontWeight: '600', marginTop: '4px' }}>LEADER 2024</div>
                            </div>
                        </div>

                        <div className="network-viz" style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed #0086FF'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <Globe size={48} color="#0086FF" strokeWidth={1} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <div style={{ color: '#0086FF', fontWeight: '600', fontSize: '14px' }}>Global IP Network Illustration</div>
                            </div>
                        </div>
                    </div>

                    {/* Floating elements to add life - Hidden on small mobile */}
                    <div className="floating-elements">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ position: 'absolute', top: '20px', right: '-15px', background: 'white', padding: '10px 20px', borderRadius: '50px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '12px', zIndex: 10 }}
                        >
                            <span style={{ color: '#28A745' }}>●</span> 192.168.1.1 (Stable)
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            style={{ position: 'absolute', bottom: '40px', left: '-20px', background: 'white', padding: '10px 20px', borderRadius: '50px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '12px', zIndex: 10 }}
                        >
                            <Globe size={14} color="#0086FF" /> USA, New York
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .hero-container {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 60px;
                    align-items: center;
                    width: 100%;
                }
                .hero-actions {
                    display: flex;
                    gap: 20px;
                    width: 100%;
                }
                .hero-title { font-size: 56px; }
                .hero-btn { font-size: 18px; }
                .network-viz { height: 200px; }
                .visual-card { min-height: 400px; padding: 40px; }

                @media (max-width: 1024px) {
                    .hero-container { 
                        grid-template-columns: 1fr; 
                        gap: 40px; 
                        text-align: center; 
                    }
                    .hero-content { display: flex; flex-direction: column; align-items: center; width: 100%; }
                    .benefit-list { align-items: center; width: 100%; }
                    .hero-title { font-size: 48px; }
                    .hero-description { max-width: 640px !important; margin-left: auto; margin-right: auto; }
                    .hero-actions { justify-content: center; }
                }

                @media (max-width: 768px) {
                    .hero-section { padding: 40px 0 !important; }
                    .hero-title { font-size: 32px; }
                    .hero-description { font-size: 16px; margin-bottom: 24px; }
                    .benefit-item { font-size: 14px !important; }
                    .hero-actions { flex-direction: column; width: 100%; gap: 12px; }
                    .hero-btn { width: 100%; padding: 14px !important; font-size: 16px !important; }
                    .floating-elements { display: none; }
                    .visual-card { min-height: 250px !important; padding: 20px !important; border-radius: 20px; }
                    .stats-mini { gap: 10px !important; }
                    .divider { display: none; }
                    .network-viz { height: 120px; }
                }

                @media (max-width: 480px) {
                    .hero-title { font-size: 26px; letter-spacing: -0.5px; }
                    .hero-description { font-size: 14px; }
                    .benefit-list { gap: 10px !important; }
                }
            `}</style>
        </section>
    );
};

export default Hero;
