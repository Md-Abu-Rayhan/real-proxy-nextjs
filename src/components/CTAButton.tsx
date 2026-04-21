"use client";

import React from "react";

export default function CTAButton() {
  const handleClick = () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const pricingSection = document.getElementById("pricing-section");
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = "/dashboard/traffic-setup";
        }
      } else {
        window.location.href = "/signup";
      }
    } catch (e) {
      // best-effort
      window.location.href = "/signup";
    }
  };

  return (
    <button onClick={handleClick} className="cta-btn">
      Get Started Now
    </button>
  );
}
