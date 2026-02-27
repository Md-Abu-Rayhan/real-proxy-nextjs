"use client";

import React, { Suspense } from "react";
import PromoBanner from "@/components/layout/PromoBanner";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import Stats from "@/components/sections/Stats";
import HowItWorks from "@/components/sections/HowItWorks";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <PromoBanner />
      <Navbar />
      <Hero />
      <Suspense fallback={<div className="container py-20 text-center">Loading pricing...</div>}>
        <Pricing />
      </Suspense>
      <Stats />
      <HowItWorks />

      {/* Simple CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Scale Your Business?</h2>
          <p className="cta-desc">Join thousands of companies using Real Proxy to bypass restrictions and get reliable data globally.</p>
          <button
            onClick={() => {
              const token = localStorage.getItem('auth_token');
              if (token) {
                const pricingSection = document.getElementById('pricing-section');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/dashboard/traffic-setup';
                }
              } else {
                window.location.href = '/register';
              }
            }}
            className="cta-btn"
          >
            Get Started Now
          </button>
        </div>
      </section>

      <style jsx>{`
        .social-proof {
            padding: 40px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .social-proof-container {
            display: flex;
            justify-content: center;
            gap: 80px;
            flex-wrap: wrap;
            opacity: 0.6;
        }
        .social-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 800;
            color: #163561;
        }
        .stars { color: #28A745; }
        .score { color: #0086FF; }

        .cta-section {
            padding: 100px 0;
            text-align: center;
            background: linear-gradient(135deg, #0086FF 0%, #0056b3 100%);
            color: white;
        }
        .cta-title {
            font-size: 42px;
            color: white;
            margin-bottom: 24px;
        }
        .cta-desc {
            font-size: 20px;
            opacity: 0.9;
            margin-bottom: 40px;
            max-width: 700px;
            margin: 0 auto 40px auto;
        }
        .cta-btn {
            background-color: white;
            color: #0086FF;
            padding: 18px 48px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: none;
            cursor: pointer;
        }

        @media (max-width: 768px) {
            .social-proof-container { gap: 30px; }
            .social-item { font-size: 14px; }
            .cta-section { padding: 60px 0; }
            .cta-title { font-size: 26px; margin-bottom: 16px; padding: 0 10px; }
            .cta-desc { font-size: 15px; padding: 0 20px; margin-bottom: 30px; }
            .cta-btn { padding: 14px 32px; font-size: 16px; width: 100%; max-width: 300px; }
        }
      `}</style>

      <Footer />
    </main>
  );
}
