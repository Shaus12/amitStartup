"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Sparkles, MapPin, FileText } from "lucide-react";
import { useT } from "@/lib/i18n";

const NAV_ICONS = [LayoutDashboard, CheckSquare, Sparkles, MapPin, FileText];

export function Sidebar() {
  const pathname = usePathname();
  const t = useT();
  const nav = t.sidebar.nav.map((item, i) => ({ ...item, icon: NAV_ICONS[i] }));

  return (
    <aside
      className="w-[220px] shrink-0 flex flex-col"
      style={{ backgroundColor: "#191b22", borderRight: "1px solid #282a30" }}
    >
      {/* Logo */}
      <div className="px-5 h-14 flex items-center" style={{ borderBottom: "1px solid #282a30" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4d8eff, #adc6ff)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight leading-none" style={{ fontFamily: "var(--font-manrope)", color: "#e2e2eb" }}>
              BizView
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

      <div className="px-5 py-4" style={{ borderTop: "1px solid #282a30" }}>
        <p className="text-[10px]" style={{ color: "#33343b", fontFamily: "var(--font-inter)" }}>
          {t.sidebar.footer}
        </p>
      </div>
    </aside>
  );
}
