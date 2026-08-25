"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import { login } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiError";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);

    try {
      const response = await login(values.email, values.password);
      const { accessToken, user } = response.data;

      setAuth(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken
      );

      toast.success(`Welcome back, ${user.name}!`);
      router.push(ROUTES.MASTERS.PARTY);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Invalid email or password")
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
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

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-10 md:w-[60%] md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <h1 className="text-2xl font-bold text-[#1b3a3a]">FabricFlow ERP</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Contact your administrator if you don&apos;t have access.
          </p>
        </div>
      </div>
    </div>
  );
}
