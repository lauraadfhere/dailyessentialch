"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSiteLogo } from "../../components/site-chrome";
import { DEFAULT_LOGO } from "@/lib/logo-config";

export default function AdminLoginPage() {
  const router = useRouter();
  const logo = useSiteLogo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        setBusy(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f3f3] font-sans text-[#0f1111]">
      <header className="bg-[#323232] px-5 py-3 text-white">
        <Link href="/en" aria-label="Daily Essential" className="inline-block">
          <Image src={logo.headerUrl} unoptimized={logo.headerUrl !== DEFAULT_LOGO} alt="Daily Essential" width={4000} height={1009} sizes={`${logo.headerWidth}px`} style={{ width: logo.headerWidth }} className="h-auto" />
        </Link>
      </header>

      <div className="mx-auto w-full max-w-[420px] px-5 py-14">
        <div className="rounded-lg border border-[#d5d9d9] bg-white p-6 shadow-sm">
          <h1 className="text-[22px] font-medium">Sign in</h1>
          <p className="mt-2 text-[13px] leading-5 text-[#565959]">Enter your administrator email and password to manage posts and content.</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label htmlFor="admin-email" className="mb-1 block text-[13px] font-bold">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1 block text-[13px] font-bold">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
              />
            </div>

            {error && <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-3 py-2 text-[13px] text-[#cc0c39]">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded bg-[#007185] px-4 py-2 text-[14px] font-medium text-white transition hover:bg-[#005a6b] disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-[12px] text-[#565959]">
          <Link href="/en" className="text-[#007185] hover:underline">← Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
