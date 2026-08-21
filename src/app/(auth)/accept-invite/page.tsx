"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "newuser@fabricflow.com";
  const token = searchParams.get("token") ?? "missing-token";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit() {
    // TODO: Replace with real API call
    // POST /api/auth/accept-invite
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      toast.success("Account activated!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[40%] flex-col items-center justify-center bg-[#1b3a3a] px-10 md:flex">
        <div className="max-w-sm text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            FabricFlow ERP
          </h1>
          <p className="mt-3 text-base text-white/80">
            Garment Manufacturing Suite
          </p>
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            Manage production, inventory, Karigar payments, and exports from one
            place.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-10 md:w-[60%] md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <h1 className="text-2xl font-bold text-[#1b3a3a]">FabricFlow ERP</h1>
          </div>

          {success ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Account activated!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You can now log in with your email and password.
              </p>
              <Button
                type="button"
                className="mt-8 h-11 w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Set Up Your Account
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You&apos;ve been invited to join FabricFlow ERP. Create your
                  password to get started.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
                noValidate
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    value={email}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Create Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pr-10"
                      disabled={isLoading}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      className="pr-10"
                      disabled={isLoading}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword ? (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Activating..." : "Activate Account"}
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Dev: Token = {token}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading invite...
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
