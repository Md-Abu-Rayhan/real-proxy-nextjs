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
import { API_URL } from "@/lib/config";

export default async function Home() {
  // Maintenance check disabled
  // try {
  //   const res = await fetch(`${API_URL}/api/maintenance/status`, { cache: "no-store" });
  //   if (res.ok) {
  //     const json = await res.json();
  //     const isOn = json?.isOn ?? json?.IsOn ?? false;
  //     if (isOn) redirect("/maintenance");
  //   }
  // } catch (e) {}

  return <HomeClient />;
}
