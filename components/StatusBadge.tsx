import type { BookingStatus } from "@/app/generated/prisma/client";

const MAP: Record<BookingStatus, { cls: string; label: string }> = {
  PAID: { cls: "badge-paid", label: "Paid" },
  PENDING: { cls: "badge-pending", label: "Awaiting payment" },
  PROCESSING: { cls: "badge-processing", label: "Processing" },
  FAILED: { cls: "badge-failed", label: "Payment failed" },
  CANCELED: { cls: "badge-canceled", label: "Canceled" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { cls, label } = MAP[status] ?? MAP.PENDING;
  return <span className={cls}>{label}</span>;
}
