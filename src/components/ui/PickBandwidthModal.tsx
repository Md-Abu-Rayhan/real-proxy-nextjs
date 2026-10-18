"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    ShoppingCart,
    Globe,
    Crown,
    Minus,
    Plus,
    Tag,
    Wallet,
    RefreshCw,
    Zap,
    ArrowRight,
    X
} from 'lucide-react';
import { API_URL } from '@/lib/config';
import { useWallet } from '@/context/WalletContext';

export const triggerPickBandwidthModal = (defaultType?: 'Residential' | 'Premium Residential', defaultGb?: number) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-pick-bandwidth-modal', {
            detail: { type: defaultType, gb: defaultGb }
        }));
    }
};

export const PickBandwidthModal: React.FC = () => {
    const router = useRouter();
    const { balanceUsd, balanceBdt, exchangeRateBdt, refreshWallet, isLoading: isWalletLoading } = useWallet();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [modalProxyType, setModalProxyType] = useState<'Residential' | 'Premium Residential'>('Residential');
    const [selectedBandwidth, setSelectedBandwidth] = useState<number>(5);
    const [promoCode, setPromoCode] = useState<string>('');
    const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
    const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

    useEffect(() => {
        const handleOpen = (e: Event) => {
            const customEvent = e as CustomEvent<{ type?: 'Residential' | 'Premium Residential'; gb?: number }>;
            if (customEvent.detail?.type) {
                setModalProxyType(customEvent.detail.type);
            }
            if (customEvent.detail?.gb) {
                setSelectedBandwidth(customEvent.detail.gb);
            }
            setPromoCode('');
            setAppliedDiscount(null);
            setIsOpen(true);
        };

        window.addEventListener('open-pick-bandwidth-modal', handleOpen);
        return () => window.removeEventListener('open-pick-bandwidth-modal', handleOpen);
    }, []);

    // Price Calculations
    const rate = exchangeRateBdt > 0 ? exchangeRateBdt : 125;
    const pricePerGb = modalProxyType === 'Premium Residential' ? 1.50 : 1.00;
    const baseTotalUsd = selectedBandwidth * pricePerGb;
    const discountAmountUsd = appliedDiscount ? (baseTotalUsd * appliedDiscount) / 100 : 0;
    const finalTotalUsd = Math.max(0.01, baseTotalUsd - discountAmountUsd);
    const finalTotalBdt = Math.round(finalTotalUsd * rate);

    const hasSufficientBalance = !isWalletLoading && balanceUsd >= finalTotalUsd;
    const balanceShortage = Math.max(0, finalTotalUsd - balanceUsd);

    // Promo Validation
    const handleValidatePromo = async () => {
        if (!promoCode || promoCode.trim().length < 3) return;
        setIsValidatingPromo(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const pkgId = modalProxyType === 'Premium Residential'
                ? (selectedBandwidth === 10 ? "static_10gb" : (selectedBandwidth === 50 ? "static_50gb" : (selectedBandwidth === 100 ? "static_100gb" : "static_custom")))
                : (selectedBandwidth === 10 ? "res_10gb" : (selectedBandwidth === 50 ? "res_50gb" : (selectedBandwidth === 100 ? "res_100gb" : "custom")));

            const res = await axios.get(`${API_URL}/api/Payment/validate-promo`, {
                params: {
                    code: promoCode.trim().toUpperCase(),
                    packageId: pkgId,
                    amount: finalTotalBdt
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data?.discountPercentage) {
                setAppliedDiscount(res.data.discountPercentage);
                toast.success(`Promo applied: ${res.data.discountPercentage}% OFF`);
            } else {
                setAppliedDiscount(null);
                toast.error("Invalid or expired promo code");
            }
        } catch {
            setAppliedDiscount(null);
            toast.error("Promo code not found");
        } finally {
            setIsValidatingPromo(false);
        }
    };

    // Confirm Wallet Purchase
    const handleConfirmPurchase = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
            router.push('/login');
            return;
        }

        if (balanceUsd < finalTotalUsd) {
            toast.error(`Insufficient balance. Please add $${balanceShortage.toFixed(2)} USD.`);
            return;
        }

        setIsPurchasing(true);
        try {
            const res = await axios.post(`${API_URL}/api/Wallet/buy-proxy`, {
                proxyType: modalProxyType,
                bandwidthGb: selectedBandwidth,
                promoCode: appliedDiscount && promoCode ? promoCode.trim() : null
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data?.success) {
                toast.success(`🎉 ${selectedBandwidth} GB ${modalProxyType} activated!`);
                setIsOpen(false);
                refreshWallet(true);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('bandwidth-purchased', {
                        detail: {
                            proxyType: modalProxyType,
                            bandwidthGb: selectedBandwidth
                        }
                    }));
                }
            } else {
                toast.error(res.data?.message || "Purchase failed.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to complete purchase.");
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-head">
                    <div className="modal-title-box">
                        <div className="modal-icon">
                            <ShoppingCart size={19} />
                        </div>
                        <div>
                            <h3 className="modal-heading">Pick Your Bandwidth</h3>
                            <p className="modal-desc">Select bandwidth volume. Paid instantly with your wallet balance.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="modal-close"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Modal Content */}
                <div className="modal-scroll-body custom-scrollbar">

                    {/* Plan Switcher */}
                    <div className="plan-switch">
                        <button
                            type="button"
                            onClick={() => {
                                setModalProxyType('Residential');
                                setAppliedDiscount(null);
                            }}
                            className={`switch-tab ${modalProxyType === 'Residential' ? 'switch-active res' : ''}`}
                        >
                            <Globe size={15} />
                            <span>Residential ($1.00/GB)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setModalProxyType('Premium Residential');
                                setAppliedDiscount(null);
                            }}
                            className={`switch-tab ${modalProxyType === 'Premium Residential' ? 'switch-active prem' : ''}`}
                        >
                            <Crown size={15} />
                            <span>Premium ($1.50/GB)</span>
                        </button>
                    </div>

                    {/* Volume Presets */}
                    <div className="section-block">
                        <div className="block-label-row">
                            <span className="block-label">Select Bandwidth Volume</span>
                            <span className="savings-badge">Market Discount Applied</span>
                        </div>
                        <div className="presets-grid">
                            {[1, 5, 10, 25, 50, 100].map((gb) => {
                                const isSelected = selectedBandwidth === gb;
                                const cost = (gb * pricePerGb).toFixed(2);
                                return (
                                    <button
                                        key={gb}
                                        type="button"
                                        onClick={() => setSelectedBandwidth(gb)}
                                        className={`preset-box ${isSelected ? (modalProxyType === 'Premium Residential' ? 'preset-gold' : 'preset-blue') : ''}`}
                                    >
                                        <span className="gb-number">{gb} GB</span>
                                        <span className="gb-price">${cost}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Slider / Stepper */}
                    <div className="slider-box">
                        <div className="slider-header">
                            <span className="slider-current-lbl">Custom Volume:</span>
                            <div className="stepper-controls">
                                <button
                                    type="button"
                                    onClick={() => setSelectedBandwidth(prev => Math.max(1, prev - 1))}
                                    className="btn-step"
                                    disabled={selectedBandwidth <= 1}
                                >
                                    <Minus size={13} />
                                </button>
                                <span className="slider-current-val">{selectedBandwidth} GB</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedBandwidth(prev => Math.min(100, prev + 1))}
                                    className="btn-step"
                                    disabled={selectedBandwidth >= 100}
                                >
                                    <Plus size={13} />
                                </button>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={selectedBandwidth}
                            onChange={(e) => setSelectedBandwidth(Number(e.target.value))}
                            className="clean-slider"
                            style={{
                                background: `linear-gradient(to right, #0086FF 0%, #0086FF ${(selectedBandwidth / 100) * 100}%, #E2E8F0 ${(selectedBandwidth / 100) * 100}%, #E2E8F0 100%)`
                            }}
                        />
                    </div>

                    {/* Cost Summary Box */}
                    <div className="cost-summary">
                        <div className="cost-row">
                            <span className="cost-lbl">Price Per GB</span>
                            <span className="cost-val">${pricePerGb.toFixed(2)} USD</span>
                        </div>
                        <div className="cost-row">
                            <span className="cost-lbl">Total in BDT</span>
                            <span className="cost-val">৳{finalTotalBdt.toLocaleString()} BDT</span>
                        </div>
                        <div className="cost-divider"></div>
                        <div className="cost-row total-highlight">
                            <span className="cost-lbl">Total to Pay</span>
                            <span className="cost-total-amount">
                                ${finalTotalUsd.toFixed(2)} <span className="usd-text">USD</span>
                            </span>
                        </div>
                    </div>

                    {/* Promo Code Input */}
                    <div className="promo-row">
                        <div className="promo-input-box">
                            <Tag size={15} className="promo-tag-icon" />
                            <input
                                type="text"
                                placeholder="PROMO CODE"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="promo-field"
                            />
                            <button
                                type="button"
                                onClick={handleValidatePromo}
                                disabled={isValidatingPromo || !promoCode}
                                className="btn-promo-apply"
                            >
                                {isValidatingPromo ? "..." : appliedDiscount ? "Applied ✓" : "Apply"}
                            </button>
                        </div>
                        {appliedDiscount && (
                            <span className="discount-note">
                                ✓ {appliedDiscount}% discount activated
                            </span>
                        )}
                    </div>

                    {/* Wallet Status Banner */}
                    <div className={`wallet-status-bar ${hasSufficientBalance ? 'status-ok' : 'status-low'}`}>
                        <div className="wallet-status-left">
                            <Wallet size={18} />
                            <div>
                                <span className="status-label">Your Wallet Balance</span>
                                <span className="status-val">${balanceUsd.toFixed(2)} USD (৳{balanceBdt.toLocaleString()} BDT)</span>
                            </div>
                        </div>
                        <div className="wallet-status-right">
                            {hasSufficientBalance ? (
                                <span className="pill-ok">✓ Sufficient</span>
                            ) : (
                                <span className="pill-short">Need +${balanceShortage.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    {/* Purchase Button */}
                    <div className="modal-cta-row">
                        {hasSufficientBalance ? (
                            <button
                                type="button"
                                onClick={handleConfirmPurchase}
                                disabled={isPurchasing}
                                className={`btn-confirm-pay ${modalProxyType === 'Premium Residential' ? 'pay-gold' : 'pay-blue'}`}
                            >
                                {isPurchasing ? (
                                    <>
                                        <RefreshCw size={16} className="spin-icon" />
                                        <span>Activating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={16} />
                                        <span>Pay ${finalTotalUsd.toFixed(2)} from Wallet</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <Link href="/dashboard/wallet" className="btn-topup-wallet-link">
                                <Wallet size={16} />
                                <span>Top Up Wallet Now (+ Add ${balanceShortage.toFixed(2)})</span>
                                <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
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

                /* Dark mode support */
                :global(body.dark-mode) .modal-container {
                    background: linear-gradient(180deg, #111827 0%, #0D1322 100%) !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
                }
                :global(body.dark-mode) .modal-head {
                    background: #111827 !important;
                    border-bottom-color: rgba(255, 255, 255, 0.08) !important;
                }
                :global(body.dark-mode) .modal-heading {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .modal-desc,
                :global(body.dark-mode) .block-label,
                :global(body.dark-mode) .slider-current-lbl,
                :global(body.dark-mode) .cost-lbl,
                :global(body.dark-mode) .status-label {
                    color: #94A3B8 !important;
                }
                :global(body.dark-mode) .modal-close {
                    background: linear-gradient(180deg, #1E293B 0%, #141C2E 100%) !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #F1F5F9 !important;
                }
                :global(body.dark-mode) .modal-close:hover {
                    background: linear-gradient(180deg, #2D3A52 0%, #1E293B 100%) !important;
                    color: #FFFFFF !important;
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
                :global(body.dark-mode) .slider-box,
                :global(body.dark-mode) .cost-summary,
                :global(body.dark-mode) .promo-input-box {
                    background: #080D1A !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    color: #CBD5E1 !important;
                }
                :global(body.dark-mode) .cost-val {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .cost-divider {
                    background: rgba(255, 255, 255, 0.08) !important;
                }
                :global(body.dark-mode) .promo-field {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .status-val {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .total-highlight .cost-lbl {
                    color: #F8FAFC !important;
                }
                :global(body.dark-mode) .btn-step {
                    background: linear-gradient(180deg, #1E293B 0%, #141C2E 100%) !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #F1F5F9 !important;
                }
                :global(body.dark-mode) .slider-current-val {
                    color: #F8FAFC !important;
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
                    .wallet-status-bar {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            `}</style>
        </div>
    );
};
