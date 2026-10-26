"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import StepIndicator from "@/components/ui/StepIndicator";

export default function WizardShell({ t, active, title, subtitle, backHref, backLabel, steps, currentStep, children }) {
  return (
    <DashboardShell active={active} title={title} subtitle={subtitle}>
      <div className="max-w-4xl mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-4"
          style={{ color: t.textSecondary, textDecoration: "none" }}
        >
          <ArrowLeft size={14} /> {backLabel}
        </Link>

        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 22 }}>
          <div className="mb-6 pb-5" style={{ borderBottom: `1px solid ${t.borderSoft}` }}>
            <StepIndicator t={t} steps={steps} current={currentStep} />
          </div>
          {children}
        </div>
      </div>
    </DashboardShell>
  );
}
