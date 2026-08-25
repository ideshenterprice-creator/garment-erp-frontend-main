"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { BundleJourneyTimeline } from "@/components/modules/production/BundleJourneyTimeline";
import { BundlePaymentsTable } from "@/components/modules/production/BundlePaymentsTable";
import { BundleSummaryCard } from "@/components/modules/production/BundleSummaryCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  getBundleByNumber,
  getBundleJourney,
  getBundlePayments,
} from "@/services/production.service";

interface BundleTrackingPageProps {
  bundleNumber: string;
}

export function BundleTrackingPage({ bundleNumber }: BundleTrackingPageProps) {
  const router = useRouter();

  const summaryQuery = useQuery({
    queryKey: [...QUERY_KEYS.BUNDLES, bundleNumber],
    queryFn: () => getBundleByNumber(bundleNumber),
    enabled: Boolean(bundleNumber),
  });

  const journeyQuery = useQuery({
    queryKey: [...QUERY_KEYS.BUNDLES, bundleNumber, "journey"],
    queryFn: () => getBundleJourney(bundleNumber),
    enabled: Boolean(bundleNumber),
  });

  const paymentsQuery = useQuery({
    queryKey: [...QUERY_KEYS.BUNDLES, bundleNumber, "payments"],
    queryFn: () => getBundlePayments(bundleNumber),
    enabled: Boolean(bundleNumber),
  });

  if (summaryQuery.isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (summaryQuery.isError || !summaryQuery.data?.data) {
    return (
      <EmptyState
        title="Bundle not found"
        description={`No tracking data found for ${bundleNumber}.`}
        actionLabel="Back to Production"
        onAction={() => router.push(ROUTES.PRODUCTION.ROOT)}
      />
    );
  }

  const summary = summaryQuery.data.data;

  return (
    <div>
      <PageHeader
        title="Bundle Tracking"
        subtitle={`${summary.bundleNumber} · ${summary.poNumber}${summary.designNumber ? ` · ${summary.designNumber}` : ""}${summary.garmentType ? ` · ${summary.garmentType}` : ""}`}
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
        <BundleSummaryCard summary={summary} />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Stage by Stage Progress
          </h2>
          {journeyQuery.isLoading ? (
            <TableSkeleton rows={4} />
          ) : journeyQuery.isError || !journeyQuery.data?.data ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-slate-600">Could not load journey.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void journeyQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <BundleJourneyTimeline
              journey={journeyQuery.data.data}
              currentStage={summary.currentStage}
            />
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Karigar Payments
          </h2>
          {paymentsQuery.isLoading ? (
            <TableSkeleton rows={3} />
          ) : paymentsQuery.isError || !paymentsQuery.data?.data ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-slate-600">Could not load payments.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void paymentsQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <BundlePaymentsTable
              payments={paymentsQuery.data.data.data}
              totalPayment={paymentsQuery.data.data.totalPaymentForBundle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
