"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getBundleByNumber } from "@/mock/production";
import { BundleTrackingPage } from "@/components/modules/production/BundleTrackingPage";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";

interface BundlePageProps {
  params: { bundleNumber: string };
}

export default function ProductionBundlePage({ params }: BundlePageProps) {
  const router = useRouter();
  const bundleNumber = decodeURIComponent(params.bundleNumber);

  const bundle = useMemo(
    () => getBundleByNumber(bundleNumber),
    [bundleNumber]
  );

  if (!bundle) {
    return (
      <EmptyState
        title="Bundle not found"
        description={`No tracking data found for ${bundleNumber}.`}
        actionLabel="Back to Production"
        onAction={() => router.push(ROUTES.PRODUCTION.ROOT)}
      />
    );
  }

  return <BundleTrackingPage bundle={bundle} />;
}
