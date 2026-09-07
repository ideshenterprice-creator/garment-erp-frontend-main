"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface POItemFormRow {
  id: string;
  designNumber: string;
  garmentType: string;
  color: string;
  qty_0_3M: number;
  qty_3_6M: number;
  qty_6_9M: number;
  qty_9_12M: number;
  qty_12_18M: number;
  qty_18_24M: number;
}

interface POItemsFormSectionProps {
  items: POItemFormRow[];
  errors?: Record<string, string>;
  onChange: (items: POItemFormRow[]) => void;
}

const sizeFields = [
  { key: "qty_0_3M", label: "0-3M" },
  { key: "qty_3_6M", label: "3-6M" },
  { key: "qty_6_9M", label: "6-9M" },
  { key: "qty_9_12M", label: "9-12M" },
  { key: "qty_12_18M", label: "12-18M" },
  { key: "qty_18_24M", label: "18-24M" },
] as const;

const garmentTypes = [
  "Baby Bodysuit",
  "Baby Romper",
  "T-Shirt",
  "Romper",
  "Jumper",
];

function rowTotal(item: POItemFormRow): number {
  return (
    item.qty_0_3M +
    item.qty_3_6M +
    item.qty_6_9M +
    item.qty_9_12M +
    item.qty_12_18M +
    item.qty_18_24M
  );
}

export function createEmptyPOItem(): POItemFormRow {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    designNumber: "",
    garmentType: "Baby Bodysuit",
    color: "",
    qty_0_3M: 0,
    qty_3_6M: 0,
    qty_6_9M: 0,
    qty_9_12M: 0,
    qty_12_18M: 0,
    qty_18_24M: 0,
  };
}

export function POItemsFormSection({
  items,
  errors = {},
  onChange,
}: POItemsFormSectionProps) {
  function updateItem(id: string, patch: Partial<POItemFormRow>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  }

  const totalDesigns = items.length;
  const totalPieces = items.reduce((sum, item) => sum + rowTotal(item), 0);

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>
        <p className="text-sm text-muted-foreground">
          Add each garment design with size-wise piece breakdown
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Design No.</TableHead>
                <TableHead>Garment Type</TableHead>
                <TableHead>Color</TableHead>
                {sizeFields.map((size) => (
                  <TableHead key={size.key} className="min-w-[72px] text-center">
                    {size.label}
                  </TableHead>
                ))}
                <TableHead>Total Pieces</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.designNumber}
                      placeholder="D-42"
                      className="h-9 w-24"
                      onChange={(event) =>
                        updateItem(item.id, { designNumber: event.target.value })
                      }
                    />
                    {errors[`items.${index}.designNumber`] ? (
                      <p className="mt-1 text-xs text-destructive">
                        {errors[`items.${index}.designNumber`]}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.garmentType}
                      onValueChange={(value) =>
                        updateItem(item.id, { garmentType: value })
                      }
                    >
                      <SelectTrigger className="h-9 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {garmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.color}
                      placeholder="e.g. Navy Blue"
                      className="h-9 w-32"
                      onChange={(event) =>
                        updateItem(item.id, { color: event.target.value })
                      }
                    />
                    {errors[`items.${index}.color`] ? (
                      <p className="mt-1 text-xs text-destructive">
                        {errors[`items.${index}.color`]}
                      </p>
                    ) : null}
                  </TableCell>
                  {sizeFields.map((size) => (
                    <TableCell key={size.key}>
                      <Input
                        type="number"
                        min={0}
                        className="h-9 w-16 text-center"
                        value={item[size.key]}
                        onChange={(event) =>
                          updateItem(item.id, {
                            [size.key]: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell className="font-semibold">
                    {rowTotal(item).toLocaleString("en-IN")} pcs
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-slate-400 hover:text-red-500"
                      disabled={items.length <= 1}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1b3a3a] hover:underline"
            onClick={() => onChange([...items, createEmptyPOItem()])}
          >
            <Plus className="size-4" />
            Add Another Design
          </button>
          {errors.items ? (
            <p className="mt-2 text-sm text-destructive">{errors.items}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="flex gap-6">
            <p>
              <span className="text-muted-foreground">Total Designs:</span>{" "}
              <span className="font-semibold">{totalDesigns}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Total Pieces:</span>{" "}
              <span className="font-semibold">
                {totalPieces.toLocaleString("en-IN")} pcs
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
