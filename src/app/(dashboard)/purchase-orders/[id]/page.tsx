"use client";

import { useParams } from "next/navigation";
import { PODetailPage } from "@/components/modules/purchase-orders/PODetailPage";

export default function PurchaseOrderDetailRoute() {
  const params = useParams<{ id: string }>();
  return <PODetailPage poId={params.id} />;
}
