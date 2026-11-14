"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
    Users,
    ShieldCheck,
    Code,
    TrendingUp,
    Send,
    Mail,
    Copy,
    Check,
    Wallet,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    HelpCircle,
    ChevronDown,
    X,
    MessageCircle
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

// Official brand SVG icons for WhatsApp and Telegram
const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0 }}>
        <path d="M12.0004 0C5.37356 0 0 5.37356 0 12.0004C0 14.6302 0.84654 17.0674 2.2618 19.0988L0.74902 23.3621C0.686862 23.5359 0.725964 23.7314 0.852277 23.8687C0.950785 23.974 1.09117 24.0326 1.23594 24.0326C1.2828 24.0326 1.33038 24.0252 1.37683 24.0097L5.78926 22.5312C7.7562 23.7942 10.0931 24.4842 12.5701 24.4842C19.197 24.4842 24.5705 19.1106 24.5705 12.4838C24.5705 5.857 19.197 0.483441 12.5701 0.483441H12.0004V0ZM12.0004 2.05831H12.5701C18.3242 2.05831 22.5126 6.74668 22.5126 12.5008C22.5126 18.2549 18.3242 22.4433 12.5701 22.4433C10.282 22.4433 8.09337 21.6888 6.2625 20.3204L6.15177 20.2458L2.46979 21.4921L3.71536 17.8093L3.63351 17.6896C2.26053 15.8614 1.50314 13.6708 1.50314 11.3831C2.05828 5.62899 6.74665 2.05831 12.0004 2.05831ZM8.57502 6.84501C8.28186 6.84501 7.95758 6.94639 7.6416 7.22736C7.30607 7.52627 6.64367 8.16335 6.64367 9.45892C6.64367 10.7545 7.66983 12.0125 7.8203 12.214C7.94071 12.3875 9.68069 15.2285 12.5932 16.3683C15.0601 17.3323 15.5348 17.151 16.0366 17.0988C16.5385 17.0465 17.6521 16.4422 17.8827 15.7891C18.1132 15.136 18.1132 14.5835 18.0326 14.4715C17.9521 14.3596 17.751 14.285 17.4497 14.1352C17.1484 13.986 15.6525 13.2536 15.3712 13.1515C15.0901 13.0494 14.879 13.0044 14.6784 13.3033C14.4772 13.6022 13.9248 14.2492 13.7538 14.4507C13.5829 14.6522 13.4121 14.6749 13.1111 14.5249C12.8099 14.375 11.8344 14.0538 10.6865 13.0336C9.79251 12.2393 9.17834 11.2464 9.00693 10.9472C8.83617 10.6481 8.98906 10.4907 9.1415 10.3421C9.27838 10.2081 9.44284 10.0076 9.59343 9.83785C9.7439 9.66814 9.8037 9.544 9.90426 9.34444C10.0047 9.14488 9.94437 8.97334 9.8638 8.81404C9.78345 8.65475 9.17135 7.15064 8.93043 6.54341V6.52225C8.68285 5.922 8.44185 5.9926 8.242 5.98604C8.04163 5.97937 7.8203 5.9554 7.6094 5.9554C7.388 5.95538 7.03666 6.03575 6.7454 6.35378H6.745Z" />
    </svg>
);

const TelegramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0 }}>
        <path d="M12 0C5.372 0 0 5.372 0 12C0 18.627 5.372 24 12 24C18.628 24 24 18.627 24 12C24 5.372 18.628 0 12 0ZM17.414 7.644L15.655 16.891C15.523 17.502 15.112 17.653 14.591 17.382L11.531 15.02L10.05 16.516C9.886 16.689 9.752 16.823 9.421 16.823L9.641 13.56L15.341 8.16C15.589 7.928 15.286 7.801 14.957 8.031L7.904 12.68L4.853 11.677C4.189 11.458 4.177 10.978 4.992 10.638L16.924 5.8C17.476 5.58 17.95 5.922 17.414 7.644Z" />
    </svg>
);

export default function ResellerPage() {
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [statusLoading, setStatusLoading] = useState<boolean>(true);
    const [resellerStatus, setResellerStatus] = useState<ResellerStatus | null>(null);

    // Onboarding form state (for non-resellers)
    const [userEmail, setUserEmail] = useState<string>('');
    const [expectedVolume, setExpectedVolume] = useState<string>('250 GB - 500 GB');
    const [inquiryProxyType, setInquiryProxyType] = useState<string>('Both Residential & Premium');
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

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('user_email') || '';
            setUserEmail(email);
        }
    }, []);

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
                    setRecipientMessage(res.data.message || 'Verified RealProxy account');
                } else {
                    setRecipientStatus('invalid');
                    setRecipientMessage(res.data?.message || 'User not registered on RealProxy');
                }
            } catch {
                setRecipientStatus('invalid');
                setRecipientMessage('Unable to verify user registration');
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

        if (recipientStatus === 'valid' && clean === lastCheckedEmailRef.current) {
            setShowConfirmModal(true);
            return;
        }

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
                setRecipientMessage(res.data.message || 'Verified RealProxy account');
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
                toast.success(res.data.message || 'Bandwidth transferred successfully.');
                setShowConfirmModal(false);
                setTargetEmail('');
                setRecipientStatus('idle');
                setRecipientMessage('');
                setBandwidthGb(10);
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
    const generatedInquiryMessage = `Hello RealProxy Team,
I would like to apply for wholesale reseller pricing:
- Account Email: ${userEmail.trim() || '[My Account Email]'}
- Estimated Monthly Volume: ${expectedVolume}
- Proxy Network: ${inquiryProxyType}
${customNote.trim() ? `- Requirements: ${customNote.trim()}\n` : ''}
Please share wholesale tier pricing and activation instructions.`;

    const whatsAppUrl = `https://wa.me/message/K4I5YCLO2D6TH1?text=${encodeURIComponent(generatedInquiryMessage)}`;
    const telegramUrl = 'https://t.me/Real_proxy_Recharge';

    const faqs = [
        {
            q: 'How does the wholesale reseller program work?',
            a: 'Authorized resellers receive wholesale volume rates on residential and premium proxies. You can manage allocations via this dashboard or integrate your custom billing portal through our REST API.'
        },
        {
            q: 'Does purchased wholesale bandwidth expire?',
            a: 'No. Bandwidth purchased under wholesale tiers has no expiration date and rolls over automatically.'
        },
        {
            q: 'Can I automate proxy provisioning through an API?',
            a: 'Yes. Once your reseller status is approved, API credentials can be generated to automate user creation, balance top-ups, and credential rotation.'
        },
        {
            q: 'What payment methods are supported for wholesale deposits?',
            a: 'We accept automated payments via bKash, Nagad, Binance Pay (USDT), and Cryptomus (USDT, LTC, BTC).'
        }
    ];

    if (!isMounted || statusLoading) {
        return (
            <div className="reseller-loading">
                <div className="reseller-spinner" />
                <p>Loading...</p>
                <style jsx>{`
                    .reseller-loading {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 80px 20px;
                        text-align: center;
                    }
                    .reseller-spinner {
                        display: inline-block;
                        width: 36px;
                        height: 36px;
                        border: 2px solid #E2E8F0;
                        border-top-color: #0086FF;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    p {
                        margin-top: 14px;
                        font-size: 13px;
                        color: #64748B;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
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
            <div className="reseller-wrapper">
                {/* 1. Header Bar */}
                <div className="reseller-header-bar">
                    <div>
                        <div className="header-tag">Reseller Account</div>
                        <h1 className="header-title">Reseller Management</h1>
                        <p className="header-sub">
                            Provision proxy traffic directly to your client accounts. Cost is deducted from your wholesale wallet.
                        </p>
                    </div>

                    <div className="header-actions">
                        <Link href="/dashboard/wallet" className="btn-topup-wallet">
                            <Wallet size={15} />
                            <span>Top Up Wallet</span>
                        </Link>
                    </div>
                </div>

                {/* 2. KPI Metrics */}
                <div className="kpi-grid">
                    <div className="kpi-box">
                        <div className="kpi-meta">
                            <span className="kpi-title">Wholesale Balance</span>
                            <div className="kpi-icon"><Wallet size={16} /></div>
                        </div>
                        <div className="kpi-number">${walletBalance.toFixed(2)}</div>
                        <div className="kpi-footer">
                            <span>Available balance</span>
                            <Link href="/dashboard/wallet" className="kpi-inline-link">
                                Add Funds <ArrowUpRight size={12} />
                            </Link>
                        </div>
                    </div>

                    <div className="kpi-box">
                        <div className="kpi-meta">
                            <span className="kpi-title">Traffic Dispatched</span>
                            <div className="kpi-icon"><TrendingUp size={16} /></div>
                        </div>
                        <div className="kpi-number">{resellerStatus.totalTransferredGb} <span className="kpi-unit">GB</span></div>
                        <div className="kpi-footer">
                            <span>Allocated to clients</span>
                        </div>
                    </div>

                    <div className="kpi-box">
                        <div className="kpi-meta">
                            <span className="kpi-title">Total Spend</span>
                            <div className="kpi-icon"><ShieldCheck size={16} /></div>
                        </div>
                        <div className="kpi-number">${resellerStatus.totalSpentUsd.toFixed(2)}</div>
                        <div className="kpi-footer">
                            <span>{resellerStatus.totalTransfersCount} completed transfers</span>
                        </div>
                    </div>

                    <div className="kpi-box">
                        <div className="kpi-meta">
                            <span className="kpi-title">Active Clients</span>
                            <div className="kpi-icon"><Users size={16} /></div>
                        </div>
                        <div className="kpi-number">{resellerStatus.uniqueClientsCount}</div>
                        <div className="kpi-footer">
                            <span>Unique recipient accounts</span>
                        </div>
                    </div>
                </div>

                {/* 3. Dispatch Form Card */}
                <div className="content-card">
                    <div className="card-header-row">
                        <div>
                            <h2 className="card-title">Dispatch Proxy Bandwidth</h2>
                            <p className="card-sub">Enter the recipient user email and choose traffic volume to allocate.</p>
                        </div>
                    </div>

                    <div className="dispatch-grid">
                        {/* Form Inputs */}
                        <div className="form-fields-wrap">
                            <div className="form-group">
                                <label className="form-label">Recipient Account Email</label>
                                <div className="input-wrap">
                                    <Mail size={16} className="input-icon" />
                                    <input
                                        type="email"
                                        value={targetEmail}
                                        onChange={(e) => setTargetEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className={`clean-input ${recipientStatus === 'valid' ? 'border-valid' : recipientStatus === 'invalid' ? 'border-invalid' : ''}`}
                                    />
                                    {recipientStatus === 'checking' && (
                                        <div className="input-status checking">
                                            <div className="mini-spin" /> Verifying...
                                        </div>
                                    )}
                                    {recipientStatus === 'valid' && (
                                        <div className="input-status valid">
                                            <CheckCircle2 size={13} /> Verified
                                        </div>
                                    )}
                                    {recipientStatus === 'invalid' && (
                                        <div className="input-status invalid">
                                            <AlertCircle size={13} /> Not found
                                        </div>
                                    )}
                                </div>
                                {recipientMessage && (
                                    <span className={`field-hint-text ${recipientStatus === 'valid' ? 'text-valid' : 'text-invalid'}`}>
                                        {recipientMessage}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Proxy Network</label>
                                <div className="network-selector">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProxyType('Residential')}
                                        className={`network-btn ${selectedProxyType === 'Residential' ? 'active' : ''}`}
                                    >
                                        <div className="network-btn-title">Residential Proxies</div>
                                        <div className="network-btn-rate">
                                            ${(resellerStatus.residentialRateUsd || 0.70).toFixed(2)} / GB
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedProxyType('Premium Residential')}
                                        className={`network-btn ${selectedProxyType === 'Premium Residential' ? 'active' : ''}`}
                                    >
                                        <div className="network-btn-title">Premium Residential</div>
                                        <div className="network-btn-rate">
                                            ${(resellerStatus.premiumResidentialRateUsd || 0.90).toFixed(2)} / GB
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="label-row">
                                    <label className="form-label">Bandwidth Volume</label>
                                    <span className="label-aside">1 GB – 1,000 GB</span>
                                </div>
                                <div className="preset-chips">
                                    {[5, 10, 25, 50, 100, 250].map((gb) => (
                                        <button
                                            key={gb}
                                            type="button"
                                            onClick={() => setBandwidthGb(gb)}
                                            className={`chip ${bandwidthGb === gb ? 'active' : ''}`}
                                        >
                                            {gb} GB
                                        </button>
                                    ))}
                                </div>
                                <div className="input-unit-wrap">
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
                                        className="clean-input input-with-suffix"
                                    />
                                    <span className="input-suffix">GB</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="summary-card">
                            <h3 className="summary-heading">Order Breakdown</h3>
                            <div className="summary-rows">
                                <div className="summary-row">
                                    <span className="summary-label">Recipient</span>
                                    <span className="summary-val">{targetEmail.trim() || '—'}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Network</span>
                                    <span className="summary-val">{selectedProxyType}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Rate Applied</span>
                                    <span className="summary-val">${ratePerGb.toFixed(2)} / GB</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Bandwidth</span>
                                    <span className="summary-val font-semibold">{bandwidthGb} GB</span>
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-row total-row">
                                    <span className="summary-label total-text">Total Cost</span>
                                    <span className="summary-val total-price">${totalCost.toFixed(2)} USD</span>
                                </div>

                                <div className="wallet-status-box">
                                    <div className="summary-row">
                                        <span>Current Balance</span>
                                        <span>${walletBalance.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Balance After</span>
                                        <span className={hasEnoughBalance ? 'text-valid font-semibold' : 'text-invalid font-semibold'}>
                                            ${remainingBalance.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!hasEnoughBalance && (
                                <div className="error-banner">
                                    <AlertCircle size={14} />
                                    <span>Insufficient wallet balance. Please add funds.</span>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={!hasEnoughBalance || recipientStatus === 'invalid' || isSubmitting || isCheckingRecipient}
                                onClick={handleTransferClick}
                                className="btn-dispatch-submit"
                            >
                                {isCheckingRecipient ? 'Verifying Recipient...' : isSubmitting ? 'Processing...' : `Dispatch ${bandwidthGb} GB`}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. History Table */}
                <div className="content-card">
                    <div className="card-header-row">
                        <div>
                            <h2 className="card-title">Transfer History</h2>
                            <p className="card-sub">Audit log of proxy bandwidth provisions dispatched from your account.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchTransfers(transfersPage)}
                            className="btn-refresh"
                        >
                            <RefreshCw size={13} className={transfersLoading ? 'spin-icon' : ''} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    <div className="table-wrap">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>Recipient</th>
                                    <th>Network</th>
                                    <th className="align-right">Bandwidth</th>
                                    <th className="align-right">Rate</th>
                                    <th className="align-right">Cost</th>
                                    <th className="align-center">Status</th>
                                    <th>Date</th>
                                    <th>Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfersLoading ? (
                                    <tr>
                                        <td colSpan={8} className="empty-cell">Loading transfer history...</td>
                                    </tr>
                                ) : transfers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="empty-cell">No transfers recorded yet.</td>
                                    </tr>
                                ) : (
                                    transfers.map((item) => (
                                        <tr key={item.id}>
                                            <td className="font-medium">{item.targetEmail}</td>
                                            <td>
                                                <span className="network-tag">{item.proxyType}</span>
                                            </td>
                                            <td className="align-right font-medium">{item.bandwidthGb} GB</td>
                                            <td className="align-right text-muted">${Number(item.ratePerGbUsd).toFixed(2)}</td>
                                            <td className="align-right text-invalid font-medium">-${Number(item.totalCostUsd).toFixed(2)}</td>
                                            <td className="align-center">
                                                <span className="status-badge">{item.status || 'COMPLETED'}</span>
                                            </td>
                                            <td className="text-muted text-sm">
                                                {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <code className="ref-code">{item.referenceId}</code>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <span className="pagination-text">
                                Page {transfersPage} of {totalPages} ({totalTransfers} items)
                            </span>
                            <div className="pagination-btns">
                                <button
                                    type="button"
                                    disabled={transfersPage <= 1}
                                    onClick={() => setTransfersPage((p) => Math.max(1, p - 1))}
                                    className="btn-page"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={transfersPage >= totalPages}
                                    onClick={() => setTransfersPage((p) => Math.min(totalPages, p + 1))}
                                    className="btn-page"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. Confirmation Modal */}
                {showConfirmModal && (
                    <div className="modal-backdrop">
                        <div className="modal-box">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="btn-modal-close"
                            >
                                <X size={18} />
                            </button>

                            <h3 className="modal-title">Confirm Transfer</h3>
                            <p className="modal-desc">
                                Bandwidth will be allocated immediately to the recipient account. Cost will be deducted from your wholesale wallet.
                            </p>

                            <div className="modal-details">
                                <div className="modal-row">
                                    <span className="text-muted">Recipient:</span>
                                    <span className="font-medium">{targetEmail.trim().toLowerCase()}</span>
                                </div>
                                <div className="modal-row">
                                    <span className="text-muted">Network:</span>
                                    <span className="font-medium">{selectedProxyType}</span>
                                </div>
                                <div className="modal-row">
                                    <span className="text-muted">Volume:</span>
                                    <span className="font-medium">{bandwidthGb} GB</span>
                                </div>
                                <div className="modal-row divider">
                                    <span className="font-semibold">Deduction:</span>
                                    <span className="font-semibold text-invalid">-${totalCost.toFixed(2)} USD</span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setShowConfirmModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={executeTransfer}
                                    className="btn-primary"
                                >
                                    {isSubmitting ? 'Transferring...' : 'Authorize Transfer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scoped Styles for Reseller Dashboard */}
                <style jsx>{`
                    .reseller-wrapper {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding-bottom: 50px;
                        font-family: var(--font-poppins, -apple-system, BlinkMacSystemFont, sans-serif);
                    }

                    .reseller-header-bar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 20px;
                        background: #FFFFFF;
                        border: 1px solid #E2E8F0;
                        border-radius: 14px;
                        padding: 22px 26px;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                    }

                    .header-tag {
                        display: inline-block;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: #0086FF;
                        margin-bottom: 4px;
                    }

                    .header-title {
                        font-size: 22px;
                        font-weight: 700;
                        color: #0F172A;
                        margin: 0 0 4px 0;
                    }

                    .header-sub {
                        font-size: 13.5px;
                        color: #64748B;
                        margin: 0;
                    }

                    .btn-topup-wallet {
                        display: inline-flex;
                        align-items: center;
                        gap: 7px;
                        background: #0086FF;
                        color: #FFFFFF;
                        padding: 10px 18px;
                        border-radius: 9px;
                        font-size: 13px;
                        font-weight: 600;
                        text-decoration: none;
                        transition: background-color 0.15s ease;
                    }

                    .btn-topup-wallet:hover {
                        background: #0076E5;
                    }

                    /* KPI Grid */
                    .kpi-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 16px;
                        margin-bottom: 20px;
                    }

                    .kpi-box {
                        background: #FFFFFF;
                        border: 1px solid #E2E8F0;
                        border-radius: 12px;
                        padding: 18px 20px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }

                    .kpi-meta {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .kpi-title {
                        font-size: 12.5px;
                        font-weight: 600;
                        color: #64748B;
                    }

                    .kpi-icon {
                        color: #64748B;
                    }

                    .kpi-number {
                        font-size: 24px;
                        font-weight: 700;
                        color: #0F172A;
                        margin: 12px 0 6px 0;
                        letter-spacing: -0.3px;
                    }

                    .kpi-unit {
                        font-size: 14px;
                        font-weight: 500;
                        color: #64748B;
                    }

                    .kpi-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 11.5px;
                        color: #94A3B8;
                    }

                    .kpi-inline-link {
                        display: inline-flex;
                        align-items: center;
                        gap: 2px;
                        color: #0086FF;
                        font-weight: 600;
                        text-decoration: none;
                    }

                    .kpi-inline-link:hover {
                        text-decoration: underline;
                    }

                    /* Content Card */
                    .content-card {
                        background: #FFFFFF;
                        border: 1px solid #E2E8F0;
                        border-radius: 14px;
                        padding: 24px 26px;
                        margin-bottom: 20px;
                    }

                    .card-header-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                        gap: 12px;
                    }

                    .card-title {
                        font-size: 17px;
                        font-weight: 700;
                        color: #0F172A;
                        margin: 0 0 3px 0;
                    }

                    .card-sub {
                        font-size: 13px;
                        color: #64748B;
                        margin: 0;
                    }

                    /* Dispatch Grid */
                    .dispatch-grid {
                        display: grid;
                        grid-template-columns: 1.4fr 1fr;
                        gap: 24px;
                    }

                    .form-fields-wrap {
                        display: flex;
                        flex-direction: column;
                        gap: 18px;
                    }

                    .form-group {
                        display: flex;
                        flex-direction: column;
                    }

                    .form-label {
                        font-size: 13px;
                        font-weight: 600;
                        color: #1E293B;
                        margin-bottom: 6px;
                    }

                    .label-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: baseline;
                    }

                    .label-aside {
                        font-size: 11.5px;
                        color: #94A3B8;
                    }

                    .input-wrap {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }

                    :global(.input-icon) {
                        position: absolute;
                        left: 12px;
                        color: #94A3B8;
                        pointer-events: none;
                    }

                    .clean-input {
                        width: 100%;
                        padding: 10px 12px 10px 38px;
                        background: #F8FAFC;
                        border: 1px solid #CBD5E1;
                        border-radius: 8px;
                        font-size: 13.5px;
                        font-family: inherit;
                        color: #0F172A;
                        outline: none;
                        transition: border-color 0.15s ease;
                        box-sizing: border-box;
                    }

                    .clean-input:focus {
                        border-color: #0086FF;
                        background: #FFFFFF;
                    }

                    .clean-input.border-valid { border-color: #059669; }
                    .clean-input.border-invalid { border-color: #EF4444; }

                    .input-status {
                        position: absolute;
                        right: 10px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 11.5px;
                        font-weight: 600;
                    }

                    .input-status.checking { color: #64748B; }
                    .input-status.valid { color: #059669; }
                    .input-status.invalid { color: #EF4444; }

                    .field-hint-text {
                        font-size: 11.5px;
                        margin-top: 4px;
                    }

                    .text-valid { color: #059669; }
                    .text-invalid { color: #EF4444; }

                    /* Network selector */
                    .network-selector {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                    }

                    .network-btn {
                        background: #F8FAFC;
                        border: 1px solid #CBD5E1;
                        border-radius: 9px;
                        padding: 12px 14px;
                        text-align: left;
                        cursor: pointer;
                        transition: all 0.15s ease;
                        font-family: inherit;
                    }

                    .network-btn:hover {
                        border-color: #94A3B8;
                    }

                    .network-btn.active {
                        border-color: #0086FF;
                        background: #EFF6FF;
                    }

                    .network-btn-title {
                        font-size: 13.5px;
                        font-weight: 600;
                        color: #0F172A;
                    }

                    .network-btn.active .network-btn-title {
                        color: #0086FF;
                    }

                    .network-btn-rate {
                        font-size: 12px;
                        color: #64748B;
                        margin-top: 2px;
                    }

                    /* Preset chips */
                    .preset-chips {
                        display: flex;
                        gap: 6px;
                        margin-bottom: 8px;
                        flex-wrap: wrap;
                    }

                    .chip {
                        flex: 1;
                        min-width: 50px;
                        padding: 6px 0;
                        background: #F8FAFC;
                        border: 1px solid #CBD5E1;
                        border-radius: 7px;
                        font-size: 12px;
                        font-weight: 600;
                        color: #334155;
                        cursor: pointer;
                        font-family: inherit;
                    }

                    .chip:hover {
                        background: #FFFFFF;
                        border-color: #94A3B8;
                    }

                    .chip.active {
                        background: #0086FF;
                        border-color: #0086FF;
                        color: #FFFFFF;
                    }

                    .input-unit-wrap {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }

                    .input-with-suffix {
                        padding-left: 12px !important;
                        padding-right: 40px !important;
                    }

                    .input-suffix {
                        position: absolute;
                        right: 12px;
                        font-size: 12.5px;
                        color: #64748B;
                        font-weight: 600;
                    }

                    /* Summary card */
                    .summary-card {
                        background: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        border-radius: 12px;
                        padding: 18px 20px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }

                    .summary-heading {
                        font-size: 14.5px;
                        font-weight: 700;
                        color: #0F172A;
                        margin: 0 0 14px 0;
                    }

                    .summary-rows {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        font-size: 12.5px;
                    }

                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .summary-label {
                        color: #64748B;
                    }

                    .summary-val {
                        color: #0F172A;
                    }

                    .summary-divider {
                        height: 1px;
                        background: #E2E8F0;
                        margin: 4px 0;
                    }

                    .total-row {
                        padding: 4px 0;
                    }

                    .total-text {
                        font-size: 13.5px;
                        font-weight: 700;
                        color: #0F172A;
                    }

                    .total-price {
                        font-size: 18px;
                        font-weight: 800;
                        color: #0086FF;
                    }

                    .wallet-status-box {
                        background: #FFFFFF;
                        border: 1px solid #E2E8F0;
                        border-radius: 8px;
                        padding: 8px 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        margin-top: 4px;
                    }

                    .error-banner {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        padding: 8px 10px;
                        background: #FEF2F2;
                        border: 1px solid #FECACA;
                        border-radius: 7px;
                        color: #DC2626;
                        font-size: 12px;
                        margin-top: 12px;
                    }

                    .btn-dispatch-submit {
                        margin-top: 16px;
                        width: 100%;
                        padding: 12px;
                        background: #0086FF;
                        color: #FFFFFF;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        font-family: inherit;
                        cursor: pointer;
                        transition: background-color 0.15s ease;
                    }

                    .btn-dispatch-submit:hover:not(:disabled) {
                        background: #0076E5;
                    }

                    .btn-dispatch-submit:disabled {
                        background: #94A3B8;
                        cursor: not-allowed;
                    }

                    /* Table */
                    .btn-refresh {
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        padding: 6px 12px;
                        background: #FFFFFF;
                        border: 1px solid #CBD5E1;
                        border-radius: 7px;
                        font-size: 12px;
                        font-weight: 600;
                        color: #334155;
                        cursor: pointer;
                        font-family: inherit;
                    }

                    .btn-refresh:hover {
                        background: #F8FAFC;
                    }

                    :global(.spin-icon) {
                        animation: spin 0.8s linear infinite;
                    }

                    .table-wrap {
                        overflow-x: auto;
                    }

                    .clean-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12.5px;
                        text-align: left;
                    }

                    .clean-table th {
                        padding: 10px 12px;
                        font-weight: 600;
                        color: #64748B;
                        border-bottom: 1px solid #E2E8F0;
                        background: #F8FAFC;
                    }

                    .clean-table td {
                        padding: 12px;
                        border-bottom: 1px solid #E2E8F0;
                        color: #1E293B;
                    }

                    .clean-table tbody tr:hover td {
                        background: #F8FAFC;
                    }

                    .align-right { text-align: right; }
                    .align-center { text-align: center; }
                    .font-medium { font-weight: 600; color: #0F172A; }
                    .font-semibold { font-weight: 700; color: #0F172A; }
                    .text-muted { color: #64748B; }
                    .text-sm { font-size: 12px; }

                    .network-tag {
                        font-size: 11px;
                        font-weight: 600;
                        padding: 2px 7px;
                        border-radius: 4px;
                        background: #F1F5F9;
                        color: #475569;
                    }

                    .status-badge {
                        font-size: 11px;
                        font-weight: 600;
                        padding: 2px 7px;
                        border-radius: 4px;
                        background: #ECFDF5;
                        color: #059669;
                    }

                    .ref-code {
                        font-family: monospace;
                        font-size: 11px;
                        background: #F1F5F9;
                        padding: 2px 5px;
                        border-radius: 4px;
                        color: #64748B;
                    }

                    .empty-cell {
                        text-align: center;
                        padding: 30px !important;
                        color: #64748B;
                    }

                    /* Pagination */
                    .pagination {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 16px;
                        padding-top: 14px;
                        border-top: 1px solid #E2E8F0;
                    }

                    .pagination-text {
                        font-size: 12px;
                        color: #64748B;
                    }

                    .pagination-btns {
                        display: flex;
                        gap: 8px;
                    }

                    .btn-page {
                        padding: 5px 12px;
                        background: #FFFFFF;
                        border: 1px solid #CBD5E1;
                        border-radius: 6px;
                        font-size: 12px;
                        color: #334155;
                        cursor: pointer;
                        font-family: inherit;
                    }

                    .btn-page:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    /* Modal */
                    .modal-backdrop {
                        position: fixed;
                        inset: 0;
                        background: rgba(15, 23, 42, 0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 99999;
                        padding: 16px;
                    }

                    .modal-box {
                        background: #FFFFFF;
                        border: 1px solid #E2E8F0;
                        border-radius: 14px;
                        padding: 24px;
                        max-width: 440px;
                        width: 100%;
                        position: relative;
                    }

                    .btn-modal-close {
                        position: absolute;
                        right: 16px;
                        top: 16px;
                        background: none;
                        border: none;
                        color: #94A3B8;
                        cursor: pointer;
                    }

                    .modal-title {
                        font-size: 17px;
                        font-weight: 700;
                        color: #0F172A;
                        margin: 0 0 6px 0;
                    }

                    .modal-desc {
                        font-size: 13px;
                        color: #64748B;
                        margin: 0 0 16px 0;
                        line-height: 1.5;
                    }

                    .modal-details {
                        background: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        border-radius: 8px;
                        padding: 12px 14px;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        font-size: 12.5px;
                        margin-bottom: 20px;
                    }

                    .modal-row {
                        display: flex;
                        justify-content: space-between;
                    }

                    .modal-row.divider {
                        border-top: 1px solid #E2E8F0;
                        padding-top: 8px;
                        margin-top: 2px;
                    }

                    .modal-actions {
                        display: flex;
                        gap: 10px;
                    }

                    .btn-secondary {
                        flex: 1;
                        padding: 10px;
                        background: #F8FAFC;
                        border: 1px solid #CBD5E1;
                        border-radius: 8px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #334155;
                        cursor: pointer;
                        font-family: inherit;
                    }

                    .btn-primary {
                        flex: 2;
                        padding: 10px;
                        background: #0086FF;
                        border: none;
                        border-radius: 8px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #FFFFFF;
                        cursor: pointer;
                        font-family: inherit;
                    }

                    .mini-spin {
                        width: 10px;
                        height: 10px;
                        border: 2px solid #64748B;
                        border-top-color: transparent;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }

                    /* Dark Mode */
                    :global(body.dark-mode) .reseller-header-bar,
                    :global(body.dark-mode) .kpi-box,
                    :global(body.dark-mode) .content-card,
                    :global(body.dark-mode) .modal-box {
                        background: #0F172A !important;
                        border-color: #1E293B !important;
                    }

                    :global(body.dark-mode) .header-title,
                    :global(body.dark-mode) .kpi-number,
                    :global(body.dark-mode) .card-title,
                    :global(body.dark-mode) .form-label,
                    :global(body.dark-mode) .summary-heading,
                    :global(body.dark-mode) .summary-val,
                    :global(body.dark-mode) .total-text,
                    :global(body.dark-mode) .font-medium,
                    :global(body.dark-mode) .font-semibold,
                    :global(body.dark-mode) .modal-title,
                    :global(body.dark-mode) .clean-table td {
                        color: #F8FAFC !important;
                    }

                    :global(body.dark-mode) .clean-input,
                    :global(body.dark-mode) .network-btn,
                    :global(body.dark-mode) .chip,
                    :global(body.dark-mode) .summary-card,
                    :global(body.dark-mode) .wallet-status-box,
                    :global(body.dark-mode) .btn-refresh,
                    :global(body.dark-mode) .btn-page,
                    :global(body.dark-mode) .modal-details,
                    :global(body.dark-mode) .btn-secondary {
                        background: #1E293B !important;
                        border-color: #334155 !important;
                        color: #E2E8F0 !important;
                    }

                    :global(body.dark-mode) .network-btn.active {
                        border-color: #0086FF !important;
                        background: rgba(0, 134, 255, 0.12) !important;
                    }

                    :global(body.dark-mode) .chip.active {
                        background: #0086FF !important;
                        color: #FFFFFF !important;
                    }

                    :global(body.dark-mode) .clean-table th {
                        background: #1E293B !important;
                        border-color: #334155 !important;
                        color: #94A3B8 !important;
                    }

                    :global(body.dark-mode) .clean-table td,
                    :global(body.dark-mode) .summary-divider,
                    :global(body.dark-mode) .pagination,
                    :global(body.dark-mode) .modal-row.divider {
                        border-color: #1E293B !important;
                    }

                    :global(body.dark-mode) .clean-table tbody tr:hover td {
                        background: rgba(255, 255, 255, 0.02) !important;
                    }

                    :global(body.dark-mode) .network-tag,
                    :global(body.dark-mode) .ref-code {
                        background: #334155 !important;
                        color: #94A3B8 !important;
                    }

                    @media (max-width: 1024px) {
                        .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                        .dispatch-grid { grid-template-columns: 1fr; }
                    }

                    @media (max-width: 640px) {
                        .kpi-grid { grid-template-columns: 1fr; }
                        .network-selector { grid-template-columns: 1fr; }
                        .reseller-header-bar,
                        .content-card { padding: 18px; }
                    }
                `}</style>
            </div>
        );
    }

    // ==========================================
    // VIEW 2: NON-RESELLER ONBOARDING & APPLICATION
    // ==========================================
    return (
        <div className="onboarding-wrapper">
            {/* Header */}
            <div className="page-header">
                <div className="header-flex">
                    <div>
                        <span className="section-kicker">Partner Program</span>
                        <h1 className="page-title">Wholesale & Reseller Program</h1>
                        <p className="page-subtitle">
                            Volume pricing, sub-account bandwidth provisioning, and REST API access for agencies and proxy distributors.
                        </p>
                    </div>
                    <div className="header-contact-group">
                        <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="btn-header-contact whatsapp">
                            <WhatsAppIcon size={16} />
                            <span>WhatsApp</span>
                        </a>
                        <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="btn-header-contact telegram">
                            <TelegramIcon size={16} />
                            <span>Telegram</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Core Program Features */}
            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon"><Users size={18} /></div>
                    <h3 className="feature-title">Sub-Account Dispatch</h3>
                    <p className="feature-desc">
                        Allocate proxy bandwidth directly into your clients&apos; registered RealProxy accounts from your dashboard.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon"><ShieldCheck size={18} /></div>
                    <h3 className="feature-title">No Bandwidth Expiration</h3>
                    <p className="feature-desc">
                        Purchased wholesale traffic never expires and rolls over continuously across active client accounts.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon"><Code size={18} /></div>
                    <h3 className="feature-title">REST API Provisioning</h3>
                    <p className="feature-desc">
                        Integrate proxy credential rotation and balance top-ups directly with your billing platform or WHMCS.
                    </p>
                </div>
            </div>

            {/* Request Access Card */}
            <div className="portal-card">
                <div className="portal-card-header">
                    <div>
                        <h2 className="portal-title">Request Reseller Access</h2>
                        <p className="portal-desc">
                            Select your volume requirements to send a direct inquiry to our accounts team.
                        </p>
                    </div>
                </div>

                <div className="portal-layout">
                    {/* Left: Clean Form */}
                    <div className="form-column">
                        <div className="field-block">
                            <label className="field-label">Account Email</label>
                            <div className="field-input-box">
                                <Mail size={15} className="field-icon" />
                                <input
                                    type="email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="native-input"
                                />
                            </div>
                        </div>

                        <div className="field-block">
                            <label className="field-label">Estimated Monthly Volume</label>
                            <select
                                value={expectedVolume}
                                onChange={(e) => setExpectedVolume(e.target.value)}
                                className="native-select"
                            >
                                <option value="100 GB - 250 GB">100 GB – 250 GB</option>
                                <option value="250 GB - 500 GB">250 GB – 500 GB</option>
                                <option value="500 GB - 1 TB">500 GB – 1 TB</option>
                                <option value="1 TB - 5 TB">1 TB – 5 TB</option>
                                <option value="5 TB+ (Enterprise)">5 TB+ (Enterprise Volume)</option>
                            </select>
                        </div>

                        <div className="field-block">
                            <label className="field-label">Proxy Network</label>
                            <select
                                value={inquiryProxyType}
                                onChange={(e) => setInquiryProxyType(e.target.value)}
                                className="native-select"
                            >
                                <option value="Residential Proxies">Residential Proxies</option>
                                <option value="Premium Residential Proxies">Premium Residential Proxies</option>
                                <option value="Both Residential & Premium">Both Residential & Premium</option>
                            </select>
                        </div>

                        <div className="field-block">
                            <label className="field-label">Additional Notes (Optional)</label>
                            <textarea
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                placeholder="Target countries, expected concurrency, or integration requirements..."
                                rows={2}
                                className="native-textarea"
                            />
                        </div>
                    </div>

                    {/* Right: Request Summary & Action Buttons */}
                    <div className="summary-column">
                        <div className="summary-panel">
                            <h3 className="panel-title">Inquiry Overview</h3>
                            <div className="panel-meta-list">
                                <div className="panel-row">
                                    <span className="panel-label">Account:</span>
                                    <span className="panel-val">{userEmail || '—'}</span>
                                </div>
                                <div className="panel-row">
                                    <span className="panel-label">Volume:</span>
                                    <span className="panel-val font-semibold">{expectedVolume}</span>
                                </div>
                                <div className="panel-row">
                                    <span className="panel-label">Network:</span>
                                    <span className="panel-val">{inquiryProxyType}</span>
                                </div>
                                {customNote.trim() && (
                                    <div className="panel-row note">
                                        <span className="panel-label">Notes:</span>
                                        <span className="panel-val-note">{customNote.trim()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="panel-actions">
                                <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-action-whatsapp"
                                >
                                    <WhatsAppIcon size={18} />
                                    <span>Contact on WhatsApp</span>
                                </a>

                                <a
                                    href={telegramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-action-telegram"
                                >
                                    <TelegramIcon size={17} />
                                    <span>Contact on Telegram</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(generatedInquiryMessage, 'inquiry_msg', 'Inquiry copied to clipboard.')}
                                    className="btn-action-tertiary"
                                >
                                    {copiedField === 'inquiry_msg' ? <Check size={14} /> : <Copy size={14} />}
                                    <span>Copy Inquiry Text</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Accordion */}
            <div className="portal-card">
                <div className="faq-header">
                    <HelpCircle size={17} className="faq-icon" />
                    <h3 className="portal-title">Frequently Asked Questions</h3>
                </div>

                <div className="faq-list">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div key={idx} className={`faq-row ${isOpen ? 'active' : ''}`}>
                                <button
                                    type="button"
                                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                    className="faq-btn"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        size={16}
                                        className={`faq-arrow ${isOpen ? 'open' : ''}`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="faq-body">
                                        <p>{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scoped Styles for Onboarding View */}
            <style jsx>{`
                .onboarding-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-bottom: 50px;
                    font-family: var(--font-poppins, -apple-system, BlinkMacSystemFont, sans-serif);
                }

                .page-header {
                    margin-bottom: 22px;
                }

                .header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .header-contact-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .btn-header-contact {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.15s ease;
                }

                .btn-header-contact.whatsapp {
                    background: rgba(37, 211, 102, 0.1);
                    color: #16A34A;
                    border: 1px solid rgba(37, 211, 102, 0.3);
                }

                .btn-header-contact.whatsapp:hover {
                    background: rgba(37, 211, 102, 0.2);
                }

                .btn-header-contact.telegram {
                    background: rgba(34, 158, 217, 0.1);
                    color: #0284C7;
                    border: 1px solid rgba(34, 158, 217, 0.3);
                }

                .btn-header-contact.telegram:hover {
                    background: rgba(34, 158, 217, 0.2);
                }

                .section-kicker {
                    display: inline-block;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #0086FF;
                    margin-bottom: 4px;
                }

                .page-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 6px 0;
                    letter-spacing: -0.3px;
                }

                .page-subtitle {
                    font-size: 14px;
                    color: #64748B;
                    margin: 0;
                    max-width: 680px;
                    line-height: 1.5;
                }

                /* Features Grid */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .feature-card {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 20px 22px;
                }

                .feature-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    background: #F1F5F9;
                    color: #0F172A;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                }

                .feature-title {
                    font-size: 14.5px;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 5px 0;
                }

                .feature-desc {
                    font-size: 13px;
                    color: #64748B;
                    line-height: 1.5;
                    margin: 0;
                }

                /* Portal Card */
                .portal-card {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 14px;
                    padding: 24px 26px;
                    margin-bottom: 20px;
                }

                .portal-card-header {
                    margin-bottom: 20px;
                }

                .portal-title {
                    font-size: 16.5px;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 3px 0;
                }

                .portal-desc {
                    font-size: 13px;
                    color: #64748B;
                    margin: 0;
                }

                .portal-layout {
                    display: grid;
                    grid-template-columns: 1.35fr 1fr;
                    gap: 26px;
                }

                .form-column {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .field-block {
                    display: flex;
                    flex-direction: column;
                }

                .field-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1E293B;
                    margin-bottom: 6px;
                }

                .field-input-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                :global(.field-icon) {
                    position: absolute;
                    left: 12px;
                    color: #94A3B8;
                    pointer-events: none;
                }

                .native-input {
                    width: 100%;
                    padding: 10px 12px 10px 38px;
                    background: #F8FAFC;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    font-size: 13.5px;
                    font-family: inherit;
                    color: #0F172A;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 0.15s ease;
                }

                .native-input:focus {
                    border-color: #0086FF;
                    background: #FFFFFF;
                }

                .native-select {
                    width: 100%;
                    padding: 10px 12px;
                    background: #F8FAFC;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    font-size: 13.5px;
                    font-family: inherit;
                    color: #0F172A;
                    outline: none;
                    box-sizing: border-box;
                    cursor: pointer;
                }

                .native-select:focus {
                    border-color: #0086FF;
                    background: #FFFFFF;
                }

                .native-textarea {
                    width: 100%;
                    padding: 10px 12px;
                    background: #F8FAFC;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    font-size: 13px;
                    font-family: inherit;
                    color: #0F172A;
                    outline: none;
                    box-sizing: border-box;
                    resize: vertical;
                }

                .native-textarea:focus {
                    border-color: #0086FF;
                    background: #FFFFFF;
                }

                /* Summary Column */
                .summary-column {
                    display: flex;
                    flex-direction: column;
                }

                .summary-panel {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 18px 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                    box-sizing: border-box;
                }

                .panel-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 14px 0;
                }

                .panel-meta-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    font-size: 12.5px;
                    margin-bottom: 18px;
                }

                .panel-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .panel-row.note {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 3px;
                    border-top: 1px solid #E2E8F0;
                    padding-top: 8px;
                }

                .panel-label {
                    color: #64748B;
                }

                .panel-val {
                    color: #0F172A;
                }

                .panel-val-note {
                    font-size: 11.5px;
                    color: #475569;
                    font-style: italic;
                }

                .panel-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                }

                .btn-action-whatsapp {
                    width: 100%;
                    padding: 11px;
                    background: #25D366;
                    color: #FFFFFF;
                    border-radius: 8px;
                    font-size: 13.5px;
                    font-weight: 600;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-sizing: border-box;
                    transition: background-color 0.15s ease;
                }

                .btn-action-whatsapp:hover {
                    background: #20BD5A;
                }

                .btn-action-telegram {
                    width: 100%;
                    padding: 11px;
                    background: #229ED9;
                    color: #FFFFFF;
                    border-radius: 8px;
                    font-size: 13.5px;
                    font-weight: 600;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-sizing: border-box;
                    transition: background-color 0.15s ease;
                }

                .btn-action-telegram:hover {
                    background: #1E8DC2;
                }

                .btn-action-tertiary {
                    width: 100%;
                    padding: 9px;
                    background: transparent;
                    border: 1px solid #CBD5E1;
                    color: #64748B;
                    border-radius: 8px;
                    font-size: 12.5px;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .btn-action-tertiary:hover {
                    color: #0F172A;
                    border-color: #94A3B8;
                }

                /* FAQ */
                .faq-header {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin-bottom: 16px;
                }

                :global(.faq-icon) {
                    color: #64748B;
                }

                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .faq-row {
                    border: 1px solid #E2E8F0;
                    border-radius: 9px;
                    overflow: hidden;
                }

                .faq-row.active {
                    border-color: #CBD5E1;
                }

                .faq-btn {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 13px 16px;
                    background: #FFFFFF;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    color: #0F172A;
                    font-size: 13.5px;
                    font-weight: 600;
                    font-family: inherit;
                }

                :global(.faq-arrow) {
                    color: #94A3B8;
                    transition: transform 0.15s ease;
                    flex-shrink: 0;
                }

                :global(.faq-arrow.open) {
                    transform: rotate(180deg);
                }

                .faq-body {
                    padding: 0 16px 14px 16px;
                    font-size: 13px;
                    color: #64748B;
                    line-height: 1.5;
                }

                .faq-body p {
                    margin: 0;
                }

                /* Dark Mode */
                :global(body.dark-mode) .feature-card,
                :global(body.dark-mode) .portal-card {
                    background: #0F172A !important;
                    border-color: #1E293B !important;
                }

                :global(body.dark-mode) .page-title,
                :global(body.dark-mode) .feature-title,
                :global(body.dark-mode) .portal-title,
                :global(body.dark-mode) .field-label,
                :global(body.dark-mode) .panel-title,
                :global(body.dark-mode) .panel-val,
                :global(body.dark-mode) .faq-btn {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .feature-icon {
                    background: #1E293B !important;
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .native-input,
                :global(body.dark-mode) .native-select,
                :global(body.dark-mode) .native-textarea,
                :global(body.dark-mode) .summary-panel,
                :global(body.dark-mode) .faq-row,
                :global(body.dark-mode) .faq-btn {
                    background: #1E293B !important;
                    border-color: #334155 !important;
                    color: #E2E8F0 !important;
                }

                :global(body.dark-mode) .btn-header-contact.whatsapp {
                    background: rgba(37, 211, 102, 0.15) !important;
                    color: #4ADE80 !important;
                    border-color: rgba(37, 211, 102, 0.35) !important;
                }

                :global(body.dark-mode) .btn-header-contact.telegram {
                    background: rgba(34, 158, 217, 0.15) !important;
                    color: #38BDF8 !important;
                    border-color: rgba(34, 158, 217, 0.35) !important;
                }

                :global(body.dark-mode) .panel-row.note {
                    border-color: #334155 !important;
                }

                :global(body.dark-mode) .btn-action-tertiary {
                    border-color: #334155 !important;
                    color: #94A3B8 !important;
                }

                @media (max-width: 1024px) {
                    .features-grid { grid-template-columns: 1fr; }
                    .portal-layout { grid-template-columns: 1fr; }
                }

                @media (max-width: 640px) {
                    .portal-card { padding: 18px; }
                    .page-title { font-size: 20px; }
                }
            `}</style>
        </div>
    );
}
