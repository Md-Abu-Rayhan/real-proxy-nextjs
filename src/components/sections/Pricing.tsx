"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const Pricing = () => {
    const router = useRouter();
    const [proxyType, setProxyType] = useState('Rotating Res.');
    const [bandwidth, setBandwidth] = useState(0.1);
    const [isLoading, setIsLoading] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(122); // Default fallback rate
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const getPricing = (gb: number) => {
        let pricePerGb = 1.00;
        if (gb >= 1000) pricePerGb = 0.50;
        else if (gb >= 500) pricePerGb = 0.60;
        else if (gb >= 250) pricePerGb = 0.65;
        else if (gb >= 100) pricePerGb = 0.70;
        else if (gb >= 50) pricePerGb = 0.80;
        else if (gb >= 25) pricePerGb = 0.85;
        else if (gb >= 10) pricePerGb = 0.90;
        else if (gb >= 5) pricePerGb = 0.95;

        // Use toFixed(2) to ensure small amounts (like $0.10) are shown correctly
        const total = (gb * pricePerGb).toFixed(2);
        const originalTotal = (gb * 1.50).toFixed(2); // Reduced base for more realistic discount
        const discount = Math.round(((1.50 - pricePerGb) / 1.50) * 100);

        // BDT conversion
        const totalBDT = (parseFloat(total) * exchangeRate).toFixed(2);
        const pricePerGbBDT = (pricePerGb * exchangeRate).toFixed(2);

        return { pricePerGb: pricePerGb.toFixed(2), total, originalTotal, discount, totalBDT, pricePerGbBDT };
    };

    const current = getPricing(bandwidth);

    React.useEffect(() => {
        const fetchRate = async () => {
            try {
                // Using a free public API
                const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                if (res.data && res.data.rates && res.data.rates.BDT) {
                    setExchangeRate(res.data.rates.BDT);
                    console.log(`Live Exchange Rate: 1 USD = ${res.data.rates.BDT} BDT`);
                }
            } catch (error) {
                console.error("Failed to fetch exchange rate, using fallback:", error);
            }
        };
        fetchRate();
    }, []);

    const handleBuyNowClick = () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please login to proceed with payment.");
            router.push('/login');
            return;
        }
        setShowPaymentModal(true);
    };

    const handleCryptoPayment = async () => {
        setIsLoading(true);
        let redirectToPayment = false;
        try {
            const orderId = `CR${Date.now()}`.substring(0, 16);
            const amount = parseFloat(current.total);

            // POST to initialize crypto payment
            const response = await axios.post('https://api.realproxy.net/api/CryptoPayment/initialize', {
                orderId: orderId,
                amount: amount,
                quoteAssetId: "b91e18ff-a9ae-3dc7-8679-e935d9a4b34b"
            }, {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.paymentUrl) {
                redirectToPayment = true;
                toast.success("Redirecting to Crypto payment...");
                window.location.href = response.data.paymentUrl;
            } else {
                toast.error(response.data.message || "Failed to get crypto payment URL.");
            }
        } catch (error: any) {
            console.error("Crypto payment error:", error.response?.data || error.message);
            toast.error("Crypto payment initialization failed.");
        } finally {
            if (!redirectToPayment) {
                setIsLoading(false);
                setShowPaymentModal(false);
            } else {
                // Keep loading true, but hide modal
                setShowPaymentModal(false);
            }
        }
    };

    const handleFiatPayment = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please login to proceed with payment.");
            router.push('/login');
            return;
        }

        setIsLoading(true);
        let redirectToPayment = false;
        try {
            // Map bandwidth/type to a package ID or use "custom"
            let packageId = "custom";
            if (bandwidth === 10) packageId = "res_10gb";
            else if (bandwidth === 50) packageId = "res_50gb";
            else if (bandwidth === 100) packageId = "res_100gb";

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.realproxy.net';
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
                customerCountry: "BD"
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.redirectUrl) {
                redirectToPayment = true;
                toast.success("Redirecting to payment gateway...");
                window.location.href = response.data.redirectUrl;
            } else {
                toast.error("Failed to get payment URL. Server responded with success but no URL.");
            }
        } catch (error: any) {
            console.error("Payment error detail:", error.response?.data);
            const message = error.response?.data?.message || error.message || "Payment initialization failed.";
            toast.error(`System Error: ${message}. Detail: ${typeof error.response?.data === 'string' ? error.response.data : ''}`);
        } finally {
            if (!redirectToPayment) {
                setIsLoading(false);
                setShowPaymentModal(false);
            } else {
                setShowPaymentModal(false);
            }
        }
    };

    const proxyTypes = ['Rotating Res.', 'Static Res.', 'Mobile Proxies', 'Datacenter'];


    return (
        <section id="pricing-section" className="pricing-section">
            <div className="container">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .pricing-section {
                        background: linear-gradient(180deg, #E8F4FF 0%, #F5FAFF 100%);
                        padding: 80px 0;
                        font-family: 'Outfit', sans-serif;
                        text-align: center;
                    }
                    .pricing-header h2 {
                        font-size: 48px;
                        font-weight: 700;
                        color: #323232;
                        margin-bottom: 12px;
                    }
                    .pricing-header p {
                        color: #666;
                        font-size: 16px;
                        margin-bottom: 40px;
                    }
                    .tabs-outer { display: flex; justify-content: center; margin-bottom: 40px; }
                    .tabs-container {
                        background: #fff;
                        padding: 6px;
                        border-radius: 50px;
                        display: flex;
                        gap: 5px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    }
                    .tab-btn {
                        padding: 12px 40px;
                        border-radius: 50px;
                        font-weight: 700;
                        font-size: 15px;
                        color: #666;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .tab-btn.active {
                        background: #0086FF;
                        color: #fff;
                    }
                    .white-card {
                        background: #fff;
                        border-radius: 0;
                        padding: 40px;
                        border: 1px solid #CCC;
                        margin-bottom: 25px;
                        max-width: 1000px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .card-title {
                        font-size: 34px;
                        color: #0086FF;
                        font-weight: 700;
                        margin-bottom: 40px;
                    }
                    .slider-wrapper { padding: 0 20px; }
                    .proxy-slider {
                        width: 100%;
                        -webkit-appearance: none;
                        height: 6px;
                        border-radius: 10px;
                        outline: none;
                    }
                    .proxy-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 24px;
                        height: 24px;
                        background: #FFF;
                        border: 4px solid #0086FF;
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    .slider-labels {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 15px;
                        color: #999;
                        font-size: 12px;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 15px;
                        max-width: 1000px;
                        margin: 0 auto 40px;
                    }
                    .stat-box {
                        background: #FFF;
                        padding: 20px;
                        border: 1px solid #CCC;
                        text-align: left;
                    }
                    .stat-box label {
                        display: block;
                        font-size: 13px;
                        color: #999;
                        margin-bottom: 15px;
                    }
                    .stat-content {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        position: relative;
                    }
                    .stat-icon { font-size: 20px; }
                    .stat-value {
                        font-size: 22px;
                        font-weight: 800;
                        color: #323232;
                    }
                    .stat-value small { font-size: 12px; color: #999; font-weight: 600; }
                    .gray-out del { color: #0086FF; font-size: 14px; margin-right: 5px; font-weight: 700; }
                    .green-text { color: #28a745; font-weight: 800; }
                    .plus-minus {
                        position: absolute;
                        right: 0;
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                    }
                    .plus-minus button {
                        background: #323232;
                        color: #fff;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 2px;
                        border: none;
                        cursor: pointer;
                    }
                    .brutal-btn {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        padding: 18px 40px;
                        border: 2.5px solid #000 !important;
                        font-weight: 800;
                        font-size: 18px;
                        color: #fff;
                        background: #0086FF;
                        box-shadow: 6px 6px 0px 0px #111 !important;
                        transition: all 0.1s;
                        border-radius: 6px;
                        cursor: pointer;
                        text-decoration: none;
                        min-width: 280px;
                    }
                    .brutal-btn:active {
                        transform: translate(3px, 3px);
                        box-shadow: 3px 3px 0px 0px #111 !important;
                    }
                    .buy-btn { background: #0086FF; color: #fff; }
                    .renews-text { color: #888; font-size: 13px; margin: 25px 0 15px; }
                    .payment-icons {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 25px;
                        margin-top: 30px;
                    }
                    .payment-icons span { font-size: 15px; font-weight: 800; color: #777; margin-right: 10px; }
                    .payment-icons img { height: 26px; filter: grayscale(1); opacity: 0.5; }
                    
                    .coming-soon-container {
                        max-width: 1000px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 80px 40px;
                        border: 1px solid #CCC;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 20px;
                    }
                    .coming-soon-icon {
                        color: #0086FF;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.7; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .coming-soon-title {
                        font-size: 32px;
                        font-weight: 800;
                        color: #323232;
                    }
                     .coming-soon-text {
                        color: #666;
                        max-width: 500px;
                    }

                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        padding: 20px;
                    }
                    .payment-modal {
                        background: #fff;
                        border-radius: 24px;
                        width: 100%;
                        max-width: 500px;
                        padding: 40px;
                        position: relative;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        border: 1px solid rgba(0, 134, 255, 0.1);
                        text-align: left;
                    }
                    .modal-close {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: #f5f5f5;
                        border: none;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        color: #666;
                        transition: all 0.2s;
                    }
                    .modal-close:hover {
                        background: #e0e0e0;
                        color: #000;
                    }
                    .modal-title {
                        font-size: 24px;
                        font-weight: 800;
                        color: #323232;
                        margin-bottom: 8px;
                    }
                    .modal-subtitle {
                        color: #666;
                        font-size: 15px;
                        margin-bottom: 30px;
                    }
                    .payment-options {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }
                    .payment-option-btn {
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        padding: 20px;
                        border-radius: 16px;
                        border: 2px solid #f0f0f0;
                        background: #fff;
                        cursor: pointer;
                        transition: all 0.2s;
                        width: 100%;
                        text-align: left;
                    }
                    .payment-option-btn:hover {
                        border-color: #0086FF;
                        background: #f8fbff;
                        transform: translateY(-2px);
                    }
                    .option-icon {
                        width: 48px;
                        height: 48px;
                        background: #f0f7ff;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #0086FF;
                    }
                    .option-info h4 {
                        margin: 0;
                        font-size: 17px;
                        font-weight: 700;
                        color: #323232;
                    }
                    .option-info p {
                        margin: 4px 0 0;
                        font-size: 13px;
                        color: #888;
                    }
                    .order-summary {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #f0f0f0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .summary-item label {
                        display: block;
                        font-size: 12px;
                        color: #999;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        font-weight: 600;
                    }
                    .summary-item span {
                        font-size: 18px;
                        font-weight: 800;
                        color: #0086FF;
                    }

                    .loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(255, 255, 255, 0.85);
                        backdrop-filter: blur(12px);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 10001;
                    }
                    .spinner-container {
                        position: relative;
                        width: 80px;
                        height: 80px;
                        margin-bottom: 24px;
                    }
                    .spinner-outer {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border: 4px solid rgba(0, 134, 255, 0.1);
                        border-top-color: #0086FF;
                        border-radius: 50%;
                        animation: spin 1s cubic-bezier(0.76, 0.35, 0.2, 0.7) infinite;
                    }
                    .spinner-inner {
                        position: absolute;
                        top: 15px;
                        left: 15px;
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(0, 134, 255, 0.05);
                        border-bottom-color: #0086FF;
                        border-radius: 50%;
                        animation: spin-reverse 1.5s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes spin-reverse {
                        to { transform: rotate(-360deg); }
                    }
                    .loading-title {
                        font-size: 22px;
                        font-weight: 800;
                        color: #041026;
                        margin-bottom: 8px;
                    }
                    .loading-subtitle {
                        color: #666;
                        font-size: 15px;
                    }

                    @media (max-width: 900px) {
                        .stats-grid { grid-template-columns: 1fr 1fr; }
                    }
                ` }} />

                <div className="pricing-header">
                    <h2>Select a Pricing Plan</h2>
                    <p>Choosing the right pricing plan is a pivotal step in tailoring our services to meet your unique needs.</p>
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
                            <motion.div key="rotating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="white-card slider-card">
                                    <h3 className="card-title">Pick Your Bandwidth</h3>
                                    <div className="slider-wrapper">
                                        <input
                                            type="range" min="0.1" max="1000" step="0.1" value={bandwidth}
                                            onChange={(e) => setBandwidth(parseFloat(e.target.value))}
                                            className="proxy-slider"
                                            style={{
                                                background: `linear-gradient(to right, #0086FF 0%, #0086FF ${(bandwidth / 1000) * 100}%, #E8F4FF ${(bandwidth / 1000) * 100}%, #E8F4FF 100%)`
                                            }}
                                        />
                                        <div className="slider-labels">
                                            {[0.1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(v => <span key={v}>{v}</span>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-box">
                                        <label>Total GB</label>
                                        <div className="stat-content">
                                            <div className="stat-icon">📦</div>
                                            <span className="stat-value">{bandwidth.toFixed(1)} <small>GB</small></span>
                                            <div className="plus-minus">
                                                <button onClick={() => setBandwidth(b => Math.min(1000, parseFloat((b + 0.1).toFixed(1))))}><Plus size={14} /></button>
                                                <button onClick={() => setBandwidth(b => Math.max(0.1, parseFloat((b - 0.1).toFixed(1))))}><Minus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-box">
                                        <label>Price Per GB</label>
                                        <div className="stat-content">
                                            <div className="stat-icon p-tag">🏷️</div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="stat-value gray-out"><del>$3.10</del> ${current.pricePerGb} <small>per GB</small></span>
                                                <span style={{ fontSize: '14px', color: '#00B67A', fontWeight: '800' }}>৳ {current.pricePerGbBDT} BDT</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-box">
                                        <label>Total Price</label>
                                        <div className="stat-content">
                                            <div className="stat-icon t-tag">💰</div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="stat-value gray-out"><del>${current.originalTotal}</del> ${current.total}</span>
                                                <span style={{ fontSize: '18px', color: '#0086FF', fontWeight: '800' }}>৳ {current.totalBDT} BDT</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-box">
                                        <label>Discount</label>
                                        <div className="stat-content">
                                            <div className="stat-icon d-tag">📉</div>
                                            <span className="stat-value green-text">-{current.discount}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="buy-now-wrapper">
                                    <button
                                        onClick={handleBuyNowClick}
                                        disabled={isLoading}
                                        className="brutal-btn buy-btn"
                                        style={{ border: 'none' }}
                                    >
                                        <ShoppingCart size={18} /> {isLoading ? 'Processing...' : 'Buy Now'}
                                    </button>
                                    <div className="payment-icons">
                                        <span>WE ACCEPT</span>
                                        <img src="/Bitcoin-Logo.png" alt="bitcoin" style={{ filter: 'none', opacity: 1, height: '48px' }} />
                                        <img src="/bKash-Logo.png" alt="bkash" style={{ filter: 'none', opacity: 1, height: '48px' }} />
                                        <img src="/Nagad-Logo.png" alt="nagad" style={{ filter: 'none', opacity: 1, height: '48px' }} />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="coming-soon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="coming-soon-container">
                                    <Zap size={64} className="coming-soon-icon" />
                                    <h3 className="coming-soon-title">{proxyType} Coming Soon</h3>
                                    <p className="coming-soon-text">We are currently working hard to bring you the best {proxyType} service. Stay tuned for updates!</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Payment Selection Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                        <motion.div
                            className="payment-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                            </button>

                            <h3 className="modal-title">Select Payment Method</h3>
                            <p className="modal-subtitle">Choose how you would like to pay for your plan.</p>

                            <div className="payment-options">
                                <button className="payment-option-btn" onClick={handleCryptoPayment} disabled={isLoading}>
                                    <div className="option-icon">
                                        <Zap size={24} />
                                    </div>
                                    <div className="option-info">
                                        <h4>Crypto</h4>
                                        <p>Pay with Bitcoin, USDT, and other cryptocurrencies</p>
                                    </div>
                                </button>

                                <button className="payment-option-btn" onClick={handleFiatPayment} disabled={isLoading}>
                                    <div className="option-icon">
                                        <ShoppingCart size={24} />
                                    </div>
                                    <div className="option-info">
                                        <h4>Fiat / Digital Payment</h4>
                                        <p>Pay with bKash, Nagad, or Credit Card via Secure Gateway</p>
                                    </div>
                                </button>
                            </div>

                            <div className="order-summary">
                                <div className="summary-item">
                                    <label>Plan</label>
                                    <span style={{ color: '#323232', fontSize: '15px' }}>{bandwidth} GB Rotating Residential</span>
                                </div>
                                <div className="summary-item" style={{ textAlign: 'right' }}>
                                    <label>Total Price</label>
                                    <span>${current.total} / ৳{current.totalBDT}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Redirection Loader */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="loading-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="spinner-container">
                            <div className="spinner-outer"></div>
                            <div className="spinner-inner"></div>
                        </div>
                        <h4 className="loading-title">Processing Securely</h4>
                        <p className="loading-subtitle">Redirecting you to the payment gateway...</p>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    style={{ width: '8px', height: '8px', background: '#0086FF', borderRadius: '50%' }}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Pricing;
