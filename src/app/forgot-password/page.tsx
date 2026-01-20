"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Key, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import LoginHeader from '@/components/layout/LoginHeader';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const ForgotPasswordPage = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('https://api.realproxy.net/api/Auth/forget-password/send-otp', {
                email: email
            });

            if (response.data && response.data.message) {
                toast.success(response.data.message);
                setStep(2);
            } else {
                // Fallback if message isn't in anticipated format but success
                toast.success('OTP sent successfully.');
                setStep(2);
            }
        } catch (error: any) {
            console.error("Send OTP error:", error);
            // API might return "User not found." as a string or in an object
            const errorMessage = error.response?.data?.message || error.response?.data || "Failed to send OTP.";
            toast.error(typeof errorMessage === 'string' ? errorMessage : "Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || !newPassword) {
            toast.error("Please enter OTP and new password.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('https://api.realproxy.net/api/Auth/forget-password/reset-password', {
                email: email,
                otp: otp,
                newPassword: newPassword
            });

            if (response.data && response.data.message) {
                toast.success(response.data.message);
                // Redirect to login after success
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast.success('Password reset successfully.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }

        } catch (error: any) {
            console.error("Reset Password error:", error);
            const errorMessage = error.response?.data?.message || error.response?.data || "Failed to reset password.";
            toast.error(typeof errorMessage === 'string' ? errorMessage : "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main style={{ backgroundColor: '#F8FBFF', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <LoginHeader />
            <section className="login-section">
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 60px)',
                    padding: '0 20px',
                    position: 'relative',
                    zIndex: 1
                }}>

                    <div className="login-card" style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        width: '100%',
                        maxWidth: '460px',
                        textAlign: 'center'
                    }}>
                        {step === 1 ? (
                            <>
                                <h2 style={{ fontSize: '26px', color: '#163561', marginBottom: '10px', fontWeight: '700' }}>{t.forgotPassword.title}</h2>
                                <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '15px' }}>{t.forgotPassword.instruction}</p>

                                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#163561', fontWeight: '500', fontSize: '14px' }}>{t.forgotPassword.emailLabel}</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={t.forgotPassword.emailPlaceholder}
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FBFF', fontSize: '15px', color: '#333' }}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            backgroundColor: '#0086FF',
                                            color: 'white',
                                            border: 'none',
                                            marginTop: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            opacity: isLoading ? 0.7 : 1,
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        {isLoading && <Loader2 className="animate-spin" size={18} />}
                                        {isLoading ? t.forgotPassword.sending : t.forgotPassword.sendCode}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '26px', color: '#163561', marginBottom: '10px', fontWeight: '700' }}>{t.forgotPassword.resetTitle}</h2>
                                <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '15px' }}>{t.forgotPassword.resetInstruction} <b>{email}</b> {t.forgotPassword.resetInstructionSuffix}</p>

                                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#163561', fontWeight: '500', fontSize: '14px' }}>{t.forgotPassword.otpLabel}</label>
                                        <div style={{ position: 'relative' }}>
                                            <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder={t.forgotPassword.otpPlaceholder}
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FBFF', fontSize: '15px', color: '#333' }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#163561', fontWeight: '500', fontSize: '14px' }}>{t.forgotPassword.newPasswordLabel}</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder={t.forgotPassword.newPasswordPlaceholder}
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FBFF', fontSize: '15px', color: '#333' }}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-primary"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            backgroundColor: '#0086FF',
                                            color: 'white',
                                            border: 'none',
                                            marginTop: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            opacity: isLoading ? 0.7 : 1,
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        {isLoading && <Loader2 className="animate-spin" size={18} />}
                                        {isLoading ? t.forgotPassword.resetting : t.forgotPassword.resetButton}
                                    </button>
                                </form>
                            </>
                        )}

                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
                            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                                <ArrowLeft size={16} />
                                {t.forgotPassword.backToLogin}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decoration */}
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    width: '320px',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}>
                    <img src="https://static.922proxy.com/img/login_bottom_left.png" alt="Decoration" style={{ width: '100%', display: 'block' }} />
                </div>
            </section>
            <style jsx>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
};

export default ForgotPasswordPage;
