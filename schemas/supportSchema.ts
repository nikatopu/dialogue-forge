import { z } from "zod";

/**
 * Topics offered in the support form's dropdown. "other" is always last so the
 * list reads as specific-first, catch-all-last.
 */
export const SUPPORT_TOPICS = [
  { value: "bug",      label: "Bug report" },
  { value: "feature",  label: "Feature request" },
  { value: "account",  label: "Account & sign-in" },
  { value: "data",     label: "Projects, import & export" },
  { value: "engine",   label: "Engine integration" },
  { value: "billing",  label: "Billing" },
  { value: "other",    label: "Other" },
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]["value"];

const TOPIC_VALUES = SUPPORT_TOPICS.map((t) => t.value) as [
  SupportTopic,
  ...SupportTopic[],
];

export const TOPIC_LABELS: Record<SupportTopic, string> = Object.fromEntries(
  SUPPORT_TOPICS.map((t) => [t.value, t.label]),
) as Record<SupportTopic, string>;

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 4000;

/** Shared by the client form and the API route — one source of truth. */
export const supportRequestSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .max(254, "That email address is too long"),
  topic: z.enum(TOPIC_VALUES, {
    error: "Choose what this is about",
  }),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `Please add a bit more detail (at least ${MESSAGE_MIN} characters)`)
    .max(MESSAGE_MAX, `Please keep this under ${MESSAGE_MAX} characters`),
  /**
   * Honeypot — real users never see this field, so anything in it means a bot.
   * Deliberately permissive: the API route accepts a tripped honeypot silently
   * instead of returning a validation error that would tell a bot what caught it.
   */
  company: z.string().optional(),
});

export type SupportRequest = z.infer<typeof supportRequestSchema>;
