import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

interface LegacyBillDetailRouteProps {
  params: { id: string };
}

export default function LegacyBillDetailRoute({
  params,
}: LegacyBillDetailRouteProps) {
  redirect(ROUTES.PURCHASE.DETAIL(params.id));
}
