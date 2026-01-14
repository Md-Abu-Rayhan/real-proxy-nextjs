"use client";

import React from 'react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#041026', color: '#fff', padding: '80px 0 40px 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '40px', marginBottom: '60px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#0086FF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>922</div>
                            <span style={{ fontSize: '20px', fontWeight: '700' }}>S5Proxy</span>
                        </div>
                        <p style={{ color: '#8898AA', fontSize: '14px', lineHeight: '1.8', maxWidth: '300px' }}>
                            The world's leading residential proxy service provider. We provide global real residential IP addresses with high anonymity and speed.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '24px' }}>
                            {/* Social icons placeholder */}
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #2d3b53', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>FB</div>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #2d3b53', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>TW</div>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #2d3b53', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>YT</div>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '24px', fontSize: '16px' }}>Help Center</h4>
                        <ul style={{ listStyle: 'none', color: '#8898AA', fontSize: '14px', lineHeight: '2.5' }}>
                            <li><a href="#">Support</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">How to use?</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '24px', fontSize: '16px' }}>Service & Items</h4>
                        <ul style={{ listStyle: 'none', color: '#8898AA', fontSize: '14px', lineHeight: '2.5' }}>
                            <li><a href="#">ISP Proxies</a></li>
                            <li><a href="#">Residential Proxies</a></li>
                            <li><a href="#">Static Proxies</a></li>
                            <li><a href="#">Mobile Proxies</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '24px', fontSize: '16px' }}>Partnership</h4>
                        <ul style={{ listStyle: 'none', color: '#8898AA', fontSize: '14px', lineHeight: '2.5' }}>
                            <li><a href="#">Affiliate Program</a></li>
                            <li><a href="#">Reseller Program</a></li>
                            <li><a href="#">White Label</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #2d3b53', paddingTop: '40px', textAlign: 'center', color: '#8898AA', fontSize: '12px' }}>
                    <p>© 2024 922S5Proxy. All rights reserved. Privacy Policy | Terms of Service</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
