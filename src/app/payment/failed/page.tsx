"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, RefreshCcw, Headset, Home } from 'lucide-react';

const PaymentFailedPage = () => {
    const router = useRouter();

    return (
        <main style={{ backgroundColor: '#FFF5F5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: 'white',
                padding: '60px 40px',
                borderRadius: '32px',
                boxShadow: '0 20px 50px rgba(220, 38, 38, 0.05)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#FFF1F2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 30px'
                }}>
                    <XCircle size={40} color="#DC2626" />
                </div>

                <h1 style={{ fontSize: '32px', color: '#991B1B', fontWeight: '800', marginBottom: '16px' }}>
                    Payment Failed
                </h1>
                <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '40px', lineHeight: '1.6' }}>
                    We couldn't process your payment. This could be due to insufficient funds, an expired card, or a temporary issue with the payment gateway.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button
                        onClick={() => router.push('/checkout')}
                        style={{
                            padding: '18px',
                            borderRadius: '16px',
                            backgroundColor: '#DC2626',
                            color: 'white',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <RefreshCcw size={18} /> Try Again
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                padding: '16px',
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: 'white',
                                color: '#163561',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Home size={18} /> Home
                        </button>
                        <button
                            onClick={() => window.open('mailto:support@realproxy.net')}
                            style={{
                                padding: '16px',
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: 'white',
                                color: '#163561',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Headset size={18} /> Support
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PaymentFailedPage;
