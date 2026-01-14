"use client";

import PromoBanner from "@/components/layout/PromoBanner";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import Stats from "@/components/sections/Stats";
import HowItWorks from "@/components/sections/HowItWorks";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <PromoBanner />
      <Navbar />
      <Hero />

      {/* Social Proof Bar */}
      <section className="social-proof">
        <div className="container social-proof-container">
          <div className="social-item">
            TRUSTPILOT <span className="stars">★★★★★</span>
          </div>
          <div className="social-item">
            Capterra <span className="score">4.8/5</span>
          </div>
          <div className="social-item">
            G2 LEADER
          </div>
        </div>
      </section>

      <Stats />
      <HowItWorks />
      <Pricing />

      {/* Simple CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Scale Your Business?</h2>
          <p className="cta-desc">Join thousands of companies using 922S5Proxy to bypass restrictions and get reliable data globally.</p>
          <button className="cta-btn">Get Started Now</button>
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
            fontSize: 18px;
            fontWeight: 800;
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
            fontSize: 42px;
            color: white;
            marginBottom: 24px;
        }
        .cta-desc {
            fontSize: 20px;
            opacity: 0.9;
            marginBottom: 40px;
            maxWidth: 700px;
            margin: 0 auto 40px auto;
        }
        .cta-btn {
            backgroundColor: white;
            color: #0086FF;
            padding: 18px 48px;
            borderRadius: 12px;
            fontSize: 18px;
            fontWeight: 700;
            boxShadow: 0 10px 30px rgba(0,0,0,0.1);
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
