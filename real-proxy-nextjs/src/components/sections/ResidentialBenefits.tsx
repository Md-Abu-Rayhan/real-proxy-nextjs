"use client";

import React from 'react';
import { Globe, Zap, Shield, Users, MapPin, Gauge } from 'lucide-react';

const ResidentialBenefits = () => {
    const benefits = [
        { icon: <Globe />, title: '200M+ Worldwide IPs', desc: 'Access one of the largest residential proxy pools with over 200 million real residential IPs.' },
        { icon: <MapPin />, title: 'City Level Targeting', desc: 'Target any country, state, or city worldwide with precision for your specific business needs.' },
        { icon: <Zap />, title: '99.9% Success Rate', desc: 'Our stable network ensures high performance and reliability for large-scale data collection.' },
        { icon: <Shield />, title: 'Total Anonymity', desc: 'Hide your real identity with high-purity residential IPs that look like real home users.' },
        { icon: <Gauge />, title: 'Unlimited Bandwidth', desc: 'Enjoy high-speed connections without worrying about bandwidth limits or throttling.' },
        { icon: <Users />, title: 'Business Features', desc: 'Support for sub-accounts and customized configurations for teams and enterprises.' }
    ];

    return (
        <section style={{ padding: '100px 0', backgroundColor: '#fff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '70px' }}>
                    <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Professional Residential Proxy Services</h2>
                    <p style={{ color: '#666', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>Designed for businesses that require scale, stability, and high anonymity.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                    {benefits.map((benefit, i) => (
                        <div key={i} style={{ display: 'flex', gap: '20px' }}>
                            <div style={{
                                minWidth: '60px',
                                height: '60px',
                                backgroundColor: 'rgba(0,134,255,0.08)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0086FF'
                            }}>
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#163561' }}>{benefit.title}</h3>
                                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResidentialBenefits;
