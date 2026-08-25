"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/services/team.service";

interface DeactivateMemberDialogProps {
  open: boolean;
  member: TeamMember | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeactivateMemberDialog({
  open,
  member,
  isLoading = false,
  onClose,
  onConfirm,
}: DeactivateMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deactivate {member?.name ?? "member"}?</DialogTitle>
          <DialogDescription>
            This will immediately revoke their access to FabricFlow ERP. They
            will be logged out of all sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            This action takes effect immediately. The member will lose access
            right away.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Deactivating..." : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
