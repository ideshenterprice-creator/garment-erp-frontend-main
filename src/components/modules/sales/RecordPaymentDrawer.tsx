"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  SALES_PAYMENT_MODES,
  toIsoDate,
  todayInputValue,
} from "@/lib/sales";
import { formatCurrency } from "@/lib/utils";
import {
  getSalesBillById,
  recordSalesPayment,
} from "@/services/sales.service";

const schema = z.object({
  amountReceived: z.number().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  referenceNo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RecordPaymentDrawerProps {
  open: boolean;
  billId: string | null;
  onClose: () => void;
}

export function RecordPaymentDrawer({
  open,
  billId,
  onClose,
}: RecordPaymentDrawerProps) {
  const queryClient = useQueryClient();
  const [amountError, setAmountError] = useState<string | null>(null);

  const billQuery = useQuery({
    queryKey: [...QUERY_KEYS.SALES_BILLS, billId],
    queryFn: () => getSalesBillById(billId!),
    enabled: open && Boolean(billId),
  });

  const bill = billQuery.data?.data;
  const outstanding =
    bill?.paymentRecord?.outstanding ??
    bill?.payment?.outstanding ??
    Number(bill?.netTotal ?? 0);

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
      amountReceived: 0,
      paymentDate: todayInputValue(),
      paymentMode: "BANK_TRANSFER",
      referenceNo: "",
    },
  });

  useEffect(() => {
    if (!open || !bill) return;
    setAmountError(null);
    reset({
      amountReceived: outstanding,
      paymentDate: todayInputValue(),
      paymentMode: "BANK_TRANSFER",
      referenceNo: "",
    });
  }, [open, bill, outstanding, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      recordSalesPayment(billId!, {
        amountReceived: values.amountReceived,
        paymentDate: toIsoDate(values.paymentDate),
        paymentMode: values.paymentMode,
        referenceNo: values.referenceNo || undefined,
      }),
    onSuccess: () => {
      toast.success("Payment recorded.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_BILLS });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to record payment."));
    },
  });

  function onSubmit(values: FormValues) {
    if (!billId) return;
    if (values.amountReceived > outstanding) {
      setAmountError(
        `Amount exceeds outstanding of ${formatCurrency(outstanding)}`
      );
      return;
    }
    setAmountError(null);
    mutation.mutate(values);
  }

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
      title="Record Payment"
      description={bill ? bill.invoiceNumber : undefined}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="record-payment-form"
            disabled={mutation.isPending || !bill || billQuery.isLoading}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {mutation.isPending ? "Saving..." : "Save Payment"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      }
    >
      {billQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading bill...</p>
      ) : bill ? (
        <form
          id="record-payment-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="space-y-1 rounded-lg bg-slate-50 px-3 py-3 text-sm">
            <p>
              <span className="text-muted-foreground">Bill No:</span>{" "}
              <span className="font-medium">{bill.invoiceNumber}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Buyer:</span>{" "}
              <span className="font-medium">{bill.buyer?.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-medium">
                {formatCurrency(Number(bill.netTotal))}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Outstanding:</span>{" "}
              <span className="font-medium text-red-600">
                {formatCurrency(outstanding)}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amountReceived">Amount Received *</Label>
            <Input
              id="amountReceived"
              type="number"
              step="0.01"
              {...register("amountReceived", { valueAsNumber: true })}
            />
            {errors.amountReceived ? (
              <p className="text-sm text-destructive">
                {errors.amountReceived.message}
              </p>
            ) : null}
            {amountError ? (
              <p className="text-sm text-destructive">{amountError}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <Input id="paymentDate" type="date" {...register("paymentDate")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Payment Mode *</Label>
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
                {SALES_PAYMENT_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="referenceNo">Reference No</Label>
            <Input id="referenceNo" {...register("referenceNo")} />
          </div>
        </form>
      ) : (
        <p className="text-sm text-red-600">Could not load bill details.</p>
      )}
    </DrawerForm>
  );
}
