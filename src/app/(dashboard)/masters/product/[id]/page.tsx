"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { mockProducts, type MockProduct } from "@/mock/masters";
import { ProductDetailPage } from "@/components/modules/masters/ProductDetailPage";

interface ProductDetailRouteProps {
  params: { id: string };
}

export default function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const initial = useMemo(
    () => mockProducts.find((product) => product.id === params.id) ?? null,
    [params.id]
  );
  const [product, setProduct] = useState<MockProduct | null>(initial);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailPage product={product} onProductUpdate={setProduct} />
  );
}
