"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Lock } from "lucide-react";
import type { KarigarPayment } from "@/types";
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

const schema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  amountPaid: z.number().positive("Amount must be greater than 0"),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});

export type RecordKarigarPaymentFormValues = z.infer<typeof schema>;

interface RecordKarigarPaymentDrawerProps {
  open: boolean;
  payment: KarigarPayment | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (values: RecordKarigarPaymentFormValues) => void;
}

export function RecordKarigarPaymentDrawer({
  open,
  payment,
  isSubmitting = false,
  onClose,
  onConfirm,
}: RecordKarigarPaymentDrawerProps) {
  const outstanding = payment
    ? Number((Number(payment.amountDue) - Number(payment.amountPaid ?? 0)).toFixed(2))
    : 0;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordKarigarPaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentDate: todayInputValue(),
      paymentMode: "CASH",
      amountPaid: outstanding,
      referenceNo: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open || !payment) return;
    const pending = Number(
      (Number(payment.amountDue) - Number(payment.amountPaid ?? 0)).toFixed(2)
    );
    reset({
      paymentDate: todayInputValue(),
      paymentMode: "CASH",
      amountPaid: pending,
      referenceNo: "",
      notes: "",
    });
  }, [open, payment, reset]);

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Payment"
      description={payment?.karigar.name}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="record-karigar-payment-form"
            disabled={isSubmitting || !payment}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Confirm Payment
            <CheckCircle2 className="size-4" />
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      {payment ? (
        <form
          id="record-karigar-payment-form"
          onSubmit={handleSubmit(onConfirm)}
          className="flex flex-col gap-4"
        >
          <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Karigar
                </p>
                <p className="mt-1 text-sm font-semibold">{payment.karigar.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Operation
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {payment.operation?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  PO Number
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {payment.po?.poNumber ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Pieces Completed
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {payment.piecesCompleted}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-teal-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                  Rate / Piece
                  <Lock className="size-3.5 text-slate-400" />
                </span>
                <span className="font-medium">
                  {formatCurrency(Number(payment.ratePerPiece))}/pc
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Amount Due</span>
                <span className="font-medium">
                  {formatCurrency(Number(payment.amountDue))}
                </span>
              </div>
              {Number(payment.amountPaid ?? 0) > 0 ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Already Paid</span>
                  <span className="font-medium">
                    {formatCurrency(Number(payment.amountPaid))}
                  </span>
                </div>
              ) : null}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Outstanding</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(outstanding)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="kp-amount">Payment Amount (₹)</Label>
            <Input
              id="kp-amount"
              type="number"
              step="0.01"
              max={outstanding}
              {...register("amountPaid", { valueAsNumber: true })}
            />
            {errors.amountPaid ? (
              <p className="text-sm text-destructive">{errors.amountPaid.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter full or partial payment up to {formatCurrency(outstanding)}.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="kp-date">Payment Date</Label>
            <Input id="kp-date" type="date" {...register("paymentDate")} />
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
            {errors.paymentMode ? (
              <p className="text-sm text-destructive">
                {errors.paymentMode.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="kp-ref">Reference No.</Label>
            <Input
              id="kp-ref"
              placeholder="TXN-987234..."
              {...register("referenceNo")}
            />
            <p className="text-xs text-muted-foreground">
              Bank ref, UPI ID, or cheque number
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="kp-notes">Notes</Label>
            <Textarea
              id="kp-notes"
              rows={3}
              placeholder="Additional details..."
              {...register("notes")}
            />
          </div>
        </form>
      ) : null}
    </DrawerForm>
  );
}
