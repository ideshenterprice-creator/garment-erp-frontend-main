"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import type { ProductionFilters, ProductionStageTab } from "@/types";
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
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { formatCurrency } from "@/lib/utils";
import { getParties } from "@/services/masters.service";
import {
  getColoringEntries,
  getCuttingEntries,
  getFinishingEntries,
  getPrintingEntries,
  getStitchingEntries,
} from "@/services/production.service";
import { getPurchaseOrders } from "@/services/purchaseOrders.service";

const PAGE_SIZE = 10;

const defaultFilters: ProductionFilters = {
  poId: "ALL",
  from: "",
  to: "",
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
  const [activeTab, setActiveTab] = useState<ProductionStageTab>("CUTTING");
  const [draftFilters, setDraftFilters] =
    useState<ProductionFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ProductionFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const posQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PURCHASE_ORDERS,
      { status: "IN_PRODUCTION", limit: 100 },
    ],
    queryFn: () => getPurchaseOrders({ status: "IN_PRODUCTION", limit: 100 }),
  });

  const activePosQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PURCHASE_ORDERS,
      { status: "ACTIVE", limit: 100 },
    ],
    queryFn: () => getPurchaseOrders({ status: "ACTIVE", limit: 100 }),
  });

  const karigarsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "KARIGAR", limit: 100 }],
    queryFn: () => getParties({ type: "KARIGAR", limit: 100 }),
  });

  const drawerPOs = useMemo(() => {
    const inProd = posQuery.data?.data.data ?? [];
    const active = activePosQuery.data?.data.data ?? [];
    const byId = new Map([...inProd, ...active].map((po) => [po.id, po]));
    return Array.from(byId.values());
  }, [posQuery.data, activePosQuery.data]);

  const filterPOs = posQuery.data?.data.data ?? [];
  const karigars = karigarsQuery.data?.data.data ?? [];

  const apiFilters = {
    poId:
      appliedFilters.poId === "ALL" ? undefined : appliedFilters.poId,
    karigarId:
      appliedFilters.karigarId === "ALL"
        ? undefined
        : appliedFilters.karigarId,
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const cuttingQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "cutting", apiFilters],
    queryFn: () => getCuttingEntries(apiFilters),
    enabled: activeTab === "CUTTING",
  });

  const printingQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "printing", apiFilters],
    queryFn: () => getPrintingEntries(apiFilters),
    enabled: activeTab === "PRINTING",
  });

  const coloringQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "coloring", apiFilters],
    queryFn: () => getColoringEntries(apiFilters),
    enabled: activeTab === "COLORING",
  });

  const stitchingQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "stitching", apiFilters],
    queryFn: () => getStitchingEntries(apiFilters),
    enabled: activeTab === "STITCHING",
  });

  const finishingQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "finishing", apiFilters],
    queryFn: () => getFinishingEntries(apiFilters),
    enabled: activeTab === "FINISHING",
  });

  const activeQuery =
    activeTab === "CUTTING"
      ? cuttingQuery
      : activeTab === "PRINTING"
        ? printingQuery
        : activeTab === "COLORING"
          ? coloringQuery
          : activeTab === "STITCHING"
            ? stitchingQuery
            : finishingQuery;

  const total = activeQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const summaryStats = useMemo(() => {
    if (activeTab === "CUTTING") {
      const summary = cuttingQuery.data?.data.summary;
      return [
        {
          label: "Total Pieces Cut",
          value: Number(summary?.totalPiecesCut ?? 0).toLocaleString("en-IN"),
        },
        {
          label: "Total Wastage (kg)",
          value: Number(summary?.totalWastageKg ?? 0).toLocaleString("en-IN"),
          tone: "warning" as const,
        },
        {
          label: "Total Karigar Payment Due",
          value: formatCurrency(Number(summary?.totalKarigarPaymentDue ?? 0)),
          tone: "accent" as const,
        },
      ];
    }
    if (activeTab === "PRINTING") {
      const summary = printingQuery.data?.data.summary;
      return [
        {
          label: "Total Pieces Printed",
          value: Number(summary?.totalPiecesReturned ?? 0).toLocaleString(
            "en-IN"
          ),
        },
        {
          label: "Total Rejected",
          value: Number(summary?.totalPiecesRejected ?? 0).toLocaleString(
            "en-IN"
          ),
          tone: "warning" as const,
        },
        {
          label: "Total Karigar Payment Due",
          value: formatCurrency(Number(summary?.totalKarigarPaymentDue ?? 0)),
          tone: "accent" as const,
        },
      ];
    }
    if (activeTab === "COLORING") {
      const summary = coloringQuery.data?.data.summary;
      return [
        {
          label: "Total Pieces Colored",
          value: Number(summary?.totalPiecesReturned ?? 0).toLocaleString(
            "en-IN"
          ),
        },
        {
          label: "Total Rejected",
          value: Number(summary?.totalPiecesRejected ?? 0).toLocaleString(
            "en-IN"
          ),
          tone: "warning" as const,
        },
        {
          label: "Total Karigar Payment Due",
          value: formatCurrency(Number(summary?.totalKarigarPaymentDue ?? 0)),
          tone: "accent" as const,
        },
      ];
    }
    if (activeTab === "STITCHING") {
      const summary = stitchingQuery.data?.data.summary;
      return [
        {
          label: "Total Pieces Processed",
          value: Number(summary?.totalPiecesReturned ?? 0).toLocaleString(
            "en-IN"
          ),
        },
        {
          label: "Total Payment Due",
          value: formatCurrency(Number(summary?.totalKarigarPaymentDue ?? 0)),
          tone: "accent" as const,
        },
      ];
    }
    const summary = finishingQuery.data?.data.summary;
    return [
      {
        label: "Total Pieces Finished",
        value: `${Number(summary?.totalPiecesCompleted ?? 0).toLocaleString("en-IN")} pcs`,
      },
      {
        label: "Total Karigar Payment Due",
        value: formatCurrency(Number(summary?.totalKarigarPaymentDue ?? 0)),
        tone: "accent" as const,
      },
    ];
  }, [
    activeTab,
    cuttingQuery.data,
    printingQuery.data,
    coloringQuery.data,
    stitchingQuery.data,
    finishingQuery.data,
  ]);

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
          setDrawerOpen(false);
        }}
      />

      <ProductionFilterBar
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
        }}
        purchaseOrders={filterPOs}
        karigars={karigars}
        posLoading={posQuery.isLoading}
        karigarsLoading={karigarsQuery.isLoading}
      />

      {activeQuery.isLoading ? (
        <TableSkeleton rows={8} />
      ) : activeQuery.isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load production entries
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void activeQuery.refetch()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {activeTab === "CUTTING" ? (
            <CuttingTable
              entries={cuttingQuery.data?.data.data ?? []}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "PRINTING" ? (
            <PrintingTable
              entries={printingQuery.data?.data.data ?? []}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "COLORING" ? (
            <ColoringTable
              entries={coloringQuery.data?.data.data ?? []}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "STITCHING" ? (
            <StitchingTable
              entries={stitchingQuery.data?.data.data ?? []}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}
          {activeTab === "FINISHING" ? (
            <FinishingTable
              entries={finishingQuery.data?.data.data ?? []}
              onAdd={() => setDrawerOpen(true)}
            />
          ) : null}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
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
        purchaseOrders={drawerPOs}
        karigars={karigars}
      />
      <RecordPrintingDrawer
        open={drawerOpen && activeTab === "PRINTING"}
        onClose={() => setDrawerOpen(false)}
        purchaseOrders={drawerPOs}
        karigars={karigars}
      />
      <RecordColoringDrawer
        open={drawerOpen && activeTab === "COLORING"}
        onClose={() => setDrawerOpen(false)}
        purchaseOrders={drawerPOs}
        karigars={karigars}
      />
      <RecordStitchingDrawer
        open={drawerOpen && activeTab === "STITCHING"}
        onClose={() => setDrawerOpen(false)}
        purchaseOrders={drawerPOs}
        karigars={karigars}
      />
      <RecordFinishingDrawer
        open={drawerOpen && activeTab === "FINISHING"}
        onClose={() => setDrawerOpen(false)}
        purchaseOrders={drawerPOs}
        karigars={karigars}
      />
    </div>
  );
}
