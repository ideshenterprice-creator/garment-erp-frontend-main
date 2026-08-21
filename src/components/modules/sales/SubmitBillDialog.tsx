"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface SubmitBillDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubmitBillDialog({
  open,
  onClose,
  onConfirm,
}: SubmitBillDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Submit Bill"
      description="Submit this bill? It will be sent to accounts and cannot be changed to draft again."
      confirmLabel="Submit Bill"
      variant="default"
    />
  );
}
