type SubscriptionStatusValue = "trial" | "active" | "past_due" | "cancelled" | "at_risk";

const labels: Record<SubscriptionStatusValue, string> = {
  trial: "Trial",
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  at_risk: "At risk",
};

export function SubscriptionStatus({ status }: { status: SubscriptionStatusValue }) {
  return <span className={`admin-status admin-status--${status}`}>{labels[status]}</span>;
}
