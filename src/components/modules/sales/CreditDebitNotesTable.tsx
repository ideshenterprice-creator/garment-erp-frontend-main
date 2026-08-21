"use client";

import type { MockCreditDebitNote, NoteType } from "@/mock/sales";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface CreditDebitNotesTableProps {
  notes: MockCreditDebitNote[];
  onAdd?: () => void;
}

export function CreditDebitNotesTable({
  notes,
  onAdd,
}: CreditDebitNotesTableProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes found"
        description="Create a credit or debit note linked to a sales invoice."
        actionLabel="+ New Note"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Note No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Linked Invoice
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Buyer
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="font-semibold">{note.noteNumber}</TableCell>
                <TableCell>
                  <NoteTypeBadge type={note.type} />
                </TableCell>
                <TableCell>{note.invoiceNumber}</TableCell>
                <TableCell>{note.buyerName}</TableCell>
                <TableCell>
                  {format(new Date(note.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(note.amount)}
                </TableCell>
                <TableCell className="max-w-xs truncate">{note.reason}</TableCell>
                <TableCell>
                  <Button type="button" variant="link" className="h-auto p-0">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function NoteTypeBadge({ type }: { type: NoteType }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        type === "CREDIT"
          ? "bg-red-50 text-red-700"
          : "bg-sky-50 text-sky-700"
      )}
    >
      {type === "CREDIT" ? "Credit Note" : "Debit Note"}
    </span>
  );
}
