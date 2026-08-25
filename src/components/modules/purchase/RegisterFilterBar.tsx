"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Party, Product } from "@/types";

export interface RegisterFilters {
  from: string;
  to: string;
  supplierId: string;
  fabricType: string;
}

interface RegisterFilterBarProps {
  filters: RegisterFilters;
  onChange: (filters: RegisterFilters) => void;
  onApply: () => void;
  suppliers: Party[];
  products: Product[];
  suppliersLoading?: boolean;
  productsLoading?: boolean;
}

export function RegisterFilterBar({
  filters,
  onChange,
  onApply,
  suppliers,
  products,
  suppliersLoading = false,
  productsLoading = false,
}: RegisterFilterBarProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            From Date
          </Label>
          <Input
            type="date"
            value={filters.from}
            onChange={(event) =>
              onChange({ ...filters, from: event.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            To Date
          </Label>
          <Input
            type="date"
            value={filters.to}
            onChange={(event) =>
              onChange({ ...filters, to: event.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Supplier
          </Label>
          <Select
            value={filters.supplierId}
            onValueChange={(value) =>
              onChange({ ...filters, supplierId: value })
            }
            disabled={suppliersLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  suppliersLoading ? "Loading..." : "All suppliers"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Fabric Type
          </Label>
          <Select
            value={filters.fabricType}
            onValueChange={(value) =>
              onChange({ ...filters, fabricType: value })
            }
            disabled={productsLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={productsLoading ? "Loading..." : "All fabrics"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Fabrics</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
            onClick={onApply}
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
