import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "../../types/ticket";
import type {
  Category,
  Priority,
  SortBy,
  SortDir,
  TicketListFilters,
  TicketStatus,
} from "../../types/ticket";

interface TicketFiltersProps {
  value: TicketListFilters;
  onChange: (value: TicketListFilters) => void;
}

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as Category[];
const PRIORITY_OPTIONS = Object.keys(PRIORITY_LABELS) as Priority[];
const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as TicketStatus[];

const SORT_OPTIONS: { value: string; label: string; sortBy: SortBy; sortDir: SortDir }[] = [
  { value: "created_at-desc", label: "Newest first", sortBy: "created_at", sortDir: "desc" },
  { value: "created_at-asc", label: "Oldest first", sortBy: "created_at", sortDir: "asc" },
  { value: "priority-desc", label: "Priority: high→low", sortBy: "priority", sortDir: "desc" },
  { value: "priority-asc", label: "Priority: low→high", sortBy: "priority", sortDir: "asc" },
];

const selectClassName = "rounded border border-slate-300 px-2 py-1 text-sm text-slate-700";

export function TicketFilters({ value, onChange }: TicketFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by status"
        className={selectClassName}
        value={value.status ?? ""}
        onChange={(event) =>
          onChange({
            ...value,
            status: (event.target.value || undefined) as TicketStatus | undefined,
            page: 1,
          })
        }
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by category"
        className={selectClassName}
        value={value.category ?? ""}
        onChange={(event) =>
          onChange({
            ...value,
            category: (event.target.value || undefined) as Category | undefined,
            page: 1,
          })
        }
      >
        <option value="">All categories</option>
        {CATEGORY_OPTIONS.map((category) => (
          <option key={category} value={category}>
            {CATEGORY_LABELS[category]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by priority"
        className={selectClassName}
        value={value.priority ?? ""}
        onChange={(event) =>
          onChange({
            ...value,
            priority: (event.target.value || undefined) as Priority | undefined,
            page: 1,
          })
        }
      >
        <option value="">All priorities</option>
        {PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort by"
        className={selectClassName}
        value={`${value.sortBy}-${value.sortDir}`}
        onChange={(event) => {
          const option = SORT_OPTIONS.find((item) => item.value === event.target.value);
          if (!option) return;
          onChange({ ...value, sortBy: option.sortBy, sortDir: option.sortDir, page: 1 });
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
