"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  boxingPOs,
  emptyBoxSizes,
  generateNextBoxNumber,
  getFinishedStock,
  sumBoxSizes,
  type BoxSizeQty,
  type MockBox,
} from "@/mock/boxing";
import { DrawerForm } from "@/components/common/DrawerForm";
import { BoxSizeInputGrid } from "@/components/modules/boxing/BoxSizeInputGrid";
import { StockInfoBox } from "@/components/modules/boxing/StockInfoBox";
import { TotalPiecesDisplay } from "@/components/modules/boxing/TotalPiecesDisplay";
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

const boxSchema = z
  .object({
    poId: z.string().min(1, "PO is required"),
    designNumber: z.string().min(1, "Design is required"),
    color: z.string().min(1, "Color is required"),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    void values;
    void ctx;
  });

type BoxFormValues = z.infer<typeof boxSchema>;

interface NewBoxDrawerProps {
  open: boolean;
  existing: MockBox[];
  onClose: () => void;
  onSave: (box: MockBox) => void;
}

export function NewBoxDrawer({
  open,
  existing,
  onClose,
  onSave,
}: NewBoxDrawerProps) {
  const boxNumber = useMemo(
    () => generateNextBoxNumber(existing),
    [existing]
  );
  const [sizes, setSizes] = useState<BoxSizeQty>(emptyBoxSizes());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema),
    defaultValues: {
      poId: "",
      designNumber: "",
      color: "",
      notes: "",
    },
  });

  const poId = watch("poId");
  const designNumber = watch("designNumber");
  const color = watch("color");
  const total = sumBoxSizes(sizes);
  const available = getFinishedStock(designNumber || "D-42", color || "White");
  const stockError = total > 0 && total > available;

  const designs = useMemo(() => {
    return boxingPOs.find((po) => po.id === poId)?.designs ?? [];
  }, [poId]);

  useEffect(() => {
    if (!open) return;
    reset({
      poId: boxingPOs[0]?.id ?? "",
      designNumber: boxingPOs[0]?.designs[0]?.designNumber ?? "",
      color: boxingPOs[0]?.designs[0]?.color ?? "Optic White",
      notes: "",
    });
    setSizes({
      qty_0_3M: 10,
      qty_3_6M: 10,
      qty_6_9M: 10,
      qty_9_12M: 10,
      qty_12_18M: 10,
      qty_18_24M: 10,
    });
  }, [open, reset]);

  useEffect(() => {
    if (designs.length === 0) return;
    const current = watch("designNumber");
    if (!designs.some((d) => d.designNumber === current)) {
      setValue("designNumber", designs[0].designNumber);
      setValue("color", designs[0].color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designs, setValue]);

  function onSubmit(values: BoxFormValues) {
    if (total <= 0) {
      toast.error("At least one size quantity must be greater than 0");
      return;
    }
    if (stockError) return;

    const po = boxingPOs.find((item) => item.id === values.poId);
    const box: MockBox = {
      id: `box-${Date.now()}`,
      boxNumber,
      poId: values.poId,
      poNumber: po?.poNumber ?? values.poId,
      designNumber: values.designNumber,
      color: values.color,
      sizes,
      totalPieces: total,
      containerId: null,
      containerNumber: null,
      status: "PACKED",
      packedDate: new Date().toISOString().slice(0, 10),
      notes: values.notes,
    };

    onSave(box);
    toast.success(`Box ${boxNumber} packed successfully.`);
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="New Box Entry"
      description="Add details for shipping container"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="new-box-form"
            disabled={isSubmitting || stockError || total <= 0}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Box Entry
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <form
        id="new-box-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Box No</Label>
            <Input value={boxNumber} readOnly className="bg-slate-50" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>PO Reference</Label>
            <Select
              value={poId}
              onValueChange={(value) =>
                setValue("poId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PO" />
              </SelectTrigger>
              <SelectContent>
                {boxingPOs.map((po) => (
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Design No</Label>
            <Select
              value={designNumber}
              onValueChange={(value) => {
                setValue("designNumber", value, { shouldValidate: true });
                const design = designs.find((d) => d.designNumber === value);
                if (design) setValue("color", design.color);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select design" />
              </SelectTrigger>
              <SelectContent>
                {designs.map((design) => (
                  <SelectItem key={design.id} value={design.designNumber}>
                    {design.designNumber} {design.color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.designNumber ? (
              <p className="text-sm text-destructive">
                {errors.designNumber.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" {...register("color")} />
            {errors.color ? (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            ) : null}
          </div>
        </div>

        <BoxSizeInputGrid
          values={sizes}
          onChange={(key, value) =>
            setSizes((prev) => ({ ...prev, [key]: value }))
          }
        />
        <TotalPiecesDisplay total={total} />
        <StockInfoBox
          designNumber={designNumber || "—"}
          color={color || "—"}
          available={available}
          packing={total}
          error={stockError}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Add packing remarks..."
            {...register("notes")}
          />
        </div>
      </form>
    </DrawerForm>
  );
}
