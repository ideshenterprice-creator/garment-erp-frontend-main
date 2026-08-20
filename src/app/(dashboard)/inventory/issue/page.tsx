import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function InventoryIssueIndexPage() {
  redirect(ROUTES.INVENTORY.ISSUE_NEW);
}
