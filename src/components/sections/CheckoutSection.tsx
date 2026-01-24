"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Bitcoin, Wallet, ArrowRight, ShieldCheck, Check } from 'lucide-react';

const CheckoutSection = () => {
    const [selectedMethod, setSelectedMethod] = useState('bitcoin');

    const paymentMethods = [
        { id: 'bitcoin', name: 'Bitcoin', icon: <Bitcoin size={48} />, desc: 'BTC, ETH, USDT, LTC' },
        { id: 'bkash', name: 'bKash', icon: <img src="/bKash-Logo.png" alt="bkash" style={{ height: '48px', width: 'auto' }} />, desc: 'Mobile Banking' },
        { id: 'nagad', name: 'Nagad', icon: <img src="/Nagad-Logo.png" alt="nagad" style={{ height: '48px', width: 'auto' }} />, desc: 'Mobile Banking' },
    ];

    return (
        <section id="checkout" className="section-padding" style={{ backgroundColor: '#fff' }}>
            <div className="container">
                <div className="checkout-grid">

                    {/* Payment Methods Side */}
                    <div className="payment-methods-side">
                        <h2 className="payment-title" style={{ color: '#163561' }}>Select your preferred method of payment</h2>

                        <div className="methods-grid">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    style={{
                                        padding: '24px',
                                        borderRadius: '20px',
                                        border: '2px solid',
                                        borderColor: selectedMethod === method.id ? '#0086FF' : '#f0f0f0',
                                        backgroundColor: selectedMethod === method.id ? 'rgba(0,134,255,0.02)' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        position: 'relative'
                                    }}
                                >
                                    {selectedMethod === method.id && (
                                        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                            <div style={{ backgroundColor: '#0086FF', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Check size={14} color="white" strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ color: selectedMethod === method.id ? '#0086FF' : '#666', marginBottom: '16px' }}>
                                        {method.icon}
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '4px', color: '#163561' }}>{method.name}</div>
                                    <div style={{ fontSize: '13px', color: '#8898AA' }}>{method.desc}</div>
                                </div>
                            ))}
                        </div>

                        <div className="info-box" style={{ marginTop: '40px', padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <ShieldCheck size={24} color="#28A745" />
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                Your connection is encrypted and payment details are safe. Locked with industry-standard 256-bit SSL encryption.
                            </p>
                        </div>
                    </div>

                    {/* Order Summary Side */}
                    <div className="summary-side">
                        <div className="summary-card" style={{
                            padding: '40px',
                            backgroundColor: '#041026',
                            borderRadius: '32px',
                            color: 'white',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ fontSize: '24px', marginBottom: '30px', color: 'white' }}>Order Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Plan</span>
                                    <span style={{ fontWeight: '600' }}>Residential Proxies</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Package</span>
                                    <span style={{ fontWeight: '600' }}>100GB Data</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Unit Price</span>
                                    <span style={{ fontWeight: '600' }}>$1.2 / GB</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Discount</span>
                                    <span style={{ fontWeight: '600', color: '#ff4d4d' }}>-$52.00</span>
                                </div>
                            </div>

                            <div style={{
                                padding: '24px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                marginBottom: '30px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Total Amount Due</div>
                                <div className="total-amount" style={{ fontSize: '42px', fontWeight: '800', color: '#0086FF' }}>$120.00</div>
                            </div>

                            <button style={{
                                width: '100%',
                                padding: '20px',
                                borderRadius: '16px',
                                backgroundColor: '#0086FF',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '18px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s ease'
                            }} className="pay-btn">
                                Pay Now <ArrowRight size={20} />
                            </button>

                            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                                By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy. All sales are final.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1.25fr 1fr;
                    gap: 50px;
                    align-items: start;
                }
                .summary-side {
                    position: sticky;
                    top: 100px;
                }
                .methods-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                }
                .payment-title {
                    font-size: 32px;
                    margin-bottom: 40px;
                }
                .pay-btn:hover {
                    background-color: #0076e5;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 134, 255, 0.3);
                }
                @media (max-width: 1024px) {
                    .checkout-grid { grid-template-columns: 1fr; gap: 40px; }
                    .summary-side { position: relative; top: 0; }
                    .payment-title { font-size: 24px; margin-bottom: 24px; text-align: center; }
                    .info-box { flex-direction: column; text-align: center; }
                }
                @media (max-width: 768px) {
                    .methods-grid { grid-template-columns: 1fr; }
                    .summary-card { padding: 30px 20px !important; border-radius: 24px !important; }
                    .total-amount { font-size: 32px !important; }
                }
            `}</style>
        </section>
    );
};

export default CheckoutSection;
