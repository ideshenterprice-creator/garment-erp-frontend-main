import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-content-bg p-6">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link href={ROUTES.AUTH.LOGIN} className="text-primary underline">
        Go to Login
      </Link>
    </div>
  );
}
