import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function BoxingIndexPage() {
  redirect(ROUTES.BOXING.BOXES);
}
