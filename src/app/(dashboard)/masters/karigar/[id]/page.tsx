"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { mockKarigars } from "@/mock/masters";
import type { KarigarProfile } from "@/types";
import { KarigarDetailPage } from "@/components/modules/masters/KarigarDetailPage";

interface KarigarDetailRouteProps {
  params: { id: string };
}

export default function KarigarDetailRoute({ params }: KarigarDetailRouteProps) {
  const initial = useMemo(
    () => mockKarigars.find((item) => item.id === params.id) ?? null,
    [params.id]
  );
  const [karigar, setKarigar] = useState<KarigarProfile | null>(initial);

  if (!karigar) {
    notFound();
  }

  return <KarigarDetailPage karigar={karigar} onUpdate={setKarigar} />;
}
