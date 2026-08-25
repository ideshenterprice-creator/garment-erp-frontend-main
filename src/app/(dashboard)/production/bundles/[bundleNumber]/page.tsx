"use client";

import { BundleTrackingPage } from "@/components/modules/production/BundleTrackingPage";

interface BundlePageProps {
  params: { bundleNumber: string };
}

export default function ProductionBundlePage({ params }: BundlePageProps) {
  const bundleNumber = decodeURIComponent(params.bundleNumber);
  return <BundleTrackingPage bundleNumber={bundleNumber} />;
}
