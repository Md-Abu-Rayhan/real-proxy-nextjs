"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Wallet,
    ArrowDownRight,
    ArrowUpRight,
    QrCode,
    Copy,
    Check,
    RefreshCw,
    Shield,
    ExternalLink,
    CreditCard,
    DollarSign,
    AlertCircle,
    TrendingUp,
    Smartphone,
    Gift,
    Clock,
    ArrowRight,
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';
import { useWallet } from '@/context/WalletContext';
import { createPaymentSession, getPaymentStatus, getUserFromToken } from '@/lib/paymentApi';
import Link from 'next/link';
import { DepositSuccessModal, DepositSuccessData } from '@/components/ui/DepositSuccessModal';

interface StaticWalletData {
    currency: string;
    network: string;
    address: string;
    qrCodeUrl?: string;
    paymentUrl?: string;
    minimumDepositUsd: number;
}

interface TransactionItem {
    id: number;
    transactionType: string;
    amountUsd: number;
    amountBdt: number;
    balanceBefore: number;
    balanceAfter: number;
    paymentMethod: string;
    gatewayTransactionId?: string;
    referenceId?: string;
    status: string;
    description: string;
    promoCodeApplied?: string;
    discountAmountUsd: number;
    createdAt: string;
}

const SUPPORTED_CRYPTO_NETWORKS = [
    { currency: 'USDT', network: 'tron', label: 'USDT (TRC-20)', badge: 'Recommended', speed: '< 2 min', min: '$1.00' },
    { currency: 'USDT', network: 'bsc', label: 'USDT (BEP-20)', badge: 'Low Fee', speed: '< 1 min', min: '$1.00' },
    { currency: 'USDT', network: 'polygon', label: 'USDT (Polygon)', badge: 'Fastest', speed: '< 30s', min: '$1.00' },
    { currency: 'LTC', network: 'ltc', label: 'Litecoin (LTC)', badge: 'Low Fee', speed: '< 5 min', min: '$1.00' },
    { currency: 'TRX', network: 'tron', label: 'TRX (TRON)', badge: 'Fast', speed: '< 2 min', min: '$1.00' },
    { currency: 'BTC', network: 'btc', label: 'Bitcoin (BTC)', badge: 'Mainnet', speed: '10-30 min', min: '$5.00' },
];

export default function WalletPage() {
    const {
        balanceUsd,
        balanceBdt,
        affiliateBalanceUsd,
        totalDepositedUsd,
        totalSpentUsd,
        exchangeRateBdt,
        refreshWallet
    } = useWallet();

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'bkash' | 'eps' | 'crypto'>('bkash');
    const [customBdt, setCustomBdt] = useState<string>('1000');
    const [isPayStationLoading, setIsPayStationLoading] = useState<boolean>(false);
    const [isEpsLoading, setIsEpsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Crypto State
    const [selectedCrypto, setSelectedCrypto] = useState(SUPPORTED_CRYPTO_NETWORKS[0]);
    const [staticWallet, setStaticWallet] = useState<StaticWalletData | null>(null);
    const [isCryptoLoading, setIsCryptoLoading] = useState<boolean>(false);
    const [isSyncingCrypto, setIsSyncingCrypto] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    // Transactions State
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isTxLoading, setIsTxLoading] = useState<boolean>(false);
    const [txPage, setTxPage] = useState<number>(1);
    const [txTotalPages, setTxTotalPages] = useState<number>(1);
    const [txFilter, setTxFilter] = useState<string>('ALL');

    // Affiliate Convert State
    const [isConvertingAffiliate, setIsConvertingAffiliate] = useState<boolean>(false);

    // Deposit Celebration Modal State
    const [depositSuccessData, setDepositSuccessData] = useState<DepositSuccessData | null>(null);
    const [isDepositSuccessOpen, setIsDepositSuccessOpen] = useState<boolean>(false);
    const lastKnownBalanceRef = useRef<number>(balanceUsd);

    useEffect(() => {
        if (balanceUsd > 0) {
            lastKnownBalanceRef.current = balanceUsd;
        }
    }, [balanceUsd]);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshWallet();
            await fetchTransactions(txPage, txFilter);
            toast.success("Wallet balance updated!");
        } catch {
            // Ignore
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    // Fetch Transactions
    const fetchTransactions = useCallback(async (page = 1, filter = txFilter) => {
        setIsTxLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/api/Wallet/transactions`, {
                params: { page, pageSize: 8, typeFilter: filter },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                setTransactions(res.data.items || []);
                setTxTotalPages(res.data.totalPages || 1);
            }
        } catch (error) {
            console.warn("Failed to fetch transactions:", error);
        } finally {
            setIsTxLoading(false);
        }
    }, [txFilter]);

    useEffect(() => {
        fetchTransactions(txPage, txFilter);
    }, [txPage, txFilter, fetchTransactions]);

    // Check return callback from PayStation
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const invoice = params.get('invoice');
        const status = params.get('status');

        if (!invoice) return;

        if (status === 'success') {
            getPaymentStatus(invoice).then(async (result) => {
                if (result && (result.status === 'SUCCESS' || result.status === 'Paid')) {
                    const bdtAmount = Number(result.amount || 0);
                    const currentRate = exchangeRateBdt > 0 ? exchangeRateBdt : 125;
                    const usdEquiv = Number((bdtAmount / currentRate).toFixed(2));

                    const updated = await refreshWallet();
                    await fetchTransactions(1, txFilter);

                    const newBal = updated?.balanceUsd ?? (balanceUsd + usdEquiv);
                    lastKnownBalanceRef.current = newBal;

                    setDepositSuccessData({
                        amountUsd: usdEquiv,
                        newBalanceUsd: newBal,
                        currency: 'BDT',
                        network: `৳${bdtAmount.toLocaleString()} BDT`,
                        method: 'PayStation (bKash)'
                    });
                    setIsDepositSuccessOpen(true);

                    toast.success(`🎉 Deposit Confirmed! ৳${bdtAmount.toLocaleString()} BDT (+$${usdEquiv} USD) credited to your wallet!`, {
                        duration: 6000
                    });
                }
            }).catch(() => {
                refreshWallet();
            }).finally(() => {
                window.history.replaceState({}, '', window.location.pathname);
            });
        } else if (status === 'failed' || status === 'cancelled') {
            toast.error("Payment was cancelled or could not be completed. No funds were deducted.", { duration: 5000 });
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [refreshWallet, fetchTransactions, txFilter]);

    // Fetch Static Crypto Wallet Address
    const fetchStaticWallet = useCallback(async (currency: string, network: string) => {
        setIsCryptoLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/api/Wallet/crypto/static-address`, {
                params: { currency, network },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                setStaticWallet(res.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load crypto deposit address.");
        } finally {
            setIsCryptoLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'crypto') {
            fetchStaticWallet(selectedCrypto.currency, selectedCrypto.network);
        }
    }, [activeTab, selectedCrypto, fetchStaticWallet]);

    // Auto-sync for incoming crypto deposit (every 5 seconds while on crypto tab)
    useEffect(() => {
        if (activeTab !== 'crypto') return;

        let isPolling = false;
        const checkDeposits = async () => {
            if (isPolling) return;
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            isPolling = true;
            try {
                const prevBal = lastKnownBalanceRef.current;
                const syncRes = await axios.post(`${API_URL}/api/Wallet/crypto/sync`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = syncRes.data;
                const newlyCredited = (data?.newlyCreditedCount ?? 0) > 0;
                const backendBalance = typeof data?.newBalanceUsd === 'number' ? data.newBalanceUsd : null;
                const balanceIncreased = backendBalance !== null && prevBal > 0 && backendBalance > prevBal + 0.001;

                if (newlyCredited || balanceIncreased) {
                    const amountAdded = newlyCredited && data?.totalCreditedUsd > 0
                        ? Number(data.totalCreditedUsd)
                        : (backendBalance !== null && prevBal > 0 ? Number((backendBalance - prevBal).toFixed(2)) : 0);

                    if (backendBalance !== null) {
                        lastKnownBalanceRef.current = backendBalance;
                    }

                    // Refresh wallet state across entire application
                    await refreshWallet();
                    await fetchTransactions(1, txFilter);

                    // Trigger the celebratory Deposit Success Modal Popup
                    setDepositSuccessData({
                        amountUsd: amountAdded > 0 ? amountAdded : (backendBalance !== null && prevBal > 0 ? backendBalance - prevBal : 0),
                        newBalanceUsd: backendBalance ?? (prevBal + amountAdded),
                        currency: selectedCrypto.currency,
                        network: selectedCrypto.label,
                        method: 'Cryptomus'
                    });
                    setIsDepositSuccessOpen(true);

                    toast.success(`🎉 Deposit Confirmed! +$${amountAdded.toFixed(2)} USD added to your wallet!`, {
                        duration: 6000
                    });
                }
            } catch {
                // Ignore background polling errors
            } finally {
                isPolling = false;
            }
        };

        const interval = setInterval(checkDeposits, 5000);
        return () => clearInterval(interval);
    }, [activeTab, selectedCrypto, refreshWallet, fetchTransactions, txFilter]);

    const handleSyncCryptoDeposits = async () => {
        setIsSyncingCrypto(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error("Please login to check deposits.");
                return;
            }

            const prevBal = lastKnownBalanceRef.current || balanceUsd;

            const res = await axios.post(`${API_URL}/api/Wallet/crypto/sync`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Always immediately refresh wallet summary so UI is guaranteed up to date with DB
            const updatedSummary = await refreshWallet();
            await fetchTransactions(1, txFilter);

            const data = res.data;
            const newlyCredited = (data?.newlyCreditedCount ?? 0) > 0;
            const backendBalance = typeof data?.newBalanceUsd === 'number'
                ? data.newBalanceUsd
                : (updatedSummary?.balanceUsd ?? null);

            const balanceIncreased = backendBalance !== null && backendBalance > prevBal + 0.001;

            if (newlyCredited || balanceIncreased) {
                const amountAdded = newlyCredited && data?.totalCreditedUsd > 0
                    ? Number(data.totalCreditedUsd)
                    : (backendBalance !== null && prevBal > 0 ? Number((backendBalance - prevBal).toFixed(2)) : 0);

                if (backendBalance !== null) {
                    lastKnownBalanceRef.current = backendBalance;
                }

                setDepositSuccessData({
                    amountUsd: amountAdded > 0 ? amountAdded : (backendBalance !== null && prevBal > 0 ? backendBalance - prevBal : 0),
                    newBalanceUsd: backendBalance ?? (prevBal + amountAdded),
                    currency: selectedCrypto.currency,
                    network: selectedCrypto.label,
                    method: 'Cryptomus'
                });
                setIsDepositSuccessOpen(true);

                toast.success(`🎉 Deposit Confirmed! +$${amountAdded.toFixed(2)} USD added to your wallet!`, {
                    duration: 6000
                });
            } else {
                toast(`Scanning Blockchain & Cryptomus... No new uncredited payment found yet. Current balance: $${(backendBalance ?? prevBal).toFixed(2)} USD. If you just sent crypto, please allow 1-2 minutes for blockchain confirmations.`, {
                    icon: '⏳',
                    duration: 6000
                });
            }
        } catch (error: any) {
            console.error("Crypto sync error:", error);
            // Even on error, attempt refreshing wallet just in case
            await refreshWallet();
            toast.error(error.response?.data?.message || "Failed to check crypto deposit status.");
        } finally {
            setIsSyncingCrypto(false);
        }
    };

    const handleCopyAddress = () => {
        if (!staticWallet?.address) return;
        navigator.clipboard.writeText(staticWallet.address);
        setCopied(true);
        toast.success("Address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePayStationTopUp = async () => {
        const amount = Number(customBdt);
        if (!amount || amount < 500) {
            toast.error("Minimum deposit amount for bKash is ৳500 BDT.");
            return;
        }

        const userInfo = getUserFromToken();
        if (!userInfo || !userInfo.userId) {
            toast.error("Please login to proceed with top-up.");
            router.push('/login');
            return;
        }

        setIsPayStationLoading(true);
        try {
            const userPhone = localStorage.getItem('user_phone') || "01700000000";
            const userName = localStorage.getItem('user_name') || userInfo.email.split('@')[0];

            const session = await createPaymentSession({
                sourceApp: "REALPROXY",
                userId: userInfo.userId,
                amount: amount,
                currency: "BDT",
                gatewayProvider: "PayStation",
                customerEmail: userInfo.email,
                customerPhone: userPhone,
                customerName: userName,
                callbackUrl: `${window.location.origin}/dashboard/wallet`,
                itemCategory: "WalletTopup",
                externalReference: `WLT-${userInfo.userId}-${amount}BDT`
            });

            if (session.success && (session.hostedInvoiceUrl || session.paymentUrl)) {
                toast.success("Redirecting to PayStation (bKash)...");
                window.location.href = session.hostedInvoiceUrl || session.paymentUrl!;
            } else {
                toast.error(session.message || "Failed to initialize PayStation payment.");
                setIsPayStationLoading(false);
            }
        } catch (error: any) {
            console.error("PayStation top-up error:", error);
            toast.error("Payment initialization failed. Please try again.");
            setIsPayStationLoading(false);
        }
    };

    const handleEpsTopUp = async () => {
        const amount = Number(customBdt);
        if (!amount || amount < 125) {
            toast.error("Minimum deposit amount for Nagad / Cards is ৳125 BDT ($1.00 USD).");
            return;
        }

        setIsEpsLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error("Please login to proceed with top-up.");
                router.push('/login');
                return;
            }

            const res = await axios.post(`${API_URL}/api/Wallet/topup/eps/initialize`, {
                amountBdt: amount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.redirectUrl) {
                toast.success("Redirecting to EPS Payment Gateway (Nagad / Cards)...");
                window.location.href = res.data.redirectUrl;
            } else {
                toast.error(res.data?.message || "Failed to initialize EPS payment.");
                setIsEpsLoading(false);
            }
        } catch (error: any) {
            console.error("EPS top-up error:", error);
            toast.error(error.response?.data?.message || "Failed to start EPS top-up.");
            setIsEpsLoading(false);
        }
    };

    const handleConvertAffiliate = async () => {
        if (affiliateBalanceUsd <= 0) {
            toast.error("No affiliate earnings available to transfer.");
            return;
        }

        setIsConvertingAffiliate(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.post(`${API_URL}/api/Wallet/convert-affiliate`, {
                amountUsd: affiliateBalanceUsd
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                toast.success(res.data.message || "Transferred earnings to wallet balance!");
                await refreshWallet();
                fetchTransactions(1, txFilter);
            } else {
                toast.error(res.data?.message || "Conversion failed.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to convert affiliate balance.");
        } finally {
            setIsConvertingAffiliate(false);
        }
    };

    const rate = exchangeRateBdt || 125;
    const calculatedUsdForBdt = (Number(customBdt) || 0) / rate;

    return (
        <div className="main-responsive-container">
            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Available Balance */}
                <div className="stat-card balance-highlight-card">
                    <div className="stat-card-header">
                        <div className="stat-title-group">
                            <span className="stat-title">Available Balance</span>
                            <button
                                type="button"
                                onClick={handleManualRefresh}
                                className="refresh-mini-btn"
                                title="Refresh Balance"
                            >
                                <RefreshCw size={12} className={isRefreshing ? "spinner" : ""} />
                            </button>
                        </div>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(0, 134, 255, 0.1)' }}>
                            <Wallet color="#0086FF" size={17} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <p className="stat-value text-primary">${balanceUsd.toFixed(2)}</p>
                        <div className="balance-sub-row">
                            <span className="stat-sub">≈ ৳{balanceBdt.toFixed(2)} BDT</span>
                            <span className="mini-rate-tag" title="Exchange Rate">৳{rate.toFixed(0)}/$1</span>
                        </div>
                    </div>
                </div>

                {/* Total Deposited */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-title">Total Deposited</span>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                            <ArrowDownRight color="#10B981" size={17} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <p className="stat-value">${totalDepositedUsd.toFixed(2)}</p>
                        <span className="stat-sub">All-time approved funds</span>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-title">Total Spent</span>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                            <ArrowUpRight color="#6366F1" size={17} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <p className="stat-value">${totalSpentUsd.toFixed(2)}</p>
                        <span className="stat-sub">Bandwidth purchases</span>
                    </div>
                </div>

                {/* Affiliate Earnings */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-title">Affiliate Earnings</span>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                            <Gift color="#F59E0B" size={17} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <p className="stat-value">${affiliateBalanceUsd.toFixed(2)}</p>
                        {affiliateBalanceUsd > 0 ? (
                            <button
                                type="button"
                                onClick={handleConvertAffiliate}
                                disabled={isConvertingAffiliate}
                                className="stat-action-link"
                            >
                                {isConvertingAffiliate ? 'Transferring...' : 'Transfer to Wallet →'}
                            </button>
                        ) : (
                            <Link href="/dashboard/affiliate" className="stat-action-link text-muted">
                                Earn with referrals →
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Left (Add Funds) & Right (Ledger) */}
            <div className="dashboard-main-grid">
                {/* Left Column: Add Funds Card */}
                <div className="actions-column">
                    <div className="action-card">
                        <div className="action-header">
                            <div className="action-title-row">
                                <h2 className="action-title">Add Funds to Wallet</h2>
                                <div className="compact-exchange-pill" title="Official Conversion Rate">
                                    <TrendingUp size={13} color="#0086FF" />
                                    <span>Exchange Rate: <strong>৳{rate.toFixed(2)} BDT = $1.00 USD</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Top-up Method Switcher */}
                        <div className="tab-nav-row">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('bkash');
                                    if (!customBdt || Number(customBdt) < 500) {
                                        setCustomBdt('1000');
                                    }
                                }}
                                className={`method-tab-btn ${activeTab === 'bkash' ? 'active bkash-active' : ''}`}
                            >
                                <div className="tab-icon-box">
                                    <img
                                        src="/bKash-Logo.png"
                                        alt="bKash"
                                        className="mfs-logo bkash-logo-img"
                                        style={{ maxHeight: '22px', maxWidth: '36px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
                                    />
                                </div>
                                <span className="tab-title">bKash</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('eps');
                                    if (!customBdt || Number(customBdt) < 125) {
                                        setCustomBdt('1000');
                                    }
                                }}
                                className={`method-tab-btn ${activeTab === 'eps' ? 'active eps-active' : ''}`}
                            >
                                <div className="tab-icon-box eps-icons-combo">
                                    <img
                                        src="/Nagad-Logo.png"
                                        alt="Nagad"
                                        className="mfs-logo nagad-logo-img"
                                        style={{ maxHeight: '20px', maxWidth: '32px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
                                    />
                                    <CreditCard size={13} className="mfs-card-icon" />
                                </div>
                                <span className="tab-title">Nagad / Cards</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('crypto')}
                                className={`method-tab-btn ${activeTab === 'crypto' ? 'active crypto-active' : ''}`}
                            >
                                <div className="tab-icon-box crypto-icon-box">
                                    <QrCode size={18} />
                                </div>
                                <span className="tab-title">Crypto</span>
                            </button>
                        </div>

                        {activeTab === 'bkash' ? (
                            <div className="method-content">
                                {/* 3-Step Guide for bKash via PayStation */}
                                <div className="step-guide-strip">
                                    <div className="guide-step">
                                        <span className="step-num bkash-step-num">1</span>
                                        <span>Enter Amount</span>
                                    </div>
                                    <span className="guide-arrow">→</span>
                                    <div className="guide-step">
                                        <span className="step-num bkash-step-num">2</span>
                                        <span>bKash Checkout</span>
                                    </div>
                                    <span className="guide-arrow">→</span>
                                    <div className="guide-step">
                                        <span className="step-num bkash-step-num">3</span>
                                        <span>Instant Credit</span>
                                    </div>
                                </div>

                                {/* Presets */}
                                <div className="field-group">
                                    <div className="field-label-row">
                                        <label className="field-label">Quick Select (BDT)</label>
                                        <span className="field-hint">Minimum Deposit: ৳500 BDT (~${(500 / rate).toFixed(2)} USD)</span>
                                    </div>
                                    <div className="presets-row">
                                        {[500, 1000, 2500, 5000, 10000].map((amt) => {
                                            const isSelected = customBdt === amt.toString();
                                            const usd = (amt / rate).toFixed(0);
                                            return (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setCustomBdt(amt.toString())}
                                                    className={`preset-btn preset-bkash ${isSelected ? 'selected selected-bkash' : ''}`}
                                                >
                                                    <span className="preset-bdt">৳{amt.toLocaleString()}</span>
                                                    <span className="preset-usd">≈ ${usd} USD</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Amount */}
                                <div className="field-group">
                                    <label className="field-label">Custom Amount in BDT</label>
                                    <div className="input-wrap">
                                        <span className="currency-prefix">৳</span>
                                        <input
                                            type="number"
                                            min="500"
                                            step="1"
                                            value={customBdt}
                                            onChange={(e) => setCustomBdt(e.target.value)}
                                            placeholder="Enter amount (min ৳500)"
                                            className="text-input"
                                        />
                                        <span className="currency-suffix">BDT</span>
                                    </div>
                                    {customBdt !== '' && Number(customBdt) < 500 && (
                                        <div className="min-bdt-warning bkash-warning">
                                            ⚠️ Minimum deposit amount for bKash is ৳500 BDT
                                        </div>
                                    )}
                                </div>

                                {/* Conversion Preview */}
                                <div className="conversion-info-box conv-bkash-theme">
                                    <div className="conv-text-side">
                                        <div className="conv-title">Wallet Balance to Credit:</div>
                                        <div className="conv-sub">0% Deposit Gateway Fee • Instant bKash Auto-Credit</div>
                                    </div>
                                    <div className="conv-amt conv-amt-bkash">${calculatedUsdForBdt.toFixed(2)} USD</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handlePayStationTopUp}
                                    disabled={isPayStationLoading || !customBdt || Number(customBdt) < 500}
                                    className="btn-primary custom-action-btn btn-bkash-theme"
                                >
                                    {isPayStationLoading ? (
                                        <>
                                            <RefreshCw size={16} className="spinner" />
                                            <span>Connecting to bKash Gateway (PayStation)...</span>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/bKash-Logo.png" alt="bKash" className="btn-mfs-logo" />
                                            <span>Pay ৳{Number(customBdt || 0).toLocaleString()} BDT with bKash</span>
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : activeTab === 'eps' ? (
                            <div className="method-content">
                                {/* 3-Step Guide for Nagad & Cards via EPS */}
                                <div className="step-guide-strip">
                                    <div className="guide-step">
                                        <span className="step-num eps-step-num">1</span>
                                        <span>Enter Amount</span>
                                    </div>
                                    <span className="guide-arrow">→</span>
                                    <div className="guide-step">
                                        <span className="step-num eps-step-num">2</span>
                                        <span>Select Nagad / Card</span>
                                    </div>
                                    <span className="guide-arrow">→</span>
                                    <div className="guide-step">
                                        <span className="step-num eps-step-num">3</span>
                                        <span>Instant Credit</span>
                                    </div>
                                </div>

                                {/* Supported Channels Bar */}
                                <div className="supported-channels-bar">
                                    <span className="channels-label">Supported by EPS:</span>
                                    <div className="channels-pill-list">
                                        <span className="channel-badge nagad-badge">
                                            <img src="/Nagad-Logo.png" alt="Nagad" className="channel-mini-img" />
                                            <span>Nagad</span>
                                        </span>
                                        <span className="channel-badge card-badge">
                                            <img src="/visa.png" alt="Visa" className="channel-mini-img" />
                                        </span>
                                        <span className="channel-badge card-badge">
                                            <img src="/mastercard.png" alt="Mastercard" className="channel-mini-img" />
                                        </span>
                                        <span className="channel-badge rocket-badge">
                                            <img src="/rocket.png" alt="Rocket" className="channel-mini-img" />
                                            <span>Rocket</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Presets */}
                                <div className="field-group">
                                    <div className="field-label-row">
                                        <label className="field-label">Quick Select (BDT)</label>
                                        <span className="field-hint">Minimum Deposit: ৳125 ($1.00 USD)</span>
                                    </div>
                                    <div className="presets-row">
                                        {[125, 500, 1000, 2500, 5000].map((amt) => {
                                            const isSelected = customBdt === amt.toString();
                                            const usd = (amt / rate).toFixed(0);
                                            return (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setCustomBdt(amt.toString())}
                                                    className={`preset-btn preset-eps ${isSelected ? 'selected selected-eps' : ''}`}
                                                >
                                                    <span className="preset-bdt">৳{amt.toLocaleString()}</span>
                                                    <span className="preset-usd">≈ ${usd} USD</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Amount */}
                                <div className="field-group">
                                    <label className="field-label">Custom Amount in BDT</label>
                                    <div className="input-wrap">
                                        <span className="currency-prefix">৳</span>
                                        <input
                                            type="number"
                                            min="125"
                                            step="1"
                                            value={customBdt}
                                            onChange={(e) => setCustomBdt(e.target.value)}
                                            placeholder="Enter amount (min ৳125)"
                                            className="text-input"
                                        />
                                        <span className="currency-suffix">BDT</span>
                                    </div>
                                    {customBdt !== '' && Number(customBdt) < 125 && (
                                        <div className="min-bdt-warning eps-warning">
                                            ⚠️ Minimum deposit amount for Nagad / Cards is ৳125 BDT ($1.00 USD)
                                        </div>
                                    )}
                                </div>

                                {/* Conversion Preview */}
                                <div className="conversion-info-box conv-eps-theme">
                                    <div className="conv-text-side">
                                        <div className="conv-title">Wallet Balance to Credit:</div>
                                        <div className="conv-sub">0% Deposit Gateway Fee • Instant Auto-Credited</div>
                                    </div>
                                    <div className="conv-amt conv-amt-eps">${calculatedUsdForBdt.toFixed(2)} USD</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleEpsTopUp}
                                    disabled={isEpsLoading || !customBdt || Number(customBdt) < 125}
                                    className="btn-primary custom-action-btn btn-eps-theme"
                                >
                                    {isEpsLoading ? (
                                        <>
                                            <RefreshCw size={16} className="spinner" />
                                            <span>Connecting to EPS Payment Gateway...</span>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/Nagad-Logo.png" alt="Nagad" className="btn-mfs-logo" style={{ height: '18px', width: 'auto', objectFit: 'contain' }} />
                                            <span>Pay ৳{Number(customBdt || 0).toLocaleString()} BDT with Nagad / Cards</span>
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="method-content">
                                {/* 3-Step Crypto Guide */}
                                <div className="step-guide-strip">
                                    <div className="guide-step">
                                        <span className="step-num">1</span>
                                        <span>Select Network</span>
                                    </div>
                                    <span className="guide-arrow">→</span>
                                    <div className="guide-step">
                                        <span className="step-num">2</span>
                                        <span>Transfer Crypto</span>
                                    </div>
                                    <span className="guide-arrow">→</span>
                                    <div className="guide-step">
                                        <span className="step-num">3</span>
                                        <span>Auto Credit</span>
                                    </div>
                                </div>

                                {/* Crypto Networks */}
                                <div className="field-group">
                                    <label className="field-label">Select Cryptocurrency & Network</label>
                                    <div className="crypto-options-grid">
                                        {SUPPORTED_CRYPTO_NETWORKS.map((coin) => {
                                            const isSelected = selectedCrypto.currency === coin.currency && selectedCrypto.network === coin.network;
                                            return (
                                                <button
                                                    key={`${coin.currency}-${coin.network}`}
                                                    type="button"
                                                    onClick={() => setSelectedCrypto(coin)}
                                                    className={`crypto-option-btn ${isSelected ? 'selected' : ''}`}
                                                >
                                                    <span className="coin-lbl">{coin.label}</span>
                                                    <span className="coin-bdg">{coin.badge}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {isCryptoLoading ? (
                                    <div className="crypto-loading">
                                        <div className="small-spinner" />
                                        <p>Generating dedicated address...</p>
                                    </div>
                                ) : staticWallet ? (
                                    <div className="crypto-box">
                                        <div className="qr-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={staticWallet.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(staticWallet.address)}`}
                                                alt="QR Code"
                                                className="qr-image"
                                            />
                                        </div>

                                        <div className="address-container">
                                            <div className="address-info-col">
                                                <span className="addr-header-lbl">Deposit Address:</span>
                                                <span className="address-text">{staticWallet.address}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCopyAddress}
                                                className={`copy-icon-btn ${copied ? "copied" : ""}`}
                                                title="Copy Address"
                                            >
                                                {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                                            </button>
                                        </div>

                                        <div className="crypto-footer-row">
                                            <span className="crypto-min-note">
                                                Min: <strong>{selectedCrypto.min} USD</strong>
                                            </span>
                                            <span className="crypto-listener-status">
                                                <span className="green-dot"></span>
                                                <span>Auto-detected in {selectedCrypto.speed}</span>
                                            </span>
                                        </div>

                                        <div className="crypto-sync-action-box">
                                            <button
                                                type="button"
                                                onClick={handleSyncCryptoDeposits}
                                                disabled={isSyncingCrypto}
                                                className="btn-sync-crypto"
                                            >
                                                <RefreshCw size={15} className={isSyncingCrypto ? "spinner" : ""} />
                                                <span>{isSyncingCrypto ? "Scanning Blockchain & Cryptomus..." : "Check Deposit Status / I Have Paid"}</span>
                                            </button>
                                            <p className="crypto-sync-tip">
                                                Deposits to your static address are permanent and auto-credited upon blockchain confirmation. Click above to instantly verify and credit any pending transfer.
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Transaction History Ledger */}
                <div className="history-column">
                    <div className="history-container">
                        <div className="history-header">
                            <div className="history-title-col">
                                <h2 className="action-title">Transaction History</h2>
                                <span className="history-subtitle">All top-ups, proxy purchases, and credits</span>
                            </div>
                            <div className="filter-chips">
                                {['ALL', 'TOPUP', 'PURCHASE', 'REFUND'].map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => {
                                            setTxFilter(f);
                                            setTxPage(1);
                                        }}
                                        className={`filter-btn ${txFilter === f ? 'active' : ''}`}
                                    >
                                        {f === 'ALL' ? 'All' : f === 'TOPUP' ? 'Top-Up' : f === 'PURCHASE' ? 'Purchase' : 'Refund'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isTxLoading ? (
                            <div className="history-loading">
                                <div className="small-spinner" />
                                <p>Loading transactions...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="history-empty">
                                <div className="empty-icon-wrap">
                                    <Wallet size={36} color="#94A3B8" />
                                </div>
                                <h4>No transactions yet</h4>
                                <p>Your deposits and proxy purchases will appear here.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Type</th>
                                            <th>Method</th>
                                            <th>Amount</th>
                                            <th>Balance After</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => {
                                            const isPositive = tx.transactionType === 'TOPUP' || tx.transactionType === 'REFUND' || tx.transactionType === 'AFFILIATE_TRANSFER';
                                            return (
                                                <tr key={tx.id}>
                                                    <td>
                                                        <span className="table-date">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`type-tag ${tx.transactionType.toLowerCase()}`}>
                                                            {tx.transactionType}
                                                        </span>
                                                    </td>
                                                    <td><span className="table-method">{tx.paymentMethod}</span></td>
                                                    <td>
                                                        <span className={`table-amount ${isPositive ? 'positive' : 'negative'}`}>
                                                            {isPositive ? '+' : '-'}${tx.amountUsd.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td><span className="table-balance">${tx.balanceAfter.toFixed(2)}</span></td>
                                                    <td>
                                                        <span className={`status-badge ${tx.status.toLowerCase()}`}>
                                                            <span className="badge-dot" />
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {txTotalPages > 1 && (
                            <div className="pagination-footer">
                                <span>Page {txPage} of {txTotalPages}</span>
                                <div className="page-btns">
                                    <button
                                        type="button"
                                        disabled={txPage <= 1}
                                        onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                                        className="page-btn"
                                    >
                                        <ChevronLeft size={14} /> Prev
                                    </button>
                                    <button
                                        type="button"
                                        disabled={txPage >= txTotalPages}
                                        onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                                        className="page-btn"
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deposit Success Celebration Modal */}
            <DepositSuccessModal
                isOpen={isDepositSuccessOpen}
                onClose={() => setIsDepositSuccessOpen(false)}
                data={depositSuccessData}
                onBuyProxies={() => router.push('/dashboard/residential-proxies')}
            />

            {/* Spacious, Generously Padded Stylesheet */}
            <style jsx>{`
                .main-responsive-container {
                    padding: 0 0 24px 0;
                    max-width: 1800px;
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    font-family: var(--font-poppins, sans-serif);
                    box-sizing: border-box;
                    min-width: 0;
                    overflow-x: hidden;
                }

                .balance-sub-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 4px;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .mini-rate-tag {
                    font-size: 11px;
                    padding: 2px 7px;
                    background: rgba(0, 134, 255, 0.08);
                    color: #0086FF;
                    border-radius: 6px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .stat-card {
                    background-color: #FFFFFF;
                    padding: 16px 18px;
                    border-radius: 14px;
                    border: 1px solid #E2E8F0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 104px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.03);
                    border-color: #CBD5E1;
                }

                .balance-highlight-card {
                    border-color: rgba(0, 134, 255, 0.3);
                }

                .stat-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .stat-title-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                }

                .stat-title {
                    font-size: 13px;
                    color: #64748B;
                    margin: 0;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .stat-icon-wrapper {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .refresh-mini-btn {
                    background: none;
                    border: none;
                    color: #0086FF;
                    cursor: pointer;
                    padding: 2px;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    display: flex;
                    align-items: center;
                }

                .refresh-mini-btn:hover { opacity: 1; }

                .stat-card-body {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 2px 0;
                    line-height: 1.2;
                }

                .text-primary {
                    color: var(--primary, #0086FF);
                }

                .stat-sub {
                    font-size: 12px;
                    color: #64748B;
                    margin: 0;
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .stat-action-link {
                    font-size: 12px;
                    color: #F59E0B;
                    font-weight: 600;
                    background: none;
                    border: none;
                    padding: 0;
                    margin-top: 4px;
                    cursor: pointer;
                    text-align: left;
                    text-decoration: none;
                }

                .stat-action-link:hover {
                    text-decoration: underline;
                }

                .text-muted {
                    color: #64748B;
                }

                /* Main Content Grid */
                .dashboard-main-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 28px;
                    min-width: 0;
                    width: 100%;
                }

                /* Ultra-wide / Big Desktop Displays (>= 1440px) */
                @media (min-width: 1440px) {
                    .dashboard-main-grid {
                        grid-template-columns: minmax(580px, 640px) minmax(0, 1fr);
                    }
                }

                .actions-column,
                .history-column {
                    min-width: 0;
                    width: 100%;
                    max-width: 100%;
                }

                /* Action Card */
                .action-card {
                    background-color: #FFFFFF;
                    border-radius: 16px;
                    border: 1px solid #E2E8F0;
                    padding: 28px 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                    box-sizing: border-box;
                    width: 100%;
                }

                .action-header {
                    margin-bottom: 22px;
                }

                .action-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .action-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--navy, #163561);
                    margin: 0;
                }

                .compact-exchange-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 12px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 20px;
                    font-size: 12px;
                    color: #475569;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
                    white-space: nowrap;
                }

                .compact-exchange-pill strong {
                    color: #0086FF;
                    font-weight: 700;
                }

                .tab-nav-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                    background: #F1F5F9;
                    padding: 5px;
                    border-radius: 14px;
                    margin-bottom: 22px;
                    border: 1px solid #E2E8F0;
                }

                .method-tab-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1.5px solid transparent;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: center;
                }

                .method-tab-btn:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.6);
                }

                .method-tab-btn.active {
                    background: #FFFFFF;
                    border-color: #CBD5E1;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }

                .method-tab-btn.active.bkash-active {
                    border-color: #E2136E;
                    box-shadow: 0 2px 10px rgba(226, 19, 110, 0.16);
                }

                .method-tab-btn.active.eps-active {
                    border-color: #F7941D;
                    box-shadow: 0 2px 10px rgba(247, 148, 29, 0.16);
                }

                .method-tab-btn.active.crypto-active {
                    border-color: #0086FF;
                    box-shadow: 0 2px 10px rgba(0, 134, 255, 0.16);
                }

                .tab-icon-box {
                    width: 32px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    overflow: hidden;
                }

                .eps-icons-combo {
                    width: auto;
                    min-width: 32px;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }

                .mfs-logo {
                    max-height: 22px;
                    max-width: 36px;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    display: block;
                    flex-shrink: 0;
                }

                .bkash-logo-img {
                    max-height: 22px;
                    max-width: 36px;
                }

                .nagad-logo-img {
                    max-height: 20px;
                    max-width: 32px;
                }

                .mfs-card-icon {
                    color: #64748B;
                }

                .crypto-icon-box {
                    color: #0086FF;
                }

                .tab-text-box {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.15;
                }

                .tab-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0F172A;
                    white-space: nowrap;
                }

                .tab-subtitle {
                    font-size: 10px;
                    font-weight: 500;
                    color: #64748B;
                    white-space: nowrap;
                }

                /* Button & Badge Themes */
                .btn-bkash-theme {
                    background: #E2136E !important;
                }

                .btn-bkash-theme:hover:not(:disabled) {
                    background: #C4165E !important;
                    box-shadow: 0 4px 14px rgba(226, 19, 110, 0.35) !important;
                }

                .btn-eps-theme {
                    background: linear-gradient(135deg, #F7941D 0%, #E65100 100%) !important;
                    box-shadow: 0 4px 14px rgba(247, 148, 29, 0.28) !important;
                }

                .btn-eps-theme:hover:not(:disabled) {
                    background: linear-gradient(135deg, #FF9E2C 0%, #F55800 100%) !important;
                    box-shadow: 0 6px 18px rgba(247, 148, 29, 0.4) !important;
                }

                .btn-mfs-logo {
                    height: 18px;
                    width: auto;
                    object-fit: contain;
                    background: #FFFFFF;
                    border-radius: 4px;
                    padding: 2px 4px;
                }

                .bkash-step-num {
                    background: #E2136E !important;
                }

                .eps-step-num {
                    background: #F7941D !important;
                }

                /* Supported Channels Bar */
                .supported-channels-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 10px 14px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                }

                .channels-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748B;
                }

                .channels-pill-list {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .channel-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 8px;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #334155;
                }

                .channel-mini-img {
                    height: 14px;
                    width: auto;
                    object-fit: contain;
                }

                .method-content {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                /* 3-Step Guide Strip */
                .step-guide-strip {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 12px 18px;
                    font-size: 12px;
                    color: #334155;
                    font-weight: 600;
                }

                .guide-step {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .step-num {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--primary, #0086FF);
                    color: #FFFFFF;
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .guide-arrow {
                    color: #94A3B8;
                    font-size: 14px;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .field-label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .field-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                }

                .field-hint {
                    font-size: 12px;
                    color: #64748B;
                }

                .presets-row {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                }

                .preset-btn {
                    padding: 10px 4px;
                    border-radius: 10px;
                    border: 1px solid #CBD5E1;
                    background: #F8FAFC;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-height: 54px;
                    justify-content: center;
                }

                .preset-btn:hover {
                    border-color: var(--primary, #0086FF);
                }

                .preset-btn.selected {
                    background: var(--primary, #0086FF);
                    border-color: var(--primary, #0086FF);
                    box-shadow: 0 2px 8px rgba(0, 134, 255, 0.25);
                }

                .preset-btn.selected-bkash {
                    background: #E2136E !important;
                    border-color: #E2136E !important;
                    box-shadow: 0 4px 14px rgba(226, 19, 110, 0.28) !important;
                }

                .preset-btn.preset-bkash:hover:not(.selected) {
                    border-color: #E2136E;
                }

                .preset-btn.selected-eps {
                    background: linear-gradient(135deg, #F7941D 0%, #E65100 100%) !important;
                    border-color: #F7941D !important;
                    box-shadow: 0 4px 14px rgba(247, 148, 29, 0.28) !important;
                }

                .preset-btn.preset-eps:hover:not(.selected) {
                    border-color: #F7941D;
                }

                .preset-bdt {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0F172A;
                }

                .preset-btn.selected .preset-bdt {
                    color: #FFFFFF;
                }

                .preset-usd {
                    font-size: 11px;
                    color: #64748B;
                }

                .preset-btn.selected .preset-usd {
                    color: rgba(255, 255, 255, 0.9);
                }

                .input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .currency-prefix {
                    position: absolute;
                    left: 16px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #64748B;
                }

                .currency-suffix {
                    position: absolute;
                    right: 16px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #94A3B8;
                }

                .text-input {
                    width: 100%;
                    padding: 12px 54px 12px 36px;
                    border-radius: 10px;
                    border: 1px solid #CBD5E1;
                    font-size: 16px;
                    font-weight: 600;
                    color: #0F172A;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .text-input:focus {
                    border-color: var(--primary, #0086FF);
                    box-shadow: 0 0 0 3px rgba(0, 134, 255, 0.08);
                }

                .min-bdt-warning {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-top: 6px;
                }

                .min-bdt-warning.bkash-warning {
                    color: #E2136E;
                }

                .min-bdt-warning.eps-warning {
                    color: #E65100;
                }

                .conversion-info-box {
                    padding: 14px 18px;
                    background-color: rgba(0, 134, 255, 0.05);
                    border: 1px solid rgba(0, 134, 255, 0.15);
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }

                .conv-text-side {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .conv-title {
                    font-size: 13px;
                    color: #0F172A;
                    font-weight: 600;
                }

                .conv-sub {
                    font-size: 11px;
                    color: #64748B;
                }

                .conv-amt {
                    font-size: 19px;
                    font-weight: 800;
                    color: var(--primary, #0086FF);
                    white-space: nowrap;
                }

                .conv-bkash-theme {
                    background-color: rgba(226, 19, 110, 0.05) !important;
                    border: 1px solid rgba(226, 19, 110, 0.22) !important;
                }

                .conv-amt-bkash {
                    color: #E2136E !important;
                }

                .conv-eps-theme {
                    background-color: rgba(247, 148, 29, 0.06) !important;
                    border: 1px solid rgba(247, 148, 29, 0.25) !important;
                }

                .conv-amt-eps {
                    color: #E65100 !important;
                }

                .custom-action-btn {
                    width: 100%;
                    justify-content: center;
                    padding: 14px;
                    font-size: 15px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    background-color: var(--primary, #0086FF);
                    color: #FFFFFF;
                    border: none;
                    transition: all 0.2s;
                }

                .custom-action-btn:hover:not(:disabled) {
                    background-color: #0076e5;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 134, 255, 0.25);
                }

                .custom-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Crypto Tab */
                .crypto-options-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .crypto-option-btn {
                    padding: 10px 6px;
                    border-radius: 10px;
                    border: 1px solid #CBD5E1;
                    background: #F8FAFC;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .crypto-option-btn.selected {
                    background: rgba(0, 134, 255, 0.1);
                    border-color: var(--primary, #0086FF);
                }

                .coin-lbl {
                    font-size: 12px;
                    font-weight: 700;
                    color: #0F172A;
                    text-align: center;
                }

                .coin-bdg {
                    font-size: 10px;
                    color: #64748B;
                }

                .crypto-box {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 14px;
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .qr-center {
                    display: flex;
                    justify-content: center;
                }

                .qr-image {
                    width: 130px;
                    height: 130px;
                    border-radius: 10px;
                    background: #fff;
                    padding: 6px;
                    border: 1px solid #E2E8F0;
                }

                .address-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #FFFFFF;
                    border: 1px solid #CBD5E1;
                    border-radius: 10px;
                    padding: 10px 12px;
                    gap: 10px;
                }

                .address-info-col {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    overflow: hidden;
                }

                .addr-header-lbl {
                    font-size: 10px;
                    color: #64748B;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .address-text {
                    font-family: ui-monospace, monospace;
                    font-size: 12px;
                    color: var(--primary, #0086FF);
                    word-break: break-all;
                    font-weight: 600;
                }

                .copy-icon-btn {
                    background: #F1F5F9;
                    border: 1px solid #E2E8F0;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #64748B;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .copy-icon-btn.copied {
                    background: #E8FFEA;
                    border-color: #AFF0B5;
                }

                .crypto-footer-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .crypto-min-note {
                    color: #B45309;
                }

                .crypto-listener-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #10B981;
                    font-weight: 600;
                }

                .green-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #10B981;
                    box-shadow: 0 0 6px #10B981;
                    animation: pulse 1.5s infinite;
                }

                .crypto-loading {
                    padding: 28px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    color: #64748B;
                    font-size: 13px;
                }

                .crypto-sync-action-box {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-top: 6px;
                    border-top: 1px dashed #CBD5E1;
                }

                .btn-sync-crypto {
                    width: 100%;
                    padding: 11px 16px;
                    background: #FFFFFF;
                    border: 1.5px solid var(--primary, #0086FF);
                    color: var(--primary, #0086FF);
                    font-weight: 600;
                    font-size: 13px;
                    border-radius: 9px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }

                .btn-sync-crypto:hover:not(:disabled) {
                    background: rgba(0, 134, 255, 0.06);
                    border-color: #0076e5;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(0, 134, 255, 0.15);
                }

                .btn-sync-crypto:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .crypto-sync-tip {
                    margin: 0;
                    font-size: 11px;
                    color: #64748B;
                    line-height: 1.4;
                    text-align: center;
                }

                /* History Column & Table */
                .history-container {
                    background-color: #FFFFFF;
                    border-radius: 16px;
                    border: 1px solid #E2E8F0;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                }

                .history-header {
                    padding: 22px 26px;
                    border-bottom: 1px solid #F1F5F9;
                    background-color: #FFFFFF;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 14px;
                }

                .history-title-col {
                    display: flex;
                    flex-direction: column;
                }

                .history-subtitle {
                    font-size: 12px;
                    color: #64748B;
                    margin-top: 3px;
                }

                .filter-chips {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    padding: 6px 14px;
                    border-radius: 8px;
                    border: none;
                    background: #F1F5F9;
                    font-size: 12px;
                    font-weight: 500;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn.active {
                    background: var(--primary, #0086FF);
                    color: #FFFFFF;
                }

                .history-empty {
                    padding: 70px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .empty-icon-wrap {
                    width: 68px;
                    height: 68px;
                    background-color: #F1F5F9;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                }

                .history-empty h4 { margin: 0 0 8px 0; color: var(--navy, #163561); font-size: 16px; }
                .history-empty p { margin: 0; color: #64748B; font-size: 14px; }

                .table-responsive {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 13px;
                }

                .history-table th {
                    padding: 13px 16px;
                    background-color: #F8FAFC;
                    color: #64748B;
                    font-weight: 600;
                    border-bottom: 1px solid #E2E8F0;
                    font-size: 12px;
                    white-space: nowrap;
                    text-transform: uppercase;
                }

                .history-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #F1F5F9;
                    color: #334155;
                    white-space: nowrap;
                }

                .table-date { font-size: 12px; color: #64748B; }
                .table-method { font-weight: 500; color: #475569; }
                .table-amount { font-weight: 700; }
                .table-amount.positive { color: #10B981; }
                .table-amount.negative { color: #EF4444; }
                .table-balance { color: #64748B; font-family: ui-monospace, monospace; }

                .type-tag {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .type-tag.topup { background: #E8FFEA; color: #10B981; }
                .type-tag.purchase { background: #E0F2FE; color: #0284C7; }
                .type-tag.refund { background: #F3E8FF; color: #7E22CE; }
                .type-tag.affiliate_transfer { background: #FEF3C7; color: #B45309; }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .badge-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                }

                .status-badge.completed { background: #E8FFEA; color: #10B981; }
                .status-badge.pending { background: #FEF3C7; color: #D97706; }
                .status-badge.failed { background: #FEE2E2; color: #DC2626; }

                .pagination-footer {
                    padding: 14px 22px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #F1F5F9;
                    font-size: 12px;
                    color: #64748B;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .page-btns {
                    display: flex;
                    gap: 8px;
                }

                .page-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid #CBD5E1;
                    background: #FFFFFF;
                    font-size: 12px;
                    color: #334155;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }

                .page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .history-loading {
                    padding: 50px 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    justify-content: center;
                    color: #64748B;
                }

                .small-spinner {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid rgba(0,0,0,0.08);
                    border-top-color: #0086ff;
                    animation: spin 1s linear infinite;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                /* ================= RESPONSIVE BREAKPOINTS ================= */
                @media (max-width: 1200px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 14px;
                    }
                    .dashboard-main-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }

                @media (max-width: 768px) {
                    .main-responsive-container {
                        padding: 0 0 20px 0;
                        gap: 16px;
                    }
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }
                    .stat-card {
                        padding: 12px 14px;
                    }
                    .stat-value {
                        font-size: 19px;
                    }
                    .action-card {
                        padding: 18px 16px;
                        border-radius: 14px;
                    }
                    .action-header {
                        margin-bottom: 16px;
                    }
                    .action-title {
                        font-size: 17px;
                    }
                    .history-header {
                        padding: 16px 18px;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .filter-chips {
                        width: 100%;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 4px;
                    }
                    .filter-btn {
                        padding: 6px 2px;
                        text-align: center;
                        font-size: 11px;
                    }
                }

                @media (max-width: 600px) {
                    .main-responsive-container {
                        padding: 0 0 95px 0;
                        gap: 14px;
                    }
                    .tab-nav-row {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 4px;
                        padding: 4px;
                        margin-bottom: 16px;
                    }
                    .method-tab-btn {
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 8px 3px;
                        gap: 3px;
                        text-align: center;
                    }
                    .tab-text-box {
                        align-items: center;
                        text-align: center;
                    }
                    .tab-title {
                        font-size: 11px;
                    }
                    .tab-subtitle {
                        font-size: 8.5px;
                    }
                    .mfs-logo {
                        height: 18px;
                    }
                    .bkash-logo-img {
                        height: 18px;
                    }
                    .nagad-logo-img {
                        height: 15px;
                    }
                    .step-guide-strip {
                        font-size: 10.5px;
                        padding: 8px 10px;
                        gap: 2px;
                    }
                    .guide-step {
                        gap: 4px;
                        font-size: 10px;
                    }
                    .step-num {
                        width: 17px;
                        height: 17px;
                        font-size: 9.5px;
                    }
                    .guide-arrow {
                        font-size: 11px;
                    }
                    .presets-row {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 6px;
                    }
                    .preset-btn {
                        min-height: 48px;
                        padding: 6px 2px;
                    }
                    .preset-bdt {
                        font-size: 12px;
                    }
                    .preset-usd {
                        font-size: 9.5px;
                    }
                    .conversion-info-box {
                        padding: 10px 12px;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .conv-title {
                        font-size: 12px;
                    }
                    .conv-sub {
                        font-size: 10px;
                    }
                    .conv-amt {
                        font-size: 16px;
                    }
                    .supported-channels-bar {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 6px;
                        padding: 8px 10px;
                    }
                    .channels-pill-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 4px;
                    }
                    .channel-badge {
                        padding: 2px 6px;
                        font-size: 10px;
                    }
                    .channel-mini-img {
                        height: 12px;
                    }
                    .crypto-options-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 6px;
                    }
                    .crypto-box {
                        padding: 12px;
                        gap: 10px;
                    }
                    .qr-image {
                        width: 115px;
                        height: 115px;
                    }
                    .address-container {
                        padding: 8px 10px;
                        gap: 6px;
                    }
                    .address-text {
                        font-size: 11px;
                    }
                    .crypto-footer-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 6px;
                    }
                    .btn-sync-crypto {
                        font-size: 12px;
                        padding: 9px 12px;
                    }
                    .history-table th,
                    .history-table td {
                        padding: 10px 12px;
                        font-size: 12px;
                    }
                }

                @media (max-width: 360px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .presets-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                /* Modern Dark Mode Styling Overrides */
                :global(body.dark-mode) .stat-card {
                    background: linear-gradient(180deg, #111827 0%, #0D1322 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.07) !important;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
                }

                :global(body.dark-mode) .balance-highlight-card {
                    background: linear-gradient(180deg, rgba(0, 134, 255, 0.14) 0%, #0D1322 100%) !important;
                    border: 1px solid rgba(0, 134, 255, 0.35) !important;
                    box-shadow: 0 4px 25px -2px rgba(0, 134, 255, 0.2), inset 0 1px 0 rgba(0, 134, 255, 0.2) !important;
                }

                :global(body.dark-mode) .action-card,
                :global(body.dark-mode) .history-container {
                    background: linear-gradient(180deg, #111827 0%, #0D1322 100%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
                }

                :global(body.dark-mode) .header-title,
                :global(body.dark-mode) .action-title,
                :global(body.dark-mode) .stat-value,
                :global(body.dark-mode) .history-empty h4 {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .stat-title,
                :global(body.dark-mode) .field-label,
                :global(body.dark-mode) .history-subtitle {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .stat-sub,
                :global(body.dark-mode) .field-hint,
                :global(body.dark-mode) .channels-label,
                :global(body.dark-mode) .crypto-sync-tip,
                :global(body.dark-mode) .history-empty p {
                    color: #64748B !important;
                }

                :global(body.dark-mode) .compact-exchange-pill {
                    background: rgba(0, 134, 255, 0.08) !important;
                    border: 1px solid rgba(0, 134, 255, 0.25) !important;
                    color: #94A3B8 !important;
                    box-shadow: 0 2px 8px rgba(0, 134, 255, 0.1) !important;
                }

                :global(body.dark-mode) .compact-exchange-pill strong {
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .mini-rate-tag {
                    background: rgba(0, 134, 255, 0.16) !important;
                    border: 1px solid rgba(0, 134, 255, 0.3) !important;
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .tab-nav-row {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.07) !important;
                }

                :global(body.dark-mode) .method-tab-btn {
                    color: #94A3B8 !important;
                    border: 1.5px solid transparent !important;
                }

                :global(body.dark-mode) .method-tab-btn:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.04) !important;
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .method-tab-btn.active.bkash-active {
                    background: linear-gradient(180deg, rgba(226, 19, 110, 0.18) 0%, rgba(226, 19, 110, 0.04) 100%), #111A2E !important;
                    border-color: #E2136E !important;
                    box-shadow: 0 4px 18px rgba(226, 19, 110, 0.25), inset 0 1px 0 rgba(226, 19, 110, 0.2) !important;
                }

                :global(body.dark-mode) .method-tab-btn.active.eps-active {
                    background: linear-gradient(180deg, rgba(247, 148, 29, 0.18) 0%, rgba(247, 148, 29, 0.04) 100%), #111A2E !important;
                    border-color: #F7941D !important;
                    box-shadow: 0 4px 18px rgba(247, 148, 29, 0.25), inset 0 1px 0 rgba(247, 148, 29, 0.2) !important;
                }

                :global(body.dark-mode) .method-tab-btn.active.crypto-active {
                    background: linear-gradient(180deg, rgba(0, 134, 255, 0.2) 0%, rgba(0, 134, 255, 0.04) 100%), #111A2E !important;
                    border-color: #0086FF !important;
                    box-shadow: 0 4px 18px rgba(0, 134, 255, 0.25), inset 0 1px 0 rgba(0, 134, 255, 0.2) !important;
                }

                :global(body.dark-mode) .tab-title {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .tab-subtitle {
                    color: #64748B !important;
                }

                :global(body.dark-mode) .step-guide-strip {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.06) !important;
                    color: #CBD5E1 !important;
                }

                :global(body.dark-mode) .guide-arrow {
                    color: #475569 !important;
                }

                :global(body.dark-mode) .supported-channels-bar {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.06) !important;
                }

                :global(body.dark-mode) .channel-badge {
                    background: #111A2E !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: #CBD5E1 !important;
                }

                :global(body.dark-mode) .preset-btn {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.07) !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                :global(body.dark-mode) .preset-btn:hover:not(.selected) {
                    background: #10172A !important;
                    border-color: rgba(0, 134, 255, 0.4) !important;
                    transform: translateY(-1px);
                }

                :global(body.dark-mode) .preset-btn .preset-bdt {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .preset-btn .preset-usd {
                    color: #64748B !important;
                }

                :global(body.dark-mode) .preset-btn.selected {
                    background: linear-gradient(135deg, #0086FF 0%, #005AC2 100%) !important;
                    border-color: #38BDF8 !important;
                    box-shadow: 0 4px 18px rgba(0, 134, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
                }

                :global(body.dark-mode) .preset-btn.selected-bkash {
                    background: linear-gradient(135deg, #E2136E 0%, #C4165E 100%) !important;
                    border-color: #FF4D94 !important;
                    box-shadow: 0 4px 18px rgba(226, 19, 110, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
                }

                :global(body.dark-mode) .preset-btn.preset-bkash:hover:not(.selected) {
                    background: #1A1122 !important;
                    border-color: rgba(226, 19, 110, 0.5) !important;
                }

                :global(body.dark-mode) .preset-btn.selected-eps {
                    background: linear-gradient(135deg, #F7941D 0%, #D44700 100%) !important;
                    border-color: #FBA94B !important;
                    box-shadow: 0 4px 18px rgba(247, 148, 29, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
                }

                :global(body.dark-mode) .preset-btn.preset-eps:hover:not(.selected) {
                    background: #1C1510 !important;
                    border-color: rgba(247, 148, 29, 0.5) !important;
                }

                :global(body.dark-mode) .preset-btn.selected .preset-bdt {
                    color: #FFFFFF !important;
                }

                :global(body.dark-mode) .preset-btn.selected .preset-usd {
                    color: rgba(255, 255, 255, 0.85) !important;
                }

                :global(body.dark-mode) .input-wrap {
                    background-color: #080D1A !important;
                    border: 1.5px solid rgba(255, 255, 255, 0.09) !important;
                    transition: all 0.2s ease !important;
                }

                :global(body.dark-mode) .input-wrap:focus-within {
                    border-color: #0086FF !important;
                    box-shadow: 0 0 0 3px rgba(0, 134, 255, 0.25) !important;
                    background-color: #0A1020 !important;
                }

                :global(body.dark-mode) .text-input {
                    background: transparent !important;
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .text-input::placeholder {
                    color: #475569 !important;
                }

                :global(body.dark-mode) .currency-prefix,
                :global(body.dark-mode) .currency-suffix {
                    color: #64748B !important;
                }

                :global(body.dark-mode) .conversion-info-box {
                    background: linear-gradient(135deg, rgba(0, 134, 255, 0.12) 0%, rgba(0, 134, 255, 0.03) 100%) !important;
                    border: 1px solid rgba(0, 134, 255, 0.25) !important;
                    box-shadow: inset 0 1px 0 rgba(0, 134, 255, 0.15) !important;
                }

                :global(body.dark-mode) .conv-title {
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .conv-sub {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .conv-amt {
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .conv-bkash-theme {
                    background: linear-gradient(135deg, rgba(226, 19, 110, 0.14) 0%, rgba(226, 19, 110, 0.03) 100%) !important;
                    border: 1px solid rgba(226, 19, 110, 0.35) !important;
                    box-shadow: inset 0 1px 0 rgba(226, 19, 110, 0.15) !important;
                }

                :global(body.dark-mode) .conv-amt-bkash {
                    color: #FF4D94 !important;
                }

                :global(body.dark-mode) .conv-eps-theme {
                    background: linear-gradient(135deg, rgba(247, 148, 29, 0.14) 0%, rgba(247, 148, 29, 0.03) 100%) !important;
                    border: 1px solid rgba(247, 148, 29, 0.35) !important;
                    box-shadow: inset 0 1px 0 rgba(247, 148, 29, 0.15) !important;
                }

                :global(body.dark-mode) .conv-amt-eps {
                    color: #FBA94B !important;
                }

                :global(body.dark-mode) .min-bdt-warning.bkash-warning {
                    color: #FF4D94 !important;
                }

                :global(body.dark-mode) .min-bdt-warning.eps-warning {
                    color: #FBA94B !important;
                }

                :global(body.dark-mode) .crypto-option-btn {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.07) !important;
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .crypto-option-btn:hover:not(.selected) {
                    background: #10172A !important;
                    border-color: rgba(0, 134, 255, 0.35) !important;
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .crypto-option-btn.selected {
                    background: linear-gradient(135deg, rgba(0, 134, 255, 0.2) 0%, rgba(0, 134, 255, 0.05) 100%), #111A2E !important;
                    border-color: #0086FF !important;
                    box-shadow: 0 4px 16px rgba(0, 134, 255, 0.25) !important;
                }

                :global(body.dark-mode) .crypto-option-btn.selected .coin-lbl {
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .coin-lbl {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .coin-bdg {
                    background: rgba(255, 255, 255, 0.06) !important;
                    color: #94A3B8 !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                }

                :global(body.dark-mode) .crypto-box {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.07) !important;
                }

                :global(body.dark-mode) .address-container {
                    background-color: #0B1120 !important;
                    border: 1px solid rgba(255, 255, 255, 0.09) !important;
                }

                :global(body.dark-mode) .addr-header-lbl {
                    color: #64748B !important;
                }

                :global(body.dark-mode) .address-text {
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .copy-icon-btn {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #CBD5E1 !important;
                }

                :global(body.dark-mode) .copy-icon-btn:hover {
                    background: rgba(0, 134, 255, 0.2) !important;
                    border-color: #0086FF !important;
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .crypto-min-note {
                    color: #64748B !important;
                }

                :global(body.dark-mode) .crypto-min-note strong {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .btn-sync-crypto {
                    background: rgba(0, 134, 255, 0.12) !important;
                    border: 1px solid rgba(0, 134, 255, 0.3) !important;
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .btn-sync-crypto:hover:not(:disabled) {
                    background: rgba(0, 134, 255, 0.22) !important;
                    border-color: #0086FF !important;
                }

                :global(body.dark-mode) .history-header {
                    background: transparent !important;
                    background-color: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07) !important;
                }

                :global(body.dark-mode) .pagination-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.07) !important;
                    color: #64748B !important;
                }

                :global(body.dark-mode) .filter-btn {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.07) !important;
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .filter-btn:hover:not(.active) {
                    background: #111A2E !important;
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .filter-btn.active {
                    background: #0086FF !important;
                    border-color: #0086FF !important;
                    color: #FFFFFF !important;
                    box-shadow: 0 2px 12px rgba(0, 134, 255, 0.35) !important;
                }

                :global(body.dark-mode) .history-table th {
                    background: #080D1A !important;
                    color: #64748B !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07) !important;
                    font-size: 11px !important;
                    letter-spacing: 0.05em !important;
                }

                :global(body.dark-mode) .history-table td {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                    color: #CBD5E1 !important;
                }

                :global(body.dark-mode) .history-table tr:hover td {
                    background: rgba(255, 255, 255, 0.02) !important;
                }

                :global(body.dark-mode) .table-date {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .table-method {
                    color: #CBD5E1 !important;
                }

                :global(body.dark-mode) .table-balance {
                    color: #64748B !important;
                }

                :global(body.dark-mode) .type-tag {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .type-tag.topup {
                    background: rgba(16, 185, 129, 0.12) !important;
                    border-color: rgba(16, 185, 129, 0.25) !important;
                    color: #34D399 !important;
                }

                :global(body.dark-mode) .type-tag.purchase {
                    background: rgba(99, 102, 241, 0.12) !important;
                    border-color: rgba(99, 102, 241, 0.25) !important;
                    color: #A5B4FC !important;
                }

                :global(body.dark-mode) .status-badge.success,
                :global(body.dark-mode) .status-badge.paid,
                :global(body.dark-mode) .status-badge.completed {
                    background: rgba(16, 185, 129, 0.12) !important;
                    border: 1px solid rgba(16, 185, 129, 0.28) !important;
                    color: #34D399 !important;
                }

                :global(body.dark-mode) .status-badge.pending,
                :global(body.dark-mode) .status-badge.processing {
                    background: rgba(245, 158, 11, 0.12) !important;
                    border: 1px solid rgba(245, 158, 11, 0.28) !important;
                    color: #FBBF24 !important;
                }

                :global(body.dark-mode) .status-badge.failed,
                :global(body.dark-mode) .status-badge.cancelled {
                    background: rgba(239, 68, 68, 0.12) !important;
                    border: 1px solid rgba(239, 68, 68, 0.28) !important;
                    color: #F87171 !important;
                }

                :global(body.dark-mode) .page-btn {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.07) !important;
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .page-btn:hover:not(:disabled) {
                    background: #111A2E !important;
                    border-color: rgba(0, 134, 255, 0.4) !important;
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .page-btn:disabled {
                    opacity: 0.3 !important;
                }

                :global(body.dark-mode) .empty-icon-wrap {
                    background: #080D1A !important;
                    border: 1px solid rgba(255, 255, 255, 0.06) !important;
                }
            `}</style>
        </div>
    );
}
