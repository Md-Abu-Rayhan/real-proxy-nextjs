"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    Wallet,
    Globe,
    Crown,
    RefreshCw,
    ArrowRight,
    Plus,
    Minus,
    Tag,
    Zap,
    ShoppingCart,
    X,
    Users,
    TrendingUp,
    FileText
} from 'lucide-react';
import { API_URL } from '@/lib/config';
import { useWallet } from '@/context/WalletContext';
import { triggerPickBandwidthModal } from '@/components/ui/PickBandwidthModal';

interface TransactionItem {
    id: number;
    transactionType: string;
    amountUsd: number;
    amountBdt: number;
    paymentMethod: string;
    status: string;
    description: string;
    createdAt: string;
}

export default function DashboardOverviewPage() {
    const router = useRouter();
    const {
        balanceUsd,
        balanceBdt,
        totalDepositedUsd,
        totalSpentUsd,
        affiliateBalanceUsd,
        exchangeRateBdt,
        isLoading: isWalletLoading,
        refreshWallet
    } = useWallet();

    // User & Credentials State
    const [userEmail, setUserEmail] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [proxyCredentials, setProxyCredentials] = useState<{ account?: string; password?: string } | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Residential Proxies Bandwidth
    const [residentialBalance, setResidentialBalance] = useState<number | null>(null);
    const [isResidentialLoading, setIsResidentialLoading] = useState<boolean>(true);

    // Premium Residential Proxies Bandwidth
    const [premiumRemainingMb, setPremiumRemainingMb] = useState<number | null>(null);
    const [premiumLimitMb, setPremiumLimitMb] = useState<number | null>(null);
    const [premiumUsedMb, setPremiumUsedMb] = useState<number | null>(null);
    const [isPremiumLoading, setIsPremiumLoading] = useState<boolean>(true);

    // Recent Transactions Ledger
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isTxLoading, setIsTxLoading] = useState<boolean>(true);

    // Currency rate calculation
    const rate = exchangeRateBdt > 0 ? exchangeRateBdt : 125;

    // Evomi residential proxy balance is returned in MB - normalize to GB (1000 MB = 1 GB)
    const residentialRemainingGb = residentialBalance !== null ? residentialBalance / 1000 : null;
    const premiumRemainingGb = premiumRemainingMb !== null ? premiumRemainingMb / 1024 : null;
    const premiumLimitGb = premiumLimitMb !== null ? premiumLimitMb / 1024 : null;
    const premiumUsedGb = premiumUsedMb !== null ? premiumUsedMb / 1024 : null;
    const totalActiveGb = (residentialRemainingGb || 0) + (premiumRemainingGb || 0);

    // Fetch Residential Data
    const fetchResidentialData = useCallback(async (token: string) => {
        setIsResidentialLoading(true);
        try {
            const infoRes = await axios.get(`${API_URL}/api/Auth/get-proxy-info`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (infoRes.data?.proxyAccount) {
                let liveKey = infoRes.data.proxyPassword;
                try {
                    const balRes = await axios.get(`${API_URL}/api/Proxy/sub_user?username=${infoRes.data.proxyAccount}`);
                    const prod = balRes.data?.data?.products?.residential;
                    if (prod?.proxy_key) liveKey = prod.proxy_key;
                    const bal = prod?.balance;
                    setResidentialBalance(typeof bal === 'number' ? bal : null);
                } catch (e) {
                    console.warn('Subuser fetch error:', e);
                }
                setProxyCredentials({
                    account: infoRes.data.proxyAccount,
                    password: liveKey
                });
            }
        } catch (err) {
            console.warn('Residential balance fetch error:', err);
        } finally {
            setIsResidentialLoading(false);
        }
    }, []);

    // Fetch Premium Data
    const fetchPremiumData = useCallback(async (email: string) => {
        setIsPremiumLoading(true);
        try {
            const subRes = await axios.get(`${API_URL}/api/Premium/subuser-info?email=${encodeURIComponent(email)}`);
            if (subRes.data?.success && subRes.data?.username) {
                const liveRes = await axios.get(`${API_URL}/api/Premium/subuser-live-usage?username=${encodeURIComponent(subRes.data.username)}`);
                if (liveRes.data?.success) {
                    setPremiumRemainingMb(liveRes.data.trafficRemainingMB ?? 0);
                    setPremiumLimitMb(liveRes.data.trafficLimitMB ?? 0);
                    setPremiumUsedMb(liveRes.data.trafficUsedMB ?? 0);
                }
            }
        } catch (err) {
            console.warn('Premium balance fetch error:', err);
        } finally {
            setIsPremiumLoading(false);
        }
    }, []);

    // Fetch Recent Transactions
    const fetchRecentTransactions = useCallback(async (token: string) => {
        setIsTxLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/Wallet/transactions`, {
                params: { page: 1, pageSize: 5 },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.items) {
                setTransactions(res.data.items);
            }
        } catch (err) {
            console.warn('Failed to fetch transactions:', err);
        } finally {
            setIsTxLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const email = localStorage.getItem('user_email') || '';
        const name = localStorage.getItem('user_name') || '';
        setUserEmail(email);
        setUserName(name || (email ? email.split('@')[0] : 'User'));

        fetchResidentialData(token);
        if (email) fetchPremiumData(email);
        fetchRecentTransactions(token);
    }, [router, fetchResidentialData, fetchPremiumData, fetchRecentTransactions]);

    // Manual Refresh
    const handleRefreshAll = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try {
            const token = localStorage.getItem('auth_token');
            const email = localStorage.getItem('user_email');
            await Promise.all([
                refreshWallet(true),
                token ? fetchResidentialData(token) : Promise.resolve(),
                email ? fetchPremiumData(email) : Promise.resolve(),
                token ? fetchRecentTransactions(token) : Promise.resolve()
            ]);
            toast.success("Metrics updated!");
        } catch {
            toast.error("Failed to refresh.");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Open Modal
    const handleOpenModal = (type: 'Residential' | 'Premium Residential') => {
        triggerPickBandwidthModal(type);
    };

    // Auto-refresh data when bandwidth is purchased
    useEffect(() => {
        const handlePurchased = () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (token) {
                fetchResidentialData(token);
                if (userEmail) fetchPremiumData(userEmail);
                fetchRecentTransactions(token);
            }
        };
        window.addEventListener('bandwidth-purchased', handlePurchased);
        return () => window.removeEventListener('bandwidth-purchased', handlePurchased);
    }, [userEmail, fetchResidentialData, fetchPremiumData, fetchRecentTransactions]);



    return (
        <div className="dash-root-container">
            {/* Top Header */}
            <header className="dash-hero-bar">
                <div className="hero-left">
                    <div className="network-status-badge">
                        <span className="pulse-dot"></span>
                        <span>Proxy Cloud: 100% Operational • 195+ Countries</span>
                    </div>
                    <h1 className="hero-heading">
                        Welcome back, <span className="highlight-name">{userName}</span>
                    </h1>
                    <p className="hero-subtext">
                        Active proxies, live bandwidth counters, and prepaid ledger overview.
                    </p>
                </div>

                <div className="hero-right">
                    <div className="rate-pill">
                        <TrendingUp size={13} color="#0086FF" />
                        <span>1 USD = <strong>৳{rate.toFixed(0)} BDT</strong></span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRefreshAll}
                        disabled={isRefreshing}
                        className="btn-sync"
                        title="Sync All Metrics"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "spin-icon" : ""} />
                        <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOpenModal('Residential')}
                        className="btn-buy-cta"
                    >
                        <ShoppingCart size={15} />
                        <span>Pick Bandwidth</span>
                    </button>
                </div>
            </header>

            {/* 4 CORE KPI METRIC CARDS WITH EMBEDDED REAL-TIME STATS */}
            <section className="kpi-grid">
                {/* 1. Wallet Balance Card */}
                <div className="kpi-card card-wallet">
                    <div className="kpi-top">
                        <div className="kpi-pill pill-blue">
                            <Wallet size={16} />
                            <span>Prepaid Balance</span>
                        </div>
                        <span className="kpi-tag green-tag">0% Fee</span>
                    </div>

                    <div className="kpi-amount-box">
                        <div className="kpi-num">
                            ${isWalletLoading ? "..." : balanceUsd.toFixed(2)}
                            <span className="kpi-cur">USD</span>
                        </div>
                        <div className="kpi-bdt">
                            ≈ ৳{isWalletLoading ? "..." : balanceBdt.toLocaleString()} BDT
                        </div>
                    </div>

                    <div className="kpi-micro-stats">
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Total Deposited</span>
                            <span className="micro-stat-val font-mono">${totalDepositedUsd.toFixed(2)}</span>
                        </div>
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Total Spent</span>
                            <span className="micro-stat-val font-mono">${totalSpentUsd.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="kpi-footer">
                        <Link href="/dashboard/wallet" className="kpi-btn-primary btn-blue btn-full">
                            <Plus size={16} strokeWidth={2.5} />
                            <span>Top Up Balance</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Residential Proxies Bandwidth Card */}
                <div className="kpi-card card-residential">
                    <div className="kpi-top">
                        <div className="kpi-pill pill-indigo">
                            <Globe size={16} />
                            <span>Residential Proxies</span>
                        </div>
                        <span className="kpi-tag gray-tag">$1.00 / GB</span>
                    </div>

                    <div className="kpi-amount-box">
                        <div className="kpi-num">
                            {isResidentialLoading ? "..." : (residentialRemainingGb !== null ? residentialRemainingGb.toFixed(2) : "0.00")}
                            <span className="kpi-cur">GB</span>
                        </div>
                        <div className="kpi-sub-label">
                            Standard Pool • Unlimited Concurrency
                        </div>
                    </div>

                    <div className="kpi-micro-stats">
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Protocols</span>
                            <span className="micro-stat-val">HTTP / SOCKS5</span>
                        </div>
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Global Nodes</span>
                            <span className="micro-stat-val">195+ Countries</span>
                        </div>
                    </div>

                    <div className="kpi-footer card-actions-dual">
                        <button
                            type="button"
                            onClick={() => handleOpenModal('Residential')}
                            className="kpi-btn-primary btn-blue"
                        >
                            <ShoppingCart size={14} />
                            <span>Buy Proxy</span>
                        </button>
                        <Link href="/dashboard/residential-proxies" className="kpi-btn-outline">
                            <span>Setup IPs</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* 3. Premium Residential Proxies Bandwidth Card */}
                <div className="kpi-card card-premium">
                    <div className="kpi-top">
                        <div className="kpi-pill pill-gold">
                            <Crown size={16} color="#FFA800" />
                            <span>Premium Residential</span>
                        </div>
                        <span className="kpi-tag gold-tag">$1.50 / GB</span>
                    </div>

                    <div className="kpi-amount-box">
                        <div className="kpi-num gold-text">
                            {isPremiumLoading ? "..." : (premiumRemainingGb !== null ? premiumRemainingGb.toFixed(2) : "0.00")}
                            <span className="kpi-cur">GB</span>
                        </div>
                        <div className="kpi-sub-label">
                            Dedicated Clean ISP Pool • 0% Ban Rate
                        </div>
                    </div>

                    <div className="kpi-micro-stats">
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Used Traffic</span>
                            <span className="micro-stat-val font-mono">{premiumUsedGb !== null ? `${premiumUsedGb.toFixed(2)} GB` : '0.00 GB'}</span>
                        </div>
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Network Tier</span>
                            <span className="micro-stat-val text-amber font-semibold">Tier-1 Clean ISP</span>
                        </div>
                    </div>

                    <div className="kpi-footer card-actions-dual">
                        <button
                            type="button"
                            onClick={() => handleOpenModal('Premium Residential')}
                            className="kpi-btn-primary btn-gold"
                        >
                            <Crown size={14} />
                            <span>Buy Proxy</span>
                        </button>
                        <Link href="/dashboard/premium-residential-proxies" className="kpi-btn-outline">
                            <span>Setup IPs</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* 4. Affiliate & Commissions Card */}
                <div className="kpi-card card-affiliate">
                    <div className="kpi-top">
                        <div className="kpi-pill pill-green">
                            <Users size={16} />
                            <span>Affiliate Rewards</span>
                        </div>
                        <span className="kpi-tag green-tag">10% Recurring</span>
                    </div>

                    <div className="kpi-amount-box">
                        <div className="kpi-num green-text">
                            ${isWalletLoading ? "..." : affiliateBalanceUsd.toFixed(2)}
                            <span className="kpi-cur">USD</span>
                        </div>
                        <div className="kpi-sub-label">
                            Available referral commissions • 10% Recurring
                        </div>
                    </div>

                    <div className="kpi-micro-stats">
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Commission Rate</span>
                            <span className="micro-stat-val text-green font-semibold">10% Lifetime</span>
                        </div>
                        <div className="micro-stat-row">
                            <span className="micro-stat-label">Min Payout</span>
                            <span className="micro-stat-val font-mono">$10.00 USD</span>
                        </div>
                    </div>

                    <div className="kpi-footer">
                        <Link href="/dashboard/affiliate" className="kpi-btn-primary kpi-btn-green btn-full">
                            <Users size={15} />
                            <span>Affiliate Hub</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* RECENT TRANSACTIONS & ACTIVITY LEDGER */}
            <section className="transactions-section">
                <div className="tx-header-row">
                    <div>
                        <h3 className="tx-section-title">Recent Wallet & Purchase Activity</h3>
                        <p className="tx-section-desc">Latest top-ups, proxy bandwidth purchases, and ledger entries.</p>
                    </div>
                    <Link href="/dashboard/wallet" className="tx-view-all-link">
                        <span>View Full Ledger</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="tx-table-card">
                    {isTxLoading ? (
                        <div className="tx-loading-box">
                            <RefreshCw size={20} className="spin-icon" />
                            <span>Loading recent activity...</span>
                        </div>
                    ) : transactions.length > 0 ? (
                        <>
                            <div className="mobile-scroll-indicator">
                                <span>← Swipe table horizontally for details →</span>
                            </div>
                            <div className="table-responsive">
                                <table className="tx-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Activity Type</th>
                                            <th>Payment Gateway</th>
                                            <th>Amount (USD)</th>
                                            <th>Amount (BDT)</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => {
                                            const isCredit = tx.transactionType?.toLowerCase().includes('topup') ||
                                                tx.transactionType?.toLowerCase().includes('deposit') ||
                                                tx.transactionType?.toLowerCase().includes('affiliate');
                                            return (
                                                <tr key={tx.id}>
                                                    <td className="tx-date">
                                                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'Recent'}
                                                    </td>
                                                    <td>
                                                        <span className={`tx-type-pill ${isCredit ? 'pill-credit' : 'pill-debit'}`}>
                                                            {tx.transactionType || tx.description || 'Transaction'}
                                                        </span>
                                                    </td>
                                                    <td className="tx-method">
                                                        {tx.paymentMethod || 'Wallet'}
                                                    </td>
                                                    <td className={`tx-amt ${isCredit ? 'tx-plus' : 'tx-minus'}`}>
                                                        {isCredit ? '+' : '-'}${Number(tx.amountUsd || 0).toFixed(2)}
                                                    </td>
                                                    <td className="tx-bdt">
                                                        ৳{Number(tx.amountBdt || 0).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <span className="tx-status-badge">
                                                            <span className="status-dot-green"></span>
                                                            {tx.status || 'Completed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="tx-empty-state">
                            <FileText size={32} color="#94A3B8" />
                            <h4>No recent transactions found</h4>
                            <p>When you top up your wallet or purchase proxy bandwidth, records will appear here.</p>
                            <Link href="/dashboard/wallet" className="btn-empty-topup">
                                Top Up Wallet Now
                            </Link>
                        </div>
                    )}
                </div>
            </section>



            {/* Scoped CSS Styles */}
            <style jsx>{`
                .dash-root-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                    padding-bottom: 40px;
                    font-family: var(--font-poppins, -apple-system, BlinkMacSystemFont, sans-serif);
                }

                /* Hero Bar */
                .dash-hero-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 18px;
                    padding: 18px 24px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02);
                }

                .network-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 3px 10px;
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #059669;
                    margin-bottom: 6px;
                }

                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #10B981;
                    box-shadow: 0 0 6px #10B981;
                    animation: pulseDot 2s infinite ease-in-out;
                }

                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.85); }
                }

                .hero-heading {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0 0 4px 0;
                    letter-spacing: -0.3px;
                }

                .highlight-name {
                    color: #0086FF;
                }

                .hero-subtext {
                    font-size: 13px;
                    color: #64748B;
                    margin: 0;
                }

                .hero-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .rate-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    font-size: 12px;
                    color: #475569;
                }

                .rate-pill strong { color: #0086FF; font-weight: 700; }

                .btn-sync {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: #FFFFFF;
                    border: 1px solid #CBD5E1;
                    border-radius: 10px;
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn-sync:hover:not(:disabled) {
                    background: #F8FAFC;
                    border-color: #94A3B8;
                    color: #0F172A;
                    transform: translateY(-1px);
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
                }

                .btn-sync:active:not(:disabled) {
                    transform: translateY(0.5px) scale(0.99);
                }

                .btn-buy-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 18px;
                    background: #0086FF;
                    color: #FFFFFF;
                    border: 1px solid rgba(0, 134, 255, 0.9);
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(0, 134, 255, 0.2), 0 3px 10px rgba(0, 134, 255, 0.25);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn-buy-cta:hover {
                    background: #0077E6;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 134, 255, 0.2), 0 6px 18px rgba(0, 134, 255, 0.35);
                }

                .btn-buy-cta:active {
                    transform: translateY(0.5px) scale(0.99);
                }

                /* 4 KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .kpi-card {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 18px;
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                    box-sizing: border-box;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02);
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .kpi-card:hover {
                    transform: translateY(-2px);
                    border-color: #CBD5E1;
                    box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
                }

                .card-wallet {
                    border-color: rgba(0, 134, 255, 0.25);
                    background: radial-gradient(circle at top right, rgba(0, 134, 255, 0.035) 0%, #FFFFFF 65%);
                }

                .card-residential {
                    border-color: rgba(79, 70, 229, 0.2);
                    background: radial-gradient(circle at top right, rgba(79, 70, 229, 0.03) 0%, #FFFFFF 65%);
                }

                .card-premium {
                    border-color: rgba(245, 158, 11, 0.25);
                    background: radial-gradient(circle at top right, rgba(245, 158, 11, 0.035) 0%, #FFFFFF 65%);
                }

                .card-affiliate {
                    border-color: rgba(16, 185, 129, 0.2);
                    background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.03) 0%, #FFFFFF 65%);
                }

                .kpi-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 14px;
                }

                .kpi-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 9999px;
                    font-size: 11.5px;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                }

                .pill-blue { background: #EFF6FF; color: #0086FF; border: 1px solid #DBEAFE; }
                .pill-indigo { background: #EEF2FF; color: #4F46E5; border: 1px solid #E0E7FF; }
                .pill-gold { background: #FFFBEB; color: #D97706; border: 1px solid #FEF3C7; }
                .pill-green { background: #ECFDF5; color: #059669; border: 1px solid #D1FAE5; }

                .kpi-tag {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 3px 9px;
                    border-radius: 9999px;
                    letter-spacing: -0.01em;
                }

                .green-tag { color: #059669; background: #ECFDF5; border: 1px solid #A7F3D0; }
                .gray-tag { color: #475569; background: #F8FAFC; border: 1px solid #E2E8F0; }
                .gold-tag { color: #B45309; background: #FFFBEB; border: 1px solid #FDE68A; }

                .kpi-amount-box {
                    margin-bottom: 16px;
                }

                .kpi-num {
                    font-size: 30px;
                    font-weight: 800;
                    color: #0F172A;
                    line-height: 1.1;
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                    letter-spacing: -0.03em;
                }

                .gold-text { color: #D97706; }
                .green-text { color: #059669; }

                .kpi-cur { font-size: 13px; font-weight: 600; color: #94A3B8; margin-left: 2px; }

                .kpi-bdt {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #64748B;
                    margin-top: 5px;
                }

                .kpi-sub-label {
                    font-size: 11.5px;
                    color: #64748B;
                    margin-top: 5px;
                    line-height: 1.35;
                }

                .kpi-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    padding-top: 16px;
                    border-top: 1px solid #F1F5F9;
                    margin-top: auto;
                }

                .card-actions-dual {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    width: 100%;
                }

                .kpi-meta-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    font-size: 11.5px;
                    color: #64748B;
                    line-height: 1.25;
                }

                .kpi-meta-stat strong {
                    color: #1E293B;
                    font-weight: 700;
                }

                /* Modern 2026 Sleek Action Buttons */
                :global(.kpi-btn-primary) {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 7px !important;
                    height: 38px !important;
                    padding: 0 16px !important;
                    border-radius: 10px !important;
                    font-size: 12.5px !important;
                    font-weight: 600 !important;
                    letter-spacing: -0.01em !important;
                    text-decoration: none !important;
                    cursor: pointer !important;
                    white-space: nowrap !important;
                    border: none !important;
                    box-sizing: border-box !important;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }

                :global(.btn-full) {
                    width: 100% !important;
                }

                :global(.btn-blue) {
                    background: #0086FF !important;
                    color: #FFFFFF !important;
                    border: 1px solid rgba(0, 134, 255, 0.8) !important;
                    box-shadow: 0 1px 2px rgba(0, 134, 255, 0.18), 0 3px 10px rgba(0, 134, 255, 0.22) !important;
                }

                :global(.btn-blue:hover) {
                    background: #0076E5 !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 4px rgba(0, 134, 255, 0.2), 0 6px 18px rgba(0, 134, 255, 0.32) !important;
                    color: #FFFFFF !important;
                }

                :global(.btn-blue:active) {
                    transform: translateY(0.5px) scale(0.99) !important;
                }

                :global(.btn-gold) {
                    background: #F59E0B !important;
                    color: #FFFFFF !important;
                    border: 1px solid rgba(217, 119, 6, 0.6) !important;
                    box-shadow: 0 1px 2px rgba(217, 119, 6, 0.18), 0 3px 10px rgba(245, 158, 11, 0.22) !important;
                }

                :global(.btn-gold:hover) {
                    background: #D97706 !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 4px rgba(217, 119, 6, 0.2), 0 6px 18px rgba(245, 158, 11, 0.32) !important;
                    color: #FFFFFF !important;
                }

                :global(.btn-gold:active) {
                    transform: translateY(0.5px) scale(0.99) !important;
                }

                :global(.kpi-btn-green) {
                    background: #10B981 !important;
                    color: #FFFFFF !important;
                    border: 1px solid rgba(5, 150, 105, 0.6) !important;
                    box-shadow: 0 1px 2px rgba(5, 150, 105, 0.18), 0 3px 10px rgba(16, 185, 129, 0.22) !important;
                }

                :global(.kpi-btn-green:hover) {
                    background: #059669 !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2), 0 6px 18px rgba(16, 185, 129, 0.32) !important;
                    color: #FFFFFF !important;
                }

                :global(.kpi-btn-green:active) {
                    transform: translateY(0.5px) scale(0.99) !important;
                }

                /* Modern Ghost Slate Button (Signature Linear/Stripe style) */
                :global(.kpi-btn-outline) {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 6px !important;
                    height: 38px !important;
                    padding: 0 14px !important;
                    border-radius: 10px !important;
                    font-size: 12.5px !important;
                    font-weight: 600 !important;
                    letter-spacing: -0.01em !important;
                    color: #334155 !important;
                    background: #FFFFFF !important;
                    border: 1px solid #CBD5E1 !important;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
                    cursor: pointer !important;
                    text-decoration: none !important;
                    white-space: nowrap !important;
                    box-sizing: border-box !important;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }

                :global(.kpi-btn-outline:hover) {
                    background: #F8FAFC !important;
                    border-color: #94A3B8 !important;
                    color: #0086FF !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06) !important;
                }

                :global(.kpi-btn-outline:active) {
                    background: #F1F5F9 !important;
                    transform: translateY(0.5px) scale(0.99) !important;
                }

                /* Embedded KPI Micro-Stats Box */
                .kpi-micro-stats {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 12px 14px;
                    margin: 12px 0 16px 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 8px;
                    flex: 1;
                }

                .micro-stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    font-size: 11.5px;
                    color: #64748B;
                    min-height: 20px;
                }

                .micro-stat-label {
                    font-weight: 500;
                    color: #64748B;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .micro-stat-val {
                    font-weight: 700;
                    color: #0F172A;
                    white-space: nowrap;
                    text-align: right;
                }

                .micro-stat-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: #FFFFFF;
                    border: 1px solid #CBD5E1;
                    border-radius: 6px;
                    padding: 2px 8px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #1E293B;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .micro-stat-copy-btn:hover {
                    border-color: #0086FF;
                    color: #0086FF;
                    background: #EFF6FF;
                }

                .micro-progress-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-top: 2px;
                }

                .micro-progress-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10.5px;
                    color: #64748B;
                    font-weight: 600;
                }

                .micro-progress-track {
                    width: 100%;
                    height: 6px;
                    background: #E2E8F0;
                    border-radius: 9999px;
                    overflow: hidden;
                }

                .micro-progress-bar {
                    height: 100%;
                    border-radius: 9999px;
                    transition: width 0.4s ease;
                }

                .bar-blue { background: #0086FF; }
                .bar-gold { background: #F59E0B; }

                .micro-badge-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 4px;
                }

                .micro-badge {
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 7px;
                    border-radius: 5px;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    color: #475569;
                }

                /* Middle 2-Column Grid */
                .middle-dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                @media (min-width: 1441px) {
                    .middle-dashboard-grid {
                        grid-template-columns: 1.2fr 0.8fr;
                    }
                }

                .info-panel {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 18px;
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .info-panel:hover {
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 14px;
                }

                .panel-title-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1 1 260px;
                    min-width: 0;
                }

                .panel-icon-wrap {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .icon-blue-wrap { background: rgba(0, 134, 255, 0.1); color: #0086FF; }
                .icon-purple-wrap { background: rgba(124, 58, 237, 0.1); color: #7C3AED; }

                .panel-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                    line-height: 1.25;
                }

                .panel-desc {
                    font-size: 12px;
                    color: #64748B;
                    margin: 2px 0 0 0;
                    line-height: 1.4;
                }

                .telemetry-controls-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .metric-toggle-capsule {
                    display: flex;
                    align-items: center;
                    background: #F1F5F9;
                    border: 1px solid #E2E8F0;
                    border-radius: 9999px;
                    padding: 2px;
                    gap: 2px;
                }

                .metric-toggle-btn {
                    padding: 4px 10px;
                    border-radius: 9999px;
                    border: none;
                    background: transparent;
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .metric-toggle-btn.active {
                    background: #FFFFFF;
                    color: #0086FF;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }

                .timeframe-pills-group {
                    display: flex;
                    align-items: center;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 8px;
                    padding: 2px;
                    gap: 2px;
                }

                .timeframe-pill-btn {
                    padding: 4px 8px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .timeframe-pill-btn.active {
                    background: #0086FF;
                    color: #FFFFFF;
                    box-shadow: 0 1px 3px rgba(0, 134, 255, 0.3);
                }

                /* Micro Live Stats Strip */
                .telemetry-live-strip {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }

                .live-stat-item {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    padding: 10px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    min-width: 0;
                }

                .ls-label {
                    font-size: 11px;
                    color: #64748B;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ls-val {
                    font-size: 14.5px;
                    font-weight: 800;
                    color: #0F172A;
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                    white-space: nowrap;
                }

                .ls-trend {
                    font-size: 9.5px;
                    font-weight: 700;
                }

                .ls-sub {
                    font-size: 9.5px;
                    color: #94A3B8;
                }

                /* Interactive Chart Wrap & SVG */
                .interactive-chart-wrap {
                    position: relative;
                    width: 100%;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 14px;
                    padding: 10px 8px 6px 8px;
                    box-sizing: border-box;
                    cursor: crosshair;
                }

                .telemetry-svg-chart {
                    width: 100%;
                    height: 210px;
                    display: block;
                    overflow: visible;
                }

                .chart-dot {
                    transition: all 0.15s ease;
                }

                .chart-hover-card {
                    position: absolute;
                    transform: translateX(-50%);
                    background: #0F172A;
                    color: #FFFFFF;
                    padding: 7px 10px;
                    border-radius: 8px;
                    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
                    pointer-events: none;
                    z-index: 10;
                    white-space: nowrap;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }

                .ch-time {
                    font-size: 9.5px;
                    color: #94A3B8;
                }

                .ch-val {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #38BDF8;
                }

                .ch-meta {
                    font-size: 9.5px;
                    color: #CBD5E1;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .ch-meta strong {
                    color: #FFFFFF;
                }

                /* Snippet Tabs & Box */
                .snippet-tabs {
                    display: flex;
                    background: #F1F5F9;
                    padding: 3px;
                    border-radius: 8px;
                    gap: 3px;
                    border: 1px solid #E2E8F0;
                }

                .snippet-tab {
                    padding: 4px 11px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .snippet-tab.active {
                    background: #FFFFFF;
                    color: #0086FF;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }

                .endpoint-details-strip {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }

                .endp-col {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    padding: 8px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .endp-lbl { font-size: 9.5px; color: #64748B; font-weight: 700; text-transform: uppercase; }

                .endp-val-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .endp-val { font-size: 12px; font-weight: 700; color: #0F172A; }

                .btn-endp-copy {
                    background: #FFFFFF;
                    border: 1px solid #CBD5E1;
                    border-radius: 6px;
                    padding: 3px 6px;
                    cursor: pointer;
                    color: #475569;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                }

                .btn-endp-copy:hover {
                    border-color: #0086FF;
                    color: #0086FF;
                }

                .code-snippet-card {
                    background: #0F172A;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .code-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 7px 12px;
                    background: #1E293B;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .code-lang-label {
                    font-size: 10px;
                    font-weight: 800;
                    color: #94A3B8;
                    letter-spacing: 0.5px;
                }

                .btn-copy-code {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 10px;
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    background: rgba(255, 255, 255, 0.1);
                    color: #F8FAFC;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .btn-copy-code:hover {
                    background: rgba(255, 255, 255, 0.18);
                    color: #38BDF8;
                }

                .code-pre {
                    margin: 0;
                    padding: 12px;
                    color: #38BDF8;
                    font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
                    font-size: 11.5px;
                    line-height: 1.5;
                    overflow-x: auto;
                    max-height: 115px;
                }

                .bandwidth-breakdown-card {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 16px;
                    padding: 18px 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02);
                }

                .bb-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13.5px;
                    color: #0F172A;
                }

                .bb-title-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                }

                .bb-title {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0F172A;
                }

                .bb-total {
                    font-size: 13px;
                    color: #64748B;
                }

                .bb-total strong {
                    color: #0086FF;
                    font-weight: 800;
                    font-size: 14.5px;
                }

                .bb-bar-track {
                    height: 10px;
                    background: #E2E8F0;
                    border-radius: 6px;
                    display: flex;
                    overflow: hidden;
                }

                .bb-bar-seg {
                    height: 100%;
                    transition: width 0.4s ease;
                }

                .res-seg { background: #0086FF; }
                .prem-seg { background: #F59E0B; }

                .bb-legend {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #64748B;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .legend-color {
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                }

                .res-col { background: #0086FF; }
                .prem-col { background: #F59E0B; }

                .legend-status-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #10B981;
                    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
                }

                .legend-status-text {
                    font-size: 11.5px;
                }

                .legend-status-text strong {
                    color: #0F172A;
                }

                /* Transactions Section */
                .transactions-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tx-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .tx-section-title {
                    font-size: 17px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                }

                .tx-section-desc {
                    font-size: 12px;
                    color: #64748B;
                    margin: 2px 0 0 0;
                }

                .tx-view-all-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #0086FF;
                    background: rgba(0, 134, 255, 0.06);
                    border: 1px solid rgba(0, 134, 255, 0.18);
                    text-decoration: none;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .tx-view-all-link:hover {
                    background: rgba(0, 134, 255, 0.12);
                    border-color: rgba(0, 134, 255, 0.35);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(0, 134, 255, 0.15);
                }
                .tx-view-all-link:active {
                    transform: translateY(0) scale(0.98);
                }

                .tx-table-card {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.015);
                }

                .mobile-scroll-indicator {
                    display: none;
                    padding: 8px 16px;
                    background: linear-gradient(90deg, #F8FAFC 0%, #EFF6FF 100%);
                    border-bottom: 1px solid #E2E8F0;
                    font-size: 11px;
                    font-weight: 600;
                    color: #0086FF;
                    text-align: right;
                }

                .table-responsive {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                    scrollbar-color: #CBD5E1 #F8FAFC;
                }

                .table-responsive::-webkit-scrollbar {
                    height: 6px;
                }
                .table-responsive::-webkit-scrollbar-track {
                    background: #F8FAFC;
                }
                .table-responsive::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 4px;
                }
                .table-responsive::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }

                .tx-table {
                    width: 100%;
                    min-width: 650px;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 13px;
                }

                .tx-table th {
                    background: #F8FAFC;
                    padding: 13px 16px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid #E2E8F0;
                    white-space: nowrap;
                }

                .tx-table td {
                    padding: 13px 16px;
                    border-bottom: 1px solid #F1F5F9;
                    color: #334155;
                    white-space: nowrap;
                }

                .tx-date {
                    font-size: 12px;
                    color: #64748B;
                    white-space: nowrap;
                    font-variant-numeric: tabular-nums;
                }

                .tx-type-pill {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .pill-credit { background: rgba(16, 185, 129, 0.1); color: #059669; }
                .pill-debit { background: rgba(99, 102, 241, 0.1); color: #4F46E5; }

                .tx-method {
                    font-weight: 600;
                    color: #475569;
                    white-space: nowrap;
                }

                .tx-amt {
                    font-weight: 800;
                    white-space: nowrap;
                }
                .tx-plus { color: #10B981; }
                .tx-minus { color: #EF4444; }

                .tx-bdt {
                    font-size: 12px;
                    color: #64748B;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .tx-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 3px 8px;
                    background: rgba(16, 185, 129, 0.08);
                    color: #059669;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .status-dot-green {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #10B981;
                    flex-shrink: 0;
                }

                .tx-loading-box, .tx-empty-state {
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    text-align: center;
                    color: #64748B;
                }

                .tx-empty-state h4 { margin: 0; color: #0F172A; font-size: 15px; }
                .tx-empty-state p { margin: 0; font-size: 13px; max-width: 400px; }

                .btn-empty-topup {
                    margin-top: 8px;
                    padding: 9px 18px;
                    background: linear-gradient(180deg, #1A94FF 0%, #0077E6 55%, #0066CC 100%);
                    color: #FFFFFF;
                    border: 1px solid rgba(0, 90, 180, 0.4);
                    border-radius: 9px;
                    font-size: 12.5px;
                    font-weight: 700;
                    text-decoration: none;
                    box-shadow: 0 2px 8px rgba(0, 134, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.35);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .btn-empty-topup:hover {
                    background: linear-gradient(180deg, #2EA0FF 0%, #0084FF 55%, #0072E5 100%);
                    transform: translateY(-1.5px);
                    box-shadow: 0 4px 14px rgba(0, 134, 255, 0.42);
                }

                /* ============================================================
                   CLEAN MODAL STYLES
                ============================================================ */
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100000;
                    padding: 16px;
                }

                .modal-container {
                    background: #FFFFFF;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 540px;
                    max-height: calc(100dvh - 32px);
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    gap: 0;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28), 0 0 1px rgba(0, 0, 0, 0.15);
                    border: 1px solid #E2E8F0;
                    animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .modal-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 22px;
                    border-bottom: 1px solid #F1F5F9;
                    background: #FFFFFF;
                    flex-shrink: 0;
                }

                .modal-scroll-body {
                    padding: 18px 22px 22px 22px;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    scrollbar-width: thin;
                    scrollbar-color: #CBD5E1 #F8FAFC;
                }
                .modal-scroll-body::-webkit-scrollbar {
                    width: 5px;
                }
                .modal-scroll-body::-webkit-scrollbar-track {
                    background: #F8FAFC;
                }
                .modal-scroll-body::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 4px;
                }
                .modal-scroll-body::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }

                .modal-title-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .modal-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 11px;
                    background: linear-gradient(180deg, rgba(0, 134, 255, 0.15) 0%, rgba(0, 134, 255, 0.05) 100%);
                    color: #0086FF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border: 1px solid rgba(0, 134, 255, 0.2);
                }

                .modal-heading {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                    letter-spacing: -0.2px;
                }

                .modal-desc {
                    font-size: 12px;
                    color: #64748B;
                    margin: 2px 0 0 0;
                }

                .modal-close {
                    width: 32px;
                    height: 32px;
                    background: #F1F5F9;
                    border: 1px solid #E2E8F0;
                    border-radius: 9px;
                    cursor: pointer;
                    color: #64748B;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modal-close:hover {
                    background: #E2E8F0;
                    color: #0F172A;
                    transform: rotate(90deg);
                }

                .plan-switch {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                    background: #F1F5F9;
                    padding: 4px;
                    border-radius: 12px;
                    border: 1px solid #E2E8F0;
                }

                .switch-tab {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    padding: 10px;
                    border-radius: 9px;
                    border: 1px solid transparent;
                    background: transparent;
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .switch-tab:hover:not(.switch-active) {
                    color: #0F172A;
                    background: rgba(255, 255, 255, 0.5);
                }

                .switch-active {
                    background: #FFFFFF;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9);
                }

                .switch-active.res {
                    color: #0086FF;
                    border-color: rgba(0, 134, 255, 0.25);
                }
                .switch-active.prem {
                    color: #D97706;
                    border-color: rgba(245, 158, 11, 0.3);
                }

                .section-block {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .block-label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .block-label {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #334155;
                }

                .savings-badge {
                    font-size: 11px;
                    font-weight: 700;
                    color: #059669;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 2px 7px;
                    border-radius: 5px;
                }

                .presets-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 7px;
                }

                .preset-box {
                    padding: 10px 4px;
                    border-radius: 10px;
                    border: 1.5px solid #E2E8F0;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .preset-box:hover {
                    border-color: #94A3B8;
                    background: #FFFFFF;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
                }

                .gb-number { font-size: 13.5px; font-weight: 800; color: #0F172A; letter-spacing: -0.2px; }
                .gb-price { font-size: 10.5px; color: #64748B; font-weight: 700; }

                .preset-blue {
                    background: linear-gradient(180deg, #1A92FF 0%, #0070E0 55%, #0060C7 100%) !important;
                    border-color: #0054B3 !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 6px 18px rgba(0, 134, 255, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
                    transform: translateY(-2px);
                }
                .preset-blue .gb-number, .preset-blue .gb-price { color: #FFFFFF !important; }

                .preset-gold {
                    background: linear-gradient(180deg, #FBBF24 0%, #F59E0B 55%, #D97706 100%) !important;
                    border-color: #B45309 !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 6px 18px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
                    transform: translateY(-2px);
                }
                .preset-gold .gb-number, .preset-gold .gb-price { color: #FFFFFF !important; }

                .slider-box {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .slider-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .slider-current-lbl { font-size: 12px; color: #64748B; font-weight: 600; }

                .stepper-controls {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn-step {
                    width: 28px;
                    height: 28px;
                    border-radius: 7px;
                    border: 1px solid #CBD5E1;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #334155;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9);
                    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn-step:hover:not(:disabled) {
                    border-color: #0086FF;
                    color: #0086FF;
                    background: #FFFFFF;
                    transform: scale(1.06);
                    box-shadow: 0 2px 6px rgba(0, 134, 255, 0.15);
                }

                .btn-step:active:not(:disabled) {
                    transform: scale(0.94);
                }

                .btn-step:disabled { opacity: 0.35; cursor: not-allowed; }

                .slider-current-val {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0F172A;
                    min-width: 50px;
                    text-align: center;
                }

                .clean-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    outline: none;
                    cursor: pointer;
                    -webkit-appearance: none;
                }

                .clean-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #FFFFFF;
                    border: 3px solid #0086FF;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                }

                .cost-summary {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .cost-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }

                .cost-lbl { font-size: 12px; color: #64748B; font-weight: 600; }
                .cost-val { font-size: 13px; font-weight: 700; color: #1E293B; }

                .cost-divider {
                    height: 1px;
                    background: #E2E8F0;
                    margin: 2px 0;
                }

                .total-highlight .cost-lbl {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0F172A;
                }

                .cost-total-amount {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0086FF;
                    display: flex;
                    align-items: baseline;
                    gap: 3px;
                }

                .usd-text { font-size: 11.5px; font-weight: 700; color: #64748B; }

                .promo-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .promo-input-box {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: #F8FAFC;
                    border: 1px solid #CBD5E1;
                    border-radius: 9px;
                    padding: 3px 6px 3px 10px;
                    gap: 6px;
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
                }

                .promo-tag-icon { color: #94A3B8; }

                .promo-field {
                    flex: 1;
                    border: none;
                    background: transparent;
                    font-size: 12px;
                    font-weight: 700;
                    color: #0F172A;
                    outline: none;
                    text-transform: uppercase;
                }

                .btn-promo-apply {
                    padding: 6px 14px;
                    border-radius: 7px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
                    color: #FFFFFF;
                    font-size: 11.5px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .btn-promo-apply:hover:not(:disabled) {
                    background: linear-gradient(180deg, #334155 0%, #1E293B 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
                }
                .btn-promo-apply:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .discount-note {
                    font-size: 11.5px;
                    font-weight: 700;
                    color: #059669;
                }

                .wallet-status-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 14px;
                    border-radius: 11px;
                }

                .status-ok {
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                }

                .status-low {
                    background: rgba(245, 158, 11, 0.08);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }

                .wallet-status-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .status-label { font-size: 10.5px; color: #64748B; font-weight: 600; text-transform: uppercase; display: block; }
                .status-val { font-size: 13.5px; font-weight: 800; color: #0F172A; }

                .pill-ok {
                    background: #10B981;
                    color: #FFFFFF;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .pill-short {
                    background: #F59E0B;
                    color: #000000;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .btn-confirm-pay {
                    width: 100%;
                    height: 46px;
                    padding: 0 20px;
                    border-radius: 12px;
                    border: none;
                    font-size: 14px;
                    font-weight: 800;
                    letter-spacing: -0.2px;
                    color: #FFFFFF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .pay-blue {
                    background: linear-gradient(180deg, #1A92FF 0%, #0070E0 55%, #0060C7 100%);
                    border: 1px solid rgba(0, 80, 170, 0.4);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 134, 255, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.38);
                }
                .pay-blue:hover:not(:disabled) {
                    background: linear-gradient(180deg, #2EA0FF 0%, #0084FF 55%, #0072E5 100%);
                    transform: translateY(-1.5px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 12px 30px rgba(0, 134, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.45);
                }
                .pay-blue:active:not(:disabled) {
                    transform: translateY(0.5px) scale(0.985);
                    box-shadow: 0 1px 3px rgba(0, 134, 255, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2);
                }

                .pay-gold {
                    background: linear-gradient(180deg, #FBBF24 0%, #F59E0B 55%, #D97706 100%);
                    border: 1px solid rgba(180, 83, 9, 0.4);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.38);
                }
                .pay-gold:hover:not(:disabled) {
                    background: linear-gradient(180deg, #FCD34D 0%, #FBBF24 55%, #F59E0B 100%);
                    transform: translateY(-1.5px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 12px 30px rgba(245, 158, 11, 0.52), inset 0 1px 0 rgba(255, 255, 255, 0.45);
                }
                .pay-gold:active:not(:disabled) {
                    transform: translateY(0.5px) scale(0.985);
                    box-shadow: 0 1px 3px rgba(245, 158, 11, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2);
                }

                .btn-confirm-pay:disabled { opacity: 0.6; cursor: not-allowed; }

                .btn-topup-wallet-link {
                    width: 100%;
                    box-sizing: border-box;
                    height: 46px;
                    padding: 0 20px;
                    border-radius: 12px;
                    background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
                    border: 1.5px solid rgba(245, 158, 11, 0.5);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 12px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12);
                    color: #FFFFFF;
                    text-decoration: none;
                    font-size: 13.5px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn-topup-wallet-link:hover {
                    background: linear-gradient(180deg, #334155 0%, #1E293B 100%);
                    border-color: #F59E0B;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
                }

                .btn-topup-wallet-link:active {
                    transform: translateY(0.5px) scale(0.985);
                }

                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* ============================================================
                   DARK MODE
                ============================================================ */
                :global(body.dark-mode) .hero-heading,
                :global(body.dark-mode) .kpi-num,
                :global(body.dark-mode) .panel-title,
                :global(body.dark-mode) .t-val,
                :global(body.dark-mode) .endp-val,
                :global(body.dark-mode) .tx-section-title,
                :global(body.dark-mode) .modal-heading,
                :global(body.dark-mode) .gb-number,
                :global(body.dark-mode) .slider-current-val,
                :global(body.dark-mode) .cost-val,
                :global(body.dark-mode) .status-val {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .hero-subtext,
                :global(body.dark-mode) .kpi-bdt,
                :global(body.dark-mode) .kpi-sub-label,
                :global(body.dark-mode) .panel-desc,
                :global(body.dark-mode) .t-lbl,
                :global(body.dark-mode) .endp-lbl,
                :global(body.dark-mode) .tx-section-desc,
                :global(body.dark-mode) .tx-date,
                :global(body.dark-mode) .modal-desc,
                :global(body.dark-mode) .block-label,
                :global(body.dark-mode) .slider-current-lbl,
                :global(body.dark-mode) .cost-lbl,
                :global(body.dark-mode) .status-label {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .kpi-card,
                :global(body.dark-mode) .info-panel,
                :global(body.dark-mode) .tx-table-card,
                :global(body.dark-mode) .rate-pill,
                :global(body.dark-mode) .modal-container {
                    background: linear-gradient(180deg, #111827 0%, #0D1322 100%) !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
                }

                :global(body.dark-mode) .telemetry-box,
                :global(body.dark-mode) .bandwidth-breakdown-card,
                :global(body.dark-mode) .endp-col,
                :global(body.dark-mode) .slider-box,
                :global(body.dark-mode) .cost-summary,
                :global(body.dark-mode) .promo-input-box {
                    background: #080D1A !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    color: #CBD5E1 !important;
                }

                :global(body.dark-mode) .btn-sync,
                :global(body.dark-mode) .btn-kpi-secondary,
                :global(body.dark-mode) .btn-endp-copy,
                :global(body.dark-mode) .btn-step,
                :global(body.dark-mode) .modal-close {
                    background: linear-gradient(180deg, #1E293B 0%, #141C2E 100%) !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #F1F5F9 !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
                }

                :global(body.dark-mode) .btn-sync:hover:not(:disabled),
                :global(body.dark-mode) .btn-kpi-secondary:hover,
                :global(body.dark-mode) .btn-endp-copy:hover,
                :global(body.dark-mode) .btn-step:hover:not(:disabled),
                :global(body.dark-mode) .modal-close:hover {
                    background: linear-gradient(180deg, #2D3A52 0%, #1E293B 100%) !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #FFFFFF !important;
                }

                :global(body.dark-mode) .tx-table th {
                    background: #080D1A !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .tx-table td {
                    border-bottom-color: rgba(255, 255, 255, 0.04) !important;
                    color: #CBD5E1 !important;
                }

                :global(body.dark-mode) .plan-switch {
                    background: #080D1A !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                :global(body.dark-mode) .switch-tab {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .switch-active {
                    background: #162033 !important;
                }

                :global(body.dark-mode) .preset-box {
                    background: #0B1120 !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                }
                :global(body.dark-mode) .preset-box .gb-number {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .preset-box .gb-price {
                    color: #94A3B8 !important;
                }
                :global(body.dark-mode) .preset-box:hover {
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    background: #111B30 !important;
                }

                :global(body.dark-mode) .snippet-tabs {
                    background: #080D1A !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                :global(body.dark-mode) .snippet-tab {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .snippet-tab.active {
                    background: #111827 !important;
                    color: #38BDF8 !important;
                }

                :global(body.dark-mode) .kpi-footer {
                    border-top-color: rgba(255, 255, 255, 0.08) !important;
                }

                :global(body.dark-mode) .kpi-meta-stat {
                    color: #94A3B8 !important;
                }

                :global(body.dark-mode) .kpi-meta-stat strong {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode .kpi-btn-outline) {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.15) !important;
                    color: #F1F5F9 !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
                }

                :global(body.dark-mode .kpi-btn-outline:hover) {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: #0086FF !important;
                    color: #38BDF8 !important;
                    box-shadow: 0 4px 14px rgba(0, 134, 255, 0.25) !important;
                }

                :global(body.dark-mode) .kpi-micro-stats {
                    background: #0B1120 !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }
                :global(body.dark-mode) .micro-stat-label {
                    color: #94A3B8 !important;
                }
                :global(body.dark-mode) .micro-stat-val {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .micro-stat-copy-btn {
                    background: #1E293B !important;
                    border-color: rgba(255, 255, 255, 0.15) !important;
                    color: #E2E8F0 !important;
                }
                :global(body.dark-mode) .micro-stat-copy-btn:hover {
                    background: #2D3748 !important;
                    border-color: #0086FF !important;
                    color: #38BDF8 !important;
                }
                :global(body.dark-mode) .micro-badge {
                    background: #1E293B !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: #CBD5E1 !important;
                }
                :global(body.dark-mode) .micro-progress-track {
                    background: #1E293B !important;
                }
                :global(body.dark-mode) .bandwidth-breakdown-card {
                    background: #0F172A !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }
                :global(body.dark-mode) .bb-title {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .bb-bar-track {
                    background: #1E293B !important;
                }
                :global(body.dark-mode) .legend-status-text strong {
                    color: #F8FAFC !important;
                }

                :global(body.dark-mode) .dash-hero-bar {
                    background: #0F172A !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }
                :global(body.dark-mode) .hero-heading {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .hero-subtext {
                    color: #94A3B8 !important;
                }
                :global(body.dark-mode) .rate-pill {
                    background: #1E293B !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: #CBD5E1 !important;
                }
                :global(body.dark-mode) .btn-sync {
                    background: #1E293B !important;
                    border-color: rgba(255, 255, 255, 0.15) !important;
                    color: #F8FAFC !important;
                }

                /* ============================================================
                   RESPONSIVE BREAKPOINTS (ALL DEVICES COMPATIBLE)
                ============================================================ */
                @media (max-width: 1440px) {
                    .kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .dash-root-container {
                        gap: 16px;
                        padding-bottom: 24px;
                    }
                    .dash-hero-bar {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 16px;
                        gap: 14px;
                    }
                    .hero-right {
                        width: 100%;
                        justify-content: flex-start;
                    }
                    .kpi-grid {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }
                    .kpi-card {
                        padding: 18px;
                    }
                    .presets-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .wallet-status-bar {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                    .mobile-scroll-indicator {
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        gap: 4px;
                    }
                }

                @media (max-width: 640px) {
                    .modal-backdrop {
                        padding: 8px;
                    }
                    .modal-container {
                        max-height: calc(100dvh - 16px);
                        border-radius: 16px;
                    }
                    .modal-head {
                        padding: 12px 16px;
                    }
                    .modal-heading {
                        font-size: 16px;
                    }
                    .modal-desc {
                        font-size: 11px;
                    }
                    .modal-scroll-body {
                        padding: 14px 16px 18px 16px;
                        gap: 13px;
                    }
                    .presets-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 6px;
                    }
                    .cost-summary {
                        padding: 10px 14px;
                        gap: 6px;
                    }
                    .cost-total-amount {
                        font-size: 18px;
                    }
                    .btn-confirm-pay {
                        height: 44px;
                        font-size: 13px;
                    }
                    .tx-header-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                    .tx-view-all-link {
                        align-self: flex-start;
                    }
                    .tx-table {
                        min-width: 630px;
                    }
                    .tx-table th {
                        padding: 10px 12px;
                        font-size: 10.5px;
                    }
                    .tx-table td {
                        padding: 11px 12px;
                        font-size: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .card-actions-dual {
                        grid-template-columns: 1fr;
                    }
                    .hero-right {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .hero-right .btn-sync,
                    .hero-right .btn-buy-cta {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
