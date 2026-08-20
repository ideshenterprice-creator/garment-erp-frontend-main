"use client";

import { format } from "date-fns";
import type { MockIssueRecord } from "@/mock/inventory";
import { EmptyState } from "@/components/common/EmptyState";
import { IssueStatusBadge } from "@/components/modules/inventory/IssueStatusBadge";
import { IssueTypeBadge } from "@/components/modules/inventory/IssueTypeBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IssueHistoryTableProps {
  issues: MockIssueRecord[];
}

export function IssueHistoryTable({ issues }: IssueHistoryTableProps) {
  if (issues.length === 0) {
    return (
      <EmptyState
        title="No issue records found"
        description="Try changing filters or issue material to a karigar."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Issue No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Issue Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Material
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Qty Issued
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Issued To
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PO
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bundle No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-semibold text-slate-900">
                  {issue.issueNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(issue.issueDate), "dd MMM")}
                </TableCell>
                <TableCell>
                  <IssueTypeBadge type={issue.issueType} />
                </TableCell>
                <TableCell>{issue.materialLabel}</TableCell>
                <TableCell className="font-semibold text-slate-900">
                  {issue.quantityIssued.toLocaleString("en-IN")}{" "}
                  {issue.unitLabel}
                </TableCell>
                <TableCell>{issue.karigar.name}</TableCell>
                <TableCell>{issue.po.poNumber}</TableCell>
                <TableCell>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {issue.bundleNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <IssueStatusBadge status={issue.displayStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
