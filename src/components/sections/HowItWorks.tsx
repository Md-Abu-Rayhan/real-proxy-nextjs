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
        <section className="how-it-works-section">
            <div className="container">
                <div className="how-header">
                    <h2 className="how-title">Simple Steps to Get Started</h2>
                    <p className="how-subtitle">Follow these easy steps and start using our premium proxies in minutes.</p>
                </div>

                <div className="how-grid">
                    {steps.map((step, i) => (
                        <div key={i} className="how-step-card">
                            <div className="icon-wrapper">
                                {step.icon}
                            </div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .how-it-works-section {
                    padding: 100px 0;
                    backgroundColor: #F8FAFC;
                }
                .how-header {
                    text-align: center;
                    margin-bottom: 70px;
                }
                .how-title {
                    font-size: 36px;
                    margin-bottom: 20px;
                }
                .how-subtitle {
                    color: #666;
                    font-size: 18px;
                }
                .how-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 40px;
                }
                .how-step-card {
                    text-align: center;
                    padding: 30px;
                    background-color: white;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    transition: transform 0.3s ease;
                }
                .how-step-card:hover { transform: translateY(-5px); }
                .icon-wrapper {
                    width: 70px;
                    height: 70px;
                    background-color: rgba(0, 134, 255, 0.05);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px auto;
                }
                .step-title {
                    font-size: 20px;
                    margin-bottom: 12px;
                }
                .step-desc {
                    color: #666;
                    font-size: 15px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .how-it-works-section { padding: 60px 0; }
                    .how-header { margin-bottom: 40px; }
                    .how-title { font-size: 28px; }
                    .how-subtitle { font-size: 16px; }
                    .how-grid { gap: 24px; }
                    .how-step-card { padding: 24px; }
                }
            `}</style>
        </section>
    );
};

export default HowItWorks;
