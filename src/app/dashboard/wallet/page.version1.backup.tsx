"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { API_URL } from '@/lib/config';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';

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
    { currency: 'USDT', network: 'tron', label: 'USDT (TRC-20)', badge: 'Instant', min: '$1.00' },
    { currency: 'USDT', network: 'bsc', label: 'USDT (BEP-20)', badge: 'Low Fee', min: '$1.00' },
    { currency: 'USDT', network: 'polygon', label: 'USDT (Polygon)', badge: 'Fast', min: '$1.00' },
    { currency: 'TON', network: 'ton', label: 'TON (Telegram)', badge: 'Native', min: '$1.00' },
    { currency: 'TRX', network: 'tron', label: 'TRX (TRON)', badge: 'Fast', min: '$1.00' },
    { currency: 'BTC', network: 'bitcoin', label: 'Bitcoin (BTC)', badge: 'Mainnet', min: '$5.00' },
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

    const [activeTab, setActiveTab] = useState<'eps' | 'crypto'>('eps');
    const [customBdt, setCustomBdt] = useState<string>('1000');
    const [isEpsLoading, setIsEpsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Crypto State
    const [selectedCrypto, setSelectedCrypto] = useState(SUPPORTED_CRYPTO_NETWORKS[0]);
    const [staticWallet, setStaticWallet] = useState<StaticWalletData | null>(null);
    const [isCryptoLoading, setIsCryptoLoading] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    // Transactions State
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isTxLoading, setIsTxLoading] = useState<boolean>(false);
    const [txPage, setTxPage] = useState<number>(1);
    const [txTotalPages, setTxTotalPages] = useState<number>(1);
    const [txFilter, setTxFilter] = useState<string>('ALL');

    // Affiliate Convert State
    const [isConvertingAffiliate, setIsConvertingAffiliate] = useState<boolean>(false);

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

    // Auto-polling for incoming crypto deposit (every 6 seconds while on crypto tab)
    useEffect(() => {
        if (activeTab !== 'crypto') return;

        let previousBalance = balanceUsd;
        const interval = setInterval(async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await axios.get(`${API_URL}/api/Wallet/summary`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const newBalance = Number(res.data?.balanceUsd ?? 0);
                if (newBalance > previousBalance && previousBalance > 0) {
                    const creditedAmount = newBalance - previousBalance;
                    toast.success(`🎉 Deposit Confirmed! +$${creditedAmount.toFixed(2)} USD credited!`, {
                        duration: 6000
                    });
                    refreshWallet();
                    fetchTransactions(1, txFilter);
                }
                previousBalance = newBalance;
            } catch {
                // Ignore background polling errors
            }
        }, 6000);

        return () => clearInterval(interval);
    }, [activeTab, balanceUsd, refreshWallet, fetchTransactions, txFilter]);

    const handleCopyAddress = () => {
        if (!staticWallet?.address) return;
        navigator.clipboard.writeText(staticWallet.address);
        setCopied(true);
        toast.success("Address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEpsTopUp = async () => {
        const amount = Number(customBdt);
        if (!amount || amount < 125) {
            toast.error("Minimum deposit amount is ৳125 BDT ($1.00 USD).");
            return;
        }

        setIsEpsLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.post(`${API_URL}/api/Wallet/topup/eps/initialize`, {
                amountBdt: amount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.redirectUrl) {
                toast.success("Redirecting to EPS Payment Gateway...");
                window.location.href = res.data.redirectUrl;
            } else {
                toast.error(res.data?.message || "Failed to initialize EPS payment.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to start EPS top-up.");
        } finally {
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
            {/* Header Section */}
            <div className="header-card">
                <div className="header-content">
                    <h1 className="header-title">
                        <div className="title-icon-box">
                            <Wallet color="#0086FF" size={24} />
                        </div>
                        <span>My Wallet & Billing</span>
                    </h1>
                    <p className="header-desc">
                        Manage your prepaid balance, add funds via bKash/Nagad or Crypto, and purchase proxy bandwidth instantly.
                    </p>
                </div>
                <div className="exchange-badge-box">
                    <div className="exchange-icon-circle">
                        <TrendingUp size={15} color="#0086FF" />
                    </div>
                    <div className="exchange-info">
                        <span className="exchange-label">Exchange Rate</span>
                        <span className="exchange-val">৳{rate.toFixed(2)} BDT = $1.00 USD</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Available Balance */}
                <div className="stat-card balance-highlight-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(0, 134, 255, 0.1)' }}>
                        <Wallet color="#0086FF" size={20} strokeWidth={2.5} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-title-row">
                            <p className="stat-title">Available Balance</p>
                            <button
                                type="button"
                                onClick={handleManualRefresh}
                                className="refresh-mini-btn"
                                title="Refresh Balance"
                            >
                                <RefreshCw size={12} className={isRefreshing ? "spinner" : ""} />
                            </button>
                        </div>
                        <p className="stat-value text-primary">${balanceUsd.toFixed(2)}</p>
                        <span className="stat-sub">≈ ৳{balanceBdt.toFixed(2)} BDT</span>
                    </div>
                </div>

                {/* Total Deposited */}
                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <ArrowDownRight color="#10B981" size={20} strokeWidth={2.5} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-title">Total Deposited</p>
                        <p className="stat-value">${totalDepositedUsd.toFixed(2)}</p>
                        <span className="stat-sub">All-time approved funds</span>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                        <ArrowUpRight color="#6366F1" size={20} strokeWidth={2.5} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-title">Total Spent</p>
                        <p className="stat-value">${totalSpentUsd.toFixed(2)}</p>
                        <span className="stat-sub">Bandwidth purchases</span>
                    </div>
                </div>

                {/* Affiliate Earnings */}
                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                        <Gift color="#F59E0B" size={20} strokeWidth={2.5} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-title">Affiliate Earnings</p>
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
                            <h2 className="action-title">Add Funds to Wallet</h2>
                        </div>

                        {/* Top-up Method Switcher */}
                        <div className="tab-nav-row">
                            <button
                                type="button"
                                onClick={() => setActiveTab('eps')}
                                className={`method-tab-btn ${activeTab === 'eps' ? 'active' : ''}`}
                            >
                                <Smartphone size={15} />
                                <span>bKash / Nagad / Cards</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('crypto')}
                                className={`method-tab-btn ${activeTab === 'crypto' ? 'active' : ''}`}
                            >
                                <QrCode size={15} />
                                <span>Crypto Deposit</span>
                            </button>
                        </div>

                        {activeTab === 'eps' ? (
                            <div className="method-content">
                                {/* Presets */}
                                <div className="field-group">
                                    <div className="field-label-row">
                                        <label className="field-label">Quick Select</label>
                                        <span className="field-hint">Min: ৳125 ($1)</span>
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
                                                    className={`preset-btn ${isSelected ? 'selected' : ''}`}
                                                >
                                                    <span className="preset-bdt">৳{amt.toLocaleString()}</span>
                                                    <span className="preset-usd">${usd}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Amount */}
                                <div className="field-group">
                                    <label className="field-label">Amount in BDT</label>
                                    <div className="input-wrap">
                                        <span className="currency-prefix">৳</span>
                                        <input
                                            type="number"
                                            min="125"
                                            step="1"
                                            value={customBdt}
                                            onChange={(e) => setCustomBdt(e.target.value)}
                                            placeholder="Enter amount"
                                            className="text-input"
                                        />
                                        <span className="currency-suffix">BDT</span>
                                    </div>
                                </div>

                                {/* Conversion Preview */}
                                <div className="conversion-info-box">
                                    <div>
                                        <div className="conv-title">Wallet Balance to Credit:</div>
                                        <div className="conv-sub">0% Deposit Fee • Instant Activation</div>
                                    </div>
                                    <div className="conv-amt">${calculatedUsdForBdt.toFixed(2)} USD</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleEpsTopUp}
                                    disabled={isEpsLoading || Number(customBdt) < 125}
                                    className="btn-primary custom-action-btn"
                                >
                                    {isEpsLoading ? (
                                        <>
                                            <RefreshCw size={16} className="spinner" />
                                            <span>Connecting to Gateway...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Proceed to Pay ৳{Number(customBdt || 0).toLocaleString()} BDT</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="method-content">
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
                                                <span>Auto-detected on transfer</span>
                                            </span>
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
                            <h2 className="action-title">Transaction History</h2>
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
                                    <Wallet size={32} color="#94A3B8" />
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

            {/* Fully Responsive CSS */}
            <style jsx>{`
                .main-responsive-container {
                    padding: 24px;
                    max-width: 1800px;
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    font-family: var(--font-poppins, sans-serif);
                    box-sizing: border-box;
                }

                /* Header Card */
                .header-card {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #FFFFFF;
                    padding: 22px 28px;
                    border-radius: 16px;
                    border: 1px solid #E2E8F0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .header-content {
                    flex: 1;
                    min-width: 260px;
                }

                .title-icon-box {
                    background-color: rgba(0, 134, 255, 0.08);
                    border-radius: 10px;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .header-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--navy, #163561);
                    margin: 0 0 6px 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .header-desc {
                    margin: 0;
                    color: #64748B;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .exchange-badge-box {
                    background-color: #F8FAFC;
                    padding: 10px 16px;
                    border-radius: 12px;
                    border: 1px solid #E2E8F0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .exchange-icon-circle {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    background: rgba(0, 134, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .exchange-info {
                    display: flex;
                    flex-direction: column;
                }

                .exchange-label {
                    font-size: 10px;
                    color: #64748B;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .exchange-val {
                    font-size: 13px;
                    color: #0F172A;
                    font-weight: 700;
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
                    padding: 18px 20px;
                    border-radius: 16px;
                    border: 1px solid #E2E8F0;
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.03);
                    border-color: #CBD5E1;
                }

                .balance-highlight-card {
                    border-color: rgba(0, 134, 255, 0.3);
                }

                .stat-icon-wrapper {
                    padding: 10px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-width: 0;
                }

                .stat-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2px;
                }

                .stat-title {
                    font-size: 12px;
                    color: #64748B;
                    margin: 0;
                    font-weight: 500;
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
                }

                .refresh-mini-btn:hover { opacity: 1; }

                .stat-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0;
                    line-height: 1.2;
                }

                .text-primary {
                    color: var(--primary, #0086FF);
                }

                .stat-sub {
                    font-size: 11px;
                    color: #94A3B8;
                    margin-top: 3px;
                }

                .stat-action-link {
                    font-size: 11px;
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
                    grid-template-columns: 420px 1fr;
                    gap: 20px;
                }

                /* Action Card */
                .action-card {
                    background-color: #FFFFFF;
                    border-radius: 16px;
                    border: 1px solid #E2E8F0;
                    padding: 22px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                }

                .action-header {
                    margin-bottom: 16px;
                }

                .action-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--navy, #163561);
                    margin: 0;
                }

                .tab-nav-row {
                    display: flex;
                    gap: 6px;
                    background: #F8FAFC;
                    padding: 4px;
                    border-radius: 10px;
                    margin-bottom: 18px;
                    border: 1px solid #E2E8F0;
                }

                .method-tab-btn {
                    flex: 1;
                    padding: 8px 10px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748B;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .method-tab-btn.active {
                    background: #FFFFFF;
                    color: var(--primary, #0086FF);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .method-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .field-label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .field-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                }

                .field-hint {
                    font-size: 11px;
                    color: #94A3B8;
                }

                .presets-row {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 6px;
                }

                .preset-btn {
                    padding: 8px 4px;
                    border-radius: 8px;
                    border: 1px solid #CBD5E1;
                    background: #F8FAFC;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .preset-btn:hover {
                    border-color: var(--primary, #0086FF);
                }

                .preset-btn.selected {
                    background: var(--primary, #0086FF);
                    border-color: var(--primary, #0086FF);
                    box-shadow: 0 2px 6px rgba(0, 134, 255, 0.25);
                }

                .preset-bdt {
                    font-size: 12px;
                    font-weight: 700;
                    color: #0F172A;
                }

                .preset-btn.selected .preset-bdt {
                    color: #FFFFFF;
                }

                .preset-usd {
                    font-size: 10px;
                    color: #64748B;
                    margin-top: 1px;
                }

                .preset-btn.selected .preset-usd {
                    color: rgba(255, 255, 255, 0.85);
                }

                .input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .currency-prefix {
                    position: absolute;
                    left: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    color: #64748B;
                }

                .currency-suffix {
                    position: absolute;
                    right: 14px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #94A3B8;
                }

                .text-input {
                    width: 100%;
                    padding: 10px 48px 10px 32px;
                    border-radius: 8px;
                    border: 1px solid #CBD5E1;
                    font-size: 15px;
                    font-weight: 600;
                    color: #0F172A;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .text-input:focus {
                    border-color: var(--primary, #0086FF);
                    box-shadow: 0 0 0 3px rgba(0, 134, 255, 0.08);
                }

                .conversion-info-box {
                    padding: 12px 14px;
                    background-color: rgba(0, 134, 255, 0.05);
                    border: 1px solid rgba(0, 134, 255, 0.15);
                    border-radius: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                }

                .conv-title {
                    font-size: 12px;
                    color: #0F172A;
                    font-weight: 600;
                }

                .conv-sub {
                    font-size: 10px;
                    color: #64748B;
                    margin-top: 1px;
                }

                .conv-amt {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--primary, #0086FF);
                    white-space: nowrap;
                }

                .custom-action-btn {
                    width: 100%;
                    justify-content: center;
                    padding: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    background-color: var(--primary, #0086FF);
                    color: #FFFFFF;
                    border: none;
                    transition: all 0.2s;
                }

                .custom-action-btn:hover:not(:disabled) {
                    background-color: #0076e5;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0, 134, 255, 0.25);
                }

                .custom-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Crypto Tab */
                .crypto-options-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                }

                .crypto-option-btn {
                    padding: 8px 4px;
                    border-radius: 8px;
                    border: 1px solid #CBD5E1;
                    background: #F8FAFC;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .crypto-option-btn.selected {
                    background: rgba(0, 134, 255, 0.1);
                    border-color: var(--primary, #0086FF);
                }

                .coin-lbl {
                    font-size: 11px;
                    font-weight: 700;
                    color: #0F172A;
                    text-align: center;
                }

                .coin-bdg {
                    font-size: 9px;
                    color: #64748B;
                    margin-top: 1px;
                }

                .crypto-box {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .qr-center {
                    display: flex;
                    justify-content: center;
                }

                .qr-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 8px;
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
                    border-radius: 8px;
                    padding: 8px 10px;
                    gap: 8px;
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
                    font-size: 11px;
                    color: var(--primary, #0086FF);
                    word-break: break-all;
                    font-weight: 600;
                }

                .copy-icon-btn {
                    background: #F1F5F9;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    cursor: pointer;
                    color: #64748B;
                    padding: 6px;
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
                    font-size: 11px;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .crypto-min-note {
                    color: #B45309;
                }

                .crypto-listener-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
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
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    color: #64748B;
                    font-size: 13px;
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
                    padding: 18px 22px;
                    border-bottom: 1px solid #F1F5F9;
                    background-color: #FFFFFF;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .filter-chips {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    padding: 4px 10px;
                    border-radius: 6px;
                    border: none;
                    background: #F1F5F9;
                    font-size: 11px;
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
                    padding: 48px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .empty-icon-wrap {
                    width: 56px;
                    height: 56px;
                    background-color: #F1F5F9;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                }

                .history-empty h4 { margin: 0 0 6px 0; color: var(--navy, #163561); font-size: 15px; }
                .history-empty p { margin: 0; color: #64748B; font-size: 13px; }

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
                    padding: 12px 18px;
                    background-color: #F8FAFC;
                    color: #64748B;
                    font-weight: 600;
                    border-bottom: 1px solid #E2E8F0;
                    font-size: 11px;
                    white-space: nowrap;
                    text-transform: uppercase;
                }

                .history-table td {
                    padding: 12px 18px;
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
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                }

                .type-tag.topup { background: #E8FFEA; color: #10B981; }
                .type-tag.purchase { background: #E0F2FE; color: #0284C7; }
                .type-tag.refund { background: #F3E8FF; color: #7E22CE; }
                .type-tag.affiliate_transfer { background: #FEF3C7; color: #B45309; }

                .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .status-badge.completed { background: #E8FFEA; color: #10B981; }
                .status-badge.pending { background: #FEF3C7; color: #D97706; }
                .status-badge.failed { background: #FEE2E2; color: #DC2626; }

                .pagination-footer {
                    padding: 12px 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #F1F5F9;
                    font-size: 12px;
                    color: #64748B;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .page-btns {
                    display: flex;
                    gap: 6px;
                }

                .page-btn {
                    padding: 4px 10px;
                    border-radius: 6px;
                    border: 1px solid #CBD5E1;
                    background: #FFFFFF;
                    font-size: 12px;
                    color: #334155;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }

                .page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .history-loading {
                    padding: 40px 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                    color: #64748B;
                }

                .small-spinner {
                    width: 22px;
                    height: 22px;
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
                    }
                    .dashboard-main-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .main-responsive-container {
                        padding: 16px 12px;
                        gap: 16px;
                    }
                    .header-card {
                        padding: 16px 18px;
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .exchange-badge-box {
                        width: 100%;
                        justify-content: flex-start;
                    }
                    .header-title {
                        font-size: 19px;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                    .stat-card {
                        padding: 14px 16px;
                    }
                    .stat-value {
                        font-size: 20px;
                    }
                    .action-card {
                        padding: 16px;
                    }
                    .presets-row {
                        grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
                    }
                    .crypto-options-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .history-header {
                        padding: 14px 16px;
                    }
                }

                @media (max-width: 480px) {
                    .main-responsive-container {
                        padding: 12px 8px;
                    }
                    .tab-nav-row {
                        flex-direction: column;
                    }
                    .method-tab-btn {
                        padding: 10px;
                    }
                    .conversion-info-box {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .presets-row {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                /* ================= DARK MODE OVERRIDES ================= */
                :global(body.dark-mode) .header-card,
                :global(body.dark-mode) .stat-card,
                :global(body.dark-mode) .action-card,
                :global(body.dark-mode) .history-container,
                :global(body.dark-mode) .history-header {
                    background-color: #1E293B;
                    border-color: #334155;
                }

                :global(body.dark-mode) .header-title,
                :global(body.dark-mode) .action-title,
                :global(body.dark-mode) .stat-value,
                :global(body.dark-mode) .history-empty h4,
                :global(body.dark-mode) .exchange-val,
                :global(body.dark-mode) .text-input,
                :global(body.dark-mode) .conv-title,
                :global(body.dark-mode) .coin-lbl,
                :global(body.dark-mode) .history-table td {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .header-desc,
                :global(body.dark-mode) .stat-title,
                :global(body.dark-mode) .field-label,
                :global(body.dark-mode) .conv-sub,
                :global(body.dark-mode) .history-table th,
                :global(body.dark-mode) .exchange-label,
                :global(body.dark-mode) .table-date,
                :global(body.dark-mode) .table-method,
                :global(body.dark-mode) .table-balance {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .exchange-badge-box,
                :global(body.dark-mode) .tab-nav-row,
                :global(body.dark-mode) .preset-btn,
                :global(body.dark-mode) .crypto-option-btn,
                :global(body.dark-mode) .crypto-box,
                :global(body.dark-mode) .history-table th,
                :global(body.dark-mode) .empty-icon-wrap,
                :global(body.dark-mode) .filter-btn,
                :global(body.dark-mode) .page-btn,
                :global(body.dark-mode) .copy-icon-btn {
                    background-color: #0F172A;
                    border-color: #334155;
                    color: #94A3B8;
                }

                :global(body.dark-mode) .text-input,
                :global(body.dark-mode) .address-container {
                    background-color: #0F172A;
                    border-color: #334155;
                }

                :global(body.dark-mode) .preset-bdt {
                    color: #F8FAFC;
                }

                :global(body.dark-mode) .method-tab-btn.active {
                    background-color: #1E293B;
                    color: #38BDF8;
                }

                :global(body.dark-mode) .preset-btn.selected {
                    background-color: #0086ff;
                }

                :global(body.dark-mode) .preset-btn.selected .preset-bdt {
                    color: #fff;
                }

                :global(body.dark-mode) .history-table td {
                    border-bottom-color: #334155;
                }

                :global(body.dark-mode) .conversion-info-box {
                    background-color: rgba(0, 134, 255, 0.12);
                    border-color: rgba(0, 134, 255, 0.25);
                }
            `}</style>
        </div>
    );
}
