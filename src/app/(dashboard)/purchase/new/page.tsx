import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

interface LegacyNewPurchasePageProps {
  searchParams: { poId?: string };
}

export default function LegacyNewPurchasePage({
  searchParams,
}: LegacyNewPurchasePageProps) {
  const query = searchParams.poId ? `?poId=${searchParams.poId}` : "";
  redirect(`${ROUTES.PURCHASE.NEW}${query}`);
}
