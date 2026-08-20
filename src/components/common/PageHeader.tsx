import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export function PageHeader({ title, subtitle, actionButton }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actionButton ? <div className="shrink-0">{actionButton}</div> : null}
    </div>
  );
}

interface PageHeaderActionProps {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export function PageHeaderAction({ label, onClick, icon }: PageHeaderActionProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
    >
      {icon}
      {label}
    </Button>
  );
}
