import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BundleNumberDisplayProps {
  bundleNumber: string;
}

export function BundleNumberDisplay({ bundleNumber }: BundleNumberDisplayProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bundleNumber">Bundle / Voucher No</Label>
      <div className="relative">
        <Input
          id="bundleNumber"
          value={bundleNumber}
          readOnly
          className="bg-slate-50 pr-10 text-slate-700"
        />
        <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </div>
      <p className="text-xs text-muted-foreground">
        This bundle number tracks this material through all stages
      </p>
    </div>
  );
}
