import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function ContainersRedirectPage() {
  redirect(ROUTES.BOXING.BOXES);
}
