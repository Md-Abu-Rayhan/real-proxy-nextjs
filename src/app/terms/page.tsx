"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="terms-container">
            <header className="terms-header">
                <div className="container">
                    <Link href="/" className="back-link">
                        <ArrowLeft size={16} />
                        <span>Back to Home</span>
                    </Link>
                    <div className="header-content">
                        <div className="icon-badge">
                            <Shield size={32} color="#0086ff" />
                        </div>
                        <h1>Terms of Service</h1>
                        <p className="last-updated">Last Updated: February 28, 2026</p>
                    </div>
                </div>
            </header>

            <main className="terms-content">
                <div className="container">
                    <div className="content-card">
                        <section>
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                These Terms of Service, along with our Service Level Agreement and Refund and Cancellation Policy,
                                govern your access and use of Real Proxy's services. By using our website and System, you agree to
                                be bound by these Terms.
                            </p>
                            <p>
                                Real Proxy offers a Service that enables internet browsing by redirecting users' communication
                                through advanced proxy infrastructure. This is available for commercial use under this agreement.
                            </p>
                            <p>
                                You represent and warrant that you have the legal authority to enter into these Terms and that
                                you have reached the age of legal majority in your jurisdiction.
                            </p>
                        </section>

                        <section>
                            <h2>2. Registration and User Account</h2>
                            <p>
                                To access our Services and System, you must complete the registration process and create an account.
                                By registering, you agree to provide accurate and complete information. You represent and warrant
                                that you are not:
                            </p>
                            <ul className="terms-list">
                                <li><CheckCircle size={14} /> Violating any anti-terrorism laws</li>
                                <li><CheckCircle size={14} /> Conducting business with prohibited persons or entities</li>
                                <li><CheckCircle size={14} /> Engaging in transactions related to blocked property</li>
                                <li><CheckCircle size={14} /> Attempting to evade any anti-terrorism laws</li>
                            </ul>
                            <p>
                                You are solely responsible for all activity associated with your account and for the security
                                of your credentials.
                            </p>
                        </section>

                        <section>
                            <h2>3. Acceptable Use</h2>
                            <p>By using our System, you agree not to:</p>
                            <ul className="terms-list">
                                <li><CheckCircle size={14} /> Use the System in violation of applicable laws or regulations</li>
                                <li><CheckCircle size={14} /> Use the System for malicious governmental purposes</li>
                                <li><CheckCircle size={14} /> Distribute malicious software or engage in harmful activities</li>
                                <li><CheckCircle size={14} /> Cause network resources to be unavailable to intended users</li>
                                <li><CheckCircle size={14} /> Distribute unlawful content or encourage unlawful activity</li>
                            </ul>
                        </section>

                        <section>
                            <h2>4. Fees and Payments</h2>
                            <p>
                                To access the System, you must subscribe to our paid plans. All purchases are final and non-refundable,
                                except at our discretion. Subscriptions auto-renew unless cancelled through your dashboard.
                            </p>
                            <p>
                                Fees listed do not include VAT, sales taxes, or other applicable charges. We reserve the right
                                to change our prices at any time with reasonable notice.
                            </p>
                        </section>

                        <section>
                            <h2>5. Chargebacks and Disputes</h2>
                            <p>
                                You agree to pay for all Services used. Initiating an unjustified chargeback or payment dispute
                                constitutes a material breach of these Terms and may result in immediate account suspension
                                and administrative fees.
                            </p>
                        </section>

                        <section>
                            <h2>6. Intellectual Property</h2>
                            <p>
                                All rights to the website and its content remain the sole property of Real Proxy. You grant us
                                a non-exclusive license to use your company name and logo for promotional purposes while
                                you are a customer.
                            </p>
                        </section>

                        <section>
                            <h2>7. Warranty Disclaimer</h2>
                            <p>
                                The Services are provided "as is" and "as available" without any warranties. Real Proxy disclaims
                                all representations and warranties regarding the System's condition or quality.
                            </p>
                        </section>

                        <section>
                            <h2>8. Contact Us</h2>
                            <p>
                                For legal and copyright inquiries, please contact our support team through the official
                                channels listed on our website.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .terms-container {
                    background-color: #f8fafc;
                    min-height: 100vh;
                    font-family: 'Inter', system-ui, sans-serif;
                    color: #1e293b;
                    line-height: 1.6;
                }

                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .terms-header {
                    background-color: white;
                    padding: 60px 0 40px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 32px;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: #0086ff;
                }

                .header-content {
                    text-align: center;
                }

                .icon-badge {
                    width: 64px;
                    height: 64px;
                    background-color: #f0f7ff;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                }

                h1 {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 12px;
                    letter-spacing: -0.025em;
                }

                .last-updated {
                    color: #64748b;
                    font-size: 14px;
                }

                .terms-content {
                    padding: 60px 0 100px;
                }

                .content-card {
                    background: white;
                    padding: 48px;
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }

                section {
                    margin-bottom: 40px;
                }

                section:last-child {
                    margin-bottom: 0;
                }

                h2 {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 20px;
                }

                p {
                    margin-bottom: 16px;
                    color: #475569;
                }

                .terms-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .terms-list li {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #475569;
                    font-size: 15px;
                }

                .terms-list li :global(svg) {
                    color: #10b981;
                }

                @media (max-width: 640px) {
                    .terms-header {
                        padding: 40px 0 30px;
                    }

                    h1 {
                        font-size: 28px;
                    }

                    .content-card {
                        padding: 30px 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default TermsOfService;
