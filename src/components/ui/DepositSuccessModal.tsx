"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, Wallet, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';
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

    // Close on Escape key
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
        <div
            className="deposit-modal-backdrop"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(10, 15, 29, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}
        >
            <div
                className="deposit-modal-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '440px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)'
                }}
            >
                {/* Top ambient glow bar */}
                <div className="glow-banner" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="modal-close-btn"
                    aria-label="Close"
                    type="button"
                >
                    <X size={18} />
                </button>

                <div className="modal-content-inner">
                    {/* Animated Celebration Icon */}
                    <div className="celebration-icon-wrap">
                        <div className="pulse-ring" />
                        <div className="icon-circle">
                            <CheckCircle2 size={40} className="success-icon" />
                        </div>
                        <div className="sparkle-badge">
                            <Sparkles size={13} />
                        </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="modal-heading">Deposit Confirmed!</h3>
                    <p className="modal-subheading">
                        Your payment has been verified on the blockchain and instantly credited to your wallet.
                    </p>

                    {/* Credited Amount Card */}
                    <div className="amount-highlight-card">
                        <span className="amount-label">Credited to Balance</span>
                        <div className="amount-row">
                            <span className="plus-sign">+</span>
                            <span className="dollar-symbol">$</span>
                            <span className="amount-val">{formattedAmount}</span>
                            <span className="currency-tag">USD</span>
                        </div>
                    </div>

                    {/* Details Breakdown */}
                    <div className="details-card">
                        <div className="detail-item">
                            <span className="detail-label">Status</span>
                            <div className="status-badge">
                                <span className="status-dot" />
                                <span>Completed</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Method / Network</span>
                            <span className="detail-value">
                                <ShieldCheck size={14} className="val-icon" />
                                {displayMethod} ({displayNetwork})
                            </span>
                        </div>

                        <div className="detail-item total-row">
                            <span className="detail-label">Updated Wallet Balance</span>
                            <div className="new-balance-wrap">
                                <Wallet size={15} className="wallet-icon" />
                                <span className="new-balance-val">${formattedNewBalance} USD</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-actions">
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
                            className="btn-buy-proxies"
                        >
                            <span>Buy Premium Proxies</span>
                            <ArrowRight size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-done"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .deposit-modal-backdrop {
                    position: fixed !important;
                    inset: 0 !important;
                    z-index: 99999 !important;
                    background-color: rgba(10, 15, 29, 0.78) !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
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
                    border-radius: 24px !important;
                    width: 100% !important;
                    max-width: 440px !important;
                    overflow: hidden !important;
                    position: relative !important;
                    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8) !important;
                    animation: popInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }

                @keyframes popInModal {
                    from { transform: scale(0.92); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                body.dark-mode .deposit-modal-card {
                    background-color: #0F172A !important;
                    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12) !important;
                }

                .glow-banner {
                    height: 5px !important;
                    width: 100% !important;
                    background: linear-gradient(90deg, #10B981, #0086FF, #10B981) !important;
                    background-size: 200% 100% !important;
                    animation: shineGlowBar 3s linear infinite !important;
                }

                @keyframes shineGlowBar {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }

                .modal-close-btn {
                    position: absolute !important;
                    top: 16px !important;
                    right: 16px !important;
                    width: 32px !important;
                    height: 32px !important;
                    border-radius: 50% !important;
                    border: none !important;
                    background: #F1F5F9 !important;
                    color: #64748B !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    z-index: 10 !important;
                }

                .modal-close-btn:hover {
                    background: #E2E8F0 !important;
                    color: #0F172A !important;
                }

                body.dark-mode .modal-close-btn {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: #94A3B8 !important;
                }

                body.dark-mode .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.18) !important;
                    color: #FFFFFF !important;
                }

                .modal-content-inner {
                    padding: 28px 24px 24px 24px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    text-align: center !important;
                }

                .celebration-icon-wrap {
                    position: relative !important;
                    margin-bottom: 16px !important;
                }

                .pulse-ring {
                    position: absolute !important;
                    inset: -8px !important;
                    border-radius: 50% !important;
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0) 70%) !important;
                    animation: pulseExpandRing 2s infinite ease-out !important;
                }

                @keyframes pulseExpandRing {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    50% { transform: scale(1.25); opacity: 0.3; }
                    100% { transform: scale(0.9); opacity: 0.8; }
                }

                .icon-circle {
                    width: 72px !important;
                    height: 72px !important;
                    border-radius: 50% !important;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%) !important;
                    border: 2px solid rgba(16, 185, 129, 0.3) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #10B981 !important;
                    position: relative !important;
                    z-index: 1 !important;
                    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3) !important;
                }

                .sparkle-badge {
                    position: absolute !important;
                    top: -2px !important;
                    right: -4px !important;
                    width: 24px !important;
                    height: 24px !important;
                    border-radius: 50% !important;
                    background: #F59E0B !important;
                    color: #FFFFFF !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4) !important;
                    z-index: 2 !important;
                }

                .modal-heading {
                    font-size: 20px !important;
                    font-weight: 800 !important;
                    color: #0F172A !important;
                    margin: 0 0 6px 0 !important;
                    letter-spacing: -0.02em !important;
                }

                body.dark-mode .modal-heading {
                    color: #F8FAFC !important;
                }

                .modal-subheading {
                    font-size: 13px !important;
                    color: #64748B !important;
                    margin: 0 0 18px 0 !important;
                    line-height: 1.45 !important;
                    max-width: 340px !important;
                }

                body.dark-mode .modal-subheading {
                    color: #94A3B8 !important;
                }

                .amount-highlight-card {
                    width: 100% !important;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 134, 255, 0.05) 100%) !important;
                    border: 1.5px solid rgba(16, 185, 129, 0.25) !important;
                    border-radius: 16px !important;
                    padding: 14px 18px !important;
                    margin-bottom: 18px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                }

                body.dark-mode .amount-highlight-card {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(0, 134, 255, 0.08) 100%) !important;
                    border-color: rgba(16, 185, 129, 0.35) !important;
                }

                .amount-label {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.06em !important;
                    color: #059669 !important;
                    margin-bottom: 4px !important;
                }

                body.dark-mode .amount-label {
                    color: #34D399 !important;
                }

                .amount-row {
                    display: flex !important;
                    align-items: baseline !important;
                    gap: 2px !important;
                }

                .plus-sign {
                    font-size: 22px !important;
                    font-weight: 800 !important;
                    color: #10B981 !important;
                }

                .dollar-symbol {
                    font-size: 18px !important;
                    font-weight: 800 !important;
                    color: #10B981 !important;
                    margin-right: 1px !important;
                }

                .amount-val {
                    font-size: 32px !important;
                    font-weight: 900 !important;
                    color: #0F172A !important;
                    letter-spacing: -0.03em !important;
                }

                body.dark-mode .amount-val {
                    color: #FFFFFF !important;
                }

                .currency-tag {
                    font-size: 13px !important;
                    font-weight: 700 !important;
                    color: #10B981 !important;
                    margin-left: 6px !important;
                }

                .details-card {
                    width: 100% !important;
                    background: #F8FAFC !important;
                    border: 1px solid #E2E8F0 !important;
                    border-radius: 14px !important;
                    padding: 12px 14px !important;
                    margin-bottom: 20px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 10px !important;
                }

                body.dark-mode .details-card {
                    background: #111A2E !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                .detail-item {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    font-size: 12px !important;
                }

                .detail-label {
                    color: #64748B !important;
                    font-weight: 500 !important;
                }

                body.dark-mode .detail-label {
                    color: #94A3B8 !important;
                }

                .detail-value {
                    color: #0F172A !important;
                    font-weight: 600 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 5px !important;
                }

                body.dark-mode .detail-value {
                    color: #E2E8F0 !important;
                }

                .val-icon {
                    color: #0086FF !important;
                }

                .status-badge {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding: 2px 9px !important;
                    border-radius: 20px !important;
                    background: rgba(16, 185, 129, 0.12) !important;
                    color: #059669 !important;
                    font-weight: 700 !important;
                    font-size: 11px !important;
                }

                body.dark-mode .status-badge {
                    background: rgba(16, 185, 129, 0.2) !important;
                    color: #34D399 !important;
                }

                .status-dot {
                    width: 6px !important;
                    height: 6px !important;
                    border-radius: 50% !important;
                    background: #10B981 !important;
                    box-shadow: 0 0 6px #10B981 !important;
                }

                .total-row {
                    padding-top: 8px !important;
                    border-top: 1px dashed #CBD5E1 !important;
                }

                body.dark-mode .total-row {
                    border-top-color: rgba(255, 255, 255, 0.1) !important;
                }

                .new-balance-wrap {
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                }

                .wallet-icon {
                    color: #10B981 !important;
                }

                .new-balance-val {
                    font-size: 13px !important;
                    font-weight: 800 !important;
                    color: #10B981 !important;
                }

                .modal-actions {
                    width: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 9px !important;
                }

                .btn-buy-proxies {
                    width: 100% !important;
                    padding: 12px 18px !important;
                    border-radius: 12px !important;
                    border: none !important;
                    background: linear-gradient(135deg, #0086FF 0%, #005AC2 100%) !important;
                    color: #FFFFFF !important;
                    font-size: 13px !important;
                    font-weight: 700 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 8px !important;
                    cursor: pointer !important;
                    box-shadow: 0 4px 14px rgba(0, 134, 255, 0.35) !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                .btn-buy-proxies:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 6px 18px rgba(0, 134, 255, 0.45) !important;
                }

                .btn-done {
                    width: 100% !important;
                    padding: 10px 18px !important;
                    border-radius: 12px !important;
                    border: 1px solid #E2E8F0 !important;
                    background: #FFFFFF !important;
                    color: #64748B !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                }

                .btn-done:hover {
                    background: #F8FAFC !important;
                    color: #0F172A !important;
                }

                body.dark-mode .btn-done {
                    background: transparent !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #94A3B8 !important;
                }

                body.dark-mode .btn-done:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: #F8FAFC !important;
                }
            `}</style>
        </div>
    );
};
