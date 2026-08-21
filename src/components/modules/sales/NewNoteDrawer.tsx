"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  generateNextNoteNumber,
  mockSalesBills,
  type MockCreditDebitNote,
  type NoteType,
} from "@/mock/sales";
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
  type: z.enum(["CREDIT", "DEBIT"]),
  salesBillId: z.string().min(1, "Linked invoice is required"),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof schema>;

interface NewNoteDrawerProps {
  open: boolean;
  existing: MockCreditDebitNote[];
  initialBillId?: string;
  onClose: () => void;
  onSave: (note: MockCreditDebitNote) => void;
}

export function NewNoteDrawer({
  open,
  existing,
  initialBillId,
  onClose,
  onSave,
}: NewNoteDrawerProps) {
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
      type: "CREDIT",
      salesBillId: "",
      amount: 0,
      reason: "",
      date: "",
    },
  });

  const type = watch("type");
  const salesBillId = watch("salesBillId");
  const bill = mockSalesBills.find((item) => item.id === salesBillId);

  useEffect(() => {
    if (!open) return;
    reset({
      type: "CREDIT",
      salesBillId: initialBillId ?? "",
      amount: 0,
      reason: "",
      date: new Date().toISOString().slice(0, 10),
    });
  }, [open, initialBillId, reset]);

  function onSubmit(values: FormValues) {
    const linked = mockSalesBills.find((item) => item.id === values.salesBillId);
    if (!linked) return;

    const note: MockCreditDebitNote = {
      id: `note-${Date.now()}`,
      noteNumber: generateNextNoteNumber(existing, values.type as NoteType),
      type: values.type,
      salesBillId: values.salesBillId,
      invoiceNumber: linked.invoiceNumber,
      buyerId: linked.buyerId,
      buyerName: linked.buyer.name,
      date: values.date,
      amount: values.amount,
      reason: values.reason,
    };

    onSave(note);
    toast.success("Note saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="New Note"
      description="Create a credit or debit note"
      footer={
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="new-note-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Note
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
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
        <div className="flex flex-col gap-2">
          <Label>Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["CREDIT", "DEBIT"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setValue("type", option)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium",
                  type === option
                    ? "border-slate-900 bg-white"
                    : "border-slate-200 text-slate-600"
                )}
              >
                {option === "CREDIT" ? "Credit Note" : "Debit Note"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Linked Invoice</Label>
          <Select
            value={salesBillId}
            onValueChange={(value) =>
              setValue("salesBillId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select invoice" />
            </SelectTrigger>
            <SelectContent>
              {mockSalesBills
                .filter((b) => b.status === "SUBMITTED" || b.status === "PAID")
                .map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.invoiceNumber}
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
            readOnly
            className="bg-slate-50"
            value={bill?.buyer.name ?? ""}
            placeholder="Auto-filled from invoice"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="noteAmount">Amount ₹</Label>
          <Input
            id="noteAmount"
            type="number"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount ? (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="noteReason">Reason</Label>
          <Textarea id="noteReason" rows={3} {...register("reason")} />
          {errors.reason ? (
            <p className="text-sm text-destructive">{errors.reason.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="noteDate">Date</Label>
          <Input id="noteDate" type="date" {...register("date")} />
        </div>
      </form>
    </DrawerForm>
  );
}
