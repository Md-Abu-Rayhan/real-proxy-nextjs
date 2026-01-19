"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import LoginHeader from '@/components/layout/LoginHeader';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        invitationCode: '',
        agree: false
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

        // Validation
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        if (!formData.agree) {
            toast.error("You must agree to the Terms and Privacy Policy.");
            return;
        }



        setIsLoading(true);
        try {
            const response = await axios.post('https://api.realproxy.net/api/Auth/register', {
                email: formData.email,
                password: formData.password,
                invitationCode: formData.invitationCode
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("User registered successfully!");
                // Optionally redirect to login
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            const message = error.response?.data || "Registration failed. Please try again.";
            toast.error(typeof message === 'string' ? message : "Registration failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            <LoginHeader />

            <section className="register-section">
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'center', maxWidth: '1400px', minHeight: 'calc(100vh - 60px)' }}>

                    {/* Left Column: Marketing */}
                    <div className="register-marketing" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: '42px', color: '#163561', marginBottom: '12px', lineHeight: '1.2' }}>
                                Start Your Journey with <br />
                                <span style={{ color: '#0086FF' }}>Real 5Proxy</span>
                            </h1>
                            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
                                Join 100,000+ users worldwide and experience the most stable residential proxy service.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ backgroundColor: 'rgba(0, 134, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                    <CheckCircle2 color="#0086FF" size={24} />
                                </div>
                                <span style={{ fontWeight: '500', color: '#163561' }}>200M+ Real Residential IPs</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ backgroundColor: 'rgba(0, 134, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                    <Globe color="#0086FF" size={24} />
                                </div>
                                <span style={{ fontWeight: '500', color: '#163561' }}>190+ Countries & Regions</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ backgroundColor: 'rgba(0, 134, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                    <CheckCircle2 color="#0086FF" size={24} />
                                </div>
                                <span style={{ fontWeight: '500', color: '#163561' }}>Industry-leading Security</span>
                            </div>
                        </div>

                        {/* Social Proof */}
                        <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '800', fontSize: '24px', color: '#163561' }}>4.8/5</span>
                                <span style={{ fontSize: '12px', color: '#8898AA' }}>Trustpilot</span>
                            </div>
                            <div style={{ width: '1px', backgroundColor: '#E2E8F0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '800', fontSize: '24px', color: '#163561' }}>G2</span>
                                <span style={{ fontSize: '12px', color: '#8898AA' }}>Leader 2024</span>
                            </div>
                        </div>
                    </div>

                    <div className="register-card" style={{
                        backgroundColor: 'white',
                        padding: '32px 40px',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                        border: '1px solid #F1F5F9',
                        width: '100%',
                        maxWidth: '540px',
                        margin: '20px 0'
                    }}>
                        <h2 style={{ fontSize: '24px', color: '#163561', marginBottom: '10px' }}>Create Account</h2>
                        {/* Social Logins */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                border: '1px solid #E2E8F0',
                                borderRadius: '10px',
                                backgroundColor: 'white',
                                fontWeight: '500',
                                fontSize: '15px'
                            }}>
                                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px' }} />
                                Google
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#F1F5F9' }} />
                            <span style={{ color: '#94A3B8', fontSize: '14px' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#F1F5F9' }} />
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#163561' }}>Email address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '15px' }}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#163561' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter password"
                                        style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '15px' }}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', border: 'none', background: 'none' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#163561' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '15px' }}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', border: 'none', background: 'none' }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#163561' }}>Invitation Code (Optional)</label>
                                <input
                                    type="text"
                                    name="invitationCode"
                                    placeholder="Enter invitation code"
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '15px' }}
                                    onChange={handleChange}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                                <input
                                    type="checkbox"
                                    name="agree"
                                    id="agree"
                                    style={{ width: '18px', height: '18px', borderRadius: '4px' }}
                                    onChange={handleChange}
                                />
                                <label htmlFor="agree" style={{ fontSize: '14px', color: '#666' }}>
                                    I have read and agree to the <a href="#" style={{ color: '#0086FF' }}>Terms of Service</a> and <a href="#" style={{ color: '#0086FF' }}>Privacy Policy</a>.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '10px',
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
                                {isLoading && <Loader2 className="animate-spin" size={20} />}
                                {isLoading ? "Signing Up..." : "Sign Up"}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: '16px' }}>
                                Already have an account? <Link href="/login" style={{ color: '#0086FF', fontWeight: '600' }}>Log In</Link>
                            </p>
                        </form>
                    </div>

                </div>
            </section>

            <style jsx>{`
                @media (max-width: 1024px) {
                    .container {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                    .register-marketing {
                        text-align: center;
                        align-items: center;
                        padding: 0 20px;
                    }
                    .register-marketing h1 { font-size: 32px !important; }
                    .register-marketing div { align-items: center; }
                }

                @media (max-width: 600px) {
                    .register-card {
                        padding: 24px !important;
                        border-radius: 16px !important;
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

export default RegisterPage;

