import { PODetailPage } from "@/components/modules/purchase-orders/PODetailPage";

interface PurchaseOrderDetailRouteProps {
  params: { id: string };
}

export default function PurchaseOrderDetailRoute({
  params,
}: PurchaseOrderDetailRouteProps) {
  return <PODetailPage poId={params.id} />;
}
