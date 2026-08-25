"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { CreateSalesNotePayload, SalesNoteType } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { toIsoDate, todayInputValue } from "@/lib/sales";
import { cn } from "@/lib/utils";
import { createNote, getSalesBills } from "@/services/sales.service";

const schema = z.object({
  type: z.enum(["CREDIT", "DEBIT"]),
  salesBillId: z.string().uuid("Linked invoice is required"),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().min(1, "Reason is required"),
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof schema>;

interface NewNoteDrawerProps {
  open: boolean;
  initialBillId?: string;
  onClose: () => void;
}

export function NewNoteDrawer({
  open,
  initialBillId,
  onClose,
}: NewNoteDrawerProps) {
  const queryClient = useQueryClient();

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
      type: "CREDIT",
      salesBillId: "",
      amount: 0,
      reason: "",
      date: todayInputValue(),
    },
  });

  const type = watch("type");
  const salesBillId = watch("salesBillId");

  const invoicesQuery = useQuery({
    queryKey: [...QUERY_KEYS.SALES_BILLS, "notes-invoices"],
    queryFn: async () => {
      const [submitted, paid] = await Promise.all([
        getSalesBills({ status: "SUBMITTED", limit: 100 }),
        getSalesBills({ status: "PAID", limit: 100 }),
      ]);
      const merged = [
        ...(submitted.data.data ?? []),
        ...(paid.data.data ?? []),
      ];
      return Array.from(new Map(merged.map((bill) => [bill.id, bill])).values());
    },
    enabled: open,
  });

  const invoices = invoicesQuery.data ?? [];
  const selectedBill = invoices.find((bill) => bill.id === salesBillId);

  useEffect(() => {
    if (!open) return;
    reset({
      type: "CREDIT",
      salesBillId: initialBillId ?? "",
      amount: 0,
      reason: "",
      date: todayInputValue(),
    });
  }, [open, initialBillId, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSalesNotePayload) => createNote(data),
    onSuccess: () => {
      toast.success("Note created.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_NOTES });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create note."));
    },
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate({
      type: values.type,
      salesBillId: values.salesBillId,
      amount: values.amount,
      reason: values.reason,
      date: toIsoDate(values.date),
    });
  }

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="New Credit / Debit Note"
      description="Raise an adjustment against a submitted or paid invoice"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="new-note-form"
            disabled={createMutation.isPending}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Create Note"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <form
        id="new-note-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex gap-2">
          {(["CREDIT", "DEBIT"] as SalesNoteType[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setValue("type", option, { shouldValidate: true })}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                type === option
                  ? "border-[#1b3a3a] bg-[#1b3a3a]/5 text-[#1b3a3a]"
                  : "border-slate-200 text-slate-600"
              )}
            >
              {option === "CREDIT" ? "Credit Note" : "Debit Note"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Linked Invoice *</Label>
          <Select
            value={salesBillId || undefined}
            onValueChange={(value) =>
              setValue("salesBillId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  invoicesQuery.isLoading ? "Loading..." : "Select invoice"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {invoices.map((bill) => (
                <SelectItem key={bill.id} value={bill.id}>
                  {bill.invoiceNumber} — {bill.buyer?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.salesBillId ? (
            <p className="text-sm text-destructive">
              {errors.salesBillId.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Buyer</Label>
          <Input
            value={selectedBill?.buyer?.name ?? ""}
            readOnly
            disabled
            className="bg-slate-50"
            placeholder="Select an invoice"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-amount">Amount *</Label>
            <Input
              id="note-amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount ? (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-date">Date *</Label>
            <Input id="note-date" type="date" {...register("date")} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="note-reason">Reason *</Label>
          <Textarea id="note-reason" rows={3} {...register("reason")} />
          {errors.reason ? (
            <p className="text-sm text-destructive">{errors.reason.message}</p>
          ) : null}
        </div>
      </form>
    </DrawerForm>
  );
}
