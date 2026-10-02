"use client";

import React, { useEffect } from 'react';
import { Check, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface DepositSuccessData {
    amountUsd: number;
    newBalanceUsd: number;
    currency?: string;
    network?: string;
    method?: string;
    txId?: string;
}

interface DepositSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DepositSuccessData | null;
    onBuyProxies?: () => void;
}

export const DepositSuccessModal: React.FC<DepositSuccessModalProps> = ({
    isOpen,
    onClose,
    data,
    onBuyProxies
}) => {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !data) return null;

    const formattedAmount = Number(data.amountUsd || 0).toFixed(2);
    const formattedNewBalance = Number(data.newBalanceUsd || 0).toFixed(2);
    const displayMethod = data.method || 'Cryptomus';
    const displayNetwork = data.network || data.currency || 'Crypto';

    return (
        <div className="deposit-modal-backdrop" onClick={onClose}>
            <div className="deposit-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="header-left">
                        <div className="status-icon-badge">
                            <Check size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="modal-title">Deposit Confirmed</h3>
                            <p className="modal-subtitle">Funds have been credited to your wallet</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Hero Amount Display */}
                <div className="modal-hero">
                    <span className="hero-label">Amount Credited</span>
                    <div className="hero-amount">
                        <span className="hero-currency">$</span>
                        <span className="hero-number">{formattedAmount}</span>
                        <span className="hero-code">USD</span>
                    </div>
                </div>

                {/* Receipt Breakdown Card */}
                <div className="ledger-card">
                    <div className="ledger-row">
                        <span className="ledger-label">Payment Method</span>
                        <span className="ledger-value">{displayMethod} ({displayNetwork})</span>
                    </div>

                    <div className="ledger-row">
                        <span className="ledger-label">Status</span>
                        <span className="ledger-value status-badge-pill">
                            <span className="status-dot" /> Confirmed
                        </span>
                    </div>

                    <div className="ledger-row ledger-divider">
                        <span className="ledger-label">Updated Balance</span>
                        <span className="ledger-value balance-value">${formattedNewBalance} USD</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            if (onBuyProxies) {
                                onBuyProxies();
                            } else {
                                router.push('/dashboard/premium-residential-proxies');
                            }
                        }}
                        className="btn-primary"
                    >
                        <span>Buy Premium Proxies</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .deposit-modal-backdrop {
                    position: fixed !important;
                    inset: 0 !important;
                    z-index: 99999 !important;
                    background: rgba(15, 23, 42, 0.7) !important;
                    backdrop-filter: blur(6px) !important;
                    -webkit-backdrop-filter: blur(6px) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 16px !important;
                    animation: backdropFadeIn 0.2s ease-out !important;
                }

                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .deposit-modal-card {
                    background-color: #FFFFFF !important;
                    border-radius: 18px !important;
                    width: 100% !important;
                    max-width: 440px !important;
                    box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px #E2E8F0 !important;
                    overflow: hidden !important;
                    position: relative !important;
                    animation: modalPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }

                @keyframes modalPopIn {
                    from { transform: scale(0.96) translateY(6px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }

                body.dark-mode .deposit-modal-card {
                    background-color: #0F172A !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
                }

                /* Header */
                .modal-header {
                    padding: 18px 22px !important;
                    background-color: #F8FAFC !important;
                    border-bottom: 1px solid #E2E8F0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                }

                body.dark-mode .modal-header {
                    background-color: #111A2E !important;
                    border-bottom-color: rgba(255, 255, 255, 0.08) !important;
                }

                .header-left {
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                }

                .status-icon-badge {
                    width: 36px !important;
                    height: 36px !important;
                    border-radius: 10px !important;
                    background-color: rgba(16, 185, 129, 0.12) !important;
                    color: #10B981 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    flex-shrink: 0 !important;
                }

                body.dark-mode .status-icon-badge {
                    background-color: rgba(16, 185, 129, 0.2) !important;
                    color: #34D399 !important;
                }

                .modal-title {
                    font-size: 15px !important;
                    font-weight: 700 !important;
                    color: #0F172A !important;
                    margin: 0 !important;
                    line-height: 1.2 !important;
                }

                body.dark-mode .modal-title {
                    color: #F8FAFC !important;
                }

                .modal-subtitle {
                    font-size: 12px !important;
                    color: #64748B !important;
                    margin: 2px 0 0 0 !important;
                }

                body.dark-mode .modal-subtitle {
                    color: #94A3B8 !important;
                }

                .modal-close-btn {
                    background: transparent !important;
                    border: none !important;
                    color: #94A3B8 !important;
                    cursor: pointer !important;
                    padding: 4px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 6px !important;
                    transition: color 0.15s, background-color 0.15s !important;
                }

                .modal-close-btn:hover {
                    color: #0F172A !important;
                    background-color: #E2E8F0 !important;
                }

                body.dark-mode .modal-close-btn:hover {
                    color: #FFFFFF !important;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }

                /* Hero Amount Display */
                .modal-hero {
                    padding: 24px 22px 18px 22px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    text-align: center !important;
                }

                .hero-label {
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    color: #64748B !important;
                    margin-bottom: 4px !important;
                }

                body.dark-mode .hero-label {
                    color: #94A3B8 !important;
                }

                .hero-amount {
                    display: flex !important;
                    align-items: baseline !important;
                    gap: 2px !important;
                }

                .hero-currency {
                    font-size: 24px !important;
                    font-weight: 700 !important;
                    color: #0F172A !important;
                }

                body.dark-mode .hero-currency {
                    color: #F8FAFC !important;
                }

                .hero-number {
                    font-size: 40px !important;
                    font-weight: 800 !important;
                    color: #0F172A !important;
                    letter-spacing: -0.03em !important;
                    line-height: 1 !important;
                }

                body.dark-mode .hero-number {
                    color: #FFFFFF !important;
                }

                .hero-code {
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    color: #64748B !important;
                    margin-left: 6px !important;
                }

                body.dark-mode .hero-code {
                    color: #94A3B8 !important;
                }

                /* Receipt Card */
                .ledger-card {
                    margin: 0 22px 22px 22px !important;
                    background-color: #F8FAFC !important;
                    border: 1px solid #E2E8F0 !important;
                    border-radius: 12px !important;
                    padding: 14px 16px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 10px !important;
                }

                body.dark-mode .ledger-card {
                    background-color: #111A2E !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                .ledger-row {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    font-size: 13px !important;
                }

                .ledger-label {
                    color: #64748B !important;
                    font-weight: 500 !important;
                }

                body.dark-mode .ledger-label {
                    color: #94A3B8 !important;
                }

                .ledger-value {
                    color: #0F172A !important;
                    font-weight: 600 !important;
                    text-align: right !important;
                }

                body.dark-mode .ledger-value {
                    color: #E2E8F0 !important;
                }

                .status-badge-pill {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    color: #059669 !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                }

                body.dark-mode .status-badge-pill {
                    color: #34D399 !important;
                }

                .status-dot {
                    width: 7px !important;
                    height: 7px !important;
                    border-radius: 50% !important;
                    background-color: #10B981 !important;
                }

                .ledger-divider {
                    padding-top: 10px !important;
                    margin-top: 2px !important;
                    border-top: 1px dashed #CBD5E1 !important;
                }

                body.dark-mode .ledger-divider {
                    border-top-color: rgba(255, 255, 255, 0.1) !important;
                }

                .balance-value {
                    color: #0086FF !important;
                    font-weight: 700 !important;
                }

                body.dark-mode .balance-value {
                    color: #38BDF8 !important;
                }

                /* Footer */
                .modal-footer {
                    padding: 0 22px 22px 22px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                }

                .btn-secondary {
                    flex: 1 !important;
                    height: 44px !important;
                    border: 1px solid #CBD5E1 !important;
                    background-color: #FFFFFF !important;
                    color: #475569 !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    border-radius: 10px !important;
                    cursor: pointer !important;
                    transition: all 0.15s ease !important;
                }

                .btn-secondary:hover {
                    background-color: #F8FAFC !important;
                    border-color: #94A3B8 !important;
                    color: #0F172A !important;
                }

                body.dark-mode .btn-secondary {
                    background-color: transparent !important;
                    border-color: rgba(255, 255, 255, 0.15) !important;
                    color: #94A3B8 !important;
                }

                body.dark-mode .btn-secondary:hover {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    color: #F8FAFC !important;
                }

                .btn-primary {
                    flex: 1.5 !important;
                    height: 44px !important;
                    border: none !important;
                    background-color: #0086FF !important;
                    color: #FFFFFF !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    border-radius: 10px !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 8px !important;
                    box-shadow: 0 2px 8px rgba(0, 134, 255, 0.25) !important;
                    transition: all 0.15s ease !important;
                }

                .btn-primary:hover {
                    background-color: #0070D6 !important;
                    box-shadow: 0 4px 12px rgba(0, 134, 255, 0.35) !important;
                    transform: translateY(-1px) !important;
                }

                .btn-primary:active {
                    transform: translateY(0) !important;
                }
            `}</style>
        </div>
    );
};
