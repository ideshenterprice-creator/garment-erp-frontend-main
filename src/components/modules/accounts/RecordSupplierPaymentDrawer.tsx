"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import type { MockSupplierPayment } from "@/mock/accounts";
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
import { formatCurrency } from "@/lib/utils";

interface RecordSupplierPaymentDrawerProps {
  open: boolean;
  payment: MockSupplierPayment | null;
  onClose: () => void;
  onConfirm: (values: {
    amountPaid: number;
    paymentDate: string;
    paymentMode: string;
    referenceNo?: string;
    notes?: string;
  }) => void;
}

export function RecordSupplierPaymentDrawer({
  open,
  payment,
  onClose,
  onConfirm,
}: RecordSupplierPaymentDrawerProps) {
  const balanceDue = payment?.balanceDue ?? 0;

  const schema = z.object({
    amountPaid: z
      .number()
      .positive("Amount must be positive")
      .refine((value) => value <= balanceDue, {
        message: `Amount exceeds balance due of ${formatCurrency(balanceDue)}`,
      }),
    paymentDate: z.string().min(1, "Payment date is required"),
    paymentMode: z.string().min(1, "Payment mode is required"),
    referenceNo: z.string().optional(),
    notes: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

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
      amountPaid: 0,
      paymentDate: "",
      paymentMode: "Bank Transfer",
      referenceNo: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open || !payment) return;
    reset({
      amountPaid: payment.balanceDue,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMode: "Bank Transfer",
      referenceNo: "",
      notes: "",
    });
  }, [open, payment, reset]);

  function onSubmit(values: FormValues) {
    onConfirm(values);
    toast.success("Payment recorded.");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Payment"
      description="Add or edit system information"
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
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Supplier
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {payment.supplierName}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Bill Number
                </p>
                <p className="mt-1 text-sm font-semibold">{payment.billNo}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Bill Date
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {format(new Date(payment.billDate), "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Amount
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(payment.billAmount)}
                </p>
              </div>
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Paid To Date
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(payment.amountPaid)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500">
                  Balance Due
                </p>
                <p className="mt-1 text-sm font-bold text-red-600">
                  {formatCurrency(payment.balanceDue)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-amount">Amount to Pay (₹)</Label>
            <Input
              id="sp-amount"
              type="number"
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
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
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
