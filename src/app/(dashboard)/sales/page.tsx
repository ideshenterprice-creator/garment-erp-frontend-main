import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function SalesIndexPage() {
  redirect(ROUTES.SALES.BILLS);
}
