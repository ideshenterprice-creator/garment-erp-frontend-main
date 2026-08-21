"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  filterByProductionFilters,
  mockColoringEntries,
  mockCuttingEntries,
  mockFinishingEntries,
  mockPrintingEntries,
  mockStitchingEntries,
  type MockColoringEntry,
  type MockCuttingEntry,
  type MockFinishingEntry,
  type MockPrintingEntry,
  type MockStitchingEntry,
  type ProductionFilters,
  type ProductionStageTab,
} from "@/mock/production";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ColoringTable } from "@/components/modules/production/ColoringTable";
import { CuttingTable } from "@/components/modules/production/CuttingTable";
import { FinishingTable } from "@/components/modules/production/FinishingTable";
import { PrintingTable } from "@/components/modules/production/PrintingTable";
import { ProductionFilterBar } from "@/components/modules/production/ProductionFilterBar";
import { ProductionSummaryBar } from "@/components/modules/production/ProductionSummaryBar";
import { ProductionTabs } from "@/components/modules/production/ProductionTabs";
import { RecordColoringDrawer } from "@/components/modules/production/RecordColoringDrawer";
import { RecordCuttingDrawer } from "@/components/modules/production/RecordCuttingDrawer";
import { RecordFinishingDrawer } from "@/components/modules/production/RecordFinishingDrawer";
import { RecordPrintingDrawer } from "@/components/modules/production/RecordPrintingDrawer";
import { RecordStitchingDrawer } from "@/components/modules/production/RecordStitchingDrawer";
import { StitchingTable } from "@/components/modules/production/StitchingTable";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 10;

const defaultFilters: ProductionFilters = {
  poId: "ALL",
  dateFrom: "",
  dateTo: "",
  karigarId: "ALL",
};

const recordLabels: Record<ProductionStageTab, string> = {
  CUTTING: "Record Cutting Entry",
  PRINTING: "Record Printing Entry",
  COLORING: "Record Coloring Entry",
  STITCHING: "Record Stitching Entry",
  FINISHING: "Record Finishing Entry",
};

export default function ProductionPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProductionStageTab>("CUTTING");
  const [filters, setFilters] = useState<ProductionFilters>(defaultFilters);
  const [applied, setApplied] = useState<ProductionFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [cutting, setCutting] = useState<MockCuttingEntry[]>(mockCuttingEntries);
  const [printing, setPrinting] =
    useState<MockPrintingEntry[]>(mockPrintingEntries);
  const [coloring, setColoring] =
    useState<MockColoringEntry[]>(mockColoringEntries);
  const [stitching, setStitching] =
    useState<MockStitchingEntry[]>(mockStitchingEntries);
  const [finishing, setFinishing] =
    useState<MockFinishingEntry[]>(mockFinishingEntries);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredCutting = useMemo(
    () => filterByProductionFilters(cutting, applied),
    [cutting, applied]
  );
  const filteredPrinting = useMemo(
    () => filterByProductionFilters(printing, applied),
    [printing, applied]
  );
  const filteredColoring = useMemo(
    () => filterByProductionFilters(coloring, applied),
    [coloring, applied]
  );
  const filteredStitching = useMemo(
    () => filterByProductionFilters(stitching, applied),
    [stitching, applied]
  );
  const filteredFinishing = useMemo(
    () => filterByProductionFilters(finishing, applied),
    [finishing, applied]
  );

  const summaryStats = useMemo(() => {
    if (activeTab === "CUTTING") {
      const pieces = filteredCutting.reduce((sum, row) => sum + row.pieces, 0);
      const wastage = filteredCutting.reduce(
        (sum, row) => sum + row.wastageKg,
        0
      );
      const payment = filteredCutting.reduce(
        (sum, row) => sum + row.amountDue,
        0
      );
      return [
        { label: "Total Pieces Cut", value: pieces.toLocaleString("en-IN") },
        {
          label: "Total Wastage (kg)",
          value: wastage.toFixed(1),
          tone: "warning" as const,
        },
        {
          label: "Total Karigar Payment Due",
          value: formatCurrency(payment),
          tone: "accent" as const,
        },
      ];
    }

    if (activeTab === "PRINTING") {
      const printed = filteredPrinting.reduce(
        (sum, row) => sum + row.piecesReturned,
        0
      );
      const rejected = filteredPrinting.reduce(
        (sum, row) => sum + row.piecesRejected,
        0
      );
      const payment = filteredPrinting.reduce(
        (sum, row) => sum + row.amountDue,
        0
      );
      return [
        {
          label: "Total Pieces Printed",
          value: printed.toLocaleString("en-IN"),
        },
        {
          label: "Total Rejected",
          value: rejected.toLocaleString("en-IN"),
          tone: "warning" as const,
        },
        {
          label: "Total Karigar Payment Due",
          value: formatCurrency(payment),
          tone: "accent" as const,
        },
      ];
    }

    if (activeTab === "COLORING") {
      const colored = filteredColoring.reduce(
        (sum, row) => sum + row.piecesReturned,
        0
      );
      const rejected = filteredColoring.reduce(
        (sum, row) => sum + row.piecesRejected,
        0
      );
      const payment = filteredColoring.reduce(
        (sum, row) => sum + row.amountDue,
        0
      );
      return [
        {
          label: "Total Pieces Colored",
          value: colored.toLocaleString("en-IN"),
        },
        {
          label: "Total Rejected",
          value: rejected.toLocaleString("en-IN"),
          tone: "warning" as const,
        },
        {
          label: "Total Karigar Payment Due",
          value: formatCurrency(payment),
          tone: "accent" as const,
        },
      ];
    }

    if (activeTab === "STITCHING") {
      const processed = filteredStitching.reduce(
        (sum, row) => sum + row.piecesReturned,
        0
      );
      const rejected = filteredStitching.reduce(
        (sum, row) => sum + row.piecesRejected,
        0
      );
      const payment = filteredStitching.reduce(
        (sum, row) => sum + row.amountDue,
        0
      );
      return [
        {
          label: "Total Pieces Processed",
          value: processed.toLocaleString("en-IN"),
        },
        {
          label: "Total Rejected",
          value: rejected.toLocaleString("en-IN"),
          tone: "warning" as const,
        },
        {
          label: "Total Payment Due",
          value: formatCurrency(payment),
          tone: "accent" as const,
        },
      ];
    }

    const finished = filteredFinishing.reduce(
      (sum, row) => sum + row.piecesCompleted,
      0
    );
    const payment = filteredFinishing.reduce(
      (sum, row) => sum + row.amountDue,
      0
    );
    return [
      {
        label: "Total Pieces Finished",
        value: `${finished.toLocaleString("en-IN")} pcs`,
      },
      {
        label: "Total Karigar Payment Due",
        value: formatCurrency(payment),
        tone: "accent" as const,
      },
    ];
  }, [
    activeTab,
    filteredCutting,
    filteredPrinting,
    filteredColoring,
    filteredStitching,
    filteredFinishing,
  ]);

  const activeRows =
    activeTab === "CUTTING"
      ? filteredCutting
      : activeTab === "PRINTING"
        ? filteredPrinting
        : activeTab === "COLORING"
          ? filteredColoring
          : activeTab === "STITCHING"
            ? filteredStitching
            : filteredFinishing;

  const totalPages = Math.max(1, Math.ceil(activeRows.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageCutting = filteredCutting.slice(pageStart, pageStart + PAGE_SIZE);
  const pagePrinting = filteredPrinting.slice(pageStart, pageStart + PAGE_SIZE);
  const pageColoring = filteredColoring.slice(pageStart, pageStart + PAGE_SIZE);
  const pageStitching = filteredStitching.slice(
    pageStart,
    pageStart + PAGE_SIZE
  );
  const pageFinishing = filteredFinishing.slice(
    pageStart,
    pageStart + PAGE_SIZE
  );

  return (
    <div>
      <PageHeader
        title="Production"
        subtitle="Record daily output for each production stage. Karigar payments are calculated automatically."
        actionButton={
          <PageHeaderAction
            label={recordLabels[activeTab]}
            icon={<PlusCircle className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <ProductionTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
      />

      <ProductionFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
      />

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <>
          {activeTab === "CUTTING" ? (
            <CuttingTable
              entries={pageCutting}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "PRINTING" ? (
            <PrintingTable
              entries={pagePrinting}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "COLORING" ? (
            <ColoringTable
              entries={pageColoring}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "STITCHING" ? (
            <StitchingTable
              entries={pageStitching}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "FINISHING" ? (
            <FinishingTable
              entries={pageFinishing}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={activeRows.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="entries"
          />

          <ProductionSummaryBar stats={summaryStats} />
        </>
      )}

      <RecordCuttingDrawer
        open={drawerOpen && activeTab === "CUTTING"}
        onClose={() => setDrawerOpen(false)}
        onSave={(entry) => setCutting((prev) => [entry, ...prev])}
      />
      <RecordPrintingDrawer
        open={drawerOpen && activeTab === "PRINTING"}
        onClose={() => setDrawerOpen(false)}
        onSave={(entry) => setPrinting((prev) => [entry, ...prev])}
      />
      <RecordColoringDrawer
        open={drawerOpen && activeTab === "COLORING"}
        onClose={() => setDrawerOpen(false)}
        onSave={(entry) => setColoring((prev) => [entry, ...prev])}
      />
      <RecordStitchingDrawer
        open={drawerOpen && activeTab === "STITCHING"}
        onClose={() => setDrawerOpen(false)}
        onSave={(entry) => setStitching((prev) => [entry, ...prev])}
      />
      <RecordFinishingDrawer
        open={drawerOpen && activeTab === "FINISHING"}
        onClose={() => setDrawerOpen(false)}
        onSave={(entry) => setFinishing((prev) => [entry, ...prev])}
      />
    </div>
  );
}
