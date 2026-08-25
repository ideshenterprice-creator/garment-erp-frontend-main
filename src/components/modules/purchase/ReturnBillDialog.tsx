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

interface ReturnBillDialogProps {
  open: boolean;
  billNumber?: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function ReturnBillDialog({
  open,
  billNumber,
  isPending = false,
  onClose,
  onConfirm,
}: ReturnBillDialogProps) {
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
      setError("Please provide a return reason");
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
          <DialogTitle>Return Purchase Bill</DialogTitle>
          <DialogDescription>
            {billNumber
              ? `Return ${billNumber}? Stock will be reversed for this fabric lot.`
              : "Return this purchase bill? Stock will be reversed."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="return-reason">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="return-reason"
            rows={3}
            placeholder="Enter return reason..."
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
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Returning..." : "Confirm Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
