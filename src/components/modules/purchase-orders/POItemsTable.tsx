"use client";

import Link from "next/link";
import type { POItem } from "@/types";
import { mockProducts } from "@/mock/masters";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface POItemsTableProps {
  items: POItem[];
}

function productHrefForGarment(garmentType: string): string | null {
  const match = mockProducts.find(
    (product) =>
      product.name.toLowerCase() === garmentType.toLowerCase() ||
      product.garmentType?.toLowerCase() === garmentType.toLowerCase()
  );
  return match ? `/masters/product/${match.id}` : null;
}

export function POItemsTable({ items }: POItemsTableProps) {
  const totals = items.reduce(
    (acc, item) => ({
      qty_0_3M: acc.qty_0_3M + item.qty_0_3M,
      qty_3_6M: acc.qty_3_6M + item.qty_3_6M,
      qty_6_9M: acc.qty_6_9M + item.qty_6_9M,
      qty_9_12M: acc.qty_9_12M + item.qty_9_12M,
      qty_12_18M: acc.qty_12_18M + item.qty_12_18M,
      qty_18_24M: acc.qty_18_24M + item.qty_18_24M,
      totalPieces: acc.totalPieces + item.totalPieces,
    }),
    {
      qty_0_3M: 0,
      qty_3_6M: 0,
      qty_6_9M: 0,
      qty_9_12M: 0,
      qty_12_18M: 0,
      qty_18_24M: 0,
      totalPieces: 0,
    }
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-900">Order Items Breakdown</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Design No</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">0-3M</TableHead>
              <TableHead className="text-right">3-6M</TableHead>
              <TableHead className="text-right">6-9M</TableHead>
              <TableHead className="text-right">9-12M</TableHead>
              <TableHead className="text-right">12-18M</TableHead>
              <TableHead className="text-right">18-24M</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No items on this purchase order
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const productHref = productHrefForGarment(item.garmentType);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.designNumber}
                    </TableCell>
                    <TableCell>
                      {productHref ? (
                        <Link
                          href={productHref}
                          className="font-medium text-[#1b3a3a] hover:underline"
                        >
                          {item.garmentType}
                        </Link>
                      ) : (
                        item.garmentType
                      )}
                    </TableCell>
                    <TableCell>{item.color}</TableCell>
                    <TableCell className="text-right">{item.qty_0_3M}</TableCell>
                    <TableCell className="text-right">{item.qty_3_6M}</TableCell>
                    <TableCell className="text-right">{item.qty_6_9M}</TableCell>
                    <TableCell className="text-right">{item.qty_9_12M}</TableCell>
                    <TableCell className="text-right">{item.qty_12_18M}</TableCell>
                    <TableCell className="text-right">{item.qty_18_24M}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.totalPieces.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {items.length > 0 ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.qty_0_3M}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.qty_3_6M}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.qty_6_9M}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.qty_9_12M}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.qty_12_18M}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.qty_18_24M}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {totals.totalPieces.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>
    </div>
  );
}
