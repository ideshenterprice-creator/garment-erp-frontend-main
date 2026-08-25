"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { GSTRate } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { GSTTable } from "@/components/modules/masters/GSTTable";
import { GSTDrawer } from "@/components/modules/masters/GSTDrawer";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getGSTRates } from "@/services/masters.service";

export default function GSTMasterPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<GSTRate | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.GST,
    queryFn: () => getGSTRates(),
  });

  const rates = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Active Tax Structure"
        subtitle="GST rates for each product category. Applied automatically on all purchase and sales bills based on the defined fiscal logic."
        actionButton={
          <PageHeaderAction
            label="Add GST Rate"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          />
        }
      />

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load GST rates
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <GSTTable
          rates={rates}
          onEdit={(rate) => {
            setEditing(rate);
            setDrawerOpen(true);
          }}
          onAdd={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        />
      )}

      <GSTDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        rate={editing}
      />
    </div>
  );
}
