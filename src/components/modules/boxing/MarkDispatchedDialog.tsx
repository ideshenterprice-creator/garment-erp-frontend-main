"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayInputValue } from "@/lib/boxing";

interface MarkDispatchedDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (dispatchDate: string) => void;
}

export function MarkDispatchedDialog({
  open,
  loading = false,
  onClose,
  onConfirm,
}: MarkDispatchedDialogProps) {
  const [dispatchDate, setDispatchDate] = useState(todayInputValue());

  useEffect(() => {
    if (!open) return;
    setDispatchDate(todayInputValue());
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Dispatched</DialogTitle>
          <DialogDescription>
            Set the dispatch date and confirm shipment of this container.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="dispatch-date">Dispatch Date *</Label>
          <Input
            id="dispatch-date"
            type="date"
            value={dispatchDate}
            onChange={(event) => setDispatchDate(event.target.value)}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!dispatchDate || loading}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
            onClick={() => onConfirm(dispatchDate)}
          >
            {loading ? "Dispatching..." : "Mark Dispatched"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
