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
    const [bandwidth, setBandwidth] = useState(500);
    const [isLoading, setIsLoading] = useState(false);

    const handleBuyNow = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please login to proceed with payment.");
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.realproxy.net';

            // Map bandwidth/type to a package ID
            let packageId = "res_10gb";
            if (bandwidth >= 100) packageId = "res_100gb";
            else if (bandwidth >= 50) packageId = "res_50gb";

            const response = await axios.post(`${apiUrl}/api/Payment/initialize-secure`, {
                packageId: packageId,
                customerOrderId: `ORD${Date.now()}`.substring(0, 16),
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
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.redirectUrl) {
                toast.success("Redirecting to payment gateway...");
                window.location.href = response.data.redirectUrl;
            } else {
                toast.error("Failed to get payment URL.");
            }
        } catch (error: any) {
            console.error("Payment error detail:", error.response?.data);
            const message = error.response?.data?.message || error.message || "Payment initialization failed.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const proxyTypes = ['Rotating Res.', 'Static Res.', 'Mobile Proxies', 'Datacenter'];

    const getPricing = (gb: number) => {
        let pricePerGb = 3.10;
        if (gb >= 1000) pricePerGb = 1.32;
        else if (gb >= 500) pricePerGb = 1.56;
        else if (gb >= 100) pricePerGb = 2.06;
        else if (gb >= 50) pricePerGb = 2.30;
        else if (gb >= 10) pricePerGb = 2.45;

        const total = (gb * pricePerGb).toFixed(0);
        const originalTotal = (gb * 3.10).toFixed(0);
        const discount = Math.round(((3.10 - pricePerGb) / 3.10) * 100);

        return { pricePerGb: pricePerGb.toFixed(2), total, originalTotal, discount };
    };

    const current = getPricing(bandwidth);

    return (
        <section className="pricing-section">
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
                                            type="range" min="1" max="1000" value={bandwidth}
                                            onChange={(e) => setBandwidth(parseInt(e.target.value))}
                                            className="proxy-slider"
                                            style={{
                                                background: `linear-gradient(to right, #0086FF 0%, #0086FF ${(bandwidth / 1000) * 100}%, #E8F4FF ${(bandwidth / 1000) * 100}%, #E8F4FF 100%)`
                                            }}
                                        />
                                        <div className="slider-labels">
                                            {[1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(v => <span key={v}>{v}</span>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-box">
                                        <label>Total GB</label>
                                        <div className="stat-content">
                                            <div className="stat-icon">📦</div>
                                            <span className="stat-value">{bandwidth} <small>GB</small></span>
                                            <div className="plus-minus">
                                                <button onClick={() => setBandwidth(b => Math.min(1000, b + 1))}><Plus size={14} /></button>
                                                <button onClick={() => setBandwidth(b => Math.max(1, b - 1))}><Minus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-box">
                                        <label>Price Per GB</label>
                                        <div className="stat-content">
                                            <div className="stat-icon p-tag">🏷️</div>
                                            <span className="stat-value gray-out"><del>$3.10</del> ${current.pricePerGb} <small>per GB</small></span>
                                        </div>
                                    </div>
                                    <div className="stat-box">
                                        <label>Total Price</label>
                                        <div className="stat-content">
                                            <div className="stat-icon t-tag">💰</div>
                                            <span className="stat-value gray-out"><del>${current.originalTotal}</del> ${current.total}</span>
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
                                        onClick={handleBuyNow}
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
        </section>
    );
};

export default Pricing;
