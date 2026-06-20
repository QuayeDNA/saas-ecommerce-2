import { Button } from "../../../design-system";

type CommissionStatusFilter = "all" | "credited" | "cancelled";

interface ReferralCommissionFilterProps {
  value: CommissionStatusFilter;
  onChange: (filter: CommissionStatusFilter) => void;
}

const FILTERS: CommissionStatusFilter[] = ["all", "credited", "cancelled"];

export const ReferralCommissionFilter = ({ value, onChange }: ReferralCommissionFilterProps) => (
  <div className="flex gap-1 flex-wrap">
    {FILTERS.map((filter) => (
      <Button
        key={filter}
        type="button"
        onClick={() => onChange(filter)}
        variant={value === filter ? "outline" : "ghost"}
        size="sm"
      >
        {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
      </Button>
    ))}
  </div>
);
