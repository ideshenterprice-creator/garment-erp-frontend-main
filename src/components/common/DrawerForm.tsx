"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DrawerFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DrawerForm({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DrawerFormProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <SheetContent
        side="right"
        className={cn(
          "flex w-full flex-col gap-0 p-0 sm:max-w-md lg:max-w-lg",
          className
        )}
      >
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle className="text-xl font-bold text-slate-900">{title}</SheetTitle>
          {description ? (
            <SheetDescription className="text-sm text-muted-foreground">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="px-6 py-5">{children}</div>
        </ScrollArea>
        {footer ? (
          <div className="border-t bg-slate-50 px-6 py-4">{footer}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
