import React from 'react';
import {
  ShieldAlert,
  KeyRound,
  FileCheck,
  History,
  Layers,
  ShieldOff,
  GitFork,
  DatabaseZap,
} from 'lucide-react';

export function SecuritySection() {
  const securityFeatures = [
    {
      title: 'Role-Based Access Control',
      desc: 'Enforces strict organizational boundary isolation with least-privilege permissions across procurement teams.',
      icon: KeyRound,
      tag: 'Access Tiering',
    },
    {
      title: 'Secure Authentication',
      desc: 'Multi-factor authentication (MFA) and single sign-on (SSO) integration compliant with e-Pramaan standards.',
      icon: ShieldAlert,
      tag: 'e-Pramaan Ready',
    },
    {
      title: 'Document Validation',
      desc: 'Automated malware screening, format validation, and digital signature checking (DSC) on all incoming attachments.',
      icon: FileCheck,
      tag: 'Sanitization',
    },
    {
      title: 'Audit Logging',
      desc: 'Every system query, user interaction, and data transformation is recorded in immutable, append-only logs.',
      icon: History,
      tag: 'Append-Only',
    },
    {
      title: 'Tender Isolation',
      desc: 'Tenancy isolation ensures tender bid data remains strictly confidential and partitioned between competing tenders.',
      icon: Layers,
      tag: 'Tenant Isolation',
    },
    {
      title: 'Prompt Injection Protection',
      desc: 'Hardened input pipelines filter hostile document payloads and jailbreak vectors targeting entity extraction engines.',
      icon: ShieldOff,
      tag: 'Adversarial Shield',
    },
    {
      title: 'Evidence Traceability',
      desc: 'Every score, flag, and metric is cryptographically tied back to the source PDF byte stream and clause offset.',
      icon: GitFork,
      tag: 'Cryptographic Link',
    },
    {
      title: 'Tamper-Evident Records',
      desc: 'SHA-256 verifiable checksums prevent retroactive modifications to evaluation matrices and final scoring sheets.',
      icon: DatabaseZap,
      tag: 'SHA-256 Digest',
    },
  ];

  return (
    <section id="security" className="py-16 lg:py-24 bg-white border-b border-[#D9E3EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#1464B4] uppercase tracking-wider">
              ENTERPRISE DEFENSE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B4C] tracking-tight font-serif">
            Security by Design
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#52677A] leading-relaxed">
            Engineered with multi-layered controls to defend national procurement infrastructure against tampering, unauthorized access, and adversarial data.
          </p>
        </div>

        {/* 8 Security Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {securityFeatures.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-[#F3F8FC] rounded-xl p-5 border border-[#D9E3EC] hover:border-[#1464B4] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1464B4] border border-[#D9E3EC] group-hover:bg-[#1464B4] group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[#52677A] bg-white border border-[#D9E3EC] px-2 py-0.5 rounded">
                      {sec.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#082B4C] mb-1.5">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-[#52677A] leading-relaxed">
                    {sec.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
