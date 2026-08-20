"use client";

import { useRouter } from "next/navigation";
import type { MockBundleRecord } from "@/mock/production";
import { PageHeader } from "@/components/common/PageHeader";
import { BundleJourneyTimeline } from "@/components/modules/production/BundleJourneyTimeline";
import { BundlePaymentsTable } from "@/components/modules/production/BundlePaymentsTable";
import { BundleSummaryCard } from "@/components/modules/production/BundleSummaryCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface BundleTrackingPageProps {
  bundle: MockBundleRecord;
}

export function BundleTrackingPage({ bundle }: BundleTrackingPageProps) {
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Bundle Tracking"
        subtitle={`${bundle.bundleNumber} · ${bundle.poNumber} · ${bundle.designNumber} · ${bundle.garmentType}`}
        actionButton={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.PRODUCTION.ROOT)}
          >
            Back to Production
          </Button>
        }
      />

      <div className="space-y-5">
        <BundleSummaryCard bundle={bundle} />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Stage by Stage Progress
          </h2>
          <BundleJourneyTimeline stages={bundle.journey} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Karigar Payments
          </h2>
          <BundlePaymentsTable payments={bundle.payments} />
        </div>
      </div>
    </div>
  );
}
