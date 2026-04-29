"use client";

import React, { useState } from 'react';
import { Minus, Plus, ShoppingCart, Zap, Box, Tag, DollarSign, TrendingDown, Check, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import { API_URL } from '@/lib/config';

const Pricing = () => {
    const router = useRouter();
    const [proxyType, setProxyType] = useState('Rotating Res.');
    const [bandwidth, setBandwidth] = useState(1);
    const searchParams = useSearchParams();
    const isRecharge = searchParams.get('recharge') === 'true';
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [isWalletLoading, setIsWalletLoading] = useState<boolean>(false);

    const getPricing = (gb: number) => {
        let pricePerGb = 1.00; // Fixed at $1.00 per GB
        const total = (gb * pricePerGb).toFixed(2);
        const originalTotal = (gb * 3.10).toFixed(2);
        const discount = Math.round(((3.10 - pricePerGb) / 3.10) * 100);
        const totalBDT = (parseFloat(total) * 125).toFixed(2);
        const pricePerGbBDT = (pricePerGb * 125).toFixed(2);

        return { pricePerGb: pricePerGb.toFixed(2), total, originalTotal, discount, totalBDT, pricePerGbBDT };
    };

    const current = getPricing(bandwidth);

    React.useEffect(() => {
        if (isRecharge) {
            const pricingSection = document.getElementById('pricing-section');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [isRecharge]);

    // Handle Promo Code Application
    const handleApplyPromo = async () => {
        if (!promoCode || promoCode.length < 3) {
            setAppliedDiscount(null);
            return;
        }

        setIsValidatingPromo(true);
        try {
            const token = localStorage.getItem('auth_token');
            const apiUrl = API_URL;
            const currentBDT = (bandwidth * 1.00 * 125);

            const response = await axios.get(`${apiUrl}/api/Payment/validate-promo`, {
                params: {
                    code: promoCode,
                    packageId: bandwidth === 10 ? "res_10gb" : (bandwidth === 50 ? "res_50gb" : (bandwidth === 100 ? "res_100gb" : "custom")),
                    amount: currentBDT
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.discountPercentage) {
                setAppliedDiscount(response.data.discountPercentage);
                toast.success(`Promo applied! ${response.data.discountPercentage}% discount`);
            } else {
                setAppliedDiscount(null);
                toast.error("Invalid promo code");
            }
        } catch (error: any) {
            setAppliedDiscount(null);
            toast.error(error.response?.data?.message || "Invalid promo code");
        } finally {
            setIsValidatingPromo(false);
        }
    };

    // Re-validate promo if bandwidth changes
    React.useEffect(() => {
        if (appliedDiscount && promoCode) {
            const reValidate = async () => {
                const token = localStorage.getItem('auth_token');
                const apiUrl = API_URL;
                const currentBDT = (bandwidth * 1.00 * 125);

                try {
                    const response = await axios.get(`${apiUrl}/api/Payment/validate-promo`, {
                        params: {
                            code: promoCode,
                            packageId: bandwidth === 10 ? "res_10gb" : (bandwidth === 50 ? "res_50gb" : (bandwidth === 100 ? "res_100gb" : "custom")),
                            amount: currentBDT
                        },
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (!(response.data && response.data.discountPercentage)) {
                        setAppliedDiscount(null);
                        toast.error("Promo removed: Bandwidth requirement not met");
                    }
                } catch (error) {
                    setAppliedDiscount(null);
                    toast.error("Promo removed: Bandwidth requirement not met");
                }
            };
            reValidate();
        }
    }, [bandwidth]);

    // Auto-clear discount if code is removed
    React.useEffect(() => {
        if (!promoCode) {
            setAppliedDiscount(null);
        }
    }, [promoCode]);

    const handleBuyNowClick = () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please login to proceed with payment.");
            router.push('/login');
            return;
        }
        // Open modal immediately for instant UX
        setWalletBalance(0);
        setIsWalletLoading(true);
        setShowPaymentModal(true);
        // Fetch wallet balance in background
        axios.get(`${API_URL}/api/affiliate/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const balance = Number(res.data?.affiliateBalance ?? res.data?.AffiliateBalance ?? 0);
            setWalletBalance(balance);
        }).catch(() => {
            setWalletBalance(0);
        }).finally(() => {
            setIsWalletLoading(false);
        });
    };

    const handleCryptoPayment = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please login to proceed with payment.");
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            const orderId = `CR${Date.now()}`.substring(0, 16);
            const amount = parseFloat(current.total);
            const apiUrl = API_URL;
            const response = await axios.post(`${apiUrl}/api/CryptoPayment/initialize`, {
                orderId: orderId,
                amount: amount,
                quoteAssetId: "usd",
                promoCode: promoCode
            }, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                toast.error(response.data.message || "Failed to get crypto payment URL.");
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error("Crypto payment error:", error.response?.data || error.message);
            toast.error("Crypto payment initialization failed.");
            setIsLoading(false);
        }
    };

    const handleFiatPayment = async () => {        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please login to proceed with payment.");
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            let packageId = "custom";
            if (bandwidth === 10) packageId = "res_10gb";
            else if (bandwidth === 50) packageId = "res_50gb";
            else if (bandwidth === 100) packageId = "res_100gb";

            const apiUrl = API_URL;
            const response = await axios.post(`${apiUrl}/api/Payment/initialize-secure`, {
                packageId: packageId,
                amount: Number(current.totalBDT),
                currency: "BDT",
                customerOrderId: `ORD${Math.floor(Date.now() / 1000)}${Math.floor(Math.random() * 100000)}`.substring(0, 16),
                customerName: "John Doe",
                customerEmail: localStorage.getItem('user_email') || "customer@example.com",
                customerPhone: "01700000000",
                customerAddress: "Dhaka, Bangladesh",
                customerCity: "Dhaka",
                customerState: "Dhaka",
                customerPostcode: "1212",
                customerCountry: "BD",
                promoCode: promoCode
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                toast.error("Failed to get payment URL.");
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error("Payment error detail:", error.response?.data);
            toast.error("Payment initialization failed.");
            setIsLoading(false);
        }
    };

    const handleWalletPayment = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please login to proceed with payment.");
            router.push('/login');
            return;
        }

        const totalUsd = parseFloat(current.total);
        if (walletBalance < totalUsd) {
            toast.error(`Insufficient wallet balance. Available: ৳${(walletBalance * 125).toFixed(2)}, Required: ৳${(totalUsd * 125).toFixed(2)}`);
            return;
        }

        setIsLoading(true);
        try {
            const apiUrl = API_URL;
            const response = await axios.post(`${apiUrl}/api/affiliate/wallet-purchase`, {
                bandwidthGb: bandwidth
            }, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (response.data) {
                const newBalance = Math.max(0, walletBalance - totalUsd);
                setWalletBalance(newBalance);
                toast.success(`🎉 Successfully purchased ${bandwidth} GB of proxy bandwidth!`);
                setShowPaymentModal(false);
                router.push('/dashboard/traffic-setup');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Wallet purchase failed.");
            setIsLoading(false);
        }
    };

    const proxyTypes = ['Rotating Res.', 'Static Res.', 'Mobile Proxies', 'Datacenter'];

    return (
        <section id="pricing-section" className="pricing-section">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                
                .pricing-section {
                    background-color: #ffffff;
                    padding: 60px 0;
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                    overflow: hidden;
                }
                .pricing-section::before {
                    content: '';
                    position: absolute;
                    top: -10%;
                    right: -5%;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(0, 134, 255, 0.03) 0%, transparent 70%);
                    z-index: 0;
                }
                .container-pricing {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    position: relative;
                    z-index: 1;
                }
                .pricing-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .pricing-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    background: rgba(0, 134, 255, 0.08);
                    color: #0086FF;
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    letter-spacing: 0.5px;
                }
                .pricing-header h2 {
                    font-size: 42px;
                    font-weight: 800;
                    color: #041026;
                    margin-bottom: 12px;
                    letter-spacing: -1px;
                    line-height: 1.1;
                }
                .pricing-header p {
                    color: #667085;
                    font-size: 17px;
                    max-width: 640px;
                    margin: 0 auto;
                    line-height: 1.5;
                }
                .tabs-outer {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 40px;
                }
                .tabs-container {
                    background: #f8f9fc;
                    padding: 6px;
                    border-radius: 16px;
                    display: inline-flex;
                    gap: 4px;
                    border: 1px solid #eaecf0;
                }
                .tab-btn {
                    padding: 10px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    color: #667085;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .tab-btn.active {
                    background: #ffffff;
                    color: #0086FF;
                    box-shadow: 0 4px 12px rgba(0, 134, 255, 0.1);
                }
                .pricing-main-card {
                    background: #ffffff;
                    border-radius: 28px;
                    padding: 40px;
                    border: 1px solid #f2f4f7;
                    box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.05);
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .bandwidth-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 32px;
                }
                .bandwidth-header h3 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #041026;
                    margin: 0;
                }
                .slider-container {
                    padding: 0 20px;
                    margin-bottom: 40px;
                }
                .custom-range {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 10px;
                    background: transparent;
                    outline: none;
                    cursor: pointer;
                }
                .custom-range::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 10px;
                    background: #f2f4f7;
                    border-radius: 20px;
                }
                .custom-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 28px;
                    width: 28px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 4px solid #0086FF;
                    box-shadow: 0 4px 12px rgba(0, 134, 255, 0.2);
                    margin-top: -9px;
                    transition: all 0.2s;
                }
                .custom-range::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                .range-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 16px;
                    color: #98a2b3;
                    font-size: 13px;
                    font-weight: 700;
                }
                .grid-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .card-stat {
                    background: #fdfdfe;
                    padding: 24px 16px;
                    border-radius: 20px;
                    border: 1px solid #f2f4f7;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .card-stat:hover {
                    border-color: #0086FF;
                    background: #ffffff;
                    transform: translateY(-4px);
                }
                .stat-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #98a2b3;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                    display: block;
                }
                .stat-box-icon {
                    width: 48px;
                    height: 48px;
                    background: #f0f7ff;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 12px;
                    color: #0086FF;
                }
                .stat-main-value {
                    font-size: 26px;
                    font-weight: 800;
                    color: #041026;
                    line-height: 1;
                    margin-bottom: 6px;
                }
                .stat-sub-value {
                    font-size: 14px;
                    color: #0086FF;
                    font-weight: 700;
                }
                .del-price {
                    font-size: 14px;
                    color: #98a2b3;
                    text-decoration: line-through;
                    margin-right: 8px;
                    font-weight: 600;
                }
                .controls-bw {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 12px;
                }
                .btn-ctrl {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    border: 1.5px solid #f2f4f7;
                    background: #ffffff;
                    color: #041026;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-ctrl:hover {
                    background: #0086FF;
                    color: #ffffff;
                    border-color: #0086FF;
                }
                .discounting {
                    background: #00b67a;
                    color: #ffffff;
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 14px;
                    font-weight: 800;
                    display: inline-block;
                }
                .final-cta-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin-top: 50px;
                    width: 100%;
                    text-align: center;
                }
                .btn-buy-premium {
                    background: linear-gradient(135deg, #0086FF 0%, #0066FF 100%);
                    color: #ffffff;
                    padding: 12px 48px;
                    border-radius: 100px;
                    font-size: 16px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    box-shadow: 0 8px 24px rgba(0, 134, 255, 0.25);
                    transition: all 0.3s ease;
                }
                .btn-buy-premium:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 32px rgba(0, 134, 255, 0.35);
                }
                .pay-logos {
                    margin-top: 40px;
                    opacity: 0.9;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }
                .pay-logos-text {
                    font-size: 11px;
                    font-weight: 700;
                    color: #98a2b3;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .logos-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 40px;
                    flex-wrap: wrap;
                }
                .logos-row img {
                    height: 30px;
                    width: auto;
                    filter: none;
                    opacity: 1;
                    transition: all 0.3s ease;
                }
                .logos-row img.binance-logo {
                    height: 22px;
                }
                .logos-row img:hover {
                    transform: scale(1.1);
                }

                .cs-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 40px 30px;
                    text-align: center;
                    border: 1px solid #f2f4f7;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .cs-icon-box {
                    width: 60px;
                    height: 60px;
                    background: #f0f7ff;
                    color: #0086FF;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    position: relative;
                }
                .cs-icon-box::before {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border: 1.5px dashed rgba(0, 134, 255, 0.2);
                    border-radius: 26px;
                    animation: spin-infinite 20s linear infinite;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .modal-bg {
                    background: rgba(4, 16, 38, 0.2);
                    backdrop-filter: blur(8px);
                }
                .payment-modal {
                    width: 100%;
                    max-width: 480px;
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 32px;
                    position: relative;
                }
                .pm-card {
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.15);
                    border: 1px solid #eaecf0;
                }
                .modal-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #f9f9fb;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #667085;
                }
                .modal-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #041026;
                    margin-bottom: 6px;
                }
                .modal-subtitle {
                    color: #667085;
                    font-size: 14px;
                    margin-bottom: 24px;
                }
                .payment-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .pm-btn {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    text-align: left;
                    width: 100%;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .option-icon {
                    width: 44px;
                    height: 44px;
                    background: #f0f7ff;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #0086FF;
                    flex-shrink: 0;
                }
                .option-info h4 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #041026;
                    margin: 0;
                }
                .option-info p {
                    font-size: 12px;
                    color: #667085;
                    margin: 2px 0 0;
                }
                .order-summary {
                    background: #f8f9fc;
                    padding: 16px;
                    border-radius: 16px;
                    border: 1px solid #eaecf0;
                }

                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .spinner-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin-bottom: 32px;
                }
                .spinner-outer, .spinner-inner {
                    position: absolute;
                    border: 4px solid transparent;
                    border-radius: 50%;
                }
                .spinner-outer {
                    width: 80px;
                    height: 80px;
                    border-top-color: #0086FF;
                    animation: spin-anim 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }
                .spinner-inner {
                    width: 50px;
                    height: 50px;
                    top: 15px;
                    left: 15px;
                    border-bottom-color: #0086FF;
                    animation: spin-anim-reverse 1.5s linear infinite;
                }
                @keyframes spin-anim { to { transform: rotate(360deg); } }
                @keyframes spin-anim-reverse { to { transform: rotate(-360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

                /* Modern Promo Code Styles */
                .promo-wrapper {
                    margin-bottom: 32px;
                    width: 100%;
                    max-width: 500px;
                }
                .promo-input-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px;
                    background: #f8f9fc;
                    border: 2px solid #eaecf0;
                    border-radius: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .promo-input-group:focus-within {
                    border-color: #0086FF;
                    background: #ffffff;
                    box-shadow: 0 8px 24px rgba(0, 134, 255, 0.08);
                }
                .promo-input-group.applied {
                    border-color: #00b67a;
                    background: rgba(0, 182, 122, 0.03);
                }
                .promo-icon-box {
                    width: 44px;
                    height: 44px;
                    background: #ffffff;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #0086FF;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
                }
                .promo-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    font-weight: 700;
                    color: #041026;
                    padding: 8px 4px;
                    min-width: 0;
                }
                .promo-input::placeholder {
                    color: #98a2b3;
                    font-weight: 500;
                }
                .promo-btn {
                    padding: 12px 24px;
                    border-radius: 14px;
                    font-size: 14px;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .promo-btn.default {
                    background: #0086FF;
                    color: #ffffff;
                }
                .promo-btn.applied {
                    background: #00b67a;
                    color: #ffffff;
                }
                .promo-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }
                .promo-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                @keyframes pulse-success {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .promo-input-group.applied .promo-icon-box {
                    animation: pulse-success 1s ease-in-out;
                    color: #00b67a;
                }

                @media (max-width: 480px) {
                    .promo-input-group {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 12px;
                        gap: 16px;
                    }
                    .promo-icon-box {
                        display: none;
                    }
                    .promo-input {
                        text-align: center;
                        padding: 4px;
                        font-size: 18px;
                    }
                    .promo-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 14px;
                    }
                }

                @media (max-width: 1024px) {
                    .grid-stats { grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .pricing-header h2 { font-size: 36px; }
                }
                @media (max-width: 768px) {
                    .pricing-section { padding: 40px 0; }
                    .pricing-main-card { padding: 24px 16px; border-radius: 20px; }
                    .bandwidth-header h3 { font-size: 20px; }
                    .range-labels span:not(:first-child):not(:last-child):not(:nth-child(6)) { 
                        display: none; 
                    }
                    .pricing-header h2 { font-size: 28px; }
                    .pricing-header p { font-size: 14px; }
                    .btn-buy-premium { width: 100%; max-width: 320px; padding: 13px 24px; font-size: 15px; }
                    .logos-row { gap: 16px; flex-wrap: wrap; }
                    .logos-row img { height: 24px; }
                    .tabs-container { overflow-x: auto; width: 100%; justify-content: flex-start; padding: 4px; }
                    .tab-btn { padding: 8px 16px; white-space: nowrap; }
                }
                @media (max-width: 480px) {
                    .grid-stats { grid-template-columns: 1fr; }
                    .card-stat { padding: 20px 12px; }
                    .stat-main-value { font-size: 22px; }
                    .bandwidth-header { margin-bottom: 24px; }
                    .slider-container { margin-bottom: 32px; }
                }
            ` }} />

            <div className="container-pricing">
                <div className="pricing-header">
                    <span className="pricing-badge"><Zap size={14} fill="currentColor" /> Simple & Transparent</span>
                    <h2>Choose Your Plan</h2>
                    <p>Unlock the power of reliable residential proxies. Flexible bandwidth designed for businesses of all sizes.</p>
                </div>

                <div className="tabs-outer">
                    <div className="tabs-container">
                        {proxyTypes.map(t => (
                            <button key={t} className={`tab-btn ${proxyType === t ? 'active' : ''}`} onClick={() => setProxyType(t)}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="content-area">
                    <AnimatePresence mode="wait">
                        {proxyType === 'Rotating Res.' ? (
                            <motion.div key="rotating" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}>
                                <div className="pricing-main-card" id="bandwidth-section">
                                    <div className="bandwidth-header">
                                        <ShoppingCart size={28} color="#0086FF" />
                                        <h3>{isRecharge ? "Recharge Account" : "Pick Your Bandwidth"}</h3>
                                    </div>

                                    <div className="slider-container">
                                        <input
                                            type="range" min="1" max="100" step="1" value={bandwidth}
                                            onChange={(e) => setBandwidth(parseFloat(e.target.value))}
                                            className="custom-range"
                                            style={{
                                                background: `linear-gradient(to right, #ebedf0ff 0%, #dee6eeff ${(bandwidth / 100) * 100}%, #f2f4f7 ${(bandwidth / 100) * 100}%, #f2f4f7 100%)`
                                            }}
                                        />
                                        <div className="range-labels">
                                            {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => <span key={v}>{v}GB</span>)}
                                        </div>
                                    </div>

                                    <div className="grid-stats">
                                        <div className="card-stat">
                                            <div className="stat-box-icon"><Box size={24} /></div>
                                            <span className="stat-label">Total Volume</span>
                                            <div className="stat-main-value">{bandwidth} <span style={{ fontSize: '16px', color: '#98a2b3' }}>GB</span></div>
                                            <div className="controls-bw">
                                                <button className="btn-ctrl" onClick={() => setBandwidth(b => Math.max(1, b - 1))}><Minus size={14} /></button>
                                                <button className="btn-ctrl" onClick={() => setBandwidth(b => Math.min(100, b + 1))}><Plus size={14} /></button>
                                            </div>
                                        </div>

                                        <div className="card-stat">
                                            <div className="stat-box-icon"><Tag size={24} /></div>
                                            <span className="stat-label">Price Per GB</span>
                                            <div className="stat-main-value">
                                                <span className="del-price">$3.10</span>
                                                ${current.pricePerGb}
                                            </div>
                                            <div className="stat-sub-value">৳ {current.pricePerGbBDT} BDT</div>
                                        </div>

                                        <div className="card-stat">
                                            <div className="stat-box-icon"><DollarSign size={24} /></div>
                                            <span className="stat-label">Total Amount</span>
                                            <div className="stat-main-value">
                                                <span className="del-price">${current.originalTotal}</span>
                                                {appliedDiscount ? (
                                                    <span style={{ color: '#00b67a' }}>
                                                        ${(parseFloat(current.total) * (1 - appliedDiscount / 100)).toFixed(2)}
                                                    </span>
                                                ) : `$${current.total}`}
                                            </div>
                                            <div className="stat-sub-value" style={{ fontSize: '20px' }}>
                                                ৳ {appliedDiscount ? (parseFloat(current.totalBDT) * (1 - appliedDiscount / 100)).toFixed(2) : current.totalBDT} BDT
                                            </div>
                                        </div>

                                        <div className="card-stat">
                                            <div className="stat-box-icon"><TrendingDown size={24} /></div>
                                            <span className="stat-label">Discount Applied</span>
                                            <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                <span className="discounting">-{current.discount}% OFF</span>
                                                {appliedDiscount && (
                                                    <span className="discounting" style={{ backgroundColor: '#0086FF', fontSize: '12px' }}>
                                                        + {appliedDiscount}% (Promo)
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '13px', color: appliedDiscount ? '#00b67a' : '#667085', fontWeight: '700' }}>
                                                {appliedDiscount ? 'Promo Applied' : 'Member Pricing'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="final-cta-area">
                                        <div className="promo-wrapper">
                                            <div className={`promo-input-group ${appliedDiscount ? 'applied' : ''}`}>
                                                <div className="promo-icon-box">
                                                    <Tag size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Have a promo code?"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                    className="promo-input"
                                                />
                                                <button
                                                    onClick={handleApplyPromo}
                                                    disabled={isValidatingPromo || !promoCode}
                                                    className={`promo-btn ${appliedDiscount ? 'applied' : 'default'}`}
                                                >
                                                    {isValidatingPromo ? 'Validating...' : (appliedDiscount ? (
                                                        <>
                                                            <Check size={16} />
                                                            Applied
                                                        </>
                                                    ) : 'Apply')}
                                                </button>
                                            </div>
                                        </div>

                                        <button onClick={handleBuyNowClick} disabled={isLoading} className="btn-buy-premium">
                                            <ShoppingCart size={20} fill="white" /> {isLoading ? 'Processing...' : 'Buy Now'}
                                        </button>

                                        <div className="pay-logos">
                                            <div className="pay-logos-text">Securely Pay with</div>
                                            <div className="logos-row">
                                                <img src="/binance-pay.png" alt="binance-pay" className="binance-logo" />
                                                <img src="/Bitcoin-Logo.png" alt="bitcoin" />
                                                <img src="/bKash-Logo.png" alt="bkash" />
                                                <img src="/Nagad-Logo.png" alt="nagad" />
                                                <img src="/rocket.png" alt="rocket" />
                                                <img src="/visa.png" alt="visa" />
                                                <img src="/mastercard.png" alt="mastercard" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="coming-soon" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                                <div className="cs-card">
                                    <div className="cs-icon-box">
                                        <Zap size={56} />
                                    </div>
                                    <h3 style={{ fontSize: '36px', fontWeight: '800', color: '#041026', marginBottom: '16px' }}>{proxyType} Available Soon</h3>
                                    <p style={{ fontSize: '18px', color: '#667085', maxWidth: '500px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                                        We are optimizing our {proxyType} pools to deliver industry-leading performance. Get notified when we go live.
                                    </p>
                                    <button onClick={() => setProxyType('Rotating Res.')} style={{ background: '#f2f4f7', color: '#041026', padding: '16px 40px', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                                        Explore Available Plans
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Selection Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="modal-overlay modal-bg" onClick={() => setShowPaymentModal(false)}>
                        <motion.div className="payment-modal pm-card" initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                            </button>

                            <h3 className="modal-title">Select Payment Method</h3>
                            <p className="modal-subtitle">Choose your preferred way to complete the purchase.</p>

                            <div className="payment-options">
                                <button className="pm-btn pm-card" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid #f2f4f7', marginBottom: '16px' }} onClick={handleCryptoPayment} disabled={isLoading}>
                                    <div className="option-icon"><Zap size={24} /></div>
                                    <div className="option-info">
                                        <h4>Cryptocurrency (Binance Pay)</h4>
                                        <p>Fast and anonymous. BTC, ETH, USDT & more.</p>
                                    </div>
                                    <Check size={20} color="#0086FF" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>

                                <button className="pm-btn pm-card" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid #f2f4f7', marginBottom: '16px' }} onClick={handleFiatPayment} disabled={isLoading}>
                                    <div className="option-icon"><ShoppingCart size={24} /></div>
                                    <div className="option-info">
                                        <h4>Bkash, Nagad, Bank Payment</h4>
                                        <p>Secure local payment via bKash, Nagad or Cards.</p>
                                    </div>
                                    <Check size={20} color="#0086FF" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>

                                {isWalletLoading ? (
                                    <button
                                        className="pm-btn pm-card"
                                        style={{
                                            padding: '24px', borderRadius: '24px',
                                            border: '1.5px solid #e4e7ec',
                                            background: '#fafafa',
                                            cursor: 'not-allowed',
                                            opacity: 0.7
                                        }}
                                        disabled
                                    >
                                        <div className="option-icon" style={{ background: '#f2f4f7', color: '#98a2b3' }}>
                                            <Wallet size={24} />
                                        </div>
                                        <div className="option-info">
                                            <h4 style={{ color: '#98a2b3' }}>Purchase with Wallet Balance</h4>
                                            <p style={{ color: '#c0c8d4' }}>Checking balance…</p>
                                        </div>
                                        <div style={{ marginLeft: 'auto', width: 18, height: 18, border: '2.5px solid #d0d5dd', borderTopColor: '#0086FF', borderRadius: '50%', animation: 'spin-anim 0.8s linear infinite' }} />
                                    </button>
                                ) : walletBalance >= parseFloat(current.total) ? (
                                    <button
                                        className="pm-btn pm-card"
                                        style={{
                                            padding: '24px', borderRadius: '24px',
                                            border: '1.5px solid #00b67a',
                                            background: 'rgba(0,182,122,0.03)'
                                        }}
                                        onClick={handleWalletPayment}
                                        disabled={isLoading}
                                    >
                                        <div className="option-icon" style={{ background: 'rgba(0,182,122,0.1)', color: '#00b67a' }}>
                                            <Wallet size={24} />
                                        </div>
                                        <div className="option-info">
                                            <h4 style={{ color: '#00b67a' }}>Purchase with Wallet Balance</h4>
                                            <p>Available: <strong style={{ color: '#00b67a' }}>৳{(walletBalance * 125).toFixed(2)}</strong> — instant, no redirect needed.</p>
                                        </div>
                                        <Check size={20} color="#00b67a" style={{ marginLeft: 'auto', opacity: 0.7 }} />
                                    </button>
                                ) : null}
                            </div>

                            <div className="order-summary" style={{ marginTop: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '14px', color: '#98a2b3', fontWeight: '1000' }}>Package</span>
                                    <span style={{ fontSize: '14px', color: '#041026', fontWeight: '700' }}>{bandwidth} GB Residential</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: walletBalance > 0 ? '8px' : '0' }}>
                                    <span style={{ fontSize: '14px', color: '#98a2b3', fontWeight: '1000' }}>Total Price</span>
                                    <span style={{ fontSize: '18px', color: '#0086FF', fontWeight: '800' }}>
                                        ৳ {appliedDiscount ? (parseFloat(current.totalBDT) * (1 - appliedDiscount / 100)).toFixed(2) : current.totalBDT}
                                    </span>
                                </div>
                                {(walletBalance > 0 || isWalletLoading) && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '14px', color: '#98a2b3', fontWeight: '1000' }}>Wallet Balance</span>
                                        {isWalletLoading ? (
                                            <span style={{ width: 80, height: 16, background: '#e4e7ec', borderRadius: 6, display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
                                        ) : (
                                            <span style={{ fontSize: '14px', color: walletBalance >= parseFloat(current.total) ? '#00b67a' : '#ef4444', fontWeight: '700' }}>
                                                ৳{(walletBalance * 125).toFixed(2)} {walletBalance >= parseFloat(current.total) ? '✓ Sufficient' : '✗ Insufficient'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Redirection Loader */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div className="loading-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)' }}>
                        <div className="spinner-container">
                            <div className="spinner-outer"></div>
                            <div className="spinner-inner"></div>
                        </div>
                        <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#041026', marginBottom: '8px' }}>Processing Securely</h4>
                        <p style={{ color: '#667085' }}>Preparing your payment gateway link...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Pricing;
