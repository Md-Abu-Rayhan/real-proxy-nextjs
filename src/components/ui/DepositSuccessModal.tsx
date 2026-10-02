"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, DollarSign, Wallet, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';
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
        <AnimatePresence>
            <div className="deposit-modal-backdrop" onClick={onClose}>
                <motion.div
                    className="deposit-modal-card"
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top ambient glow bar */}
                    <div className="glow-banner" />

                    {/* Close Button */}
                    <button onClick={onClose} className="modal-close-btn" aria-label="Close">
                        <X size={18} />
                    </button>

                    <div className="modal-content">
                        {/* Animated Celebration Icon */}
                        <div className="celebration-icon-wrap">
                            <div className="pulse-ring" />
                            <div className="icon-circle">
                                <CheckCircle2 size={44} className="success-icon" />
                            </div>
                            <div className="sparkle-badge">
                                <Sparkles size={14} />
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
                                        router.push('/dashboard/residential-proxies');
                                    }
                                }}
                                className="btn-buy-proxies"
                            >
                                <span>Buy Proxies Now</span>
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
                </motion.div>

                <style jsx>{`
                    .deposit-modal-backdrop {
                        position: fixed;
                        inset: 0;
                        z-index: 10000;
                        background: rgba(10, 15, 29, 0.75);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 16px;
                    }

                    .deposit-modal-card {
                        background: #FFFFFF;
                        border-radius: 24px;
                        width: 100%;
                        max-width: 440px;
                        overflow: hidden;
                        position: relative;
                        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8);
                        animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    :global(body.dark-mode) .deposit-modal-card {
                        background: #0B1120;
                        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    }

                    .glow-banner {
                        height: 5px;
                        width: 100%;
                        background: linear-gradient(90deg, #10B981, #0086FF, #10B981);
                        background-size: 200% 100%;
                        animation: shineGlow 3s linear infinite;
                    }

                    @keyframes shineGlow {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 200% 50%; }
                    }

                    .modal-close-btn {
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        border: none;
                        background: #F1F5F9;
                        color: #64748B;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        z-index: 10;
                    }

                    .modal-close-btn:hover {
                        background: #E2E8F0;
                        color: #0F172A;
                    }

                    :global(body.dark-mode) .modal-close-btn {
                        background: rgba(255, 255, 255, 0.08);
                        color: #94A3B8;
                    }

                    :global(body.dark-mode) .modal-close-btn:hover {
                        background: rgba(255, 255, 255, 0.15);
                        color: #FFFFFF;
                    }

                    .modal-content {
                        padding: 32px 28px 28px 28px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }

                    .celebration-icon-wrap {
                        position: relative;
                        margin-bottom: 20px;
                    }

                    .pulse-ring {
                        position: absolute;
                        inset: -8px;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0) 70%);
                        animation: pulseExpand 2s infinite ease-out;
                    }

                    @keyframes pulseExpand {
                        0% { transform: scale(0.9); opacity: 0.8; }
                        50% { transform: scale(1.25); opacity: 0.3; }
                        100% { transform: scale(0.9); opacity: 0.8; }
                    }

                    .icon-circle {
                        width: 76px;
                        height: 76px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
                        border: 2px solid rgba(16, 185, 129, 0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #10B981;
                        position: relative;
                        z-index: 1;
                        box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
                    }

                    .sparkle-badge {
                        position: absolute;
                        top: -2px;
                        right: -4px;
                        width: 26px;
                        height: 26px;
                        border-radius: 50%;
                        background: #F59E0B;
                        color: #FFFFFF;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4);
                        z-index: 2;
                        animation: bounceSoft 2s infinite ease-in-out;
                    }

                    @keyframes bounceSoft {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-3px); }
                    }

                    .modal-heading {
                        font-size: 22px;
                        font-weight: 800;
                        color: #0F172A;
                        margin: 0 0 6px 0;
                        letter-spacing: -0.02em;
                    }

                    :global(body.dark-mode) .modal-heading {
                        color: #F8FAFC;
                    }

                    .modal-subheading {
                        font-size: 13px;
                        color: #64748B;
                        margin: 0 0 22px 0;
                        line-height: 1.5;
                        max-width: 340px;
                    }

                    :global(body.dark-mode) .modal-subheading {
                        color: #94A3B8;
                    }

                    .amount-highlight-card {
                        width: 100%;
                        background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 134, 255, 0.06) 100%);
                        border: 1.5px solid rgba(16, 185, 129, 0.25);
                        border-radius: 16px;
                        padding: 16px 20px;
                        margin-bottom: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    :global(body.dark-mode) .amount-highlight-card {
                        background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(0, 134, 255, 0.08) 100%);
                        border-color: rgba(16, 185, 129, 0.35);
                    }

                    .amount-label {
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                        color: #059669;
                        margin-bottom: 4px;
                    }

                    :global(body.dark-mode) .amount-label {
                        color: #34D399;
                    }

                    .amount-row {
                        display: flex;
                        align-items: baseline;
                        gap: 2px;
                    }

                    .plus-sign {
                        font-size: 24px;
                        font-weight: 800;
                        color: #10B981;
                    }

                    .dollar-symbol {
                        font-size: 20px;
                        font-weight: 800;
                        color: #10B981;
                        margin-right: 1px;
                    }

                    .amount-val {
                        font-size: 34px;
                        font-weight: 900;
                        color: #0F172A;
                        letter-spacing: -0.03em;
                    }

                    :global(body.dark-mode) .amount-val {
                        color: #FFFFFF;
                    }

                    .currency-tag {
                        font-size: 14px;
                        font-weight: 700;
                        color: #10B981;
                        margin-left: 6px;
                    }

                    .details-card {
                        width: 100%;
                        background: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        border-radius: 14px;
                        padding: 14px 16px;
                        margin-bottom: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    :global(body.dark-mode) .details-card {
                        background: #111A2E;
                        border-color: rgba(255, 255, 255, 0.08);
                    }

                    .detail-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 12px;
                    }

                    .detail-label {
                        color: #64748B;
                        font-weight: 500;
                    }

                    :global(body.dark-mode) .detail-label {
                        color: #94A3B8;
                    }

                    .detail-value {
                        color: #0F172A;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    :global(body.dark-mode) .detail-value {
                        color: #E2E8F0;
                    }

                    .val-icon {
                        color: #0086FF;
                    }

                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 3px 10px;
                        border-radius: 20px;
                        background: rgba(16, 185, 129, 0.12);
                        color: #059669;
                        font-weight: 700;
                        font-size: 11px;
                    }

                    :global(body.dark-mode) .status-badge {
                        background: rgba(16, 185, 129, 0.2);
                        color: #34D399;
                    }

                    .status-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #10B981;
                        box-shadow: 0 0 6px #10B981;
                        animation: blink 1.5s infinite;
                    }

                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                    }

                    .total-row {
                        padding-top: 10px;
                        border-top: 1px dashed #CBD5E1;
                    }

                    :global(body.dark-mode) .total-row {
                        border-top-color: rgba(255, 255, 255, 0.1);
                    }

                    .new-balance-wrap {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }

                    .wallet-icon {
                        color: #10B981;
                    }

                    .new-balance-val {
                        font-size: 14px;
                        font-weight: 800;
                        color: #10B981;
                    }

                    .modal-actions {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .btn-buy-proxies {
                        width: 100%;
                        padding: 13px 20px;
                        border-radius: 12px;
                        border: none;
                        background: linear-gradient(135deg, #0086FF 0%, #005AC2 100%);
                        color: #FFFFFF;
                        font-size: 14px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        cursor: pointer;
                        box-shadow: 0 4px 14px rgba(0, 134, 255, 0.35);
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .btn-buy-proxies:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 6px 18px rgba(0, 134, 255, 0.45);
                    }

                    .btn-buy-proxies:active {
                        transform: translateY(0);
                    }

                    .btn-done {
                        width: 100%;
                        padding: 11px 20px;
                        border-radius: 12px;
                        border: 1px solid #E2E8F0;
                        background: #FFFFFF;
                        color: #64748B;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .btn-done:hover {
                        background: #F8FAFC;
                        color: #0F172A;
                    }

                    :global(body.dark-mode) .btn-done {
                        background: transparent;
                        border-color: rgba(255, 255, 255, 0.12);
                        color: #94A3B8;
                    }

                    :global(body.dark-mode) .btn-done:hover {
                        background: rgba(255, 255, 255, 0.05);
                        color: #F8FAFC;
                    }
                `}</style>
            </div>
        </AnimatePresence>
    );
};
