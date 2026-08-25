"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Ship, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { AddBoxToContainerDrawer } from "@/components/modules/boxing/AddBoxToContainerDrawer";
import { ContainerBoxesTable } from "@/components/modules/boxing/ContainerBoxesTable";
import { ContainerInfoCard } from "@/components/modules/boxing/ContainerInfoCard";
import { ContainerSizeSummaryCard } from "@/components/modules/boxing/ContainerSizeSummaryCard";
import { MarkDispatchedDialog } from "@/components/modules/boxing/MarkDispatchedDialog";
import { MarkReadyDialog } from "@/components/modules/boxing/MarkReadyDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { toIsoDate } from "@/lib/boxing";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  getContainerById,
  markContainerDispatched,
  markContainerReady,
} from "@/services/boxing.service";

interface ContainerDetailPageProps {
  containerId: string;
}

export function ContainerDetailPage({ containerId }: ContainerDetailPageProps) {
  const queryClient = useQueryClient();
  const [addBoxOpen, setAddBoxOpen] = useState(false);
  const [readyOpen, setReadyOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);

  const detailQuery = useQuery({
    queryKey: [...QUERY_KEYS.CONTAINERS, containerId],
    queryFn: () => getContainerById(containerId),
  });

  const container = detailQuery.data?.data;
  const boxCount = container?.boxes?.length ?? 0;
  const canAddBox =
    container?.status === "LOADING" || container?.status === "READY";

  const readyMutation = useMutation({
    mutationFn: () => markContainerReady(containerId),
    onSuccess: () => {
      toast.success("Container marked ready.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTAINERS });
      setReadyOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to mark container ready."));
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: (dispatchDate: string) =>
      markContainerDispatched(containerId, {
        dispatchDate: toIsoDate(dispatchDate),
      }),
    onSuccess: () => {
      toast.success("Container dispatched.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTAINERS });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      setDispatchOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to dispatch container."));
    },
  });

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={ROUTES.BOXING.CONTAINERS}>
            <ArrowLeft className="size-4" />
            Back to Containers
          </Link>
        </Button>
      </div>

      <PageHeader
        title={container?.containerNumber ?? "Container Detail"}
        subtitle="Container contents, size totals, and dispatch actions."
        actionButton={
          container ? (
            <div className="flex flex-wrap items-center gap-2">
              {canAddBox ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddBoxOpen(true)}
                >
                  <Plus className="size-4" />
                  Add Box
                </Button>
              ) : null}

              {container.status === "LOADING" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          type="button"
                          disabled={boxCount === 0}
                          className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                          onClick={() => setReadyOpen(true)}
                        >
                          <CheckCircle2 className="size-4" />
                          Mark as Ready
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {boxCount === 0 ? (
                      <TooltipContent>
                        Add at least one box first
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              ) : null}

              {container.status === "READY" ? (
                <Button
                  type="button"
                  className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                  onClick={() => setDispatchOpen(true)}
                >
                  <Ship className="size-4" />
                  Mark as Dispatched
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />

      {detailQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : detailQuery.isError || !container ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load container.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void detailQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <ContainerInfoCard container={container} />
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Boxes in Container
              </h3>
              <ContainerBoxesTable
                boxes={container.boxes}
                canAdd={canAddBox}
                onAdd={() => setAddBoxOpen(true)}
              />
            </div>
          </div>
          <ContainerSizeSummaryCard summary={container.sizeSummary} />
        </div>
      )}

      {container ? (
        <>
          <AddBoxToContainerDrawer
            open={addBoxOpen}
            containerId={container.id}
            poId={container.poId}
            onClose={() => setAddBoxOpen(false)}
          />
          <MarkReadyDialog
            open={readyOpen}
            onClose={() => setReadyOpen(false)}
            onConfirm={() => readyMutation.mutate()}
          />
          <MarkDispatchedDialog
            open={dispatchOpen}
            loading={dispatchMutation.isPending}
            onClose={() => setDispatchOpen(false)}
            onConfirm={(date) => dispatchMutation.mutate(date)}
          />
        </>
      ) : null}
    </div>
  );
}
