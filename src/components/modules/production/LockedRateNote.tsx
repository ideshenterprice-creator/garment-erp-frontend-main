interface LockedRateNoteProps {
  note?: string;
}

export function LockedRateNote({
  note = "Rate is locked from Operations & Rates master. Cannot be edited.",
}: LockedRateNoteProps) {
  return <p className="text-xs italic text-muted-foreground">{note}</p>;
}
