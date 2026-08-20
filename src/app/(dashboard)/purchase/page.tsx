import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function PurchaseIndexPage() {
  redirect(ROUTES.PURCHASE.BILLS);
}
