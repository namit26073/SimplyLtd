import { useId, useState, useRef, type JSX, type ReactNode } from "react";
import {
  franchisingSchema,
  INVESTMENT_RANGES,
  INVESTMENT_LABELS,
  TIMELINES,
  TIMELINE_LABELS,
  type FranchisingFormInput,
} from "../../schemas/franchising";
import "./form.css";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type FieldErrors = Partial<Record<keyof FranchisingFormInput, string>>;

const initialValues: FranchisingFormInput = {
  name: "",
  email: "",
  phone: "",
  regionInterest: "",
  investmentRange: "100k-250k",
  timeline: "6-12mo",
  background: "",
};

export default function Franchising(): JSX.Element {
  const formId = useId();
  const errorRegionId = `${formId}-errors`;
  const successHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const [values, setValues] = useState<FranchisingFormInput>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({ kind: "idle" });
  const [botField, setBotField] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrors({});

    if (botField !== "") {
      setSubmission({ kind: "success" });
      return;
    }

    const turnstileToken =
      (window as unknown as { turnstile?: { getResponse(): string | undefined } })
        .turnstile?.getResponse() ?? "dev-bypass";

    const parsed = franchisingSchema.safeParse({
      ...values,
      turnstileToken,
      botField,
    });

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !(path in fieldErrors)) {
          fieldErrors[path as keyof FranchisingFormInput] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setSubmission({
        kind: "error",
        message: "Some fields need attention before we can send this.",
      });
      return;
    }

    setSubmission({ kind: "submitting" });

    try {
      const response = await fetch("/api/franchising", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          errors?: FieldErrors;
          message?: string;
        };
        if (body.errors) setErrors(body.errors);
        setSubmission({
          kind: "error",
          message: body.message ?? "Something went wrong sending your enquiry.",
        });
        return;
      }

      setSubmission({ kind: "success" });
      setTimeout(() => successHeadingRef.current?.focus(), 0);
    } catch {
      setSubmission({
        kind: "error",
        message: "Network error — please try again or email us directly.",
      });
    }
  };

  if (submission.kind === "success") {
    return (
      <div className="form-success" role="status">
        <h2
          ref={successHeadingRef}
          className="t-display form-success__heading"
          tabIndex={-1}
        >
          We&apos;ve got your enquiry.
        </h2>
        <p className="t-editorial t-editorial--italic form-success__dek">
          We review franchising enquiries on Friday afternoons. Expect a reply within five working
          days — we'll start with a quick discovery call.
        </p>
        <p className="t-caption form-success__detail">We replied to {values.email}</p>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={hasErrors ? errorRegionId : undefined}
    >
      <div className="form__honeypot" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Don&apos;t fill this out</label>
        <input
          id={`${formId}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={botField}
          onChange={(e) => setBotField(e.target.value)}
        />
      </div>

      <div className="form__grid">
        <Field id={`${formId}-name`} label="Your name" required error={errors.name}>
          <input
            id={`${formId}-name`}
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </Field>

        <Field id={`${formId}-email`} label="Email" required error={errors.email}>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
        </Field>

        <Field id={`${formId}-phone`} label="Phone" required error={errors.phone}>
          <input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            required
            aria-required="true"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
          />
        </Field>

        <Field
          id={`${formId}-region`}
          label="Region / city you'd like to operate in"
          required
          error={errors.regionInterest}
          hint="A city, neighbourhood, or wider region is fine."
        >
          <input
            id={`${formId}-region`}
            type="text"
            required
            aria-required="true"
            value={values.regionInterest}
            onChange={(e) => setValues({ ...values, regionInterest: e.target.value })}
          />
        </Field>

        <Field
          id={`${formId}-investment`}
          label="Investment range"
          required
          error={errors.investmentRange}
        >
          <select
            id={`${formId}-investment`}
            required
            aria-required="true"
            value={values.investmentRange}
            onChange={(e) =>
              setValues({
                ...values,
                investmentRange: e.target.value as FranchisingFormInput["investmentRange"],
              })
            }
          >
            {INVESTMENT_RANGES.map((r) => (
              <option key={r} value={r}>
                {INVESTMENT_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id={`${formId}-timeline`}
          label="Timeline"
          required
          error={errors.timeline}
        >
          <select
            id={`${formId}-timeline`}
            required
            aria-required="true"
            value={values.timeline}
            onChange={(e) =>
              setValues({ ...values, timeline: e.target.value as FranchisingFormInput["timeline"] })
            }
          >
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {TIMELINE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id={`${formId}-background`}
        label="Tell us about yourself (optional)"
        error={errors.background}
        hint="Hospitality background, business experience, why Simply specifically. The more we know, the better the first call."
      >
        <textarea
          id={`${formId}-background`}
          rows={6}
          maxLength={4000}
          value={values.background}
          onChange={(e) => setValues({ ...values, background: e.target.value })}
        />
      </Field>

      {submission.kind === "error" && (
        <div id={errorRegionId} className="form__error-region" role="alert" aria-live="polite">
          {submission.message}
        </div>
      )}

      <div className="form__actions">
        <button
          type="submit"
          className="form__submit"
          disabled={submission.kind === "submitting"}
          aria-busy={submission.kind === "submitting"}
        >
          {submission.kind === "submitting" ? "Sending…" : "Send enquiry"}
          {submission.kind !== "submitting" && (
            <span aria-hidden="true" className="form__submit-arrow">
              →
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function Field({ id, label, required, error, hint, children }: FieldProps): JSX.Element {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const decoratedChildren =
    typeof children === "object" && children !== null && "props" in children
      ? // @ts-expect-error - cloning React children to inject aria attributes
        { ...children, props: { ...children.props, "aria-describedby": describedBy } }
      : children;

  return (
    <div className="form__field">
      <label htmlFor={id} className="form__label">
        {label}
        {required && (
          <span aria-hidden="true" className="form__required">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="form__hint t-caption">
          {hint}
        </p>
      )}
      {decoratedChildren}
      {error && (
        <p id={errorId} className="form__error t-caption" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
