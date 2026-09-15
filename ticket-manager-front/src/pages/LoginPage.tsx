import { useState, type FormEvent } from "react";
import { FormField } from "../components/form/FormField";
import { useAuth } from "../auth/useAuth";

const inputClassName = "mt-1 w-full rounded border border-slate-300 px-3 py-2";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Enter your email.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    login(email, password);
  }

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">Ticket Manager</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <input
            id="email"
            type="email"
            className={inputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={fieldErrors.password}>
          <input
            id="password"
            type="password"
            className={inputClassName}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>

        {loginError && <p className="text-sm text-red-600">{loginError}</p>}

        <button
          type="submit"
          disabled={isLoggingIn}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoggingIn ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
