import { statusBadgeClass } from "@/lib/status";

export function StatusBadge({ label, status }: { label: string; status: string }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-left text-xs font-semibold leading-4 ring-1 ring-inset ${statusBadgeClass(
        status
      )}`}
    >
      {label}
    </span>
  );
}
