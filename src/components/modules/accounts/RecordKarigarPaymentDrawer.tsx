"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import type { MockKarigarPayment } from "@/mock/accounts";
import { poNumberForId } from "@/mock/accounts";
import { DrawerForm } from "@/components/common/DrawerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";

const schema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const modes = ["Cash", "Bank Transfer", "UPI", "Cheque"] as const;

interface RecordKarigarPaymentDrawerProps {
  open: boolean;
  payment: MockKarigarPayment | null;
  onClose: () => void;
  onConfirm: (values: FormValues) => void;
}

export function RecordKarigarPaymentDrawer({
  open,
  payment,
  onClose,
  onConfirm,
}: RecordKarigarPaymentDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentDate: "",
      paymentMode: "Cash",
      referenceNo: "",
      notes: "",
    },
  });

  const paymentMode = watch("paymentMode");

  useEffect(() => {
    if (!open || !payment) return;
    reset({
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMode: "Cash",
      referenceNo: "",
      notes: "",
    });
  }, [open, payment, reset]);

  function onSubmit(values: FormValues) {
    if (!payment) return;
    onConfirm(values);
    toast.success(
      `Payment of ${formatCurrency(payment.amountDue)} confirmed for ${payment.karigar.name}.`
    );
    onClose();
  }

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
          onSubmit={handleSubmit(onSubmit)}
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
                  {payment.operation.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  PO Number
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {poNumberForId(payment.poId)}
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
                  {formatCurrency(payment.ratePerPiece)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Amount Due
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(payment.amountDue)}
                </span>
              </div>
              <p className="mt-2 text-xs text-red-600">
                Amount cannot be changed.
              </p>
            </div>
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {modes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    setValue("paymentMode", mode, { shouldValidate: true })
                  }
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium",
                    paymentMode === mode
                      ? "border-[#1b3a3a] bg-[#1b3a3a] text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  )}
                >
                  {mode === "Bank Transfer" ? "Bank" : mode}
                </button>
              ))}
            </div>
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
