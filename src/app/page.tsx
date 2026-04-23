import React, { Suspense } from "react";
import PromoBanner from "@/components/layout/PromoBanner";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import Stats from "@/components/sections/Stats";
import HowItWorks from "@/components/sections/HowItWorks";
import FAQ from "@/components/sections/FAQ";
import Tutorials from "@/components/sections/Tutorials";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import HomeClient from "./HomeClient";
import { redirect } from "next/navigation";

export default async function Home() {
  // Server-side maintenance check: redirect immediately if maintenance is enabled.
  try {
    const res = await fetch("https://api.realproxy.net/api/maintenance/status", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      console.log('[page] maintenance api response', json);
      const isOn = json?.isOn ?? json?.IsOn ?? false;
      if (isOn) {
        redirect("/maintenance");
      }
    }
  } catch (e) {
    // If the API check fails, fall back to rendering the home page.
  }

  return <HomeClient />;
}
