"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { NotificationBell } from "./notification-bell";

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/posts/new", label: "Add a post" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/profile", label: "Profile" },
];

const groups = [
  { heading: "REPORTS", items: [{ href: "/admin", label: "Dashboard" }] },
  {
    heading: "MANAGE",
    items: [
      { href: "/admin/posts", label: "All posts" },
      { href: "/admin/posts/new", label: "Add a post" },
      { href: "/admin/messages", label: "Contact messages" },
      { href: "/admin/comments", label: "Comment moderation" },
      { href: "/admin/reviews", label: "Book reviews" },
      { href: "/admin/books", label: "Books" },
      { href: "/admin/books/new", label: "Add a book" },
    ],
  },
  {
    heading: "PROFILE",
    items: [{ href: "/admin/profile", label: "Avatar and bio" }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/posts") {
    return pathname === "/admin/posts" || (pathname.startsWith("/admin/posts/") && !pathname.startsWith("/admin/posts/new"));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Divider() {
  return <hr className="my-5 border-0 border-t border-dashed border-[#c4c4c4]" />;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell min-h-screen bg-white font-sans text-[#0f1111]">
      <header className="admin-shell-header sticky top-0 z-20">
        <div className="bg-[#232323] text-white">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 sm:px-8">
            <Link href="/admin" className="text-[22px] font-normal tracking-[-.01em] text-white sm:text-[28px] lg:text-[32px]">
              daily essential publishing
            </Link>
            <nav className="flex items-center gap-6 text-[15px] sm:text-[16px]">
              <NotificationBell />
              <span className="hidden sm:inline">Help</span>
              <span className="hidden sm:inline">Your account</span>
              <button type="button" onClick={signOut} className="text-white underline-offset-4 hover:underline">
                Sign out
              </button>
            </nav>
          </div>
        </div>
        <div className="border-b border-[#d5d9d9] bg-white">
          <div className="mx-auto flex max-w-[1600px] items-stretch px-5 sm:px-8">
            <div className="flex min-w-0 gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const active = isActive(pathname, tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`whitespace-nowrap border-b-[3px] px-4 pb-2.5 pt-3 text-[15px] sm:text-[16px] transition-colors ${
                      active ? "border-[#007185] font-bold text-[#0f1111]" : "border-transparent text-[#0f1111] hover:text-[#c45500]"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] items-stretch">
        <aside className="hidden w-[236px] shrink-0 self-stretch border-r border-[#d5d9d9] bg-[#f3f3f3] px-5 py-6 md:block">
          {groups.map((group, index) => (
            <div key={group.heading}>
              {index > 0 && <Divider />}
              <p className="mb-2 text-[13px] font-bold tracking-[.02em] text-[#0f1111]">{group.heading}</p>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block py-0.5 text-[14px] hover:underline ${
                        isActive(pathname, item.href) ? "font-bold text-[#007185]" : "text-[#0f1111]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Divider />
          <p className="mb-2 text-[13px] font-bold tracking-[.02em] text-[#0f1111]">SITE</p>
          <Link href="/en" target="_blank" className="block py-0.5 text-[14px] text-[#0f1111] hover:underline">
            View storefront
          </Link>
          <Divider />
          <p className="mb-2 text-[13px] font-bold tracking-[.02em] text-[#0f1111]">ACCOUNT</p>
          <button type="button" onClick={signOut} className="block py-0.5 text-left text-[14px] text-[#0f1111] hover:underline">
            Sign out
          </button>
        </aside>

        <main className="admin-shell-main min-w-0 flex-1 bg-white px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
