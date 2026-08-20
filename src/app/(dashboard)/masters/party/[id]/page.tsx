"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { mockParties } from "@/mock/masters";
import type { Party } from "@/types";
import { PartyDetailPage } from "@/components/modules/masters/PartyDetailPage";

interface PartyDetailRouteProps {
  params: { id: string };
}

export default function PartyDetailRoute({ params }: PartyDetailRouteProps) {
  const initial = useMemo(
    () => mockParties.find((party) => party.id === params.id) ?? null,
    [params.id]
  );

  const [party, setParty] = useState<Party | null>(initial);

  if (!party) {
    notFound();
  }

  return <PartyDetailPage party={party} onPartyUpdate={setParty} />;
}
