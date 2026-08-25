"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { inviteMember } from "@/services/team.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getApiErrorMessage } from "@/lib/apiError";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["ADMIN", "TEAM_MEMBER"]),
});

type FormValues = z.infer<typeof schema>;

interface InviteMemberDrawerProps {
  open: boolean;
  existingEmails: string[];
  onClose: () => void;
}

export function InviteMemberDrawer({
  open,
  existingEmails,
  onClose,
}: InviteMemberDrawerProps) {
  const queryClient = useQueryClient();
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "TEAM_MEMBER",
    },
  });

  const role = watch("role");

  const inviteMutation = useMutation({
    mutationFn: (formData: FormValues) =>
      inviteMember({
        name: formData.name,
        email: formData.email,
        role: formData.role as UserRole,
      }),
    onSuccess: (response, variables) => {
      setInviteLink(response.data.inviteLink ?? "");
      setSuccessEmail(variables.email);
      toast.success(response.message || `Invite prepared for ${variables.email}`);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM_MEMBERS });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    if (!open) return;
    setSuccessEmail(null);
    setInviteLink("");
    reset({ name: "", email: "", role: "TEAM_MEMBER" });
  }, [open, reset]);

  function onSubmit(values: FormValues) {
    const exists = existingEmails.some(
      (email) => email.toLowerCase() === values.email.toLowerCase()
    );
    if (exists) {
      toast.error("A member with this email already exists.");
      return;
    }

    inviteMutation.mutate(values);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  function handleClose() {
    setSuccessEmail(null);
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={handleClose}
      title="Invite Team Member"
      description="An invite link will be sent to their email address."
      footer={
        successEmail ? (
          <Button
            type="button"
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
            onClick={handleClose}
          >
            Done
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              form="invite-member-form"
              disabled={inviteMutation.isPending}
              className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
            >
              {inviteMutation.isPending ? "Sending..." : "Send Invite"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        )
      }
    >
      {successEmail ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-7" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              Invite sent to {successEmail}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share this link manually during development. In production, this
              will be sent via email.
            </p>
          </div>
          {inviteLink ? (
            <div className="flex w-full items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left">
              <code className="flex-1 break-all text-xs text-slate-700">
                {inviteLink}
              </code>
              <Button type="button" size="icon" variant="outline" onClick={copyLink}>
                <Copy className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <form
          id="invite-member-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input
              id="invite-name"
              placeholder="Enter their full name"
              disabled={inviteMutation.isPending}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@company.com"
              disabled={inviteMutation.isPending}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Role</Label>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "ADMIN", { shouldValidate: true })}
                className={cn(
                  "rounded-xl border p-4 text-left",
                  role === "ADMIN"
                    ? "border-[#1b3a3a] bg-teal-50/50"
                    : "border-slate-200 bg-white"
                )}
              >
                <p className="font-semibold text-slate-900">Admin</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Full access to all modules including team management
                </p>
                <p className="mt-2 text-xs font-medium text-amber-700">
                  Admins have full system access.
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  setValue("role", "TEAM_MEMBER", { shouldValidate: true })
                }
                className={cn(
                  "rounded-xl border p-4 text-left",
                  role === "TEAM_MEMBER"
                    ? "border-[#1b3a3a] bg-teal-50/50"
                    : "border-slate-200 bg-white"
                )}
              >
                <p className="font-semibold text-slate-900">Team Member</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Can record entries and view data. Cannot manage team or
                  accounts.
                </p>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-sky-600" />
            <div>
              <p className="text-sm text-slate-700">
                An invite email will be sent to the provided address. The link
                expires in 48 hours.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Note: Email sending is not active yet. The invite link will be
                shown here for manual sharing during development.
              </p>
            </div>
          </div>
        </form>
      )}
    </DrawerForm>
  );
}
