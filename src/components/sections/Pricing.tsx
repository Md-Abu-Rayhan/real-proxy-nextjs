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

            // Map bandwidth/type to a package ID or use "custom"
            let packageId = "custom";
            if (bandwidth === 10) packageId = "res_10gb";
            else if (bandwidth === 50) packageId = "res_50gb";
            else if (bandwidth === 100) packageId = "res_100gb";

            const response = await axios.post(`${apiUrl}/api/Payment/initialize-secure`, {
                packageId: packageId,
                amount: parseFloat(current.totalBDT),
                currency: "BDT",
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
