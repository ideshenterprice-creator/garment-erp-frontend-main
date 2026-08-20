"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Package, Plus } from "lucide-react";
import { mockProducts, type MockProduct } from "@/mock/masters";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { ProductTable } from "@/components/modules/masters/ProductTable";
import { ProductDrawer } from "@/components/modules/masters/ProductDrawer";
import { Pagination } from "@/components/common/Pagination";

type ProductFilter =
  | "ALL"
  | "RAW_MATERIAL"
  | "FINISHED_GOOD"
  | "ACCESSORY"
  | "WASTAGE";

const PAGE_SIZE = 9;

export default function ProductMasterPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MockProduct[]>(mockProducts);
  const [filter, setFilter] = useState<ProductFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MockProduct | null>(null);

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

  const lowStock = 12;
  const activeSamples = products.filter((p) => p.category === "FINISHED_GOOD").length;

  return (
    <div>
      <PageHeader
        title="Product Master"
        subtitle="Fabric, finished garments, accessories and wastage — everything the factory uses or produces."
        actionButton={
          <PageHeaderAction
            label="+ New Product"
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
          value={124}
          accent="teal"
          icon={<Package className="size-5" />}
        />
        <StatCard
          label="Low Stock"
          value={`${lowStock} Items`}
          accent="orange"
          valueClassName="text-orange-600"
        />
        <StatCard
          label="Active Samples"
          value={String(activeSamples).padStart(2, "0")}
          accent="pink"
        />
        <StatCard label="Wastage Rate" value="2.4%" accent="gray" />
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
            onEdit={(product) => {
              setEditing(product);
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
              return prev.map((item) => (item.id === product.id ? product : item));
            }
            return [product, ...prev];
          });
        }}
      />
    </div>
  );
}
