"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Copy } from "@/lib/i18n";
import { RichTextEditor } from "./rich-text-editor";

const fieldClass = "mt-2 w-full border-b border-[#bdbdb7] bg-transparent px-0 py-3 text-base outline-none placeholder:text-[#858580] focus:border-[#1b1b1b]";
const labelClass = "text-[11px] font-semibold tracking-[.18em] text-[#72726d]";

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function ContactForm({ locale, copy }: { locale: string; copy: Copy["contact"]["form"] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [editorKey, setEditorKey] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    if (!name.trim() || !email.trim() || !plainText(message)) {
      setStatus("error");
      setFeedback(copy.required);
      return;
    }

    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, locale, website: trap }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || copy.error);

      setStatus("sent");
      router.push(`/${locale}/contact/sent`);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : copy.error);
    }
  }

  return (
    <form className="mt-4 grid gap-6" onSubmit={submit} noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="contact-name">{copy.name}</label>
          <input
            id="contact-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            maxLength={80}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-email">{copy.email}</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            maxLength={200}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="contact-subject">
          {copy.subject} <span className="font-normal normal-case tracking-normal text-[#9a9890]">({copy.optional})</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={160}
          className={fieldClass}
        />
      </div>

      <RichTextEditor
        key={editorKey}
        id="contact-message"
        label={copy.message}
        placeholder={copy.placeholder}
        copy={copy.editor}
        value={message}
        onChange={setMessage}
      />

      {/* Hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" value={trap} onChange={(event) => setTrap(event.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-[#1b1b1b] px-5 py-3 text-[11px] font-semibold tracking-[.14em] text-white transition hover:bg-[#a28d00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? copy.sending : copy.send}
        </button>
        {feedback && (
          <p
            role={status === "error" ? "alert" : "status"}
            className={`text-sm ${status === "error" ? "text-[#9f321f]" : "text-[#4e6b3f]"}`}
          >
            {feedback}
          </p>
        )}
      </div>
    </form>
  );
}
