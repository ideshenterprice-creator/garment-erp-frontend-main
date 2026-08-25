"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import type { SupplierBillPaymentRow } from "@/types";
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
import { ACCOUNT_PAYMENT_MODES, todayInputValue } from "@/lib/accounts";
import { formatCurrency } from "@/lib/utils";

export type RecordSupplierPaymentFormValues = {
  amountPaid: number;
  paymentDate: string;
  paymentMode: string;
  referenceNo?: string;
  notes?: string;
};

interface RecordSupplierPaymentDrawerProps {
  open: boolean;
  payment: SupplierBillPaymentRow | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (values: RecordSupplierPaymentFormValues) => void;
}

export function RecordSupplierPaymentDrawer({
  open,
  payment,
  isSubmitting = false,
  onClose,
  onConfirm,
}: RecordSupplierPaymentDrawerProps) {
  const balanceDue = payment ? Number(payment.outstanding) : 0;

  const schema = z.object({
    amountPaid: z
      .number()
      .positive("Amount must be positive")
      .refine((value) => value <= balanceDue + 1e-9, {
        message: `Amount exceeds balance due of ${formatCurrency(balanceDue)}`,
      }),
    paymentDate: z.string().min(1, "Payment date is required"),
    paymentMode: z.string().min(1, "Payment mode is required"),
    referenceNo: z.string().optional(),
    notes: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordSupplierPaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amountPaid: 0,
      paymentDate: todayInputValue(),
      paymentMode: "BANK_TRANSFER",
      referenceNo: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open || !payment) return;
    reset({
      amountPaid: Number(payment.outstanding),
      paymentDate: todayInputValue(),
      paymentMode: "BANK_TRANSFER",
      referenceNo: "",
      notes: "",
    });
  }, [open, payment, reset]);

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Payment"
      description={payment?.billNumber}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            form="record-supplier-payment-form"
            disabled={isSubmitting || !payment}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90 sm:flex-1"
          >
            Confirm Payment
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      {payment ? (
        <form
          id="record-supplier-payment-form"
          onSubmit={handleSubmit(onConfirm)}
          className="flex flex-col gap-4"
        >
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Supplier
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {payment.supplier?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Bill Number
                </p>
                <p className="mt-1 text-sm font-semibold">{payment.billNumber}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Bill Date
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {format(new Date(payment.purchaseDate), "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Bill Amount
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(Number(payment.totalAmount))}
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Amount Already Paid
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(Number(payment.totalPaid))}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500">
                  Balance Due
                </p>
                <p className="mt-1 text-sm font-bold text-red-600">
                  {formatCurrency(Number(payment.outstanding))}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-amount">Amount to Pay (₹)</Label>
            <Input
              id="sp-amount"
              type="number"
              step="0.01"
              {...register("amountPaid", { valueAsNumber: true })}
            />
            <p className="text-xs italic text-muted-foreground">
              You can enter partial amount if needed.
            </p>
            {errors.amountPaid ? (
              <p className="text-sm text-destructive">
                {errors.amountPaid.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-date">Payment Date</Label>
            <Input id="sp-date" type="date" {...register("paymentDate")} />
            {errors.paymentDate ? (
              <p className="text-sm text-destructive">
                {errors.paymentDate.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Payment Mode</Label>
            <Select
              value={watch("paymentMode")}
              onValueChange={(value) =>
                setValue("paymentMode", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_PAYMENT_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-ref">Reference No (Optional)</Label>
            <Input
              id="sp-ref"
              placeholder="e.g. TXN-99887766"
              {...register("referenceNo")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-notes">Notes</Label>
            <Textarea
              id="sp-notes"
              rows={3}
              placeholder="Add internal payment notes..."
              {...register("notes")}
            />
          </div>
        </form>
      ) : null}
    </DrawerForm>
  );
}
