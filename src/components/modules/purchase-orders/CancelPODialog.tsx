"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePOStore } from "@/store/poStore";

interface CancelPODialogProps {
  open: boolean;
  poNumber?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelPODialog({
  open,
  poNumber,
  onClose,
  onConfirm,
}: CancelPODialogProps) {
  const cancelReason = usePOStore((state) => state.cancelReason);
  const setCancelReason = usePOStore((state) => state.setCancelReason);
  const [error, setError] = useState("");

  function handleConfirm() {
    if (!cancelReason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }
    onConfirm(cancelReason.trim());
    setCancelReason("");
    setError("");
    onClose();
  }

  function handleClose() {
    setCancelReason("");
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Purchase Order</DialogTitle>
          <DialogDescription>
            {poNumber
              ? `Are you sure you want to cancel ${poNumber}? This action cannot be undone.`
              : "Are you sure you want to cancel this purchase order?"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="cancel-reason">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="cancel-reason"
            rows={3}
            placeholder="Enter cancellation reason..."
            value={cancelReason}
            onChange={(event) => {
              setCancelReason(event.target.value);
              if (error) setError("");
            }}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose}>
            Keep PO
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Confirm Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
