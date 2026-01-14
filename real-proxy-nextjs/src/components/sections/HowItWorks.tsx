"use client";

import React from 'react';
import { MousePointer2, Settings, ShieldCheck, Zap } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            title: 'Choose a Plan',
            desc: 'Select from our variety of residential, ISP, or mobile proxy plans based on your needs.',
            icon: <MousePointer2 size={32} color="#0086FF" />
        },
        {
            title: 'Get Credentials',
            desc: 'Instant access to your dashboard with all the credentials and API keys.',
            icon: <Settings size={32} color="#0086FF" />
        },
        {
            title: 'Configure Proxies',
            desc: 'Use our easy-to-use software or integrate directly with your favorite tools.',
            icon: <Zap size={32} color="#0086FF" />
        },
        {
            title: 'Scale Globally',
            desc: 'Access millions of IPs and start scraping or browsing with confidence.',
            icon: <ShieldCheck size={32} color="#0086FF" />
        }
    ];

    return (
        <section style={{ padding: '100px 0', backgroundColor: '#F8FAFC' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '70px' }}>
                    <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Simple Steps to Get Started</h2>
                    <p style={{ color: '#666', fontSize: '18px' }}>Follow these easy steps and start using our premium proxies in minutes.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px' }}>
                    {steps.map((step, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                backgroundColor: 'rgba(0, 134, 255, 0.05)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px auto'
                            }}>
                                {step.icon}
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{step.title}</h3>
                            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
