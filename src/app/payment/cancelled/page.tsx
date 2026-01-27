"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ShoppingCart, Home } from 'lucide-react';

const PaymentCancelledPage = () => {
    const router = useRouter();

    return (
        <main style={{ backgroundColor: '#F8FBFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: 'white',
                padding: '60px 40px',
                borderRadius: '32px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#FEF3C7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 30px'
                }}>
                    <AlertCircle size={40} color="#D97706" />
                </div>

                <h1 style={{ fontSize: '32px', color: '#163561', fontWeight: '800', marginBottom: '16px' }}>
                    Payment Cancelled
                </h1>
                <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '40px', lineHeight: '1.6' }}>
                    You have cancelled the payment process. No charges were made to your account.
                </p>

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
                        onClick={() => router.push('/checkout')}
                        style={{
                            padding: '16px',
                            borderRadius: '16px',
                            backgroundColor: '#0086FF',
                            color: 'white',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <ShoppingCart size={18} /> Resume Checkout
                    </button>
                </div>
            </div>
        </main>
    );
};

export default PaymentCancelledPage;
