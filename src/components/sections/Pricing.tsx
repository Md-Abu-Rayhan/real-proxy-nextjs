"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Pricing = () => {
    const [proxyType, setProxyType] = useState('Rotating Res.');
    const [tier, setTier] = useState('Regular');
    const [bandwidth, setBandwidth] = useState(500);

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

    const enterprisePlans = [
        { title: 'Venture', price: '5,200', traffic: '5 TB', gbPrice: '1.04', isPopular: false },
        { title: 'Business', price: '6,600', traffic: '10 TB', gbPrice: '0.66', isPopular: true },
        { title: 'Corporate', price: '30,000', traffic: '50 TB', gbPrice: '0.60', isPopular: false },
        { title: 'Custom +', price: '47,000', traffic: '100 TB', gbPrice: '0.47', isPopular: false },
    ];

    const current = getPricing(bandwidth);

    return (
        <section className="pricing-section">
            <div className="container">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .pricing-section {
                        background: linear-gradient(180deg, #D1CAFD 0%, #EFE9FD 100%);
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
                    .tabs-outer { display: flex; justify-content: center; margin-bottom: 25px; }
                    .tabs-container {
                        background: #fff;
                        padding: 6px;
                        border-radius: 50px;
                        display: flex;
                        gap: 5px;
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
                        background: #5B53EA;
                        color: #fff;
                    }
                    .toggle-outer { display: flex; justify-content: center; margin-bottom: 40px; }
                    .toggle-container {
                        background: #F1F0FE;
                        padding: 4px;
                        border-radius: 50px;
                        display: flex;
                        width: 300px;
                    }
                    .toggle-btn {
                        flex: 1;
                        padding: 10px;
                        border-radius: 50px;
                        font-weight: 700;
                        font-size: 14px;
                        color: #5B53EA;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                    }
                    .toggle-btn.active {
                        background: #5B53EA;
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
                        color: #5B53EA;
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
                        border: 4px solid #5B53EA;
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
                    .gray-out del { color: #5B53EA; font-size: 14px; margin-right: 5px; font-weight: 700; }
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
                        background: #5B53EA;
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
                    .buy-btn { background: #5B53EA; color: #fff; }
                    .ent-btn { 
                        background: #FFBC0E !important; 
                        color: #000 !important; 
                        width: 90%; 
                        padding: 14px 20px;
                        font-size: 16px;
                    }
                    .renews-text { color: #888; font-size: 13px; margin: 25px 0 15px; }
                    .payment-icons {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 15px;
                    }
                    .payment-icons span { font-size: 13px; font-weight: 800; color: #999; margin-right: 5px; }
                    .payment-icons img { height: 26px; filter: grayscale(1); opacity: 0.5; }
                    .enterprise-container {
                        max-width: 1000px;
                        margin: 0 auto;
                        background: #fff;
                        border: 1px solid #CCC;
                    }
                    .enterprise-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        border-bottom: 1px solid #eee;
                    }
                    .ent-card {
                        padding: 45px 15px;
                        border-right: 1px solid #eee;
                        position: relative;
                        background: #fff;
                    }
                    .ent-card:last-child { border-right: none; }
                    .popular-card {
                        transform: scale(1.05);
                        background: #fff;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                        z-index: 10;
                        border: 1px solid #CCC;
                    }
                    .popular-ribbon {
                        position: absolute;
                        top: -16px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #FFBC0E;
                        padding: 6px 18px;
                        font-size: 12px;
                        font-weight: 800;
                        text-transform: uppercase;
                        border-radius: 4px;
                        color: #000;
                        border: 2px solid #000;
                        white-space: nowrap;
                    }
                    .ent-title { font-size: 26px; font-weight: 800; margin-bottom: 22px; color: #323232; }
                    .ent-price { margin-bottom: 12px; color: #323232; }
                    .ent-price .symbol { font-size: 22px; font-weight: 800; vertical-align: top; }
                    .ent-price .amount { font-size: 42px; font-weight: 900; }
                    .ent-price .yr { color: #999; font-size: 15px; font-weight: 700; }
                    .ent-gb-price { color: #999; font-size: 15px; margin-bottom: 35px; font-weight: 600; }
                    .features-table { padding: 25px; }
                    .table-row {
                        display: grid;
                        grid-template-columns: 2fr repeat(4, 1fr);
                        padding: 16px 12px;
                        border-bottom: 1px dashed #eee;
                        font-size: 15px;
                        text-align: left;
                    }
                    .table-row.head-row { background: #f9f9f9; font-weight: 800; border-bottom: none; color: #323232; }
                    .col-val { text-align: center; color: #5B53EA; font-weight: 800; }
                    .blue-check { color: #5B53EA; font-size: 19px; font-weight: 900; }
                    @media (max-width: 900px) {
                        .stats-grid, .enterprise-grid { grid-template-columns: 1fr 1fr; }
                        .table-row { display: none; }
                        .ent-card { border-bottom: 1px solid #eee; border-right: none; }
                        .popular-card { transform: none; margin: 20px 0; }
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

                <div className="toggle-outer">
                    <div className="toggle-container">
                        <button className={`toggle-btn ${tier === 'Regular' ? 'active' : ''}`} onClick={() => setTier('Regular')}>Regular</button>
                        <button className={`toggle-btn ${tier === 'Enterprise' ? 'active' : ''}`} onClick={() => setTier('Enterprise')}>Enterprise</button>
                    </div>
                </div>

                <div className="content-area">
                    <AnimatePresence mode="wait">
                        {tier === 'Regular' ? (
                            <motion.div key="regular" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="white-card slider-card">
                                    <h3 className="card-title">Pick Your Bandwidth</h3>
                                    <div className="slider-wrapper">
                                        <input
                                            type="range" min="1" max="1000" value={bandwidth}
                                            onChange={(e) => setBandwidth(parseInt(e.target.value))}
                                            className="proxy-slider"
                                            style={{
                                                background: `linear-gradient(to right, #5B53EA 0%, #5B53EA ${(bandwidth / 1000) * 100}%, #E8E6FD ${(bandwidth / 1000) * 100}%, #E8E6FD 100%)`
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
                                    <Link href="/register" className="brutal-btn buy-btn">
                                        <ShoppingCart size={18} /> Buy Now
                                    </Link>
                                    <p className="renews-text">Auto-renews upon plan completion or annually. Opt-out anytime.</p>
                                    <div className="payment-icons">
                                        <span>WE ACCEPT</span>
                                        <img src="https://proxyjet.io/wp-content/uploads/2024/05/paypal.png" alt="paypal" />
                                        <img src="https://proxyjet.io/wp-content/uploads/2024/05/visa.png" alt="visa" />
                                        <img src="https://proxyjet.io/wp-content/uploads/2024/05/mastercard.png" alt="mastercard" />
                                        <img src="https://proxyjet.io/wp-content/uploads/2024/05/amex.png" alt="amex" />
                                        <img src="https://proxyjet.io/wp-content/uploads/2024/05/bitcoin.png" alt="bitcoin" />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="enterprise" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="enterprise-container">
                                    <div className="enterprise-grid">
                                        {enterprisePlans.map((plan, i) => (
                                            <div key={i} className={`ent-card ${plan.isPopular ? 'popular-card' : ''}`}>
                                                {plan.isPopular && <div className="popular-ribbon">Most popular</div>}
                                                <h4 className="ent-title">{plan.title}</h4>
                                                <div className="ent-price">
                                                    <span className="symbol">$</span>
                                                    <span className="amount">{plan.price}</span>
                                                    <span className="yr">/hr</span>
                                                </div>
                                                <p className="ent-gb-price">${plan.gbPrice}/GB</p>
                                                <Link href="/contact" className="brutal-btn ent-btn">
                                                    Contact Sales
                                                </Link>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="features-table">
                                        <div className="table-row head-row">
                                            <div className="col-label">Traffic</div>
                                            {enterprisePlans.map((p, i) => <div key={i} className="col-val">{p.traffic}</div>)}
                                        </div>
                                        {['Concurrent session', 'City/State targeting', 'Automatic proxy rotation', '24/7 support', 'Dedicated Account Manager'].map((f, i) => (
                                            <div key={i} className="table-row">
                                                <div className="col-label">{f}</div>
                                                {enterprisePlans.map((_, idx) => (
                                                    <div key={idx} className="col-val">
                                                        {f.includes('session') ? 'Unlimited' : <span className="blue-check">✔</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
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
