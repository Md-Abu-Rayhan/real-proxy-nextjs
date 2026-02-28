"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus, MessageSquare, Zap, CreditCard, Shield, Globe } from 'lucide-react';

const FAQ = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const categories = [
        { name: 'All', icon: <Globe size={16} /> },
        { name: 'Trials and Payment', icon: <CreditCard size={16} /> },
        { name: 'Service Features', icon: <Zap size={16} /> },
        { name: 'Account and Usage Policy', icon: <Shield size={16} /> },
        { name: 'Functionality', icon: <MessageSquare size={16} /> }
    ];

    const faqs = [
        {
            category: 'Trials and Payment',
            question: 'Do you offer a free trial?',
            answer: 'For individual users, we consistently provide free of charge trials. This allows users to experience our service before making a full commitment. Business customers can contact live-chat for a trial tailored to their use case.'
        },
        {
            category: 'Trials and Payment',
            question: 'What payment methods do you accept?',
            answer: 'We accept Credit/Debit cards (Visa, MasterCard, American Express), Google Pay, Apple Pay, and over 20 different Cryptocurrencies including BTC, ETH, and USDT.'
        },
        {
            category: 'Trials and Payment',
            question: 'Do you offer non-subscription plans?',
            answer: 'Yes, pay-as-you-go plans are available for users who prefer not to commit to monthly subscriptions. You can purchase bandwidth as needed.'
        },
        {
            category: 'Trials and Payment',
            question: 'What is your refund policy?',
            answer: 'Users are encouraged to contact support for any issues. While we strive for 100% satisfaction, detailed refund terms are available in our Terms of Service.'
        },
        {
            category: 'Trials and Payment',
            question: 'Are invoices available?',
            answer: 'Yes, invoices are automatically generated for every purchase and are easily downloadable from your user dashboard.'
        },
        {
            category: 'Service Features',
            question: 'Does the bandwidth roll over?',
            answer: 'No, bandwidth resets at the end of each billing cycle for subscription plans. However, pay-as-you-go data typically remains valid until used.'
        },
        {
            category: 'Service Features',
            question: 'Can I buy additional data?',
            answer: 'Yes, additional bandwidth can be purchased at any time if your current supply runs out, ensuring uninterrupted service.'
        },
        {
            category: 'Service Features',
            question: 'Do you offer IP authentication?',
            answer: 'Currently, access is exclusively secured via username and password authentication. This provides a balance of security and ease of use across different tools.'
        },
        {
            category: 'Service Features',
            question: 'What geo-targeting levels do you support?',
            answer: 'We support precise geo-targeting at the country, state, and city levels, allowing you to access content as if you were truly in that specific location.'
        },
        {
            category: 'Service Features',
            question: 'Which protocols do you support?',
            answer: 'Both HTTP and SOCKS5 protocols are fully supported, ensuring compatibility with almost any software or custom script.'
        },
        {
            category: 'Service Features',
            question: 'Do you provide usage statistics?',
            answer: 'Yes, real-time traffic and detailed usage statistics are visible directly in your user dashboard for full transparency.'
        },
        {
            category: 'Service Features',
            question: 'How long can I use sticky sessions?',
            answer: 'We support extended sticky sessions, allowing you to maintain the same IP address for periods up to 24 hours when necessary.'
        },
        {
            category: 'Account and Usage Policy',
            question: 'Are proxies legal?',
            answer: 'Yes, proxies are entirely legal when used for activities that comply with local laws and our Terms of Service.'
        },
        {
            category: 'Account and Usage Policy',
            question: 'What usage is permitted?',
            answer: 'Common permitted uses include web scraping, SEO monitoring, ad verification, market research, and social media management.'
        },
        {
            category: 'Account and Usage Policy',
            question: 'Are your proxies IPv4 or IPv6?',
            answer: 'We primarily provide high-quality IPv4 residential and mobile proxies, as they offer the best compatibility with most websites.'
        },
        {
            category: 'Functionality',
            question: 'Do you offer reseller plans?',
            answer: 'Yes, we provide flexible white-label and reseller solutions. Contact our support team to discuss a partnership tailored to your needs.'
        },
        {
            category: 'Functionality',
            question: 'Do you require KYC?',
            answer: 'While we value privacy, certain payment methods or exceptionally high-volume usage may require standard identity verification (KYC) to prevent abuse.'
        },
        {
            category: 'Functionality',
            question: 'How do the proxies work?',
            answer: 'Our system routes your traffic through a vast network of real residential and mobile devices globally, making your automated requests indistinguishable from real human users.'
        },
        {
            category: 'Functionality',
            question: 'Do you offer unlimited bandwidth?',
            answer: 'Residential plans are typically data-limited to ensure quality. However, we can discuss custom configurations for enterprise clients with specific needs.'
        }
    ];

    const filteredFaqs = activeTab === 'All'
        ? faqs
        : faqs.filter(f => f.category === activeTab || (activeTab === 'Functionality' && f.category === 'Functionality'));

    return (
        <section id="faq-section" className="faq-section">
            <style dangerouslySetInnerHTML={{
                __html: `
                .faq-section {
                    padding: 100px 0;
                    background-color: #f8f9fa;
                    font-family: 'Outfit', sans-serif;
                }
                .faq-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 24px;
                }
                .faq-header {
                    text-align: center;
                    margin-bottom: 60px;
                }
                .faq-header h2 {
                    font-size: 42px;
                    font-weight: 800;
                    color: #041026;
                    margin-bottom: 16px;
                }
                .faq-header p {
                    font-size: 18px;
                    color: #667085;
                }
                
                .faq-tabs {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 48px;
                    flex-wrap: wrap;
                }
                .faq-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: white;
                    border: 1px solid #eaecf0;
                    border-radius: 100px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #4E5969;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .faq-tab-btn.active {
                    background: #4D76F1;
                    color: white;
                    border-color: #4D76F1;
                    box-shadow: 0 4px 12px rgba(77, 118, 241, 0.2);
                }
                
                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .faq-item {
                    background: white;
                    border: 1px solid #eaecf0;
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s;
                }
                .faq-item:hover {
                    border-color: #4D76F1;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                }
                .faq-question-btn {
                    width: 100%;
                    padding: 24px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                }
                .faq-question-text {
                    font-size: 18px;
                    font-weight: 700;
                    color: #041026;
                }
                .faq-answer {
                    padding: 0 32px 24px;
                    color: #667085;
                    font-size: 16px;
                    line-height: 1.6;
                }
                
                @media (max-width: 768px) {
                    .faq-section { padding: 60px 0; }
                    .faq-header h2 { font-size: 32px; }
                    .faq-question-btn { padding: 20px; }
                    .faq-question-text { font-size: 16px; }
                    .faq-answer { padding: 0 20px 20px; font-size: 14px; }
                }
            ` }} />

            <div className="faq-container">
                <div className="faq-header">
                    <h2>Frequently Asked Questions</h2>
                    <p>Everything you need to know about our proxy solutions.</p>
                </div>

                <div className="faq-tabs">
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            className={`faq-tab-btn ${activeTab === cat.name ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(cat.name);
                                setOpenIndex(null);
                            }}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="faq-list">
                    {filteredFaqs.map((faq, idx) => (
                        <div key={idx} className="faq-item">
                            <button
                                className="faq-question-btn"
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            >
                                <span className="faq-question-text">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown size={20} color={openIndex === idx ? '#4D76F1' : '#86909C'} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="faq-answer">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '64px',
                    textAlign: 'center',
                    padding: '40px',
                    background: 'white',
                    borderRadius: '24px',
                    border: '1px solid #eaecf0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#041026', marginBottom: '12px' }}>Still have questions?</h3>
                    <p style={{ color: '#667085', fontSize: '16px', marginBottom: '32px' }}>Can't find the answer you're looking for? Our support team is here to help you 24/7.</p>
                    <button
                        onClick={() => window.location.href = 'mailto:support@realproxy.net'}
                        style={{
                            background: '#041026',
                            color: 'white',
                            padding: '16px 40px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <MessageSquare size={20} />
                        Chat with Support
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
