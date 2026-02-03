import PromoBanner from "@/components/layout/PromoBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResidentialHero from "@/components/sections/ResidentialHero";
import Pricing from "@/components/sections/Pricing";
import ResidentialBenefits from "@/components/sections/ResidentialBenefits";
import CheckoutSection from "@/components/sections/CheckoutSection";

export const metadata = {
    title: "Residential Proxies - Real Proxy",
    description: "Best residential ip proxy service provider. Get unlimited speed and anonymity with 200M+ real residential IPs.",
};

export default function ResidentialProxiesPage() {
    return (
        <main>
            <PromoBanner />
            <Navbar />
            <ResidentialHero />
            <Pricing />
            <ResidentialBenefits />
            {/* <CheckoutSection /> */}

            {/* Dynamic CTA at the bottom */}
            <section style={{ padding: '80px 0', background: '#041026', color: 'white' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '12px' }}>Start with Real Proxy Residential Proxies</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Join over 100k+ global users today.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <a href="#pricing-section" className="btn-primary" style={{ padding: '16px 40px', background: '#0086FF', border: 'none', textDecoration: 'none', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}>Order Now</a>
                        <button className="btn-outline" style={{ padding: '16px 40px', color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'transparent' }}>Contact Support</button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
