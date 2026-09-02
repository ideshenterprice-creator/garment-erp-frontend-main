"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteRowButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}

export function DeleteRowButton({
  onClick,
  title = "Delete permanently",
}: DeleteRowButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
