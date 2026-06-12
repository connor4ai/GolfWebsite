"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRM } from "@/components/ui/useRM";
import { site } from "@/lib/site";

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const inputClass =
  "w-full border border-line/70 bg-night/60 px-4 py-3.5 font-body text-sm text-cream placeholder:text-mist/50 transition-colors duration-300 focus:border-brass focus:outline-none";

/**
 * Inquiry form with client-side validation and an animated confirmation.
 * Template sites ship without a backend; the submit handler validates,
 * then renders the success state (wire to the client's CRM/email service
 * at deployment — see docs/REPOPULATE.md).
 */
export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const reduced = useRM();
  const topics = useMemo(() => {
    const list = ["General", "Tee times", "Group outings"];
    if (site.flags.hasLodging) list.push("Stay");
    if (site.flags.hasWeddings) list.push("Weddings & events");
    if (site.flags.hasMembership) list.push("Membership");
    return list;
  }, []);

  const normalizedInitial = topics.find(
    (t) => t.toLowerCase().split(" ")[0] === (initialTopic ?? "").toLowerCase()
  );

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    topic: normalizedInitial ?? "General",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);

  const validate = (v = values): FieldErrors => {
    const errs: FieldErrors = {};
    if (!v.name.trim()) errs.name = "Please tell us your name.";
    if (!v.email.trim()) errs.email = "We need an email to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
      errs.email = "That email doesn't look quite right.";
    if (!v.message.trim() || v.message.trim().length < 10)
      errs.message = "Tell us a little more — ten characters at least.";
    return errs;
  };

  const set = (field: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const blur = (field: string) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errs).length === 0) setSent(true);
  };

  const err = (field: keyof FieldErrors) =>
    touched[field] && errors[field] ? (
      <p role="alert" className="mt-1.5 text-xs text-[#e0a37a]">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-[28rem] flex-col items-center justify-center border hairline bg-pine/15 p-10 text-center"
          >
            <motion.svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden
              initial={reduced ? undefined : { rotate: -8 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <circle cx="32" cy="32" r="30" stroke="#c2a35d" strokeWidth="1.5" />
              <motion.path
                d="M20 33.5l8.5 8L44 24"
                stroke="#c2a35d"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? undefined : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              />
            </motion.svg>
            <h3 className="display-3 mt-8">Message received.</h3>
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-mist">
              Thank you, {values.name.split(" ")[0]} — someone from the{" "}
              {site.identity.shortName} team will reply within one business day.
              If it&apos;s urgent, call{" "}
              <a href={site.booking.phoneHref} className="text-brass hover:underline">
                {site.booking.phone}
              </a>
              .
            </p>
            <button
              type="button"
              className="btn-ghost mt-8"
              onClick={() => {
                setSent(false);
                setValues({ name: "", email: "", phone: "", topic: "General", message: "" });
                setTouched({});
                setErrors({});
              }}
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="grid gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-name" className="eyebrow mb-2 block">
                  Name *
                </label>
                <input
                  id="cf-name"
                  name="name"
                  autoComplete="name"
                  className={inputClass}
                  placeholder="Walter Hagen"
                  value={values.name}
                  onChange={set("name")}
                  onBlur={blur("name")}
                  aria-invalid={!!(touched.name && errors.name)}
                />
                {err("name")}
              </div>
              <div>
                <label htmlFor="cf-email" className="eyebrow mb-2 block">
                  Email *
                </label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={set("email")}
                  onBlur={blur("email")}
                  aria-invalid={!!(touched.email && errors.email)}
                />
                {err("email")}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-phone" className="eyebrow mb-2 block">
                  Phone <span className="normal-case text-mist/70">(optional)</span>
                </label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={inputClass}
                  placeholder="+1 (___) ___-____"
                  value={values.phone}
                  onChange={set("phone")}
                />
              </div>
              <div>
                <label htmlFor="cf-topic" className="eyebrow mb-2 block">
                  I&apos;m writing about
                </label>
                <select
                  id="cf-topic"
                  name="topic"
                  className={inputClass}
                  value={values.topic}
                  onChange={set("topic")}
                >
                  {topics.map((t) => (
                    <option key={t} value={t} className="bg-raised text-cream">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cf-message" className="eyebrow mb-2 block">
                Message *
              </label>
              <textarea
                id="cf-message"
                name="message"
                rows={6}
                className={`${inputClass} resize-y`}
                placeholder="Dates, party size, the state of your short game — whatever helps."
                value={values.message}
                onChange={set("message")}
                onBlur={blur("message")}
                aria-invalid={!!(touched.message && errors.message)}
              />
              {err("message")}
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <button type="submit" className="btn-primary">
                Send message
              </button>
              <p className="text-xs text-mist">* required</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
