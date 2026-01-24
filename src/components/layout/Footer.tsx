"use client";

import React from 'react';
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="container footer-container">
                <div className="footer-grid">
                    <div className="footer-info">
                        <div className="footer-logo">
                            <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
                        </div>
                        <p className="footer-desc">
                            The world's leading residential proxy service provider. We provide global real residential IP addresses with high anonymity and speed.
                        </p>
                        <div className="social-links">
                            <div className="social-icon"><Facebook size={18} /></div>
                            <div className="social-icon"><Twitter size={18} /></div>
                            <div className="social-icon"><Youtube size={18} /></div>
                            <div className="social-icon"><Instagram size={18} /></div>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Help Center</h4>
                        <ul className="footer-links">
                            <li><a href="#">Support</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">How to use?</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Service & Items</h4>
                        <ul className="footer-links">
                            <li><a href="#">ISP Proxies</a></li>
                            <li><a href="#">Residential Proxies</a></li>
                            <li><a href="#">Static Proxies</a></li>
                            <li><a href="#">Mobile Proxies</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Partnership</h4>
                        <ul className="footer-links">
                            <li><a href="#">Affiliate Program</a></li>
                            <li><a href="#">Reseller Program</a></li>
                            <li><a href="#">White Label</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Real Proxy. All rights reserved. Privacy Policy | Terms of Service</p>
                </div>
            </div>
            <style jsx>{`
                .footer-section {
                    background: linear-gradient(180deg, #041026 0%, #020817 100%);
                    color: #fff;
                    padding: 100px 0 40px 0;
                    border-top: 1px solid rgba(0, 134, 255, 0.1);
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr 1fr;
                    gap: 40px;
                    margin-bottom: 60px;
                }
                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }
                .footer-desc {
                    color: #CBD5E0;
                    font-size: 14px;
                    line-height: 1.8;
                    max-width: 300px;
                }
                .social-links {
                    display: flex;
                    gap: 15px;
                    margin-top: 24px;
                }
                .social-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: white;
                }
                .social-icon:hover {
                    background-color: #0086FF;
                    border-color: #0086FF;
                    color: white;
                    transform: translateY(-3px);
                }
                .footer-heading {
                    margin-bottom: 30px;
                    font-size: 18px;
                    font-weight: 700;
                    position: relative;
                    padding-bottom: 12px;
                    color: white;
                }
                .footer-heading::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 30px;
                    height: 2px;
                    background-color: #0086FF;
                }
                .footer-links {
                    list-style: none;
                    color: #CBD5E0;
                    font-size: 14px;
                    line-height: 2.5;
                    padding: 0;
                }
                .footer-links a:hover {
                    color: #0086FF;
                }
                .footer-bottom {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 40px;
                    text-align: center;
                    color: #CBD5E0;
                    font-size: 12px;
                }

                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                    }
                }

                @media (max-width: 768px) {
                    .footer-section { padding: 60px 0 30px 0; }
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .footer-info {
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .footer-logo { justify-content: center; }
                    .social-links { justify-content: center; }
                    .footer-column {
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
