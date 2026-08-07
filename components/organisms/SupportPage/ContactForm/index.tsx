"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import cn from "classnames";
import { Button } from "@/components/atoms/Button";
import {
  supportRequestSchema, SUPPORT_TOPICS, MESSAGE_MAX,
  type SupportRequest,
} from "@/schemas/supportSchema";
import style from "./ContactForm.module.scss";

type Status = { kind: "idle" } | { kind: "sent" } | { kind: "failed"; message: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const {
    register, handleSubmit, reset, control,
    formState: { errors, isSubmitting },
  } = useForm<SupportRequest>({
    resolver: zodResolver(supportRequestSchema),
    mode: "onBlur",
    defaultValues: { email: "", topic: undefined, message: "", company: "" },
  });

  // useWatch returns a value rather than a function, so React Compiler can
  // still optimize this component.
  const message = useWatch({ control, name: "message" });
  const messageLength = message?.length ?? 0;

  async function onSubmit(values: SupportRequest) {
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus({
          kind: "failed",
          message: data.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      reset();
      setStatus({ kind: "sent" });
    } catch {
      setStatus({
        kind: "failed",
        message: "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={style.form}>
      <div className={style.field}>
        <label htmlFor="support-email" className={style.label}>Your email</label>
        <input
          id="support-email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "support-email-error" : undefined}
          className={cn(style.input, errors.email && style.inputError)}
          {...register("email")}
        />
        <p className={style.hint}>We&apos;ll only use this to reply to you.</p>
        {errors.email && (
          <p id="support-email-error" role="alert" className={style.error}>{errors.email.message}</p>
        )}
      </div>

      <div className={style.field}>
        <label htmlFor="support-topic" className={style.label}>What&apos;s this about?</label>
        <div className={style.selectWrap}>
          <select
            id="support-topic"
            defaultValue=""
            aria-invalid={!!errors.topic}
            aria-describedby={errors.topic ? "support-topic-error" : undefined}
            className={cn(style.select, errors.topic && style.inputError)}
            {...register("topic")}
          >
            <option value="" disabled>Select a topic…</option>
            {SUPPORT_TOPICS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        {errors.topic && (
          <p id="support-topic-error" role="alert" className={style.error}>{errors.topic.message}</p>
        )}
      </div>

      <div className={style.field}>
        <div className={style.labelRow}>
          <label htmlFor="support-message" className={style.label}>Message</label>
          <span className={cn(style.counter, messageLength > MESSAGE_MAX && style.counterOver)}>
            {messageLength} / {MESSAGE_MAX}
          </span>
        </div>
        <textarea
          id="support-message"
          rows={7}
          placeholder="Tell us what happened, what you expected, and the steps to reproduce it."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "support-message-error" : undefined}
          className={cn(style.textarea, errors.message && style.inputError)}
          {...register("message")}
        />
        {errors.message && (
          <p id="support-message-error" role="alert" className={style.error}>{errors.message.message}</p>
        )}
      </div>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div className={style.honeypot} aria-hidden="true">
        <label htmlFor="support-company">Company</label>
        <input id="support-company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className={style.actions}>
        <Button type="submit" disabled={isSubmitting} className={style.submit}>
          {isSubmitting
            ? <><Loader2 size={14} className="animate-spin" />Sending…</>
            : <><Send size={14} />Send message</>}
        </Button>

        <AnimatePresence mode="wait">
          {status.kind === "sent" && (
            <motion.p
              key="sent"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="status"
              className={cn(style.status, style.statusOk)}
            >
              <CheckCircle2 size={14} />Message sent — we&apos;ll be in touch.
            </motion.p>
          )}
          {status.kind === "failed" && (
            <motion.p
              key="failed"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="alert"
              className={cn(style.status, style.statusBad)}
            >
              <AlertCircle size={14} />{status.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
