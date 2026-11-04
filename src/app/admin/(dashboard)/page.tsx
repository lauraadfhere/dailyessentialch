import Link from "next/link";
import { connection } from "next/server";
import { getPosts, type Post } from "@/lib/parse";
import { DownloadReportButton, type ReportRow } from "../download-report-button";

const ranges = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "month", label: "This month" },
] as const;

const chartTypes = [
  { key: "bar", label: "Bar chart" },
  { key: "line", label: "Line chart" },
] as const;

type RangeKey = (typeof ranges)[number]["key"];
type ChartKey = (typeof chartTypes)[number]["key"];

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isPublished(post: Post) {
  return post.status !== "draft";
}

function publishedTime(post: Post) {
  if (!post.publishedAt) return null;
  const time = new Date(post.publishedAt).getTime();
  return Number.isNaN(time) ? null : time;
}

function getRangeBounds(key: RangeKey, now: Date): [number, number] {
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const end = Number.POSITIVE_INFINITY;

  if (key === "yesterday") return [startYesterday, startToday];
  if (key === "month") return [startMonth, end];
  return [startToday, end];
}

function monthlyCounts(posts: Post[], now: Date, months: number) {
  const buckets = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    return { label: date.toLocaleDateString("en-GB", { month: "short" }), year: date.getFullYear(), month: date.getMonth(), count: 0 };
  });

  for (const post of posts) {
    if (!isPublished(post)) continue;
    const time = publishedTime(post);
    if (time === null) continue;
    const date = new Date(time);
    const bucket = buckets.find((item) => item.year === date.getFullYear() && item.month === date.getMonth());
    if (bucket) bucket.count += 1;
  }

  return buckets;
}

function LineChart({ data, max }: { data: { label: string; count: number }[]; max: number }) {
  const width = 640;
  const height = 200;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const x = (index: number) => padLeft + (data.length === 1 ? innerW / 2 : (index * innerW) / (data.length - 1));
  const y = (count: number) => padTop + innerH - (count / max) * innerH;
  const points = data.map((bucket, index) => `${x(index)},${y(bucket.count)}`).join(" ");
  const gridLevels = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(max * ratio));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Line chart of posts published per month">
      {gridLevels.map((level) => (
        <g key={level}>
          <line x1={padLeft} x2={width - padRight} y1={y(level)} y2={y(level)} stroke="#e7e7e7" />
          <text x={padLeft - 8} y={y(level) + 4} textAnchor="end" fontSize="11" fill="#565959">{level}</text>
        </g>
      ))}
      <polyline points={points} fill="none" stroke="#007185" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((bucket, index) => (
        <g key={`${bucket.label}-${index}`}>
          <circle cx={x(index)} cy={y(bucket.count)} r="4" fill="#fff" stroke="#007185" strokeWidth="2" />
          <text x={x(index)} y={y(bucket.count) - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f1111">{bucket.count}</text>
          <text x={x(index)} y={height - 8} textAnchor="middle" fontSize="12" fill="#565959">{bucket.label}</text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ data, max }: { data: { label: string; count: number }[]; max: number }) {
  return (
    <div className="relative flex h-56 items-end gap-4 pb-7 pl-9 pr-2 pt-6" role="img" aria-label="Bar chart of posts published per month">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <div key={ratio} className="pointer-events-none absolute inset-x-0 border-t border-[#e7e7e7]" style={{ bottom: `${28 + ratio * (224 - 28 - 24)}px` }} />
      ))}
      {data.map((bucket) => (
        <div key={bucket.label} className="relative flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[12px] font-semibold text-[#0f1111]">{bucket.count}</span>
          <div
            className="w-full max-w-[64px] bg-[#007185] transition-all"
            style={{ height: `${Math.max(bucket.count === 0 ? 2 : 4, (bucket.count / max) * 75)}%` }}
          />
          <span className="absolute -bottom-7 text-[12px] text-[#565959]">{bucket.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string; chart?: string }> }) {
  await connection();
  const params = await searchParams;
  const activeRange: RangeKey = ranges.some((item) => item.key === params.range) ? (params.range as RangeKey) : "today";
  const activeChart: ChartKey = params.chart === "line" ? "line" : "bar";
  const activeLabel = ranges.find((item) => item.key === activeRange)?.label ?? "Today";

  let posts: Post[] = [];
  let error = "";
  try {
    posts = await getPosts();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load posts.";
  }

  const now = new Date();
  const [start, end] = getRangeBounds(activeRange, now);
  const publishedInRange = posts.filter((post) => {
    if (!isPublished(post)) return false;
    const time = publishedTime(post);
    return time !== null && time >= start && time < end;
  });
  const published = posts.filter(isPublished).length;
  const drafts = posts.length - published;
  const chart = monthlyCounts(posts, now, 6);
  const maxCount = Math.max(4, ...chart.map((bucket) => bucket.count));
  const recent = posts.slice(0, 8);

  const reportRows: ReportRow[] = publishedInRange.map((post) => ({
    title: post.title,
    slug: post.slug,
    category: post.category,
    locale: post.locale || "en",
    status: post.status,
    publishedAt: post.publishedAt ?? "",
  }));

  const metrics = [
    {
      title: `Posts published`,
      value: publishedInRange.length,
      note: `${activeLabel} · live on the storefront`,
      href: "/admin/posts",
      cta: "View posts",
    },
    {
      title: "Drafts",
      value: drafts,
      note: "Not visible on the storefront yet",
      href: "/admin/posts/new",
      cta: "Start a draft",
    },
    {
      title: "Total published",
      value: published,
      note: "Across all languages",
      href: "/admin/posts",
      cta: "Manage content",
    },
  ];

  const buildHref = (range: RangeKey, chartType: ChartKey = activeChart) => `/admin?range=${range}&chart=${chartType}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="admin-display text-[34px] font-normal leading-tight text-[#0f1111]">Dashboard</h1>
          <p className="mt-1 max-w-3xl text-[12px] leading-5 text-[#565959]">
            All numbers are based on the posts stored in your Parse content database. Drafts are hidden from the storefront until published.{" "}
            <Link href="/admin/posts" className="font-semibold text-[#007185] hover:underline">Learn more about the Dashboard.</Link>
          </p>
        </div>
        <Link href="/admin/posts/new" className="rounded-[3px] border border-[#007185] px-4 py-2 text-[14px] font-medium text-[#007185] transition hover:bg-[#f0f8fa]">
          Add a post
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>
      )}

      <section className="rounded-[4px] border border-[#d5d9d9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-1">
          <nav className="flex gap-1 text-[14px]" aria-label="Period">
            {ranges.map((item) => {
              const active = item.key === activeRange;
              return (
                <Link
                  key={item.key}
                  href={buildHref(item.key)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`border-b-[3px] px-3 pb-2.5 pt-3 transition-colors ${
                    active ? "border-[#007185] font-bold text-[#0f1111]" : "border-[#e7e7e7] text-[#565959] hover:text-[#0f1111]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <DownloadReportButton rows={reportRows} filename={`dashboard-${activeRange}.csv`} />
        </div>
        <div className="grid gap-8 px-6 py-7 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.title} className="flex flex-col">
              <p className="text-[16px] font-bold text-[#0f1111]">{metric.title}</p>
              <p className="admin-display mt-4 text-[44px] font-normal leading-none text-[#0f1111]">{metric.value}</p>
              <p className="mt-2 text-[12px] text-[#565959]">{metric.note}</p>
              <div className="mt-auto border-t border-[#d5d9d9] pt-3">
                <Link href={metric.href} className="text-[14px] text-[#007185] hover:underline">{metric.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[4px] border border-[#d5d9d9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5">
          <div>
            <h2 className="text-[17px] font-bold text-[#0f1111]">Posts published</h2>
            <p className="mt-1 text-[13px] text-[#565959]">Last 6 months</p>
          </div>
          <div className="flex overflow-hidden rounded-[3px] border border-[#007185] text-[14px]" role="group" aria-label="Chart type">
            {chartTypes.map((item) => {
              const active = item.key === activeChart;
              return (
                <Link
                  key={item.key}
                  href={buildHref(activeRange, item.key)}
                  scroll={false}
                  aria-pressed={active}
                  className={`px-4 py-1.5 ${active ? "bg-[#007185] font-medium text-white" : "bg-white text-[#007185] hover:bg-[#f0f8fa]"}`}
                >
                  {active && item.key === "bar" ? "✓ " : ""}{item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="px-6 pb-10 pt-6">
          {activeChart === "line" ? <LineChart data={chart} max={maxCount} /> : <BarChart data={chart} max={maxCount} />}
        </div>
      </section>

      <section className="rounded-[4px] border border-[#d5d9d9] bg-white">
        <div className="flex items-center justify-between border-b border-[#d5d9d9] px-6 py-4">
          <h2 className="text-[17px] font-bold text-[#0f1111]">Recent posts</h2>
          <Link href="/admin/posts" className="text-[14px] text-[#007185] hover:underline">See all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-8 text-[13px] text-[#565959]">
            {error ? "Posts could not be loaded." : "No posts yet. Use “Add a post” to create the first one."}
          </p>
        ) : (
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#f3f3f3] text-[13px] text-[#565959]">
              <tr>
                <th className="px-6 py-2.5 font-semibold">Title</th>
                <th className="px-6 py-2.5 font-semibold">Language</th>
                <th className="px-6 py-2.5 font-semibold">Status</th>
                <th className="px-6 py-2.5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((post) => (
                <tr key={post.id} className="border-t border-[#e7e7e7]">
                  <td className="px-6 py-3">
                    <Link href={`/admin/posts/${post.slug}`} className="text-[#007185] hover:underline">{post.title}</Link>
                  </td>
                  <td className="px-6 py-3 uppercase">{post.locale || "en"}</td>
                  <td className="px-6 py-3">
                    <span className={isPublished(post) ? "font-semibold text-[#067d62]" : "font-semibold text-[#b12704]"}>{isPublished(post) ? "Published" : "Draft"}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">{formatDate(post.publishedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
