"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { createInviteLink, type MockTeamMember } from "@/mock/team";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResendInviteDialogProps {
  open: boolean;
  member: MockTeamMember | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResendInviteDialog({
  open,
  member,
  onClose,
  onConfirm,
}: ResendInviteDialogProps) {
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLink(null);
    }
  }, [open]);

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  function handleResend() {
    const nextLink = createInviteLink(member?.email);
    setLink(nextLink);
    onConfirm();
    if (member) {
      toast.success(`Invite resent to ${member.email}.`);
    }
  }

  function handleClose() {
    setLink(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        {link ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Invite resent
              </DialogTitle>
              <DialogDescription>
                Share this new link manually during development.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <code className="flex-1 break-all text-xs text-slate-700">
                {link}
              </code>
              <Button type="button" size="icon" variant="outline" onClick={copyLink}>
                <Copy className="size-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleClose} className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                Resend Invite to {member?.email ?? "member"}?
              </DialogTitle>
              <DialogDescription>
                A new invite link will be generated. The previous link will
                expire immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                onClick={handleResend}
              >
                Resend Invite
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
