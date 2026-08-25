"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { CreatePartyPayload, Party } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errorHandler";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { createParty, updateParty } from "@/services/masters.service";

const partySchema = z.object({
  name: z.string().min(1, "Party name is required"),
  type: z.enum(["BUYER", "SUPPLIER", "KARIGAR"]),
  contact: z.string().min(1, "Contact number is required"),
  gstNumber: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  bankName: z.string().optional(),
  isActive: z.boolean(),
});

type PartyFormValues = z.infer<typeof partySchema>;

interface PartyDrawerProps {
  open: boolean;
  onClose: () => void;
  party?: Party | null;
}

const defaultValues: PartyFormValues = {
  name: "",
  type: "BUYER",
  contact: "+91",
  gstNumber: "",
  city: "",
  country: "UAE",
  bankAccount: "",
  ifsc: "",
  bankName: "",
  isActive: true,
};

function toPayload(values: PartyFormValues): CreatePartyPayload {
  return {
    name: values.name,
    type: values.type,
    contact: values.contact,
    gstNumber: values.gstNumber || undefined,
    city: values.city,
    country: values.country,
    bankAccount: values.bankAccount || undefined,
    ifsc: values.ifsc || undefined,
    bankName: values.bankName || undefined,
  };
}

export function PartyDrawer({ open, onClose, party }: PartyDrawerProps) {
  const isEdit = Boolean(party);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues,
  });

  const typeValue = watch("type");
  const countryValue = watch("country");
  const isActive = watch("isActive");

  useEffect(() => {
    if (!open) return;
    if (party) {
      reset({
        name: party.name,
        type: party.type,
        contact: party.contact ?? "+91",
        gstNumber: party.gstNumber ?? "",
        city: party.city ?? "",
        country: party.country ?? "UAE",
        bankAccount: party.bankAccount ?? "",
        ifsc: party.ifsc ?? "",
        bankName: party.bankName ?? "",
        isActive: party.isActive,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, party, reset]);

  const addPartyMutation = useMutation({
    mutationFn: (data: CreatePartyPayload) => createParty(data),
    onSuccess: () => {
      toast.success("Party added successfully.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARTIES });
      onClose();
      reset(defaultValues);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add party."));
    },
  });

  const editPartyMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreatePartyPayload>;
    }) => updateParty(id, data),
    onSuccess: () => {
      toast.success("Party updated.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARTIES });
      if (party?.id) {
        void queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.PARTIES, party.id],
        });
      }
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update party."));
    },
  });

  const isPending = addPartyMutation.isPending || editPartyMutation.isPending;

  function onSubmit(values: PartyFormValues) {
    const payload = toPayload(values);
    if (isEdit && party) {
      editPartyMutation.mutate({ id: party.id, data: payload });
      return;
    }
    addPartyMutation.mutate(payload);
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Party" : "Add New Party"}
      description="Enter registration and contact details"
      footer={
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            form="party-form"
            disabled={isPending}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            <Check className="size-4" />
            {isPending ? "Saving..." : isEdit ? "Update Party" : "Save Party"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
        </div>
      }
    >
      <form id="party-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Entity Information
          </h3>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Party Name <span className="text-red-500">*</span>
            </Label>
            <Input id="name" placeholder="e.g. Reliance Trends" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={typeValue}
              onValueChange={(value) =>
                setValue("type", value as PartyFormValues["type"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYER">Buyer</SelectItem>
                <SelectItem value="SUPPLIER">Supplier</SelectItem>
                <SelectItem value="KARIGAR">Karigar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Location & Identification
          </h3>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact">
              Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input id="contact" placeholder="+91" {...register("contact")} />
            {errors.contact ? (
              <p className="text-sm text-destructive">{errors.contact.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gstNumber">GST Number (Optional)</Label>
            <Input
              id="gstNumber"
              placeholder="22AAAAA0000A1Z5"
              {...register("gstNumber")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input id="city" placeholder="Enter City" {...register("city")} />
            {errors.city ? (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Country</Label>
            <Select
              value={countryValue}
              onValueChange={(value) =>
                setValue("country", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UAE">UAE</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Bank Details
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Used for automated Karigar and Supplier disbursements.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bankAccount">Account Number</Label>
              <Input
                id="bankAccount"
                placeholder="0000 0000 0000 00"
                {...register("bankAccount")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ifsc">IFSC Code</Label>
                <Input id="ifsc" placeholder="SBIN0000" {...register("ifsc")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="State Bank of India"
                  {...register("bankName")}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Active Status</p>
            <p className="text-xs text-muted-foreground">
              Use Activate/Deactivate on the list to change status after save.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setValue("isActive", !isActive)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isActive ? "bg-[#1b3a3a]" : "bg-slate-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                isActive ? "left-5" : "left-0.5"
              )}
            />
          </button>
        </section>
      </form>
    </DrawerForm>
  );
}
