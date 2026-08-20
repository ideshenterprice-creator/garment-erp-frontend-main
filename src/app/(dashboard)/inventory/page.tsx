import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function InventoryIndexPage() {
  redirect(ROUTES.INVENTORY.STOCK);
}
