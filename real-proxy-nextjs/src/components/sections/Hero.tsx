"use client";

import React from 'react';
import { CheckCircle2, Download, ShoppingCart, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section style={{
            padding: '100px 0',
            background: 'radial-gradient(circle at 70% 30%, rgba(0, 134, 255, 0.05) 0%, transparent 50%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            minHeight: '700px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1.5px' }}>
                        The World's <span style={{ color: '#0086FF' }}>#1</span> Residential <br />
                        Proxy Service Provider
                    </h1>
                    <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px', maxWidth: '540px', lineHeight: '1.6' }}>
                        Access 200M+ real residential IPs from 190+ countries. 99.9% uptime, lightning fast speed, and industry-leading security.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
                            <CheckCircle2 size={20} color="#28A745" /> 200M+ Stable Residential IPs
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
                            <CheckCircle2 size={20} color="#28A745" /> City-level targeting coverage 190+ countries
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '500' }}>
                            <CheckCircle2 size={20} color="#28A745" /> Compatible with all browsers and tools
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button className="btn-primary" style={{ padding: '18px 44px', fontSize: '18px', borderRadius: '12px' }}>
                            <ShoppingCart size={20} /> Buy Now
                        </button>
                        <button className="btn-outline" style={{ padding: '18px 44px', fontSize: '18px', borderRadius: '12px', border: '2px solid #0086FF' }}>
                            <Download size={20} /> Free Download
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ position: 'relative' }}
                >
                    {/* Visual elements / Badge placeholders */}
                    <div style={{
                        width: '100%',
                        minHeight: '440px',
                        backgroundColor: '#fff',
                        borderRadius: '32px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '30px',
                        padding: '50px',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontWeight: '800', fontSize: '28px', color: '#163561' }}>4.8/5</div>
                                <div style={{ fontSize: '13px', color: '#8898AA', fontWeight: '600', marginTop: '4px' }}>TRUSTPILOT</div>
                            </div>
                            <div style={{ width: '1px', height: '40px', backgroundColor: '#eee', alignSelf: 'center' }} />
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontWeight: '800', fontSize: '28px', color: '#163561' }}>High</div>
                                <div style={{ fontSize: '13px', color: '#8898AA', fontWeight: '600', marginTop: '4px' }}>PERFORMANCE</div>
                            </div>
                            <div style={{ width: '1px', height: '40px', backgroundColor: '#eee', alignSelf: 'center' }} />
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontWeight: '800', fontSize: '28px', color: '#163561' }}>G2</div>
                                <div style={{ fontSize: '13px', color: '#8898AA', fontWeight: '600', marginTop: '4px' }}>LEADER 2024</div>
                            </div>
                        </div>

                        <div style={{
                            width: '100%',
                            height: '240px',
                            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed #0086FF'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <Globe size={64} color="#0086FF" strokeWidth={1} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <div style={{ color: '#0086FF', fontWeight: '600' }}>Global IP Network Illustration</div>
                            </div>
                        </div>
                    </div>

                    {/* Floating elements to add life */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ position: 'absolute', top: '20px', right: '-30px', background: 'white', padding: '12px 24px', borderRadius: '50px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '14px' }}
                    >
                        <span style={{ color: '#28A745' }}>●</span> 192.168.1.1 (Stable)
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        style={{ position: 'absolute', bottom: '40px', left: '-40px', background: 'white', padding: '12px 24px', borderRadius: '50px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '14px' }}
                    >
                        <Globe size={16} color="#0086FF" /> USA, New York
                    </motion.div>
                </motion.div>
            </div>

            <style jsx>{`
        @media (max-width: 968px) {
          .container { grid-template-columns: 1fr; text-align: center; }
          div { justify-content: center !important; }
          h1 { fontSize: 40px !important; }
        }
      `}</style>
        </section>
    );
};

export default Hero;
