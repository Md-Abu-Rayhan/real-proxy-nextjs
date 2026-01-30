"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import LoginHeader from '@/components/layout/LoginHeader';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const LoginPage = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error("Please enter email and password.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('https://api.realproxy.net/api/Auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data && response.data.token) {
                // Save token to localStorage
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user_email', formData.email);
                toast.success("Login successful!");

                // Redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard/traffic-setup');
                }, 1000);
            }
        } catch (error: any) {
            console.error("Login error:", error);
            const message = error.response?.data || "Login failed. Please check your credentials.";
            toast.error(typeof message === 'string' ? message : "Login failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main style={{ backgroundColor: '#F8FBFF', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <LoginHeader />

            <section className="login-section">
                <div className="container" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    minHeight: 'calc(100vh - 60px)',
                    position: 'relative',
                    zIndex: 1,
                    margin: '0 auto',
                    padding: '0 20px'
                }}>

                    {/* Left Column: Marketing */}
                    <div className="login-marketing" style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '170px' }}>


                        <div>
                            <h1 style={{ fontSize: '36px', color: '#163561', marginBottom: '20px', lineHeight: '1.2', fontWeight: '700' }}>
                                {t.login.marketing1}
                            </h1>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: '#00B67A' }}>
                                    <CheckCircle2 size={18} fill="currentColor" color="white" />
                                </div>
                                <span style={{ fontSize: '16px', color: '#163561', fontWeight: '500' }}>{t.login.marketing2}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: '#00B67A' }}>
                                    <CheckCircle2 size={18} fill="currentColor" color="white" />
                                </div>
                                <span style={{ fontSize: '16px', color: '#163561', fontWeight: '500' }}>{t.login.marketing3}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: '#00B67A' }}>
                                    <CheckCircle2 size={18} fill="currentColor" color="white" />
                                </div>
                                <span style={{ fontSize: '16px', color: '#163561', fontWeight: '500' }}>{t.login.marketing4}</span>
                            </div>
                        </div>


                    </div>

                    {/* Right Column: Login Form */}
                    <div className="login-card-container" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="login-card" style={{
                            backgroundColor: 'white',
                            padding: '40px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            width: '100%',
                            maxWidth: '460px',
                            textAlign: 'center'
                        }}>
                            <h2 style={{ fontSize: '26px', color: '#163561', marginBottom: '32px', fontWeight: '700' }}>{t.login.title}</h2>

                            {/* Social Logins */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '24px' }}>
                                <button style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '10px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    color: '#333'
                                }}>
                                    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z" fill="#EA4335" />
                                    </svg>
                                    Log in with Google
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#F1F5F9' }} />
                                <span style={{ color: '#94A3B8', fontSize: '13px' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#F1F5F9' }} />
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder={t.login.email}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FBFF', fontSize: '15px', color: '#333' }}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder={t.login.password}
                                            style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FBFF', fontSize: '15px', color: '#333' }}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', border: 'none', background: 'none' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
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
                                        marginTop: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: isLoading ? 0.7 : 1,
                                        cursor: isLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isLoading && <Loader2 className="animate-spin" size={18} />}
                                    {isLoading ? t.common.loading : t.login.title}
                                </button>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', alignItems: 'flex-start' }}>
                                    <Link href="/forgot-password" style={{ color: '#0086FF', fontSize: '14px', cursor: 'pointer' }}>
                                        {t.login.forgotPassword}
                                    </Link>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        {t.login.noAccount} <Link href="/register" style={{ color: '#0086FF', fontWeight: '500' }}>{t.nav.signup}</Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '-20px',
                    width: '400px',
                    height: '400px',
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: 0.5
                }}>
                    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                        <circle cx="100" cy="300" r="150" fill="url(#paint0_radial)" fillOpacity="0.4" />
                        <circle cx="50" cy="350" r="100" fill="url(#paint1_radial)" fillOpacity="0.3" />
                        <path d="M0 400C100 350 200 380 300 300C400 220 450 150 400 0H0V400Z" fill="url(#paint2_linear)" fillOpacity="0.1" />
                        <defs>
                            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 300) rotate(90) scale(150)">
                                <stop stopColor="#0086FF" />
                                <stop offset="1" stopColor="#0086FF" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 350) rotate(90) scale(100)">
                                <stop stopColor="#163561" />
                                <stop offset="1" stopColor="#163561" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="paint2_linear" x1="0" y1="400" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#0086FF" />
                                <stop offset="1" stopColor="#163561" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </section>

            <style jsx>{`
                @media (max-width: 992px) {
                    .login-marketing {
                        display: none !important;
                    }
                    .container {
                        grid-template-columns: 1fr !important;
                        justify-content: center !important;
                    }
                    .login-card-container {
                        width: 100% !important;
                    }
                }

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

export default LoginPage;

