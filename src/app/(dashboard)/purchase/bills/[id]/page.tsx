import { BillDetailPage } from "@/components/modules/purchase/BillDetailPage";

interface PurchaseBillDetailRouteProps {
  params: { id: string };
}

export default function PurchaseBillDetailRoute({
  params,
}: PurchaseBillDetailRouteProps) {
  return <BillDetailPage billId={params.id} />;
}
