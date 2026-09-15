import { useTicketForm } from "./useTicketForm";
import { FormField } from "../form/FormField";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../../types/ticket";
import type { Category, Priority, TicketCreatePayload } from "../../types/ticket";

interface TicketFormProps {
  onSubmit: (values: TicketCreatePayload) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as Category[];
const PRIORITY_OPTIONS = Object.keys(PRIORITY_LABELS) as Priority[];
const inputClassName = "mt-1 w-full rounded border border-slate-300 px-3 py-2";

export function TicketForm({ onSubmit, disabled, isSubmitting, submitError }: TicketFormProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    priority,
    setPriority,
    errors,
    handleSubmit,
  } = useTicketForm(onSubmit);

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4" noValidate>
      <FormField label="Title" htmlFor="title" error={errors.title}>
        <input
          id="title"
          type="text"
          className={inputClassName}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          rows={4}
          className={inputClassName}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormField>

      <FormField label="Category" htmlFor="category">
        <select
          id="category"
          className={inputClassName}
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
        >
          {CATEGORY_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Priority" htmlFor="priority">
        <select
          id="priority"
          className={inputClassName}
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority)}
        >
          {PRIORITY_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
      </FormField>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit ticket"}
      </button>
    </form>
  );
}
