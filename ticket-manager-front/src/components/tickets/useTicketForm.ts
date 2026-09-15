import { useState, type FormEvent } from "react";
import type { Category, Priority, TicketCreatePayload } from "../../types/ticket";

interface FormErrors {
  title?: string;
  description?: string;
}

function validate(title: string, description: string): FormErrors {
  const errors: FormErrors = {};
  if (!title.trim()) {
    errors.title = "Enter a title";
  } else if (title.trim().length > 200) {
    errors.title = "Title is too long";
  }
  if (!description.trim()) {
    errors.description = "Enter a description";
  }
  return errors;
}

export function useTicketForm(onSubmit: (values: TicketCreatePayload) => void) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("IT");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(title, description);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim(), category, priority });
  }

  return {
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
  };
}
