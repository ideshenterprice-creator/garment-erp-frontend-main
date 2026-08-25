"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ProductDetailPage } from "@/components/modules/masters/ProductDetailPage";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getProductById } from "@/services/masters.service";

export default function ProductDetailRoute() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, id],
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  const status =
    error instanceof AxiosError ? error.response?.status : undefined;

  if (isError && status === 404) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been removed or the link is invalid."
      />
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">
          Could not load product details
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return <ProductDetailPage product={data.data} />;
}
