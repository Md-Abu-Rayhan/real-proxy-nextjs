"use client";

import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Pricing = () => {
    const [activeTab, setActiveTab] = useState('ISP Proxies');

    const tabs = ['ISP Proxies', 'Residential Proxies', 'Static Proxies', 'Mobile Proxies'];

    const pricingData: Record<string, any[]> = {
        'ISP Proxies': [
            { title: 'Starter', price: '0.04', unit: 'IP', features: ['100 IPs', '24h Validity', '190+ Countries', 'High Anonymity'], isPopular: false, icon: <Zap size={24} /> },
            { title: 'Standard', price: '0.03', unit: 'IP', features: ['500 IPs', '7 Days Validity', 'City-level Targeting', 'SOCKS5 Support'], isPopular: true, icon: <ShieldCheck size={24} /> },
            { title: 'Enterprise', price: '0.02', unit: 'IP', features: ['2000+ IPs', '30 Days Validity', 'Dedicated Support', 'Unlimited Bandwidth'], isPopular: false, icon: <Server size={24} /> },
        ],
        'Residential Proxies': [
            { title: 'GB Plan', price: '0.7', unit: 'GB', features: ['Rotate IPs', 'No Expiration', 'Global Pool', 'Full Protocol'], isPopular: true, icon: <Zap size={24} /> }
        ],
        'Static Proxies': [],
        'Mobile Proxies': []
    };

    return (
        <section style={{ padding: '120px 0', backgroundColor: '#fff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '70px' }}>
                    <h2 style={{ fontSize: '42px', marginBottom: '20px', letterSpacing: '-1px' }}>Find the Perfect Proxy Plan</h2>
                    <p style={{ color: '#666', fontSize: '20px', maxWidth: '700px', margin: '0 auto' }}>Whether you're a startup or an enterprise, we have a plan tailored to your needs.</p>
                </div>

                {/* Custom Tabs */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '60px',
                    backgroundColor: '#F1F5F9',
                    padding: '6px',
                    borderRadius: '16px',
                    width: 'fit-content',
                    margin: '0 auto 60px auto'
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '14px 28px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                fontSize: '15px',
                                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                                color: activeTab === tab ? '#0086FF' : '#64748B',
                                boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Pricing Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', justifyContent: 'center' }}>
                    <AnimatePresence mode="wait">
                        {pricingData[activeTab]?.length > 0 ? (
                            pricingData[activeTab].map((plan, index) => (
                                <motion.div
                                    key={`${activeTab}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    style={{
                                        padding: '48px 40px',
                                        borderRadius: '28px',
                                        border: '1px solid #f0f0f0',
                                        backgroundColor: 'white',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: plan.isPopular ? '0 30px 60px rgba(0, 134, 255, 0.12)' : '0 10px 30px rgba(0,0,0,0.03)',
                                        transform: plan.isPopular ? 'scale(1.02)' : 'scale(1)',
                                        zIndex: plan.isPopular ? 1 : 0,
                                        borderTop: plan.isPopular ? '4px solid #0086FF' : '1px solid #f0f0f0'
                                    }} className="pricing-card">
                                    {plan.isPopular && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-18px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: '#0086FF',
                                            color: 'white',
                                            padding: '6px 20px',
                                            borderRadius: '30px',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            letterSpacing: '1px'
                                        }}>MOST POPULAR</div>
                                    )}

                                    <div style={{ color: '#0086FF', marginBottom: '24px' }}>{plan.icon}</div>

                                    <h3 style={{ fontSize: '24px', marginBottom: '8px', color: '#163561' }}>{plan.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                                        <span style={{ fontSize: '48px', fontWeight: '800', color: '#163561' }}>${plan.price}</span>
                                        <span style={{ color: '#64748B', fontWeight: '500' }}>/{plan.unit}</span>
                                    </div>

                                    <div style={{ width: '100%', height: '1px', backgroundColor: '#f1f5f9', marginBottom: '32px' }} />

                                    <ul style={{ listStyle: 'none', marginBottom: '40px', flexGrow: 1 }}>
                                        {plan.features.map((feat: string, i: number) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', color: '#475569', fontSize: '15px' }}>
                                                <div style={{ backgroundColor: 'rgba(0, 134, 255, 0.1)', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                                                    <Check size={14} color="#0086FF" strokeWidth={3} />
                                                </div>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <button style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        fontWeight: '700',
                                        fontSize: '16px',
                                        backgroundColor: plan.isPopular ? '#0086FF' : 'white',
                                        color: plan.isPopular ? 'white' : '#0086FF',
                                        border: '2px solid #0086FF',
                                        transition: 'all 0.2s ease'
                                    }} className="order-btn">Order Now</button>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                                Coming Soon...
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <style jsx>{`
        .pricing-card:hover {
          transform: translateY(-8px) ${activeTab === 'Residential Proxies' ? '' : 'scale(1.02)'};
          box-shadow: 0 40px 80px rgba(0,0,0,0.1);
        }
        .order-btn:hover {
            background-color: ${activeTab === 'Residential Proxies' ? '#0076e5' : '#0086FF'};
            color: white;
            box-shadow: 0 10px 20px rgba(0, 134, 255, 0.2);
        }
      `}</style>
        </section>
    );
};

export default Pricing;
