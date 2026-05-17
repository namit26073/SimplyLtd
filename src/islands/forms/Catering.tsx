import { useId, useState, useRef, type JSX, type ReactNode } from "react";
import {
  cateringSchema,
  EVENT_TYPES,
  type CateringFormInput,
} from "../../schemas/catering";
import "./form.css";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type FieldErrors = Partial<Record<keyof CateringFormInput, string>>;

const eventTypeLabel: Record<(typeof EVENT_TYPES)[number], string> = {
  wedding: "Wedding",
  corporate: "Corporate",
  festival: "Festival",
  private: "Private party",
  other: "Something else",
};

const initialValues: CateringFormInput = {
  name: "",
  email: "",
  phone: "",
  eventDate: "",
  flexibleDate: false,
  eventType: "wedding",
  guestCount: 50,
  eventLocation: "",
  notes: "",
};

export default function Catering(): JSX.Element {
  const formId = useId();
  const errorRegionId = `${formId}-errors`;
  const successHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const [values, setValues] = useState<CateringFormInput>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({ kind: "idle" });
  const [botField, setBotField] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrors({});

    // Honeypot: silently succeed-ish but don't actually send.
    if (botField !== "") {
      setSubmission({ kind: "success" });
      return;
    }

    // Turnstile widget integration is wired to the page chrome; in dev
    // (no key configured) we pass a dev sentinel that the function will
    // accept when TURNSTILE_SECRET_KEY is unset.
    const turnstileToken =
      (window as unknown as { turnstile?: { getResponse(): string | undefined } })
        .turnstile?.getResponse() ?? "dev-bypass";

    const parsed = cateringSchema.safeParse({
      ...values,
      turnstileToken,
      botField,
    });

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !(path in fieldErrors)) {
          fieldErrors[path as keyof CateringFormInput] = issue.message;
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
      const response = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          errors?: FieldErrors;
          message?: string;
        };
        if (body.errors) {
          setErrors(body.errors);
        }
        setSubmission({
          kind: "error",
          message: body.message ?? "Something went wrong sending your enquiry.",
        });
        return;
      }

      setSubmission({ kind: "success" });
      // Move focus to the success heading for screen-reader announcement
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
          Enquiry received.
        </h2>
        <p className="t-editorial t-editorial--italic form-success__dek">
          Thanks for getting in touch. Someone from the team will reply within two working days. If
          your event is in the next 14 days, give us a call instead.
        </p>
        <p className="t-caption form-success__detail">
          We replied to {values.email}
        </p>
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
      {/* Honeypot — visually hidden, off-tab, named generically. */}
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
        <Field
          id={`${formId}-name`}
          label="Your name"
          required
          error={errors.name}
        >
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

        <Field
          id={`${formId}-email`}
          label="Email"
          required
          error={errors.email}
        >
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

        <Field
          id={`${formId}-phone`}
          label="Phone (optional)"
          error={errors.phone}
        >
          <input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
          />
        </Field>

        <Field
          id={`${formId}-event-location`}
          label="Event location"
          required
          error={errors.eventLocation}
          hint="A postcode or venue name is fine."
        >
          <input
            id={`${formId}-event-location`}
            type="text"
            autoComplete="off"
            required
            aria-required="true"
            value={values.eventLocation}
            onChange={(e) => setValues({ ...values, eventLocation: e.target.value })}
          />
        </Field>

        <Field
          id={`${formId}-event-date`}
          label="Event date"
          error={errors.eventDate}
        >
          <input
            id={`${formId}-event-date`}
            type="date"
            value={values.eventDate}
            disabled={values.flexibleDate}
            onChange={(e) => setValues({ ...values, eventDate: e.target.value })}
          />
          <label className="form__inline-check">
            <input
              type="checkbox"
              checked={values.flexibleDate}
              onChange={(e) =>
                setValues({
                  ...values,
                  flexibleDate: e.target.checked,
                  eventDate: e.target.checked ? "" : values.eventDate,
                })
              }
            />
            <span className="t-caption">Date is flexible</span>
          </label>
        </Field>

        <Field
          id={`${formId}-guest-count`}
          label="Guest count"
          required
          error={errors.guestCount}
          hint="We cater for 10 and up."
        >
          <input
            id={`${formId}-guest-count`}
            type="number"
            min={10}
            step={1}
            inputMode="numeric"
            required
            aria-required="true"
            value={values.guestCount}
            onChange={(e) =>
              setValues({ ...values, guestCount: Number.parseInt(e.target.value, 10) || 0 })
            }
          />
        </Field>
      </div>

      <fieldset className="form__fieldset">
        <legend className="t-caption form__legend">Event type</legend>
        <div className="form__radio-grid">
          {EVENT_TYPES.map((type) => (
            <label key={type} className="form__radio">
              <input
                type="radio"
                name="eventType"
                value={type}
                checked={values.eventType === type}
                onChange={() => setValues({ ...values, eventType: type })}
              />
              <span>{eventTypeLabel[type]}</span>
            </label>
          ))}
        </div>
        {errors.eventType && (
          <p className="form__error t-caption" role="alert">
            {errors.eventType}
          </p>
        )}
      </fieldset>

      <Field
        id={`${formId}-notes`}
        label="Anything we should know? (optional)"
        error={errors.notes}
      >
        <textarea
          id={`${formId}-notes`}
          rows={4}
          maxLength={2000}
          value={values.notes}
          onChange={(e) => setValues({ ...values, notes: e.target.value })}
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

  // Wire describedBy onto the child input
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
