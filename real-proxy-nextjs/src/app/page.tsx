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
      <section style={{ padding: '40px 0', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '800', color: '#163561' }}>
            TRUSTPILOT <span style={{ color: '#28A745' }}>★★★★★</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '800', color: '#163561' }}>
            Capterra <span style={{ color: '#0086FF' }}>4.8/5</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '800', color: '#163561' }}>
            G2 LEADER
          </div>
        </div>
      </section>

      <Stats />
      <HowItWorks />
      <Pricing />

      {/* Simple CTA Section */}
      <section style={{ padding: '100px 0', textAlign: 'center', background: 'linear-gradient(135deg, #0086FF 0%, #0056b3 100%)', color: 'white' }}>
        <div className="container">
          <h2 style={{ fontSize: '42px', color: 'white', marginBottom: '24px' }}>Ready to Scale Your Business?</h2>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto' }}>Join thousands of companies using 922S5Proxy to bypass restrictions and get reliable data globally.</p>
          <button style={{
            backgroundColor: 'white',
            color: '#0086FF',
            padding: '18px 48px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>Get Started Now</button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
