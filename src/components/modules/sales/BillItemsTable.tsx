"use client";

import { StockCheckColumn } from "@/components/modules/sales/StockCheckColumn";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

export interface BillItemRow {
  id: string;
  designNumber: string;
  garmentType: string;
  color: string;
  size: string;
  quantity: number;
  ratePerPiece: number;
  availableStock: number;
}

interface BillItemsTableProps {
  items: BillItemRow[];
  onChangeQty: (id: string, quantity: number) => void;
  onChangeRate: (id: string, rate: number) => void;
}

export function BillItemsTable({
  items,
  onChangeQty,
  onChangeRate,
}: BillItemsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Style Code</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Bill Qty</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Stock Status</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const amount = item.quantity * item.ratePerPiece;
            const error =
              item.quantity > 0 && item.quantity > item.availableStock;
            return (
              <TableRow
                key={item.id}
                className={cn(error && "bg-red-50 hover:bg-red-50")}
              >
                <TableCell
                  className={cn(
                    "font-medium",
                    error ? "text-red-600" : "text-slate-900"
                  )}
                >
                  {item.designNumber}
                  <p className="text-xs font-normal text-muted-foreground">
                    {item.garmentType} · {item.color}
                  </p>
                </TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    className="h-9 w-24"
                    value={item.quantity || ""}
                    onChange={(event) =>
                      onChangeQty(item.id, Number(event.target.value) || 0)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    className="h-9 w-24"
                    value={item.ratePerPiece || ""}
                    onChange={(event) =>
                      onChangeRate(item.id, Number(event.target.value) || 0)
                    }
                  />
                </TableCell>
                <TableCell>
                  <StockCheckColumn
                    available={item.availableStock}
                    quantity={item.quantity}
                  />
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
