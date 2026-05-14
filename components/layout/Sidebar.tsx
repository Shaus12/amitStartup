"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, GitBranch, Sparkles, FileText, CreditCard } from "lucide-react";
import { useT } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV_ICONS = [LayoutDashboard, CheckSquare, GitBranch, Sparkles, FileText, CreditCard];

export function MobileNav() {
  const pathname = usePathname();
  const t = useT();
  const nav = t.sidebar.nav.map((item: { href: string; label: string; description: string }, i: number) => ({ ...item, icon: NAV_ICONS[i] }));

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      style={{ backgroundColor: "var(--bv-surface-raised)", borderTop: "1px solid var(--bv-border)" }}
    >
      {nav.map(({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            style={{ color: active ? "#4d8eff" : "var(--bv-text-3)" }}
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
      style={{ backgroundColor: "var(--bv-surface-raised)", borderRight: "1px solid var(--bv-border)" }}
    >
      {/* Logo */}
      <div className="px-5 h-14 flex items-center" style={{ borderBottom: "1px solid var(--bv-border)" }}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="BizMap Logo" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-sm font-bold tracking-tight leading-none" style={{ fontFamily: "var(--font-manrope)", color: "var(--bv-text-1)" }}>
              BizMap
            </p>
            <p className="text-[10px] mt-0.5 leading-none" style={{ color: "var(--bv-muted)", fontFamily: "var(--font-inter)" }}>
              {t.sidebar.intelligence}
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--bv-muted)", fontFamily: "var(--font-inter)" }}>
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
              style={{ backgroundColor: active ? "var(--bv-border)" : "transparent", color: active ? "var(--bv-text-1)" : "var(--bv-text-3)" }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.backgroundColor = "var(--bv-surface-elevated)";
                if (!active) e.currentTarget.style.color = "var(--bv-text-2)";
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
                if (!active) e.currentTarget.style.color = "var(--bv-text-3)";
              }}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.5} style={{ color: active ? "#4d8eff" : "inherit" }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-none truncate" style={{ fontFamily: "var(--font-inter)" }}>{label}</p>
                <p className="text-[10px] leading-none mt-1 truncate" style={{ color: active ? "var(--bv-muted)" : "var(--bv-border-subtle)", fontFamily: "var(--font-inter)" }}>
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
            border: "1px dashed var(--bv-border)",
            padding: "10px 12px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(77,142,255,0.3)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(77,142,255,0.04)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--bv-border)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
          onClick={() => window.location.href = "/brain"}
        >
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 14 }}>🧠</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--bv-text-3)", fontFamily: "var(--font-inter)" }}>
              מוח העסק
            </span>
          </div>
          <p style={{ fontSize: 10, color: "var(--bv-border-subtle)", fontFamily: "var(--font-inter)", lineHeight: 1.4 }}>
            העלה מסמכים לשיפור הניתוח
          </p>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--bv-border)" }}>
        <p className="text-[10px]" style={{ color: "var(--bv-border-subtle)", fontFamily: "var(--font-inter)" }}>
          {t.sidebar.footer}
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
