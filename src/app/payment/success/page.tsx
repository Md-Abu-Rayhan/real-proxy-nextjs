"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Suspense } from 'react';

const PaymentSuccessContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(true);
    const [paymentDetails, setPaymentDetails] = useState<any>(null);

    const merchantTransactionId = searchParams.get('merchantTransactionId');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!merchantTransactionId) {
                setIsVerifying(false);
                return;
            }

            try {
                const token = localStorage.getItem('auth_token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.realproxy.net';

                // Call verification endpoint
                const response = await axios.get(`${apiUrl}/api/Payment/verify/${merchantTransactionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data) {
                    setPaymentDetails(response.data);
                }
            } catch (error) {
                console.error("Verification error:", error);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [merchantTransactionId]);

    if (isVerifying) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FBFF' }}>
                <Loader2 className="animate-spin" size={48} color="#0086FF" />
                <p style={{ marginTop: '20px', color: '#163561', fontWeight: '600' }}>Verifying your payment...</p>
                <style jsx>{`
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

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
                    backgroundColor: '#E8FBF0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 30px'
                }}>
                    <CheckCircle2 size={40} color="#00B67A" />
                </div>

                <h1 style={{ fontSize: '32px', color: '#163561', fontWeight: '800', marginBottom: '16px' }}>
                    Payment Successful!
                </h1>
                <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '40px', lineHeight: '1.6' }}>
                    Thank you for your purchase. Your account has been updated with the new credits.
                </p>

                {paymentDetails && (
                    <div style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '20px',
                        padding: '24px',
                        marginBottom: '40px',
                        textAlign: 'left'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748B', fontSize: '14px' }}>Transaction ID</span>
                            <span style={{ color: '#163561', fontWeight: '600', fontSize: '14px' }}>{merchantTransactionId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748B', fontSize: '14px' }}>Amount Paid</span>
                            <span style={{ color: '#163561', fontWeight: '600', fontSize: '14px' }}>${paymentDetails.totalAmount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontSize: '14px' }}>Status</span>
                            <span style={{ backgroundColor: '#E8FBF0', color: '#00B67A', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                Verified
                            </span>
                        </div>
                    </div>
                )}

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
                        onClick={() => router.push('/dashboard/traffic-setup')}
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
                        Dashboard <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </main>
    );
};

const PaymentSuccessPage = () => {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FBFF' }}>
                <Loader2 className="animate-spin" size={48} color="#0086FF" />
                <p style={{ marginTop: '20px', color: '#163561', fontWeight: '600' }}>Loading payment status...</p>
                <style jsx>{`
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
};

export default PaymentSuccessPage;
