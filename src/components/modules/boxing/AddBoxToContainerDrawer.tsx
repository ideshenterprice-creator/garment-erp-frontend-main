"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DrawerForm } from "@/components/common/DrawerForm";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { addBoxToContainer, getBoxes } from "@/services/boxing.service";
import { cn } from "@/lib/utils";

interface AddBoxToContainerDrawerProps {
  open: boolean;
  containerId: string;
  poId: string;
  onClose: () => void;
}

export function AddBoxToContainerDrawer({
  open,
  containerId,
  poId,
  onClose,
}: AddBoxToContainerDrawerProps) {
  const queryClient = useQueryClient();
  const [selectedBoxId, setSelectedBoxId] = useState<string>("");

  const boxesQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.BOXES,
      { poId, status: "PACKED", limit: 100 },
    ],
    queryFn: () => getBoxes({ poId, status: "PACKED", limit: 100 }),
    enabled: open && Boolean(poId),
  });

  const boxes = boxesQuery.data?.data.data ?? [];

  useEffect(() => {
    if (!open) return;
    setSelectedBoxId("");
  }, [open]);

  const addMutation = useMutation({
    mutationFn: (boxId: string) =>
      addBoxToContainer(containerId, { boxId }),
    onSuccess: () => {
      toast.success("Box added to container.");
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.CONTAINERS, containerId],
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTAINERS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOXES });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add box."));
    },
  });

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!addMutation.isPending) onClose();
      }}
      title="Add Box to Container"
      description="Select a PACKED box from the same purchase order"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            disabled={!selectedBoxId || addMutation.isPending}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
            onClick={() => {
              if (selectedBoxId) addMutation.mutate(selectedBoxId);
            }}
          >
            {addMutation.isPending ? "Adding..." : "Add Box"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onClose}
            disabled={addMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {boxesQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading packed boxes...</p>
        ) : boxes.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-600">
            No PACKED boxes available for this PO.
          </p>
        ) : (
          boxes.map((box) => (
            <button
              key={box.id}
              type="button"
              onClick={() => setSelectedBoxId(box.id)}
              className={cn(
                "rounded-lg border px-3 py-3 text-left transition-colors",
                selectedBoxId === box.id
                  ? "border-[#1b3a3a] bg-[#1b3a3a]/5"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <p className="font-semibold text-slate-900">{box.boxNumber}</p>
              <p className="mt-1 text-sm text-slate-600">
                {box.designNumber} · {box.color} · {box.totalPieces} pcs
              </p>
            </button>
          ))
        )}
      </div>
    </DrawerForm>
  );
}
