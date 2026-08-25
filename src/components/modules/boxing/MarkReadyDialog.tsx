"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface MarkReadyDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MarkReadyDialog({
  open,
  onClose,
  onConfirm,
}: MarkReadyDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Mark container ready?"
      description="Confirm that all boxes are loaded and this container is ready for dispatch."
      confirmLabel="Mark Ready"
      variant="default"
    />
  );
}
