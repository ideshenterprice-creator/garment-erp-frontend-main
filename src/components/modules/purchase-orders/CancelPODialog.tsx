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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CancelPODialogProps {
  open: boolean;
  poNumber?: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelPODialog({
  open,
  poNumber,
  isPending = false,
  onClose,
  onConfirm,
}: CancelPODialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setError("");
    }
  }, [open]);

  function handleConfirm() {
    if (!reason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }
    onConfirm(reason.trim());
  }

  function handleClose() {
    if (isPending) return;
    setReason("");
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
            value={reason}
            disabled={isPending}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) setError("");
            }}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Keep PO
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Cancelling..." : "Confirm Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
