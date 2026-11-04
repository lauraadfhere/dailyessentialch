import Link from "next/link";
import { connection } from "next/server";
import { getContactMessages, type ContactMessage } from "@/lib/contact";
import { RichTextView } from "../../../components/rich-text-view";
import { MessageActions } from "../../message-actions";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const filters = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "handled", label: "Handled" },
];

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await connection();
  const { status } = await searchParams;
  const filter = status === "new" || status === "handled" ? status : "all";

  let messages: ContactMessage[] = [];
  let error = "";
  try {
    messages = await getContactMessages();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load messages.";
  }

  const unread = messages.filter((message) => !message.isHandled).length;
  const visible = messages.filter((message) => (filter === "new" ? !message.isHandled : filter === "handled" ? message.isHandled : true));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Contact messages</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#565959]">
          Everything sent through the contact form. {unread === 0 ? "Nothing is waiting for a reply." : `${unread} ${unread === 1 ? "message is" : "messages are"} still marked new.`}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#d5d9d9] bg-white px-3 py-2 text-[13px]">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={item.key === "all" ? "/admin/messages" : `/admin/messages?status=${item.key}`}
            className={`rounded px-3 py-1.5 ${filter === item.key ? "bg-[#e7f4f7] font-semibold text-[#007185]" : "text-[#0f1111] hover:bg-[#f2f3f3]"}`}
          >
            {item.label}
            {item.key === "new" && unread > 0 ? ` (${unread})` : ""}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-[#d5d9d9] bg-white px-5 py-8 text-[13px] text-[#565959]">
          {error ? "Messages could not be loaded." : filter === "all" ? "No messages yet. They will appear here as soon as the form is used." : "Nothing in this view."}
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((message) => (
            <article key={message.id} className="rounded-lg border border-[#d5d9d9] bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7e7e7] px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">
                    {message.name} <span className="font-normal text-[#565959]">· {message.email}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#565959]">
                    {message.subject || "No subject"} · {formatDate(message.createdAt)}
                    {message.locale ? ` · ${message.locale.toUpperCase()}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${message.isHandled ? "bg-[#f0f2f2] text-[#565959]" : "bg-[#e7f4f7] text-[#007185]"}`}>
                  {message.isHandled ? "Handled" : "New"}
                </span>
              </div>

              <RichTextView html={message.messageHtml} className="space-y-2 px-5 py-4 text-[13px] leading-6 text-[#0f1111]" />

              <div className="flex flex-wrap items-center gap-4 border-t border-[#e7e7e7] px-5 py-2.5">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "your message"}`)}`}
                  className="text-[13px] text-[#007185] hover:underline"
                >
                  Reply by email
                </a>
                <MessageActions id={message.id} isHandled={message.isHandled} subject={message.subject} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
