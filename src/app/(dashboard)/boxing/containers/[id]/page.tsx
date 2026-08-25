"use client";

import { useParams } from "next/navigation";
import { ContainerDetailPage } from "@/components/modules/boxing/ContainerDetailPage";

export default function ContainerDetailRoutePage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  if (!id) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Invalid container id.
      </div>
    );
  }

  return <ContainerDetailPage containerId={id} />;
}
