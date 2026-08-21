"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const schema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

interface ReturnBillDialogProps {
  open: boolean;
  invoiceNumber: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function ReturnBillDialog({
  open,
  invoiceNumber,
  onClose,
  onConfirm,
}: ReturnBillDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (open) reset({ reason: "" });
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Return Bill</DialogTitle>
          <DialogDescription>
            Return invoice {invoiceNumber}. Provide a reason for the return.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            onConfirm(values.reason);
            onClose();
          })}
          className="space-y-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="returnReason">Reason</Label>
            <Textarea id="returnReason" rows={4} {...register("reason")} />
            {errors.reason ? (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              Confirm Return
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
