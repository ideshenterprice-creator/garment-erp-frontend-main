"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { SalesNote, SalesNoteType } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { cn, formatCurrency } from "@/lib/utils";

interface CreditDebitNotesTableProps {
  notes: SalesNote[];
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
        actionLabel="New Note"
        onAction={onAdd}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
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
                <TableHead className="min-w-[280px] text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-semibold">
                    {note.noteNumber}
                  </TableCell>
                  <TableCell>
                    <NoteTypeBadge type={note.type} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={ROUTES.SALES.BILL_DETAIL(note.salesBillId)}
                      className="font-medium text-[#1b3a3a] hover:underline"
                    >
                      {note.salesBill?.invoiceNumber ?? note.salesBillId}
                    </Link>
                  </TableCell>
                  <TableCell>{note.buyer?.name ?? "—"}</TableCell>
                  <TableCell>
                    {format(new Date(note.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(note.amount))}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="whitespace-normal text-sm leading-relaxed text-slate-700">
                          {note.reason}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-sm whitespace-normal text-left"
                      >
                        {note.reason}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}

function NoteTypeBadge({ type }: { type: SalesNoteType }) {
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
