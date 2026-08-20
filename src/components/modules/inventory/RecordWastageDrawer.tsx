"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
import { toast } from "sonner";
import {
  generateNextWastageNumber,
  mockKarigarParties,
  mockStockItems,
  type MockWastageEntry,
} from "@/mock/inventory";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";
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

const wastageSchema = z.object({
  poId: z.string().min(1, "Purchase order is required"),
  designCode: z.string().min(1, "Design code is required"),
  fabricProductId: z.string().min(1, "Fabric type is required"),
  wastageQty: z.number().positive("Wastage quantity must be positive"),
  returnedByPartyId: z.string().min(1, "Returned by is required"),
  dateOfReturn: z.string().min(1, "Date of return is required"),
  remarks: z.string().optional(),
});

type WastageFormValues = z.infer<typeof wastageSchema>;

interface RecordWastageDrawerProps {
  open: boolean;
  existing: MockWastageEntry[];
  onClose: () => void;
  onSave: (entry: MockWastageEntry) => void;
}

const fabricOptions = mockStockItems.filter(
  (item) =>
    item.product.category === "RAW_MATERIAL" ||
    item.product.category === "WASTAGE"
);

export function RecordWastageDrawer({
  open,
  existing,
  onClose,
  onSave,
}: RecordWastageDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WastageFormValues>({
    resolver: zodResolver(wastageSchema),
    defaultValues: {
      poId: "",
      designCode: "",
      fabricProductId: "",
      wastageQty: 0,
      returnedByPartyId: "",
      dateOfReturn: "2024-02-16",
      remarks: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      poId: "",
      designCode: "",
      fabricProductId: "",
      wastageQty: 0,
      returnedByPartyId: "",
      dateOfReturn: "2024-02-16",
      remarks: "",
    });
  }, [open, reset]);

  function onSubmit(values: WastageFormValues) {
    const po = mockPurchaseOrders.find((item) => item.id === values.poId);
    const fabric = fabricOptions.find(
      (item) => item.productId === values.fabricProductId
    );
    const returnedBy =
      mockKarigarParties.find((party) => party.id === values.returnedByPartyId)
        ?.name ?? "Unknown";

    const entry: MockWastageEntry = {
      id: `cw-${Date.now()}`,
      entryNumber: generateNextWastageNumber(existing),
      date: values.dateOfReturn,
      poId: values.poId,
      poNumber: po?.poNumber ?? values.poId,
      designCode: values.designCode,
      fabricType: fabric?.product.name ?? "Fabric",
      fabricProductId: values.fabricProductId,
      wastageQty: values.wastageQty,
      returnedBy,
      status: "IN_STOCK",
      remarks: values.remarks,
      valuePerKg: 45,
    };

    onSave(entry);
    toast.success("Wastage record saved. Added to IN STOCK inventory.");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Wastage Return"
      description="Capture fabric leftovers from cutting floor"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-wastage-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Record
          </Button>
        </div>
      }
    >
      <form
        id="record-wastage-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label>
            Purchase Order Number <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("poId")}
            onValueChange={(value) =>
              setValue("poId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select PO..." />
            </SelectTrigger>
            <SelectContent>
              {mockPurchaseOrders.map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.poNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.poId ? (
            <p className="text-sm text-destructive">{errors.poId.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="designCode">
              Design Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="designCode"
              placeholder="e.g. D-46"
              {...register("designCode")}
            />
            {errors.designCode ? (
              <p className="text-sm text-destructive">
                {errors.designCode.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dateOfReturn">
              Date of Return <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateOfReturn"
              type="date"
              {...register("dateOfReturn")}
            />
            {errors.dateOfReturn ? (
              <p className="text-sm text-destructive">
                {errors.dateOfReturn.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Fabric Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("fabricProductId")}
            onValueChange={(value) =>
              setValue("fabricProductId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Fabric..." />
            </SelectTrigger>
            <SelectContent>
              {fabricOptions.map((item) => (
                <SelectItem key={item.productId} value={item.productId}>
                  {item.product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fabricProductId ? (
            <p className="text-sm text-destructive">
              {errors.fabricProductId.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="wastageQty">
            Wastage Quantity (kg) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="wastageQty"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pr-12"
              {...register("wastageQty", { valueAsNumber: true })}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-slate-400">
              KG
            </span>
          </div>
          {errors.wastageQty ? (
            <p className="text-sm text-destructive">
              {errors.wastageQty.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Returned By (Cutter Name) <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("returnedByPartyId")}
            onValueChange={(value) =>
              setValue("returnedByPartyId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Full name of personnel" />
            </SelectTrigger>
            <SelectContent>
              {mockKarigarParties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.returnedByPartyId ? (
            <p className="text-sm text-destructive">
              {errors.returnedByPartyId.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="remarks">Remarks / Notes</Label>
          <Textarea
            id="remarks"
            rows={3}
            placeholder="Additional details..."
            {...register("remarks")}
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-slate-100 px-3 py-3 text-sm text-slate-600">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <p>
            By recording this wastage, it will be added to the &apos;IN
            STOCK&apos; inventory and available for resale or disposal value
            tracking.
          </p>
        </div>
      </form>
    </DrawerForm>
  );
}
