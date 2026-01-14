"use client";

import React from 'react';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="container footer-container">
                <div className="footer-grid">
                    <div className="footer-info">
                        <div className="footer-logo">
                            <div className="logo-icon">922</div>
                            <span className="logo-text">S5Proxy</span>
                        </div>
                        <p className="footer-desc">
                            The world's leading residential proxy service provider. We provide global real residential IP addresses with high anonymity and speed.
                        </p>
                        <div className="social-links">
                            <div className="social-icon">FB</div>
                            <div className="social-icon">TW</div>
                            <div className="social-icon">YT</div>
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
                    <p>© 2024 922S5Proxy. All rights reserved. Privacy Policy | Terms of Service</p>
                </div>
            </div>
            <style jsx>{`
                .footer-section {
                    background-color: #041026;
                    color: #fff;
                    padding: 80px 0 40px 0;
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
                .logo-icon {
                    width: 32px;
                    height: 32px;
                    background-color: #0086FF;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }
                .logo-text {
                    font-size: 20px;
                    font-weight: 700;
                }
                .footer-desc {
                    color: #8898AA;
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
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid #2d3b53;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .footer-heading {
                    margin-bottom: 24px;
                    font-size: 16px;
                }
                .footer-links {
                    list-style: none;
                    color: #8898AA;
                    font-size: 14px;
                    line-height: 2.5;
                    padding: 0;
                }
                .footer-links a:hover {
                    color: #0086FF;
                }
                .footer-bottom {
                    border-top: 1px solid #2d3b53;
                    padding-top: 40px;
                    text-align: center;
                    color: #8898AA;
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
