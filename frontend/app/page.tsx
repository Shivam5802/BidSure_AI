'use client';

import React from 'react';
import {
  GovernmentTopBar,
  MainHeader,
  HeroSection,
  TrustFeatureStrip,
  AboutSection,
  BenefitsSection,
  HowItWorksSection,
  AIEngineSection,
  EvidenceSection,
  GovernanceSection,
  SecuritySection,
  ImpactMetricsSection,
  CTASection,
  ContactSection,
} from '@/components/landing';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#17324D] font-sans antialiased selection:bg-blue-100 selection:text-[#082B4C]">
      {/* 1. Official Government Top Information & Accessibility Bar */}
      <GovernmentTopBar />

      {/* 2. Main Institutional Sticky Header */}
      <MainHeader />

      {/* 3. Main Landing Page Sections */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* Large Government Portal Hero Section with Parliament visual & Tricolor accent */}
        <HeroSection />

        {/* 4 Feature Institutional Blocks Row */}
        <TrustFeatureStrip />

        {/* About BidSure with 3 Institutional Pillars & Emblem watermark */}
        <AboutSection />

        {/* Why BidSure / 5 Key Benefits Grid */}
        <BenefitsSection />

        {/* Horizontal Process Timeline: Tender → AI Blueprint → Evidence → Rules → Officer Review → Decision */}
        <HowItWorksSection />

        {/* AI + Deterministic Rules Pipeline (Explainable deterministic engine) */}
        <AIEngineSection />

        {/* Evidence-Backed Verification (Interactive page-level citations & document inspector) */}
        <EvidenceSection />

        {/* Governance & Trust: Built for Accountability (AI Assists → Rules Verify → Officer Decides) */}
        <GovernanceSection />

        {/* Security by Design (8 enterprise & government defense cards) */}
        <SecuritySection />

        {/* Government Trust & Metrics Banner (matching reference bottom banner) */}
        <ImpactMetricsSection />

        {/* Official Procurement Helpdesk & Enquiries Section */}
        <ContactSection />

        {/* Final Government-style CTA Section */}
        <CTASection />
      </main>

      {/* 4. Deep Navy Government Technology Portal Footer */}
      <Footer />
    </div>
  );
}
