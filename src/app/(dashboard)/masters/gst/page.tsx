"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { mockGSTRates, type MockGSTRate } from "@/mock/masters";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { GSTTable } from "@/components/modules/masters/GSTTable";
import { GSTDrawer } from "@/components/modules/masters/GSTDrawer";

const PAGE_SIZE = 8;

export default function GSTMasterPage() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<MockGSTRate[]>(mockGSTRates);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MockGSTRate | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.max(1, Math.ceil(rates.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => rates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rates, page]
  );

  return (
    <div>
      <PageHeader
        title="Active Tax Structure"
        subtitle="GST rates for each product category. Applied automatically on all purchase and sales bills based on the defined fiscal logic."
        actionButton={
          <PageHeaderAction
            label="+ Add GST Rate"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          />
        }
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <GSTTable
            rates={pageItems}
            onEdit={(rate) => {
              setEditing(rate);
              setDrawerOpen(true);
            }}
            onAdd={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={rates.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="entries"
          />
        </>
      )}

      <GSTDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        rate={editing}
        onSave={(rate) => {
          setRates((prev) => {
            const exists = prev.some((item) => item.id === rate.id);
            if (exists) {
              return prev.map((item) => (item.id === rate.id ? rate : item));
            }
            return [rate, ...prev];
          });
        }}
      />
    </div>
  );
}
