"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { MockSalesBill } from "@/mock/sales";
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

const schema = z.object({
  amountReceived: z.number().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RecordPaymentDrawerProps {
  open: boolean;
  bill: MockSalesBill | null;
  onClose: () => void;
  onSave: (values: FormValues) => void;
}

export function RecordPaymentDrawer({
  open,
  bill,
  onClose,
  onSave,
}: RecordPaymentDrawerProps) {
  const outstanding = bill
    ? Math.max(0, bill.netTotal - bill.amountReceived)
    : 0;

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
      amountReceived: 0,
      paymentDate: "",
      paymentMode: "Wire Transfer",
      referenceNo: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open || !bill) return;
    reset({
      amountReceived: outstanding,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMode: "Wire Transfer",
      referenceNo: "",
      notes: "",
    });
  }, [open, bill, outstanding, reset]);

  function onSubmit(values: FormValues) {
    onSave(values);
    toast.success("Payment recorded successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Payment"
      description={bill ? bill.invoiceNumber : undefined}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="record-payment-form"
            disabled={isSubmitting || !bill}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Payment
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      {bill ? (
        <form
          id="record-payment-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm">
            <p className="font-medium text-slate-900">{bill.buyer.name}</p>
            <p className="text-muted-foreground">
              Outstanding: {formatCurrency(outstanding)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amountReceived">Amount Received</Label>
            <Input
              id="amountReceived"
              type="number"
              {...register("amountReceived", { valueAsNumber: true })}
            />
            {errors.amountReceived ? (
              <p className="text-sm text-destructive">
                {errors.amountReceived.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input id="paymentDate" type="date" {...register("paymentDate")} />
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
                <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                <SelectItem value="LC">Letter of Credit</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="referenceNo">Reference No</Label>
            <Input id="referenceNo" {...register("referenceNo")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payNotes">Notes</Label>
            <Textarea id="payNotes" rows={2} {...register("notes")} />
          </div>
        </form>
      ) : null}
    </DrawerForm>
  );
}
