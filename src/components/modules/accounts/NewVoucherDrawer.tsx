"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import {
  generateNextVoucherNumber,
  type MockVoucher,
  type VoucherType,
} from "@/mock/accounts";
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
import { cn } from "@/lib/utils";

const schema = z.object({
  type: z.enum(["PAYMENT", "RECEIPT"]),
  partyDescription: z.string().min(2, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  referenceNo: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface NewVoucherDrawerProps {
  open: boolean;
  existing: MockVoucher[];
  onClose: () => void;
  onSave: (voucher: MockVoucher) => void;
}

export function NewVoucherDrawer({
  open,
  existing,
  onClose,
  onSave,
}: NewVoucherDrawerProps) {
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
      type: "PAYMENT",
      partyDescription: "",
      amount: 0,
      paymentMode: "Bank Transfer",
      referenceNo: "",
      date: "",
      notes: "",
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (!open) return;
    reset({
      type: "PAYMENT",
      partyDescription: "",
      amount: 0,
      paymentMode: "Bank Transfer",
      referenceNo: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    });
  }, [open, reset]);

  function onSubmit(values: FormValues) {
    const voucherNumber = generateNextVoucherNumber(existing);
    const voucher: MockVoucher = {
      id: `vch-${Date.now()}`,
      voucherNumber,
      date: values.date,
      type: values.type as VoucherType,
      partyDescription: values.partyDescription,
      amount: values.amount,
      paymentMode: values.paymentMode,
      referenceNo: values.referenceNo || "—",
      notes: values.notes,
    };
    onSave(voucher);
    toast.success(`Voucher ${voucherNumber} saved.`);
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="New Voucher"
      description="Record cash or bank transaction"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="new-voucher-form"
            disabled={isSubmitting}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Voucher
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <form
        id="new-voucher-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label>Voucher Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("type", "PAYMENT")}
              className={cn(
                "rounded-xl border p-4 text-left",
                type === "PAYMENT"
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white"
              )}
            >
              <ArrowUpRight className="mb-2 size-5 text-red-600" />
              <p className="font-semibold text-slate-900">Payment</p>
              <p className="text-xs text-muted-foreground">Money going out</p>
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "RECEIPT")}
              className={cn(
                "rounded-xl border p-4 text-left",
                type === "RECEIPT"
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white"
              )}
            >
              <ArrowDownLeft className="mb-2 size-5 text-emerald-600" />
              <p className="font-semibold text-slate-900">Receipt</p>
              <p className="text-xs text-muted-foreground">Money coming in</p>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="v-party">Party / Description</Label>
          <Input
            id="v-party"
            placeholder="e.g. Electricity Bill, Factory Rent"
            {...register("partyDescription")}
          />
          <p className="text-xs text-muted-foreground">
            Enter party name or expense description. e.g. Electricity Bill,
            Factory Rent, Al Reem Trading
          </p>
          {errors.partyDescription ? (
            <p className="text-sm text-destructive">
              {errors.partyDescription.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="v-amount">Amount ₹</Label>
          <Input
            id="v-amount"
            type="number"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount ? (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
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
              <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="v-ref">Reference No</Label>
          <Input id="v-ref" {...register("referenceNo")} />
          <p className="text-xs text-muted-foreground">
            Bank ref, UPI ID, or cheque number
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="v-date">Date</Label>
          <Input id="v-date" type="date" {...register("date")} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="v-notes">Notes</Label>
          <Textarea id="v-notes" rows={3} {...register("notes")} />
        </div>
      </form>
    </DrawerForm>
  );
}
