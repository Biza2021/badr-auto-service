"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function PendingButton({
  children,
  pendingLabel = "Enregistrement..."
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className="btn-primary w-full sm:w-auto" type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}
