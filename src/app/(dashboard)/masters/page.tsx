import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function MastersPage() {
  redirect(ROUTES.MASTERS.PARTY);
}
