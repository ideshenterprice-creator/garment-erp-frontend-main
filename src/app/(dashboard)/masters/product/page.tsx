"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Recycle, Search, Shirt, Wrench } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { ProductTable } from "@/components/modules/masters/ProductTable";
import { ProductDrawer } from "@/components/modules/masters/ProductDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  getProducts,
  toggleProductStatus,
  deleteProduct,
} from "@/services/masters.service";

type ProductFilter =
  | "ALL"
  | "RAW_MATERIAL"
  | "FINISHED_GOOD"
  | "ACCESSORY"
  | "WASTAGE";

const PAGE_SIZE = 10;

export default function ProductMasterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ProductFilter>("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [statusTarget, setStatusTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filters = {
    category: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, filters],
    queryFn: () => getProducts(filters),
  });

  const rawCount = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, { category: "RAW_MATERIAL", limit: 1 }],
    queryFn: () => getProducts({ category: "RAW_MATERIAL", limit: 1 }),
  });
  const finishedCount = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, { category: "FINISHED_GOOD", limit: 1 }],
    queryFn: () => getProducts({ category: "FINISHED_GOOD", limit: 1 }),
  });
  const accessoryCount = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, { category: "ACCESSORY", limit: 1 }],
    queryFn: () => getProducts({ category: "ACCESSORY", limit: 1 }),
  });
  const wastageCount = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, { category: "WASTAGE", limit: 1 }],
    queryFn: () => getProducts({ category: "WASTAGE", limit: 1 }),
  });

  const products = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersActive = filter !== "ALL" || Boolean(debouncedSearch);

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleProductStatus(id, isActive),
    onSuccess: (_, variables) => {
      toast.success(
        variables.isActive ? "Product activated." : "Product deactivated."
      );
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      setStatusTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update product status."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete product."));
    },
  });

  function clearFilters() {
    setFilter("ALL");
    setSearch("");
    setPage(1);
  }

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
          label="Raw Material"
          value={rawCount.data?.data.total ?? 0}
          accent="teal"
          icon={<Package className="size-5" />}
        />
        <StatCard
          label="Finished Goods"
          value={finishedCount.data?.data.total ?? 0}
          accent="blue"
          icon={<Shirt className="size-5" />}
        />
        <StatCard
          label="Accessories"
          value={accessoryCount.data?.data.total ?? 0}
          accent="orange"
          icon={<Wrench className="size-5" />}
        />
        <StatCard
          label="Wastage"
          value={wastageCount.data?.data.total ?? 0}
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
        extraActions={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load products
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <ProductTable
            products={products}
            onRowClick={(product) =>
              router.push(ROUTES.MASTERS.PRODUCT_DETAIL(product.id))
            }
            onEdit={(product) => {
              setEditing(product);
              setDrawerOpen(true);
            }}
            onToggleStatus={setStatusTarget}
            onDelete={setDeleteTarget}
            onAdd={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
            emptyTitle={
              filtersActive
                ? "No products match your filters"
                : "No products added yet"
            }
            emptyDescription={
              filtersActive
                ? "Try clearing filters or adjusting your search."
                : "Add your first product to the catalog."
            }
            emptyActionLabel="+ New Product"
            emptyActionIsClear={filtersActive}
            onEmptyAction={
              filtersActive
                ? clearFilters
                : () => {
                    setEditing(null);
                    setDrawerOpen(true);
                  }
            }
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="products"
          />
        </>
      )}

      <ProductDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        product={editing}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => {
          if (!toggleStatusMutation.isPending) setStatusTarget(null);
        }}
        title={
          statusTarget?.isActive
            ? `Deactivate ${statusTarget.name}?`
            : `Activate ${statusTarget?.name ?? "product"}?`
        }
        description={
          statusTarget?.isActive
            ? "This product will no longer be available for new transactions."
            : "This product will become available again."
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Activate"}
        onConfirm={() => {
          if (!statusTarget) return;
          toggleStatusMutation.mutate({
            id: statusTarget.id,
            isActive: !statusTarget.isActive,
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.name} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
