"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
    Handshake,
    MessageCircle,
    Send,
    Mail,
    Copy,
    Check,
    ExternalLink,
    Zap,
    ShieldCheck,
    Users,
    ArrowRight,
    HelpCircle,
    ChevronDown,
    Sparkles,
    PhoneCall,
    Wallet,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    Shield,
    Clock,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ResellerStatus {
    isReseller: boolean;
    email: string;
    walletBalanceUsd: number;
    residentialRateUsd: number;
    premiumResidentialRateUsd: number;
    totalTransferredGb: number;
    totalSpentUsd: number;
    totalTransfersCount: number;
    uniqueClientsCount: number;
}

interface TransferLog {
    id: number;
    targetEmail: string;
    proxyType: string;
    bandwidthGb: number;
    ratePerGbUsd: number;
    totalCostUsd: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceId: string;
    status: string;
    createdAt: string;
}

export default function ResellerPage() {
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [statusLoading, setStatusLoading] = useState<boolean>(true);
    const [resellerStatus, setResellerStatus] = useState<ResellerStatus | null>(null);

    // Onboarding interactive form state (for non-resellers)
    const [userEmail, setUserEmail] = useState<string>('');
    const [expectedVolume, setExpectedVolume] = useState<string>('250 GB');
    const [inquiryProxyType, setInquiryProxyType] = useState<string>('Residential & Premium');
    const [customNote, setCustomNote] = useState<string>('');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Reseller Command Center Dispatch Form State (for authorized resellers)
    const [targetEmail, setTargetEmail] = useState<string>('');
    const [selectedProxyType, setSelectedProxyType] = useState<'Residential' | 'Premium Residential'>('Residential');
    const [bandwidthGb, setBandwidthGb] = useState<number>(10);
    const [recipientStatus, setRecipientStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [recipientMessage, setRecipientMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

    // Reseller Transfers History
    const [transfers, setTransfers] = useState<TransferLog[]>([]);
    const [transfersLoading, setTransfersLoading] = useState<boolean>(false);
    const [transfersPage, setTransfersPage] = useState<number>(1);
    const [totalTransfers, setTotalTransfers] = useState<number>(0);
    const pageSize = 10;

    // Dark mode observer
    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('user_email') || '';
            setUserEmail(email);
        }

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

    // Theme object matching dashboard standard
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
        infoBorder: 'rgba(255, 255, 255, 0.06)',
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        badgeText: '#34D399',
        accentGlow: 'rgba(0, 134, 255, 0.12)'
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
        infoBorder: '#E2E8F0',
        badgeBg: '#ECFDF5',
        badgeText: '#059669',
        accentGlow: 'rgba(0, 134, 255, 0.06)'
    };

    // Fetch Reseller Status
    const fetchStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setStatusLoading(false);
                return;
            }
            const res = await axios.get('/api/Reseller/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResellerStatus(res.data);
        } catch (err) {
            console.warn('Could not fetch reseller status:', err);
        } finally {
            setStatusLoading(false);
        }
    }, []);

    // Fetch Reseller Transfers History
    const fetchTransfers = useCallback(async (page = 1) => {
        setTransfersLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            const res = await axios.get('/api/Reseller/transfers', {
                params: { page, pageSize },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                setTransfers(res.data.items || []);
                setTotalTransfers(res.data.totalCount || 0);
            }
        } catch (err) {
            console.error('Failed to load transfers history:', err);
        } finally {
            setTransfersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchStatus();
        }
    }, [isMounted, fetchStatus]);

    useEffect(() => {
        if (resellerStatus?.isReseller) {
            fetchTransfers(transfersPage);
        }
    }, [resellerStatus?.isReseller, transfersPage, fetchTransfers]);

    const lastCheckedEmailRef = useRef<string>('');
    const [isCheckingRecipient, setIsCheckingRecipient] = useState<boolean>(false);

    // Live Recipient Verification with 300ms Debounce
    useEffect(() => {
        const clean = targetEmail.trim().toLowerCase();
        if (!clean || clean.length < 5 || !clean.includes('@')) {
            setRecipientStatus('idle');
            setRecipientMessage('');
            lastCheckedEmailRef.current = '';
            return;
        }

        if (clean === lastCheckedEmailRef.current) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingRecipient(true);
            setRecipientStatus('checking');
            try {
                const token = localStorage.getItem('auth_token');
                const res = await axios.get('/api/Reseller/check-recipient', {
                    params: { email: clean },
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && res.data.exists) {
                    lastCheckedEmailRef.current = clean;
                    setRecipientStatus('valid');
                    setRecipientMessage(res.data.message || 'Valid recipient found');
                } else {
                    setRecipientStatus('invalid');
                    setRecipientMessage(res.data?.message || 'User not registered on RealProxy');
                }
            } catch {
                setRecipientStatus('invalid');
                setRecipientMessage('Unable to verify user');
            } finally {
                setIsCheckingRecipient(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [targetEmail]);

    // Fast-path First-Click Handler
    const handleTransferClick = async () => {
        const clean = targetEmail.trim().toLowerCase();
        if (!clean || clean.length < 5 || !clean.includes('@')) {
            toast.error('Please enter a valid recipient user email.');
            return;
        }

        if (!hasEnoughBalance) {
            toast.error('Insufficient wallet balance. Please top up your wallet first.');
            return;
        }

        // If already validated, open modal instantly!
        if (recipientStatus === 'valid' && clean === lastCheckedEmailRef.current) {
            setShowConfirmModal(true);
            return;
        }

        // If not yet validated or in-flight, verify inline immediately and proceed
        setIsCheckingRecipient(true);
        setRecipientStatus('checking');
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get('/api/Reseller/check-recipient', {
                params: { email: clean },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.exists) {
                lastCheckedEmailRef.current = clean;
                setRecipientStatus('valid');
                setRecipientMessage(res.data.message || 'Valid recipient found');
                setShowConfirmModal(true);
            } else {
                setRecipientStatus('invalid');
                setRecipientMessage(res.data?.message || 'User not registered on RealProxy');
                toast.error(res.data?.message || 'User not registered on RealProxy.');
            }
        } catch {
            setRecipientStatus('invalid');
            toast.error('Unable to verify user registration.');
        } finally {
            setIsCheckingRecipient(false);
        }
    };

    // Calculate Wholesale Costs
    const ratePerGb = selectedProxyType === 'Premium Residential'
        ? (resellerStatus?.premiumResidentialRateUsd || 0.90)
        : (resellerStatus?.residentialRateUsd || 0.70);

    const totalCost = Number((bandwidthGb * ratePerGb).toFixed(2));
    const walletBalance = resellerStatus?.walletBalanceUsd || 0;
    const hasEnoughBalance = walletBalance >= totalCost;
    const remainingBalance = Number((walletBalance - totalCost).toFixed(2));

    // Handle Transfer Execution
    const executeTransfer = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error('Session expired. Please log in again.');
                return;
            }

            const payload = {
                targetEmail: targetEmail.trim().toLowerCase(),
                proxyType: selectedProxyType,
                bandwidthGb: Number(bandwidthGb)
            };

            const res = await axios.post('/api/Reseller/transfer', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                toast.success(res.data.message || 'Proxy traffic transferred successfully!');
                setShowConfirmModal(false);
                setTargetEmail('');
                setRecipientStatus('idle');
                setRecipientMessage('');
                setBandwidthGb(10);
                // Refresh balance and table
                await fetchStatus();
                await fetchTransfers(1);
                setTransfersPage(1);
            } else {
                toast.error(res.data?.message || 'Transfer failed.');
            }
        } catch (err: unknown) {
            let errorMsg = 'Failed to execute transfer.';
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Copy to clipboard helper
    const copyToClipboard = async (text: string, fieldKey: string, successMessage: string) => {
        try {
            if (navigator?.clipboard) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            setCopiedField(fieldKey);
            toast.success(successMessage);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error('Failed to copy to clipboard.');
        }
    };

    // Constructed Inquiry Message (for regular users)
    const generatedInquiryMessage = `Hello RealProxy Admin,
I would like to apply for the RealProxy Reseller & Wholesale Program:
• Account Email: ${userEmail.trim() || '[My Account Email]'}
• Expected Monthly Volume: ${expectedVolume}
• Proxy Type: ${inquiryProxyType}
${customNote.trim() ? `• Custom Requirements: ${customNote.trim()}\n` : ''}
Please share your custom wholesale pricing and API access details.`;

    const whatsAppUrl = `https://wa.me/message/K4I5YCLO2D6TH1?text=${encodeURIComponent(generatedInquiryMessage)}`;
    const telegramUrl = 'https://t.me/Real_proxy_Recharge';

    const faqs = [
        {
            q: 'What are the official wholesale rates for Resellers?',
            a: 'Authorized resellers get Standard Residential Proxies at $0.70/GB (retail $1.00) and Premium Residential Proxies at $0.90/GB (retail $1.50) without expiration.'
        },
        {
            q: 'Can I provision proxies directly into my clients’ accounts?',
            a: 'Yes! Use this Reseller Command Center to dispatch GB directly to any client account. The cost is deducted directly from your wholesale wallet balance.'
        },
        {
            q: 'Do you provide an API for automated proxy provisioning?',
            a: 'Yes, full REST API endpoints are available to automate sub-user creation, bandwidth top-ups, and credential rotation directly from your own billing portal.'
        },
        {
            q: 'What payment options are available for wholesale wallet top-ups?',
            a: 'We accept bKash, Nagad, Binance Pay (zero network fee USDT), and Cryptomus automated crypto deposits (USDT, LTC, BTC).'
        }
    ];

    if (!isMounted || statusLoading) {
        return (
            <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #0086ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', color: theme.textMuted, fontSize: '14px' }}>Loading Reseller Portal...</p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // ==========================================
    // VIEW 1: AUTHORIZED RESELLER COMMAND CENTER
    // ==========================================
    if (resellerStatus?.isReseller) {
        const totalPages = Math.ceil(totalTransfers / pageSize);

        return (
            <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: '60px' }}>
                {/* 1. VIP Reseller Hero Header */}
                <div style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '20px',
                    padding: '30px 28px',
                    marginBottom: '24px',
                    boxShadow: isDarkMode ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 14px', borderRadius: '24px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
                                <Sparkles size={15} />
                                <span>Authorized Wholesale Reseller</span>
                            </div>

                            <h1 style={{ fontSize: '28px', fontWeight: '800', color: theme.text, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                                Reseller Command Center
                            </h1>
                            <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0, maxWidth: '640px', lineHeight: '1.6' }}>
                                Provision and dispatch residential proxy bandwidth directly into any client&apos;s registered RealProxy account. Cost is automatically deducted from your wholesale wallet.
                            </p>
                        </div>

                        {/* Wholesale Tier Rates Card */}
                        <div style={{
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '16px',
                            padding: '16px 20px',
                            display: 'flex',
                            gap: '24px',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: theme.textMuted, letterSpacing: '0.5px' }}>
                                    Residential Proxies
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
                                    ${(resellerStatus.residentialRateUsd || 0.70).toFixed(2)} <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '500' }}>/ GB</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', marginTop: '2px' }}>
                                    Save 30% vs Retail
                                </div>
                            </div>

                            <div style={{ width: '1px', height: '42px', backgroundColor: theme.cardBorder }} />

                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: theme.textMuted, letterSpacing: '0.5px' }}>
                                    Premium Residential
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#8B5CF6', marginTop: '2px' }}>
                                    ${(resellerStatus.premiumResidentialRateUsd || 0.90).toFixed(2)} <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '500' }}>/ GB</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '600', marginTop: '2px' }}>
                                    Save 40% vs Retail
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Reseller Performance Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px',
                    marginBottom: '28px'
                }}>
                    {/* Wallet Balance Card */}
                    <div style={{
                        backgroundColor: theme.card,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '16px',
                        padding: '22px 20px',
                        boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMuted }}>Reseller Wallet</span>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(0, 134, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0086FF' }}>
                                <Wallet size={18} />
                            </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '26px', fontWeight: '800', color: theme.text }}>
                                ${walletBalance.toFixed(2)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ fontSize: '12px', color: theme.textMuted }}>Available Balance</span>
                                <Link
                                    href="/dashboard/wallet"
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#0086FF',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    + Top Up <ArrowUpRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Total GB Dispatched */}
                    <div style={{
                        backgroundColor: theme.card,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '16px',
                        padding: '22px 20px',
                        boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMuted }}>Bandwidth Dispatched</span>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                                <Zap size={18} />
                            </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '26px', fontWeight: '800', color: '#10B981' }}>
                                {resellerStatus.totalTransferredGb} <span style={{ fontSize: '14px', fontWeight: '600' }}>GB</span>
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
                                Total proxy traffic sent
                            </p>
                        </div>
                    </div>

                    {/* Total Wholesale Spend */}
                    <div style={{
                        backgroundColor: theme.card,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '16px',
                        padding: '22px 20px',
                        boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMuted }}>Total Spend</span>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                                <ShieldCheck size={18} />
                            </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '26px', fontWeight: '800', color: theme.text }}>
                                ${resellerStatus.totalSpentUsd.toFixed(2)}
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
                                Across {resellerStatus.totalTransfersCount} provision operations
                            </p>
                        </div>
                    </div>

                    {/* Unique Clients */}
                    <div style={{
                        backgroundColor: theme.card,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '16px',
                        padding: '22px 20px',
                        boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMuted }}>Clients Served</span>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                                <Users size={18} />
                            </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '26px', fontWeight: '800', color: theme.text }}>
                                {resellerStatus.uniqueClientsCount}
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: theme.textMuted }}>
                                Unique registered client accounts
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Proxy Dispatch Console (The Interactive Tool) */}
                <div style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '20px',
                    padding: '30px 28px',
                    marginBottom: '32px',
                    boxShadow: isDarkMode ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(0, 134, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0086FF' }}>
                            <Send size={16} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.text, margin: 0 }}>
                            Dispatch Proxy Bandwidth
                        </h2>
                    </div>
                    <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 24px 0' }}>
                        Enter the registered user&apos;s email and specify bandwidth. Funds are deducted from your reseller wallet, and the proxy traffic is instantly activated in the recipient&apos;s dashboard.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {/* Form Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Target User Email */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: theme.text, marginBottom: '6px' }}>
                                    Recipient User Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        value={targetEmail}
                                        onChange={(e) => setTargetEmail(e.target.value)}
                                        placeholder="e.g. te.st.a.bidrayhan@gmail.com"
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 40px',
                                            backgroundColor: theme.inputBg,
                                            border: `1px solid ${recipientStatus === 'valid' ? '#10B981' : recipientStatus === 'invalid' ? '#EF4444' : theme.inputBorder}`,
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            color: theme.text,
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: theme.textMuted }} />

                                    {/* Verification pill */}
                                    {recipientStatus === 'checking' && (
                                        <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '12px', color: '#0086FF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '12px', height: '12px', border: '2px solid #0086FF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            Checking...
                                        </div>
                                    )}
                                    {recipientStatus === 'valid' && (
                                        <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                            <CheckCircle2 size={15} /> Valid User
                                        </div>
                                    )}
                                    {recipientStatus === 'invalid' && (
                                        <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                            <AlertCircle size={15} /> Not Found
                                        </div>
                                    )}
                                </div>
                                {recipientMessage && (
                                    <p style={{ fontSize: '12px', color: recipientStatus === 'valid' ? '#10B981' : '#EF4444', margin: '4px 0 0 2px' }}>
                                        {recipientMessage}
                                    </p>
                                )}
                            </div>

                            {/* Proxy Type Selection */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>
                                    Select Proxy Service
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {/* Option 1: Residential Proxies */}
                                    <div
                                        onClick={() => setSelectedProxyType('Residential')}
                                        style={{
                                            border: `2px solid ${selectedProxyType === 'Residential' ? '#10B981' : theme.cardBorder}`,
                                            backgroundColor: selectedProxyType === 'Residential' ? (isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5') : theme.inputBg,
                                            borderRadius: '12px',
                                            padding: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: selectedProxyType === 'Residential' ? '#10B981' : theme.text }}>
                                                Residential
                                            </span>
                                            {selectedProxyType === 'Residential' && <Check size={16} color="#10B981" />}
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: theme.text, marginTop: '6px' }}>
                                            ${(resellerStatus.residentialRateUsd || 0.70).toFixed(2)} <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '500' }}>/ GB</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', marginTop: '4px' }}>
                                            Evomi Residential Pool
                                        </div>
                                    </div>

                                    {/* Option 2: Premium Residential Proxies */}
                                    <div
                                        onClick={() => setSelectedProxyType('Premium Residential')}
                                        style={{
                                            border: `2px solid ${selectedProxyType === 'Premium Residential' ? '#8B5CF6' : theme.cardBorder}`,
                                            backgroundColor: selectedProxyType === 'Premium Residential' ? (isDarkMode ? 'rgba(139, 92, 246, 0.08)' : '#F5F3FF') : theme.inputBg,
                                            borderRadius: '12px',
                                            padding: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: selectedProxyType === 'Premium Residential' ? '#8B5CF6' : theme.text }}>
                                                Premium
                                            </span>
                                            {selectedProxyType === 'Premium Residential' && <Check size={16} color="#8B5CF6" />}
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: theme.text, marginTop: '6px' }}>
                                            ${(resellerStatus.premiumResidentialRateUsd || 0.90).toFixed(2)} <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '500' }}>/ GB</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '600', marginTop: '4px' }}>
                                            Geonode Premium Pool
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bandwidth Selection */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: theme.text, marginBottom: '6px' }}>
                                    Bandwidth Amount (GB)
                                </label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    {[5, 10, 25, 50, 100].map((quickGb) => (
                                        <button
                                            key={quickGb}
                                            type="button"
                                            onClick={() => setBandwidthGb(quickGb)}
                                            style={{
                                                flex: 1,
                                                padding: '7px 0',
                                                borderRadius: '8px',
                                                border: `1px solid ${bandwidthGb === quickGb ? '#0086FF' : theme.inputBorder}`,
                                                backgroundColor: bandwidthGb === quickGb ? (isDarkMode ? 'rgba(0,134,255,0.15)' : '#EFF6FF') : theme.inputBg,
                                                color: bandwidthGb === quickGb ? '#0086FF' : theme.text,
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {quickGb} GB
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    step="1"
                                    value={bandwidthGb}
                                    onChange={(e) => {
                                        const val = Math.max(1, Math.min(1000, parseInt(e.target.value) || 1));
                                        setBandwidthGb(val);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: theme.inputBg,
                                        border: `1px solid ${theme.inputBorder}`,
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        color: theme.text,
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Order Summary & Execution Card */}
                        <div style={{
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '16px',
                            padding: '22px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: theme.text, margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>
                                    Wholesale Transfer Summary
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: theme.textMuted }}>Target Client:</span>
                                        <span style={{ fontWeight: '700', color: theme.text, wordBreak: 'break-all' }}>
                                            {targetEmail ? targetEmail.trim() : '—'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: theme.textMuted }}>Service Type:</span>
                                        <span style={{ fontWeight: '700', color: selectedProxyType === 'Premium Residential' ? '#8B5CF6' : '#10B981' }}>
                                            {selectedProxyType}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: theme.textMuted }}>Rate Applied:</span>
                                        <span style={{ fontWeight: '700', color: theme.text }}>
                                            ${ratePerGb.toFixed(2)} USD / GB
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: theme.textMuted }}>Bandwidth to Add:</span>
                                        <span style={{ fontWeight: '800', color: theme.text }}>
                                            {bandwidthGb} GB <span style={{ fontSize: '11px', color: theme.textMuted }}>({bandwidthGb * 1000} MB)</span>
                                        </span>
                                    </div>

                                    <div style={{ height: '1px', backgroundColor: theme.cardBorder, margin: '6px 0' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '800', color: theme.text }}>Total Cost (USD):</span>
                                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#0086FF' }}>
                                            ${totalCost.toFixed(2)}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: theme.textMuted }}>Wallet Balance:</span>
                                        <span style={{ fontWeight: '600', color: theme.text }}>${walletBalance.toFixed(2)}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: theme.textMuted }}>Remaining Balance:</span>
                                        <span style={{ fontWeight: '700', color: hasEnoughBalance ? '#10B981' : '#EF4444' }}>
                                            ${remainingBalance.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {!hasEnoughBalance && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '10px 14px',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        color: '#EF4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <AlertCircle size={15} />
                                        <span>Insufficient balance. Please top up your wallet first.</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <button
                                    type="button"
                                    disabled={!hasEnoughBalance || recipientStatus === 'invalid' || isSubmitting || isCheckingRecipient}
                                    onClick={handleTransferClick}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: (!hasEnoughBalance || recipientStatus === 'invalid') ? '#94A3B8' : '#0086FF',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: '800',
                                        cursor: (!hasEnoughBalance || recipientStatus === 'invalid') ? 'not-allowed' : 'pointer',
                                        boxShadow: (!hasEnoughBalance || recipientStatus === 'invalid') ? 'none' : '0 4px 14px rgba(0, 134, 255, 0.35)',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isCheckingRecipient ? (
                                        <>
                                            <div style={{ width: '15px', height: '15px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            <span>Verifying Recipient...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Transfer {bandwidthGb} GB to Client</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Reseller Transfer History Table */}
                <div style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '20px',
                    padding: '26px 28px',
                    boxShadow: isDarkMode ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: theme.text, margin: 0 }}>
                                Dispatched Bandwidth History
                            </h3>
                            <p style={{ fontSize: '13px', color: theme.textMuted, margin: '4px 0 0 0' }}>
                                Audit log of all wholesale proxy traffic provisions sent from your account.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchTransfers(transfersPage)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                border: `1px solid ${theme.cardBorder}`,
                                backgroundColor: theme.inputBg,
                                color: theme.text,
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={13} className={transfersLoading ? 'spin' : ''} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Recipient Email</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Proxy Type</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Bandwidth</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Rate / GB</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Cost Deducted</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Date & Time</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>Reference ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfersLoading ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', color: theme.textMuted }}>
                                            Loading transfer history...
                                        </td>
                                    </tr>
                                ) : transfers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', color: theme.textMuted }}>
                                            No proxy transfers recorded yet. Use the console above to dispatch traffic to your clients.
                                        </td>
                                    </tr>
                                ) : (
                                    transfers.map((item) => (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: `1px solid ${theme.cardBorder}`,
                                                color: theme.text,
                                                transition: 'background-color 0.15s ease'
                                            }}
                                        >
                                            <td style={{ padding: '14px', fontWeight: '700' }}>
                                                {item.targetEmail}
                                            </td>
                                            <td style={{ padding: '14px' }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: item.proxyType.includes('Premium') ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                                    color: item.proxyType.includes('Premium') ? '#8B5CF6' : '#10B981'
                                                }}>
                                                    {item.proxyType}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'right', fontWeight: '800' }}>
                                                {item.bandwidthGb} GB
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'right', color: theme.textMuted }}>
                                                ${Number(item.ratePerGbUsd).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'right', fontWeight: '800', color: '#EF4444' }}>
                                                -${Number(item.totalCostUsd).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '14px', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                    color: '#10B981'
                                                }}>
                                                    {item.status || 'COMPLETED'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px', fontSize: '12px', color: theme.textMuted }}>
                                                {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: '11px', color: theme.textMuted }}>
                                                {item.referenceId}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${theme.cardBorder}` }}>
                            <span style={{ fontSize: '12px', color: theme.textMuted }}>
                                Showing {(transfersPage - 1) * pageSize + 1}–{Math.min(transfersPage * pageSize, totalTransfers)} of {totalTransfers} transfers
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    disabled={transfersPage <= 1}
                                    onClick={() => setTransfersPage((p) => Math.max(1, p - 1))}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.cardBorder}`,
                                        backgroundColor: theme.inputBg,
                                        color: theme.text,
                                        fontSize: '12px',
                                        cursor: transfersPage <= 1 ? 'not-allowed' : 'pointer',
                                        opacity: transfersPage <= 1 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={transfersPage >= totalPages}
                                    onClick={() => setTransfersPage((p) => Math.min(totalPages, p + 1))}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.cardBorder}`,
                                        backgroundColor: theme.inputBg,
                                        color: theme.text,
                                        fontSize: '12px',
                                        cursor: transfersPage >= totalPages ? 'not-allowed' : 'pointer',
                                        opacity: transfersPage >= totalPages ? 0.5 : 1
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. Confirmation Modal */}
                {showConfirmModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                        padding: '16px'
                    }}>
                        <div style={{
                            backgroundColor: theme.card,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '20px',
                            padding: '28px',
                            maxWidth: '460px',
                            width: '100%',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            position: 'relative'
                        }}>
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(0, 134, 255, 0.1)', color: '#0086FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <ShieldCheck size={22} />
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: theme.text, margin: '0 0 8px 0' }}>
                                Confirm Wholesale Transfer
                            </h3>
                            <p style={{ fontSize: '13px', color: theme.textMuted, margin: '0 0 20px 0', lineHeight: '1.5' }}>
                                You are about to transfer proxy traffic to your client. Funds will be deducted from your wallet immediately.
                            </p>

                            <div style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '12px', padding: '14px', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: theme.textMuted }}>Recipient Email:</span>
                                    <span style={{ fontWeight: '700', color: theme.text }}>{targetEmail.trim().toLowerCase()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: theme.textMuted }}>Service:</span>
                                    <span style={{ fontWeight: '700', color: '#10B981' }}>{selectedProxyType}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: theme.textMuted }}>Bandwidth:</span>
                                    <span style={{ fontWeight: '800', color: theme.text }}>{bandwidthGb} GB</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: `1px solid ${theme.cardBorder}` }}>
                                    <span style={{ fontWeight: '800', color: theme.text }}>Wallet Deduction:</span>
                                    <span style={{ fontWeight: '900', color: '#EF4444', fontSize: '15px' }}>-${totalCost.toFixed(2)} USD</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setShowConfirmModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: `1px solid ${theme.inputBorder}`,
                                        backgroundColor: theme.inputBg,
                                        color: theme.text,
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={executeTransfer}
                                    style={{
                                        flex: 2,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        backgroundColor: '#0086FF',
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: '800',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div style={{ width: '14px', height: '14px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            <span>Confirm & Send</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // VIEW 2: NON-RESELLER ONBOARDING & APPLICATION
    // ==========================================
    return (
        <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: '60px' }}>
            {/* Header Hero Section */}
            <div style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px',
                padding: '32px 28px',
                marginBottom: '24px',
                boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginBottom: '14px'
                        }}>
                            <Handshake size={14} />
                            <span>Official Partner & Wholesale</span>
                        </div>

                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: theme.text,
                            margin: '0 0 10px 0',
                            letterSpacing: '-0.5px'
                        }}>
                            RealProxy Wholesale & Reseller Program
                        </h1>

                        <p style={{
                            fontSize: '15px',
                            color: theme.textMuted,
                            lineHeight: '1.6',
                            margin: 0,
                            maxWidth: '720px'
                        }}>
                            Scale your proxy operations or business with enterprise-tier volume discounts.
                            Get custom per-GB rates ($0.70/GB Standard Residential, $0.90/GB Premium Residential), API provisioning keys, dedicated sub-user accounts, and priority 24/7 technical assistance.
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        minWidth: '220px'
                    }}>
                        <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                backgroundColor: '#25D366',
                                color: '#FFFFFF',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '14px',
                                textDecoration: 'none',
                                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                                transition: 'opacity 0.2s ease'
                            }}
                        >
                            <MessageCircle size={18} />
                            <span>Chat on WhatsApp</span>
                        </a>

                        <a
                            href={telegramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                backgroundColor: '#229ED9',
                                color: '#FFFFFF',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '14px',
                                textDecoration: 'none',
                                boxShadow: '0 2px 8px rgba(34, 158, 217, 0.25)',
                                transition: 'opacity 0.2s ease'
                            }}
                        >
                            <Send size={18} />
                            <span>Telegram Support</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Interactive Application Form */}
            <div style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={18} color="#0086FF" />
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: theme.text, margin: 0 }}>
                        Apply for Wholesale / Reseller Activation
                    </h2>
                </div>
                <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 20px 0' }}>
                    Fill out your expected traffic needs to instantly generate a tailored partnership request message to send to the admin.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.text, marginBottom: '6px' }}>
                            Your Account Email
                        </label>
                        <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="e.g. personal.abidrayhan@gmail.com"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: theme.inputBg,
                                border: `1px solid ${theme.inputBorder}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: theme.text,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.text, marginBottom: '6px' }}>
                            Expected Monthly Volume
                        </label>
                        <select
                            value={expectedVolume}
                            onChange={(e) => setExpectedVolume(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: theme.inputBg,
                                border: `1px solid ${theme.inputBorder}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: theme.text,
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="100 GB - 250 GB">100 GB – 250 GB</option>
                            <option value="250 GB - 500 GB">250 GB – 500 GB</option>
                            <option value="500 GB - 1 TB">500 GB – 1 TB</option>
                            <option value="1 TB - 5 TB">1 TB – 5 TB</option>
                            <option value="5 TB+ (Enterprise Volume)">5 TB+ (Custom Enterprise Wholesale)</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.text, marginBottom: '6px' }}>
                            Target Proxy Type
                        </label>
                        <select
                            value={inquiryProxyType}
                            onChange={(e) => setInquiryProxyType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: theme.inputBg,
                                border: `1px solid ${theme.inputBorder}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: theme.text,
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="Residential Proxies ($0.70/GB)">Residential Proxies ($0.70/GB)</option>
                            <option value="Premium Residential Proxies ($0.90/GB)">Premium Residential Proxies ($0.90/GB)</option>
                            <option value="Both Residential & Premium">Both Residential & Premium</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.text, marginBottom: '6px' }}>
                        Custom Requirements or Specific Subnets (Optional)
                    </label>
                    <textarea
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="Share any special targeting, scraping targets, concurrency limits, or integration questions..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: theme.inputBg,
                            border: `1px solid ${theme.inputBorder}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: theme.text,
                            boxSizing: 'border-box',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Live Message Preview & Actions */}
                <div style={{
                    backgroundColor: theme.infoBg,
                    border: `1px solid ${theme.infoBorder}`,
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '16px'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                        Generated Application Message
                    </div>
                    <pre style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        color: theme.text,
                        lineHeight: '1.6'
                    }}>
                        {generatedInquiryMessage}
                    </pre>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#25D366',
                            color: '#FFFFFF',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '14px',
                            textDecoration: 'none'
                        }}
                    >
                        <MessageCircle size={16} />
                        <span>Send to Admin on WhatsApp</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => copyToClipboard(generatedInquiryMessage, 'inquiry_msg', 'Application message copied to clipboard!')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: theme.inputBg,
                            color: theme.text,
                            border: `1px solid ${theme.inputBorder}`,
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        {copiedField === 'inquiry_msg' ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                        <span>Copy Message</span>
                    </button>
                </div>
            </div>

            {/* How to Get Started as a Reseller */}
            <div style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '24px'
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: theme.text, margin: '0 0 20px 0' }}>
                    How to Get Started as a Reseller
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    {[
                        {
                            step: '1',
                            title: 'Contact Admin',
                            desc: 'Reach out via WhatsApp or Telegram with your estimated monthly traffic requirements.'
                        },
                        {
                            step: '2',
                            title: 'Receive Wholesale Rates & Activation',
                            desc: 'Admin activates your reseller account status, unlocking $0.70 / $0.90 per-GB wholesale pricing in your portal.'
                        },
                        {
                            step: '3',
                            title: 'Dispatch & Scale Clients',
                            desc: 'Dispatch proxy bandwidth directly into any client account or integrate your billing system via our API.'
                        }
                    ].map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '14px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#0086FF',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '800',
                                fontSize: '14px',
                                flexShrink: 0
                            }}>
                                {s.step}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', color: theme.text, margin: '0 0 4px 0' }}>
                                    {s.title}
                                </h4>
                                <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0, lineHeight: '1.5' }}>
                                    {s.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Accordion */}
            <div style={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px',
                padding: '28px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <HelpCircle size={18} color="#0086FF" />
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: theme.text, margin: 0 }}>
                        Frequently Asked Questions
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div
                                key={idx}
                                style={{
                                    border: `1px solid ${theme.cardBorder}`,
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px 18px',
                                        backgroundColor: theme.card,
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: theme.text,
                                        fontSize: '14px',
                                        fontWeight: '700'
                                    }}
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        size={16}
                                        style={{
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                            color: theme.textMuted
                                        }}
                                    />
                                </button>
                                {isOpen && (
                                    <div style={{
                                        padding: '0 18px 16px 18px',
                                        fontSize: '13px',
                                        color: theme.textMuted,
                                        lineHeight: '1.6'
                                    }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
