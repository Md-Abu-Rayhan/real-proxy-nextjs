"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import LoginHeader from '@/components/layout/LoginHeader';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
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
            const response = await axios.post('https://localhost:7044/api/Auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data && response.data.token) {
                // Save token to localStorage
                localStorage.setItem('auth_token', response.data.token);
                toast.success("Login successful!");

                // Redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard');
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
                                Trusted by over 150,000 global <br />
                                users, invalid IPs are free
                            </h1>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: '#00B67A' }}>
                                    <CheckCircle2 size={18} fill="currentColor" color="white" />
                                </div>
                                <span style={{ fontSize: '16px', color: '#163561', fontWeight: '500' }}>More than 200 million IPs worldwide</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: '#00B67A' }}>
                                    <CheckCircle2 size={18} fill="currentColor" color="white" />
                                </div>
                                <span style={{ fontSize: '16px', color: '#163561', fontWeight: '500' }}>Residential IP score reaches above 99%</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: '#00B67A' }}>
                                    <CheckCircle2 size={18} fill="currentColor" color="white" />
                                </div>
                                <span style={{ fontSize: '16px', color: '#163561', fontWeight: '500' }}>Highly reliable with 99.9% uptime</span>
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
                            <h2 style={{ fontSize: '26px', color: '#163561', marginBottom: '32px', fontWeight: '700' }}>Login</h2>

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
                                    <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '16px' }} />
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
                                        placeholder="Email"
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
                                            placeholder="Password"
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
                                    {isLoading ? "Logging in..." : "Log in"}
                                </button>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', alignItems: 'flex-start' }}>
                                    <Link href="/forgot-password" style={{ color: '#0086FF', fontSize: '14px', cursor: 'pointer' }}>
                                        Forgot your password ?
                                    </Link>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        No account? <Link href="/register" style={{ color: '#0086FF', fontWeight: '500' }}>Sign Up</Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                {/* House Illustration (Bottom Left) */}
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

