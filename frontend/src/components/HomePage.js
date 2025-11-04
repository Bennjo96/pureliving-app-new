import React, { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection/HeroSection";
import Footer from "./Footer";
import CTASection from "./CTASection/CTASection";

// Lazy‑load heavier below‑the‑fold chunks
const FeaturesSection = lazy(() => import("./FeaturesSection/FeaturesSection"));
const PricingSection = lazy(() => import("./PricingSection"));

/**
 * Landing page – lightweight hero first, lazy items later.
 * Uses section IDs (#top, #pricing) so hash‑links work without JS.
 */
export default function HomePage() {
  const location = useLocation();

  // Scroll to an anchor when the hash changes (to offset fixed navbar)
  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) {
      // delay until after paint so images/fonts don't shift
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ---------- Header ---------- */}
      <Navbar />

      {/* ---------- Main ---------- */}
      {/* scroll‑padding so anchor lands below fixed navbar */}
      <main id="top" className="mt-20 scroll-pt-20">
        <section id="hero">
          <HeroSection />
        </section>

        <Suspense fallback={<div className="text-center py-10">Loading…</div>}>
          <section id="features">
            <FeaturesSection />
          </section>
        </Suspense>

        <Suspense fallback={<div className="text-center py-10">Loading pricing…</div>}>
          <section id="pricing" className="scroll-mt-24">
            <PricingSection />
          </section>
        </Suspense>

        <section id="cta">
          <CTASection />
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <Footer />
    </div>
  );
}
