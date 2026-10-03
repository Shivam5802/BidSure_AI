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
import { useHashScroll } from '@/hooks/useHashScroll';

export default function LandingPage() {
  useHashScroll();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0A0F1D] text-[#17324D] dark:text-slate-100 font-sans antialiased selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-[#082B4C] dark:selection:text-blue-100 transition-colors duration-200">
      <GovernmentTopBar />
      <MainHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <HeroSection />
        <TrustFeatureStrip />
        <AboutSection />
        <BenefitsSection />
        <HowItWorksSection />
        <AIEngineSection />
        <EvidenceSection />
        <GovernanceSection />
        <SecuritySection />
        <ImpactMetricsSection />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
