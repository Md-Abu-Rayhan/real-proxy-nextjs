"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const ResidentialPricing = () => {
    const [planType, setPlanType] = useState('Personal');

    const personalPlans = [
        { gb: '5GB', price: '2', total: '10', discount: '-4', badge: '' },
        { gb: '10GB', price: '1.8', total: '18', discount: '-8', badge: '' },
        { gb: '40GB', price: '1.4', total: '56', discount: '-24', badge: '' },
        { gb: '100GB', price: '1.2', total: '120', discount: '-52', badge: 'Most Popular' },
        { gb: '300GB', price: '0.9', total: '270', discount: '-120', badge: 'Most Hot' },
        { gb: '600GB', price: '0.8', total: '480', discount: '-210', badge: 'Best Value' },
    ];

    const businessPlans = [
        { gb: '1000GB', price: '0.7', total: '700', discount: 'Custom', badge: 'Enterprise' },
        { gb: '3000GB', price: '0.65', total: '1950', discount: 'Custom', badge: 'Best Value' },
        { gb: '5000GB', price: '0.6', total: '3000', discount: 'Custom', badge: 'High Volume' },
    ];

    const activePlans = planType === 'Personal' ? personalPlans : businessPlans;

    return (
        <section style={{ padding: '100px 0', backgroundColor: '#F8FAFC' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Enjoy Unlimited Residential Proxies</h2>
                    <p style={{ color: '#666', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>Choose a traffic package that meets your business needs with 99.9% IP availability.</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '6px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex' }}>
                        <button
                            onClick={() => setPlanType('Personal')}
                            style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', backgroundColor: planType === 'Personal' ? '#0086FF' : 'transparent', color: planType === 'Personal' ? 'white' : '#666' }}
                        >Residential Proxies</button>
                        <button
                            onClick={() => setPlanType('Business')}
                            style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', backgroundColor: planType === 'Business' ? '#0086FF' : 'transparent', color: planType === 'Business' ? 'white' : '#666' }}
                        >Residential (Business)</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                    {activePlans.map((plan, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            style={{
                                backgroundColor: 'white',
                                padding: '40px',
                                borderRadius: '24px',
                                border: '1px solid #f0f0f0',
                                position: 'relative',
                                boxShadow: plan.badge ? '0 20px 40px rgba(0,134,255,0.1)' : '0 10px 30px rgba(0,0,0,0.02)'
                            }}
                        >
                            {plan.badge && (
                                <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: plan.badge === 'Best Value' ? '#ff4d4d' : '#0086FF', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700' }}>
                                    {plan.badge}
                                </div>
                            )}
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Traffic Package</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: '#163561', marginBottom: '24px' }}>{plan.gb}</div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '36px', fontWeight: '800', color: '#0086FF' }}>${plan.price}</span>
                                <span style={{ color: '#666' }}>/GB</span>
                            </div>

                            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                    <span>Total Price</span>
                                    <span style={{ textDecoration: 'line-through', color: '#999' }}>${parseInt(plan.total) + 10}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '20px', color: '#163561' }}>
                                    <span>${plan.total}</span>
                                    <span style={{ color: '#ff4d4d' }}>{plan.discount}$</span>
                                </div>
                            </div>

                            <ul style={{ listStyle: 'none', marginBottom: '30px' }}>
                                <li style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '14px' }}>
                                    <Check size={16} color="#28A745" /> Country and city level positioning
                                </li>
                                <li style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '14px' }}>
                                    <Check size={16} color="#28A745" /> IP availability 99.9%
                                </li>
                                <li style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '14px' }}>
                                    <Check size={16} color="#28A745" /> Unlimited concurrency and bandwidth
                                </li>
                            </ul>

                            <button style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                backgroundColor: '#0086FF',
                                color: 'white',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer'
                            }}>Order Now</button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResidentialPricing;
