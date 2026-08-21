"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Package,
  Plus,
  Recycle,
} from "lucide-react";
import { toast } from "sonner";
import { mockProducts, type MockProduct } from "@/mock/masters";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProductTable } from "@/components/modules/masters/ProductTable";
import { ProductDrawer } from "@/components/modules/masters/ProductDrawer";
import { ROUTES } from "@/constants/routes";

type ProductFilter =
  | "ALL"
  | "RAW_MATERIAL"
  | "FINISHED_GOOD"
  | "ACCESSORY"
  | "WASTAGE";

const PAGE_SIZE = 10;

export default function ProductMasterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MockProduct[]>(mockProducts);
  const [filter, setFilter] = useState<ProductFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MockProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MockProduct | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return products;
    return products.filter((product) => product.category === filter);
  }, [products, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.displayStatus === "ACTIVE").length,
      discontinued: products.filter((p) => p.displayStatus === "DISCONTINUED")
        .length,
      wastage: products.filter((p) => p.category === "WASTAGE").length,
    }),
    [products]
  );

  return (
    <div>
      <PageHeader
        title="Product Master"
        subtitle="Fabric, finished garments, accessories and wastage — everything the factory uses or produces."
        actionButton={
          <PageHeaderAction
            label="New Product"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total SKUs"
          value={stats.total}
          accent="teal"
          icon={<Package className="size-5" />}
        />
        <StatCard
          label="Active Products"
          value={stats.active}
          accent="blue"
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="Discontinued"
          value={stats.discontinued}
          accent="orange"
          icon={<Ban className="size-5" />}
        />
        <StatCard
          label="Wastage Items"
          value={stats.wastage}
          accent="gray"
          icon={<Recycle className="size-5" />}
        />
      </div>

      <FilterBar
        tabs={[
          { label: "All", value: "ALL" },
          { label: "Raw Material", value: "RAW_MATERIAL" },
          { label: "Finished Goods", value: "FINISHED_GOOD" },
          { label: "Accessories", value: "ACCESSORY" },
          { label: "Wastage", value: "WASTAGE" },
        ]}
        activeTab={filter}
        onTabChange={(value) => {
          setFilter(value as ProductFilter);
          setPage(1);
        }}
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <ProductTable
            products={pageItems}
            onRowClick={(product) =>
              router.push(ROUTES.MASTERS.PRODUCT_DETAIL(product.id))
            }
            onEdit={(product) => {
              setEditing(product);
              setDrawerOpen(true);
            }}
            onDelete={setDeleteTarget}
            onAdd={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="products"
          />
        </>
      )}

      {!loading && products.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertTriangle className="size-4" />
          No products in catalog yet.
        </div>
      ) : null}

      <ProductDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        product={editing}
        onSave={(product) => {
          setProducts((prev) => {
            const exists = prev.some((item) => item.id === product.id);
            if (exists) {
              return prev.map((item) =>
                item.id === product.id ? product : item
              );
            }
            return [product, ...prev];
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? "product"}?`}
        description="This product will be removed from the catalog."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteTarget) return;
          setProducts((prev) =>
            prev.filter((item) => item.id !== deleteTarget.id)
          );
          toast.success(`${deleteTarget.name} deleted`);
          setPage(1);
        }}
      />
    </div>
  );
}
