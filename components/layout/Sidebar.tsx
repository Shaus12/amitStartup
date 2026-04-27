"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, GitBranch, Sparkles, MapPin, FileText } from "lucide-react";
import { useT } from "@/lib/i18n";

const NAV_ICONS = [LayoutDashboard, CheckSquare, GitBranch, Sparkles, MapPin, FileText];

export function MobileNav() {
  const pathname = usePathname();
  const t = useT();
  const nav = t.sidebar.nav.map((item: { href: string; label: string; description: string }, i: number) => ({ ...item, icon: NAV_ICONS[i] }));

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      style={{ backgroundColor: "#191b22", borderTop: "1px solid #282a30" }}
    >
      {nav.map(({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            style={{ color: active ? "#4d8eff" : "#8c909f" }}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} style={{ color: active ? "#4d8eff" : "inherit" }} />
            <span className="text-[9px] font-medium leading-none" style={{ fontFamily: "var(--font-inter)" }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useT();
  const nav = t.sidebar.nav.map((item, i) => ({ ...item, icon: NAV_ICONS[i] }));

  return (
    <aside
      className="hidden md:flex w-[220px] shrink-0 flex-col"
      style={{ backgroundColor: "#191b22", borderRight: "1px solid #282a30" }}
    >
      {/* Logo */}
      <div className="px-5 h-14 flex items-center" style={{ borderBottom: "1px solid #282a30" }}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="BizMap Logo" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-sm font-bold tracking-tight leading-none" style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}>
              BizMap
            </p>
            <p className="text-[10px] mt-0.5 leading-none" style={{ color: "#424754", fontFamily: "var(--font-inter)" }}>
              {t.sidebar.intelligence}
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: "#424754", fontFamily: "var(--font-inter)" }}>
          {t.sidebar.workspace}
        </p>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, description }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              data-tour={href === "/tasks" ? "tasks-sidebar-item" : undefined}
              className="group flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150"
              style={{ backgroundColor: active ? "#282a30" : "transparent", color: active ? "#e2e2eb" : "#8c909f" }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.backgroundColor = "#1e1f26";
                if (!active) e.currentTarget.style.color = "#c2c6d6";
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
                if (!active) e.currentTarget.style.color = "#8c909f";
              }}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.5} style={{ color: active ? "#4d8eff" : "inherit" }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-none truncate" style={{ fontFamily: "var(--font-inter)" }}>{label}</p>
                <p className="text-[10px] leading-none mt-1 truncate" style={{ color: active ? "#424754" : "#33343b", fontFamily: "var(--font-inter)" }}>
                  {description}
                </p>
              </div>
              {active && <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "#4d8eff" }} />}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Business Brain */}
      <div className="px-3 pb-3">
        <div
          style={{
            borderRadius: 12,
            border: "1px dashed #282a30",
            padding: "10px 12px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(77,142,255,0.3)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(77,142,255,0.04)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#282a30";
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
          onClick={() => window.location.href = "/brain"}
        >
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 14 }}>🧠</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
              מוח העסק
            </span>
          </div>
          <p style={{ fontSize: 10, color: "#33343b", fontFamily: "var(--font-inter)", lineHeight: 1.4 }}>
            העלה מסמכים לשיפור הניתוח
          </p>
        </div>
      </div>

      <div className="px-5 py-4" style={{ borderTop: "1px solid #282a30" }}>
        <p className="text-[10px]" style={{ color: "#33343b", fontFamily: "var(--font-inter)" }}>
          {t.sidebar.footer}
        </p>
      </div>
    </aside>
  );
}
