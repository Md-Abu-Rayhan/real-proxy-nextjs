"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    User,
    Mail,
    Phone,
    Wallet,
    Gift,
    Copy,
    Check,
    Save,
    RotateCcw,
    Lock,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/config';
import { useWallet } from '@/context/WalletContext';

interface UserProfileData {
    id: number;
    email: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    walletBalance?: number;
    referralCode?: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const { balanceUsd, refreshWallet } = useWallet();

    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [copiedRef, setCopiedRef] = useState<boolean>(false);

    // Profile state
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [fullName, setFullName] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [originalName, setOriginalName] = useState<string>('');
    const [originalPhone, setOriginalPhone] = useState<string>('');

    // Dark mode observer matching residential-proxies
    useEffect(() => {
        setIsMounted(true);
        const checkDarkMode = () => {
            if (typeof document !== 'undefined') {
                setIsDarkMode(document.body.classList.contains('dark-mode'));
            }
        };
        checkDarkMode();

        const observer = new MutationObserver(() => {
            checkDarkMode();
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Theme object matching the dashboard standard
    const theme = isDarkMode ? {
        bg: '#080C14',
        card: '#0F172A',
        cardBorder: 'rgba(255, 255, 255, 0.08)',
        inputBg: '#1E293B',
        inputBorder: 'rgba(255, 255, 255, 0.12)',
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        accent: '#0086FF',
        infoBg: '#131D31',
        infoBorder: 'rgba(255, 255, 255, 0.06)'
    } : {
        bg: '#F8FAFC',
        card: '#FFFFFF',
        cardBorder: '#E2E8F0',
        inputBg: '#F8FAFC',
        inputBorder: '#CBD5E1',
        text: '#0F172A',
        textMuted: '#64748B',
        accent: '#0086FF',
        infoBg: '#F8FAFC',
        infoBorder: '#E2E8F0'
    };

    // Bangladeshi 11-digit phone validation
    const isValidBdPhone = useCallback((phone?: string | null): boolean => {
        if (!phone) return false;
        const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
        const standard = cleaned.startsWith('880') ? cleaned.slice(2) : cleaned;
        if (standard.length !== 11) return false;
        if (!standard.startsWith('01')) return false;
        if (standard === '01700000000' || standard === '01000000000' || standard === '01111111111') return false;
        return true;
    }, []);

    const isDirty = fullName.trim() !== originalName.trim() || phoneNumber.trim() !== originalPhone.trim();

    // Fetch Profile
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error("Please login to view your profile.");
                router.push('/login');
                return;
            }

            const res = await axios.get(`${API_URL}/api/Auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                const data: UserProfileData = res.data;
                setProfile(data);

                const currentName = data.fullName?.trim() || '';
                const currentPhone = data.phoneNumber?.trim() || '';

                setFullName(currentName);
                setPhoneNumber(currentPhone);
                setOriginalName(currentName);
                setOriginalPhone(currentPhone);

                if (currentName && currentName.length >= 2) {
                    localStorage.setItem('user_name', currentName);
                } else {
                    localStorage.removeItem('user_name');
                }

                if (currentPhone && isValidBdPhone(currentPhone)) {
                    localStorage.setItem('user_phone', currentPhone);
                } else {
                    localStorage.removeItem('user_phone');
                }
            }
        } catch (err: any) {
            console.error("Failed to load profile:", err);
            toast.error(err?.response?.data?.message || "Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    }, [router, isValidBdPhone]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Handle Save
    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const cleanName = fullName.trim();
        const cleanPhone = phoneNumber.trim();

        if (cleanName.length > 0 && cleanName.length < 2) {
            toast.error("Full Name must be at least 2 characters long.");
            return;
        }

        if (cleanPhone.length > 0 && !isValidBdPhone(cleanPhone)) {
            toast.error("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error("Session expired. Please login again.");
                router.push('/login');
                return;
            }

            const res = await axios.post(`${API_URL}/api/Auth/profile`, {
                fullName: cleanName,
                phoneNumber: cleanPhone
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                toast.success("Profile updated successfully!");

                setOriginalName(cleanName);
                setOriginalPhone(cleanPhone);

                if (cleanName && cleanName.length >= 2) {
                    localStorage.setItem('user_name', cleanName);
                } else {
                    localStorage.removeItem('user_name');
                }

                if (cleanPhone && isValidBdPhone(cleanPhone)) {
                    localStorage.setItem('user_phone', cleanPhone);
                } else {
                    localStorage.removeItem('user_phone');
                }

                if (profile) {
                    setProfile({
                        ...profile,
                        fullName: cleanName,
                        phoneNumber: cleanPhone
                    });
                }
            } else {
                toast.error(res.data?.message || "Failed to update profile.");
            }
        } catch (err: any) {
            console.error("Save profile error:", err);
            toast.error(err?.response?.data?.message || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Handle Reset
    const handleReset = () => {
        setFullName(originalName);
        setPhoneNumber(originalPhone);
        toast("Form reverted to saved profile.", { icon: '↩️' });
    };

    // Copy Referral Code
    const handleCopyRef = () => {
        if (!profile?.referralCode) return;
        navigator.clipboard.writeText(profile.referralCode);
        setCopiedRef(true);
        toast.success("Referral code copied to clipboard!");
        setTimeout(() => setCopiedRef(false), 2000);
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 0 32px 0',
            fontFamily: "'Poppins', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            {/* Header Box */}
            <div style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0, 134, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <User color="#0086FF" size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: theme.text,
                            margin: '0 0 4px 0'
                        }}>
                            My Profile
                        </h1>
                        <p style={{
                            fontSize: '13.5px',
                            color: theme.textMuted,
                            margin: 0
                        }}>
                            Manage your personal details, contact information, and account credentials.
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: theme.infoBg,
                    border: `1px solid ${theme.infoBorder}`,
                    padding: '8px 16px',
                    borderRadius: '10px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase' }}>
                            Wallet Balance
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#0086FF' }}>
                            ${(profile?.walletBalance ?? balanceUsd).toFixed(2)} USD
                        </span>
                    </div>
                    <Link
                        href="/dashboard/wallet"
                        style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: '#0086FF',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <span>Top-Up</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>

            {/* Grid Layout: Left Column Form, Right Column Read-Only Account Info */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px'
            }}>
                {/* Left Card: Editable Information */}
                <div style={{
                    background: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '20px',
                        paddingBottom: '16px',
                        borderBottom: `1px solid ${theme.cardBorder}`
                    }}>
                        <User size={18} color="#0086FF" />
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, margin: 0 }}>
                            Edit Personal Details
                        </h2>
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Full Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                                Full Name <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <User size={16} color={theme.textMuted} style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. Rayhan Ahmed"
                                    maxLength={80}
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        padding: '0 38px',
                                        backgroundColor: theme.inputBg,
                                        border: `1.5px solid ${theme.inputBorder}`,
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        color: theme.text,
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {fullName.trim().length >= 2 && (
                                    <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '14px', pointerEvents: 'none' }} />
                                )}
                            </div>
                            <span style={{ fontSize: '12px', color: theme.textMuted }}>
                                Your legal name for payment gateway invoice verification.
                            </span>
                        </div>

                        {/* Mobile Phone Number */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                                Mobile Phone Number (11 digits) <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Phone size={16} color={theme.textMuted} style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    maxLength={15}
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        padding: '0 38px',
                                        backgroundColor: theme.inputBg,
                                        border: `1.5px solid ${theme.inputBorder}`,
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        color: theme.text,
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {isValidBdPhone(phoneNumber) ? (
                                    <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '14px', pointerEvents: 'none' }} />
                                ) : phoneNumber.length > 0 ? (
                                    <AlertCircle size={16} color="#F59E0B" style={{ position: 'absolute', right: '14px', pointerEvents: 'none' }} />
                                ) : null}
                            </div>
                            <span style={{ fontSize: '12px', color: theme.textMuted }}>
                                Required 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={!isDirty || saving}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 18px',
                                    backgroundColor: theme.inputBg,
                                    border: `1px solid ${theme.inputBorder}`,
                                    borderRadius: '10px',
                                    fontSize: '13.5px',
                                    fontWeight: '600',
                                    color: theme.text,
                                    cursor: !isDirty || saving ? 'not-allowed' : 'pointer',
                                    opacity: !isDirty || saving ? 0.5 : 1,
                                    transition: 'all 0.15s'
                                }}
                            >
                                <RotateCcw size={15} />
                                <span>Reset</span>
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !isDirty}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 22px',
                                    backgroundColor: '#0086FF',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '13.5px',
                                    fontWeight: '600',
                                    color: 'white',
                                    cursor: saving || !isDirty ? 'not-allowed' : 'pointer',
                                    opacity: saving || !isDirty ? 0.5 : 1,
                                    boxShadow: '0 4px 10px rgba(0, 134, 255, 0.25)',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Card: Read-Only System Details */}
                <div style={{
                    background: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '16px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        paddingBottom: '16px',
                        borderBottom: `1px solid ${theme.cardBorder}`
                    }}>
                        <Lock size={18} color="#6366F1" />
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, margin: 0 }}>
                            Account Information
                        </h2>
                    </div>

                    {/* Email */}
                    <div style={{
                        background: theme.infoBg,
                        border: `1px solid ${theme.infoBorder}`,
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase' }}>
                                Registered Email
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>
                                {profile?.email || '—'}
                            </span>
                        </div>
                        <Lock size={14} color={theme.textMuted} />
                    </div>

                    {/* User ID */}
                    <div style={{
                        background: theme.infoBg,
                        border: `1px solid ${theme.infoBorder}`,
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase' }}>
                                Account User ID
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: theme.text }}>
                                #{profile?.id || '—'}
                            </span>
                        </div>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#10B981',
                            background: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
                            padding: '3px 8px',
                            borderRadius: '6px'
                        }}>
                            Active
                        </span>
                    </div>

                    {/* Referral Code */}
                    <div style={{
                        background: theme.infoBg,
                        border: `1px solid ${theme.infoBorder}`,
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase' }}>
                            Referral Code
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                readOnly
                                value={profile?.referralCode || 'NOT_ASSIGNED'}
                                style={{
                                    flex: 1,
                                    height: '38px',
                                    padding: '0 12px',
                                    background: theme.card,
                                    border: `1.5px dashed ${theme.inputBorder}`,
                                    borderRadius: '8px',
                                    fontSize: '13.5px',
                                    fontWeight: '700',
                                    color: '#0086FF',
                                    letterSpacing: '0.04em',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleCopyRef}
                                disabled={!profile?.referralCode}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '0 14px',
                                    backgroundColor: isDarkMode ? 'rgba(0, 134, 255, 0.15)' : '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    fontWeight: '600',
                                    color: '#0086FF',
                                    cursor: 'pointer'
                                }}
                            >
                                {copiedRef ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                        <Link
                            href="/dashboard/affiliate"
                            style={{
                                fontSize: '12px',
                                color: '#EC4899',
                                fontWeight: '600',
                                textDecoration: 'none',
                                marginTop: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span>Affiliate Dashboard</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
