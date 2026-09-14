"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Shield, Check, AlertCircle, ArrowRight, Wallet, Tag, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '@/lib/config';
import { useWallet } from '@/context/WalletContext';
import { useRouter } from 'next/navigation';

interface OneClickBuyModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialProxyType?: 'Residential' | 'Premium Residential';
    initialBandwidthGb?: number;
    onSuccess?: () => void;
}

export const OneClickBuyModal: React.FC<OneClickBuyModalProps> = ({
    isOpen,
    onClose,
    initialProxyType = 'Residential',
    initialBandwidthGb = 1,
    onSuccess
}) => {
    const router = useRouter();
    const { balanceUsd, balanceBdt, exchangeRateBdt, refreshWallet, openTopUpModal } = useWallet();

    const [proxyType, setProxyType] = useState<'Residential' | 'Premium Residential'>(initialProxyType);
    const [bandwidth, setBandwidth] = useState<number>(initialBandwidthGb);
    const [promoCode, setPromoCode] = useState<string>('');
    const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number | null>(null);
    const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setProxyType(initialProxyType);
            setBandwidth(initialBandwidthGb);
            setPromoCode('');
            setAppliedDiscountPercent(null);
            setPurchaseSuccess(false);
            setSuccessMessage('');
        }
    }, [isOpen, initialProxyType, initialBandwidthGb]);

    const pricePerGb = proxyType === 'Premium Residential' ? 1.50 : 1.00;
    const baseTotalUsd = bandwidth * pricePerGb;
    const discountAmountUsd = appliedDiscountPercent ? (baseTotalUsd * appliedDiscountPercent) / 100 : 0;
    const finalTotalUsd = Math.max(0.01, baseTotalUsd - discountAmountUsd);
    const finalTotalBdt = finalTotalUsd * (exchangeRateBdt || 125);
    const hasSufficientBalance = balanceUsd >= finalTotalUsd;
    const balanceAfterUsd = balanceUsd - finalTotalUsd;

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setIsValidatingPromo(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${API_URL}/api/Payment/validate-promo`, {
                params: {
                    code: promoCode.trim(),
                    amount: baseTotalUsd * (exchangeRateBdt || 125)
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.discountPercentage) {
                setAppliedDiscountPercent(res.data.discountPercentage);
                toast.success(`🎉 Promo code applied! ${res.data.discountPercentage}% Discount`);
            } else {
                setAppliedDiscountPercent(null);
                toast.error("Invalid promo code");
            }
        } catch (error: any) {
            setAppliedDiscountPercent(null);
            toast.error(error.response?.data?.message || "Invalid or expired promo code");
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handlePurchase = async () => {
        if (!hasSufficientBalance) {
            onClose();
            openTopUpModal();
            return;
        }

        setIsPurchasing(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.post(`${API_URL}/api/Wallet/buy-proxy`, {
                proxyType,
                bandwidthGb: bandwidth,
                promoCode: appliedDiscountPercent ? promoCode.trim() : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                setPurchaseSuccess(true);
                setSuccessMessage(res.data.message || `Successfully activated ${bandwidth} GB proxy bandwidth!`);
                await refreshWallet();
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.data?.message || "Purchase failed.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Purchase failed. Please try again.");
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title-wrap">
                        <div className="modal-icon-badge">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="modal-title">1-Click Proxy Purchase</h3>
                            <p className="modal-subtitle">Instant proxy allocation from your wallet balance</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                {purchaseSuccess ? (
                    <div className="success-body">
                        <div className="success-icon-wrap">
                            <Check size={36} color="#10B981" />
                        </div>
                        <h4 className="success-heading">Purchase Successful!</h4>
                        <p className="success-msg">{successMessage}</p>
                        <div className="summary-box">
                            <div className="summary-row">
                                <span>Plan:</span>
                                <strong>{proxyType}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Bandwidth:</span>
                                <strong>{bandwidth} GB</strong>
                            </div>
                            <div className="summary-row border-top">
                                <span>Remaining Balance:</span>
                                <strong className="green-text">${balanceUsd.toFixed(2)} USD</strong>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                router.push(proxyType === 'Premium Residential' ? '/dashboard/premium-residential-proxies' : '/dashboard/residential-proxies');
                            }}
                            className="primary-action-btn"
                        >
                            Go to Proxy Dashboard ➔
                        </button>
                    </div>
                ) : (
                    <div className="modal-body">
                        {/* Proxy Type */}
                        <div className="form-section">
                            <label className="section-label">Proxy Type</label>
                            <div className="proxy-types-grid">
                                <button
                                    type="button"
                                    onClick={() => setProxyType('Residential')}
                                    className={`proxy-type-card ${proxyType === 'Residential' ? 'active-type' : ''}`}
                                >
                                    <span className="type-title">Residential (Evomi)</span>
                                    <span className="type-price">$1.00 / GB</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProxyType('Premium Residential')}
                                    className={`proxy-type-card ${proxyType === 'Premium Residential' ? 'active-type' : ''}`}
                                >
                                    <span className="type-title">Premium (Geonode)</span>
                                    <span className="type-price gold-price">$1.50 / GB</span>
                                </button>
                            </div>
                        </div>

                        {/* Bandwidth Selector */}
                        <div className="form-section">
                            <div className="label-flex">
                                <label className="section-label">Bandwidth Package</label>
                                <span className="selected-badge">{bandwidth} GB</span>
                            </div>
                            <div className="bandwidth-pills">
                                {[1, 2, 5, 10, 25, 50, 100].map((gb) => (
                                    <button
                                        key={gb}
                                        type="button"
                                        onClick={() => setBandwidth(gb)}
                                        className={`gb-pill ${bandwidth === gb ? 'active-gb' : ''}`}
                                    >
                                        {gb} GB
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Promo Code */}
                        <div className="form-section">
                            <label className="section-label">Promo Code</label>
                            <div className="promo-input-row">
                                <div className="input-rel-box">
                                    <input
                                        type="text"
                                        placeholder="ENTER PROMO CODE"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        className="promo-input"
                                    />
                                    {appliedDiscountPercent && (
                                        <span className="promo-badge">
                                            -{appliedDiscountPercent}%
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleApplyPromo}
                                    disabled={isValidatingPromo || !promoCode.trim()}
                                    className="apply-btn"
                                >
                                    {isValidatingPromo ? <Loader2 size={14} className="spinner" /> : <Tag size={14} />}
                                    <span>Apply</span>
                                </button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="order-summary-card">
                            <div className="sum-row">
                                <span>Subtotal:</span>
                                <span>${baseTotalUsd.toFixed(2)} USD</span>
                            </div>
                            {appliedDiscountPercent && (
                                <div className="sum-row discount-row">
                                    <span>Discount ({appliedDiscountPercent}%):</span>
                                    <span>-${discountAmountUsd.toFixed(2)} USD</span>
                                </div>
                            )}
                            <div className="sum-row total-row">
                                <span>Total to Pay:</span>
                                <span className="blue-total">
                                    ${finalTotalUsd.toFixed(2)} USD <span className="bdt-sub">(৳{finalTotalBdt.toFixed(2)} BDT)</span>
                                </span>
                            </div>
                            <div className="sum-row wallet-row">
                                <span className="flex-center-gap">
                                    <Wallet size={14} color="#0086FF" /> Available Wallet Balance:
                                </span>
                                <span className={hasSufficientBalance ? 'green-text' : 'red-text'}>
                                    ${balanceUsd.toFixed(2)} USD
                                </span>
                            </div>
                            {hasSufficientBalance && (
                                <div className="sum-row sub-muted">
                                    <span>Balance after purchase:</span>
                                    <span>${balanceAfterUsd.toFixed(2)} USD</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {hasSufficientBalance ? (
                            <button
                                type="button"
                                onClick={handlePurchase}
                                disabled={isPurchasing}
                                className="primary-action-btn"
                            >
                                {isPurchasing ? (
                                    <>
                                        <Loader2 size={18} className="spinner" />
                                        <span>Allocating Proxy Traffic...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        <span>⚡ Confirm & Buy Instantly (${finalTotalUsd.toFixed(2)})</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="insufficient-wrap">
                                <div className="insufficient-alert">
                                    <AlertCircle size={16} color="#F59E0B" />
                                    <span>You need ${(finalTotalUsd - balanceUsd).toFixed(2)} USD more in your wallet.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        router.push('/dashboard/wallet');
                                    }}
                                    className="topup-redirect-btn"
                                >
                                    <Wallet size={18} />
                                    <span>💳 Top Up Wallet to Buy</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }

                .modal-card {
                    background-color: #FFFFFF;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 480px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    border: 1px solid #E2E8F0;
                    animation: popIn 0.2s ease-out;
                }

                @keyframes popIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .modal-header {
                    padding: 18px 22px;
                    background-color: #F8FAFC;
                    border-bottom: 1px solid #E2E8F0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .modal-title-wrap {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .modal-icon-badge {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background-color: rgba(0, 134, 255, 0.1);
                    color: #0086FF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--navy, #163561);
                    margin: 0;
                }

                .modal-subtitle {
                    font-size: 11px;
                    color: #64748B;
                    margin: 2px 0 0 0;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: #64748B;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                }

                .modal-body {
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .section-label {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #475569;
                }

                .proxy-types-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .proxy-type-card {
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid #CBD5E1;
                    background-color: #F8FAFC;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .active-type {
                    border-color: #0086FF;
                    background-color: rgba(0, 134, 255, 0.08);
                }

                .type-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--navy, #163561);
                }

                .type-price {
                    font-size: 12px;
                    font-weight: 700;
                    color: #0086FF;
                    margin-top: 4px;
                }

                .gold-price {
                    color: #D97706;
                }

                .label-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .selected-badge {
                    font-size: 12px;
                    font-weight: 700;
                    color: #0086FF;
                    background-color: rgba(0, 134, 255, 0.1);
                    padding: 2px 8px;
                    border-radius: 6px;
                }

                .bandwidth-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .gb-pill {
                    padding: 8px 14px;
                    border-radius: 10px;
                    border: 1px solid #CBD5E1;
                    background-color: #F8FAFC;
                    font-size: 12px;
                    font-weight: 700;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .active-gb {
                    background-color: #0086FF;
                    color: #FFFFFF;
                    border-color: #0086FF;
                }

                .promo-input-row {
                    display: flex;
                    gap: 8px;
                }

                .input-rel-box {
                    position: relative;
                    flex: 1;
                }

                .promo-input {
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid #CBD5E1;
                    background-color: #F8FAFC;
                    font-size: 13px;
                    font-weight: 700;
                    outline: none;
                    text-transform: uppercase;
                }

                .promo-badge {
                    position: absolute;
                    right: 8px;
                    top: 8px;
                    background-color: #DCFCE7;
                    color: #15803D;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .apply-btn {
                    padding: 10px 16px;
                    border-radius: 10px;
                    background-color: #0F172A;
                    color: #FFFFFF;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: none;
                    cursor: pointer;
                }

                .order-summary-card {
                    padding: 14px 16px;
                    border-radius: 14px;
                    background-color: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    font-size: 13px;
                }

                .sum-row {
                    display: flex;
                    justify-content: space-between;
                    color: #64748B;
                }

                .discount-row {
                    color: #16A34A;
                    font-weight: 600;
                }

                .total-row {
                    border-top: 1px solid #E2E8F0;
                    padding-top: 8px;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--navy, #163561);
                }

                .blue-total {
                    color: #0086FF;
                }

                .bdt-sub {
                    font-size: 11px;
                    color: #64748B;
                    font-weight: 400;
                }

                .wallet-row {
                    border-top: 1px dashed #CBD5E1;
                    padding-top: 8px;
                    font-size: 12px;
                }

                .flex-center-gap {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .sub-muted {
                    font-size: 11px;
                }

                .green-text { color: #16A34A; font-weight: 700; }
                .red-text { color: #DC2626; font-weight: 700; }

                .primary-action-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #0086FF 0%, #0056b3 100%);
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(0, 134, 255, 0.3);
                }

                .insufficient-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .insufficient-alert {
                    padding: 10px 12px;
                    background-color: #FEF3C7;
                    border: 1px solid #FDE68A;
                    border-radius: 10px;
                    font-size: 12px;
                    color: #B45309;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .topup-redirect-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    cursor: pointer;
                }

                .success-body {
                    padding: 32px 24px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 14px;
                }

                .success-icon-wrap {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background-color: #DCFCE7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .success-heading {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--navy, #163561);
                    margin: 0;
                }

                .success-msg {
                    font-size: 13px;
                    color: #64748B;
                    margin: 0;
                }

                .summary-box {
                    width: 100%;
                    background-color: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    font-size: 13px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    color: #64748B;
                }

                .border-top {
                    border-top: 1px solid #E2E8F0;
                    padding-top: 6px;
                    margin-top: 2px;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
