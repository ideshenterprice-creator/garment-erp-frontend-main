"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  mockBoxes,
  type MockBox,
} from "@/mock/boxing";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  BoxFilterBar,
  type BoxFilters,
} from "@/components/modules/boxing/BoxFilterBar";
import { BoxPackingTable } from "@/components/modules/boxing/BoxPackingTable";
import { BoxStatCards } from "@/components/modules/boxing/BoxStatCards";
import { NewBoxDrawer } from "@/components/modules/boxing/NewBoxDrawer";

const PAGE_SIZE = 10;

const defaultFilters: BoxFilters = {
  poId: "ALL",
  status: "ALL",
  dateRange: "THIS_MONTH",
};

export default function BoxPackingPage() {
  const [loading, setLoading] = useState(true);
  const [boxes, setBoxes] = useState<MockBox[]>(mockBoxes);
  const [filters, setFilters] = useState<BoxFilters>(defaultFilters);
  const [applied, setApplied] = useState<BoxFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return boxes.filter((box) => {
      if (applied.poId !== "ALL" && box.poId !== applied.poId) return false;
      if (applied.status !== "ALL" && box.status !== applied.status) return false;
      return true;
    });
  }, [boxes, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Box Packing"
        subtitle="Finished garments packed into numbered boxes ready for container loading."
        actionButton={
          <PageHeaderAction
            label="+ New Box Entry"
            icon={<Plus className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <BoxStatCards
        boxesPackedThisMonth={84}
        totalPiecesPacked={18400}
        boxesLoadedInContainer={boxes.filter((b) => b.status === "LOADED").length || 60}
      />

      <BoxFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <BoxPackingTable
            boxes={pageItems}
            onAdd={() => setDrawerOpen(true)}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="boxes"
          />
        </>
      )}

      <NewBoxDrawer
        open={drawerOpen}
        existing={boxes}
        onClose={() => setDrawerOpen(false)}
        onSave={(box) => {
          setBoxes((prev) => [box, ...prev]);
          setPage(1);
        }}
      />
    </div>
  );
}
