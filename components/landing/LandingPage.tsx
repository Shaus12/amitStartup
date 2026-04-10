"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronRight, Zap, Network, Clock,
  Brain, CheckCircle, Activity, AlertTriangle, BarChart3,
  TrendingUp, Users, DollarSign,
} from "lucide-react";

/* ─── Stitch design tokens ──────────────────────────────────────── */
const C = {
  bg:      "#111319",
  s0:      "#0c0e14",
  s1:      "#191b22",
  s2:      "#1e1f26",
  s3:      "#282a30",
  s4:      "#33343b",
  outline: "#424754",
  muted:   "#8c909f",
  sub:     "#c2c6d6",
  text:    "#e2e2eb",
  blue:    "#4d8eff",
  glow:    "#adc6ff",
  green:   "#34d399",
  amber:   "#fbbf24",
  red:     "#f87171",
  purple:  "#a78bfa",
};
const MF: React.CSSProperties = { fontFamily: "var(--font-manrope)" };
const IF: React.CSSProperties = { fontFamily: "var(--font-inter)" };

/* ─── Scroll reveal ─────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("bv-visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".bv-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Nav ────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: C.bg + "d8",
        backdropFilter: "blur(16px) saturate(1.4)",
        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        borderBottom: `1px solid ${C.s3}`,
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.glow})` }}
          >
            <BizLogo size={13} />
          </div>
          <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>BizView</span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7">
          {["Features", "How it works", "Pricing"].map((l) => (
            <span
              key={l}
              className="text-xs font-medium cursor-pointer transition-colors duration-150"
              style={{ ...IF, color: C.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >{l}</span>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:block text-xs font-medium transition-colors duration-150"
            style={{ ...IF, color: C.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >Sign in</Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold transition-all duration-150 active:scale-[0.97]"
            style={{
              ...IF,
              background: C.text,
              color: C.s0,
              boxShadow: `0 1px 0 0 rgba(255,255,255,0.1) inset`,
            }}
          >
            Get BizView free
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-0 px-6 relative overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "600px",
          background: `radial-gradient(ellipse at 50% 0%, rgba(77,142,255,0.09) 0%, transparent 65%)`,
        }} />
      </div>
      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(${C.s3} 1px, transparent 1px),
          linear-gradient(90deg, ${C.s3} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        opacity: 0.18,
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
      }} />

      {/* Content */}
      <div className="relative text-center max-w-[860px] mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8 text-[11px] font-semibold"
          style={{
            ...IF,
            backgroundColor: `rgba(77,142,255,0.08)`,
            border: `1px solid rgba(77,142,255,0.18)`,
            color: C.blue,
            animation: "bv-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.blue, animation: "bv-pulse-dot 2s ease-in-out infinite", display: "inline-block" }} />
          Powered by Claude AI
        </div>

        {/* Headline */}
        <h1
          className="text-[3.25rem] md:text-[4.5rem] lg:text-[5.25rem] font-extrabold leading-[1.02] tracking-tight mb-6"
          style={{ ...MF, color: C.text, animation: "bv-fade-up 0.7s 0.08s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          The AI workspace<br />
          <span style={{ color: C.muted }}>that knows your</span>{" "}
          <span style={{ color: C.text }}>business.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-base md:text-lg leading-relaxed mb-10 mx-auto"
          style={{ ...IF, color: C.muted, maxWidth: "52ch", animation: "bv-fade-up 0.7s 0.16s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          Map every department, process, and workflow. Then let AI tell you exactly
          where you lose time and money — and hand you the agents to fix it.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          style={{ animation: "bv-fade-up 0.7s 0.24s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold transition-all duration-150 active:scale-[0.97] w-full sm:w-auto justify-center"
            style={{ ...IF, background: C.text, color: C.s0 }}
          >
            Map my business free
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-all duration-150 active:scale-[0.97] w-full sm:w-auto justify-center"
            style={{
              ...IF, color: C.sub,
              border: `1px solid ${C.s3}`,
              backgroundColor: C.s2,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.s4; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.s3; }}
          >
            See a live example
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>

        {/* Social proof */}
        <div
          className="flex items-center justify-center gap-4 mt-8 flex-wrap"
          style={{ animation: "bv-fade-up 0.7s 0.32s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {[
            { icon: CheckCircle, text: "No account needed" },
            { icon: CheckCircle, text: "Local-first, data stays with you" },
            { icon: CheckCircle, text: "18-step deep analysis" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs" style={{ ...IF, color: C.outline }}>
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: C.green }} strokeWidth={2.5} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Hero product screenshot */}
      <div
        className="relative mt-16 w-full max-w-[1180px] mx-auto"
        style={{ animation: "bv-fade-up 0.9s 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <HeroBrowserMockup />
        {/* Gradient fade at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${C.bg})` }}
        />
      </div>
    </section>
  );
}

/* ─── Browser mockup ─────────────────────────────────────────────── */
function HeroBrowserMockup() {
  const DEPTS = [
    { id: "mkt", x: 60,  y: 60,  name: "Marketing",  color: C.blue,   status: "Healthy", hrs: 22, procs: 4 },
    { id: "sal", x: 420, y: 40,  name: "Sales",       color: C.green,  status: "At Risk", hrs: 30, procs: 5 },
    { id: "ops", x: 240, y: 200, name: "Operations",  color: C.amber,  status: "Review",  hrs: 38, procs: 7 },
    { id: "fin", x: 620, y: 170, name: "Finance",     color: C.purple, status: "Healthy", hrs: 14, procs: 3 },
    { id: "cs",  x: 80,  y: 240, name: "Customer Success", color: C.red, status: "Review", hrs: 25, procs: 4 },
  ];

  // Connections: [from_id, to_id]
  const EDGES = [
    ["mkt","sal"], ["mkt","ops"], ["sal","ops"],
    ["ops","fin"], ["sal","fin"], ["ops","cs"],
  ];

  // Node centers (x + 130, y + 50)
  const center = (id: string) => {
    const d = DEPTS.find(d => d.id === id)!;
    return { cx: d.x + 130, cy: d.y + 50 };
  };

  return (
    <div
      className="rounded-xl overflow-hidden select-none"
      style={{
        backgroundColor: C.s1,
        border: `1px solid ${C.s3}`,
        boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${C.s4}`,
        transform: "perspective(1400px) rotateX(4deg)",
        transformOrigin: "50% 0%",
      }}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-3 px-4 h-10 shrink-0" style={{ backgroundColor: C.s2, borderBottom: `1px solid ${C.s3}` }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f87171" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fbbf24" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#34d399" }} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded px-3 py-1 text-[11px] w-48" style={{ backgroundColor: C.s3, color: C.outline, ...IF }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green }} />
            bizview.app/dashboard
          </div>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ minHeight: 420 }}>
        {/* Sidebar */}
        <div className="w-40 shrink-0 flex flex-col py-3 px-2" style={{ backgroundColor: C.s1, borderRight: `1px solid ${C.s3}` }}>
          <div className="flex items-center gap-2 px-2 mb-5">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.glow})` }}>
              <BizLogo size={9} />
            </div>
            <span className="text-[11px] font-bold" style={{ ...MF, color: C.text }}>BizView</span>
          </div>
          <div className="text-[8px] font-bold tracking-widest uppercase px-2 mb-2" style={{ ...IF, color: C.s4 }}>Workspace</div>
          {[
            { label: "Business Map", active: true },
            { label: "AI Opportunities", active: false },
          ].map(({ label, active }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-medium mb-0.5"
              style={{ backgroundColor: active ? C.s3 : "transparent", color: active ? C.text : C.outline, ...IF }}
            >
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: active ? C.blue : C.s4 }} />
              {label}
            </div>
          ))}
          <div className="flex-1" />
          {/* AI panel teaser */}
          <div className="mx-1 p-2 rounded" style={{ backgroundColor: `rgba(77,142,255,0.06)`, border: `1px solid ${C.s3}` }}>
            <div className="text-[9px] font-bold mb-1" style={{ ...IF, color: C.blue }}>AI Analysis</div>
            <div className="text-[8px] leading-snug" style={{ ...IF, color: C.outline }}>8 opportunities found</div>
            <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.s3 }}>
              <div className="h-full rounded-full" style={{ width: "67%", background: `linear-gradient(90deg, ${C.blue}, ${C.glow})` }} />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{
            backgroundColor: C.bg,
            backgroundImage: `radial-gradient(circle, ${C.s3} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        >
          {/* Toolbar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10" style={{ backgroundColor: C.bg + "cc", borderBottom: `1px solid ${C.s3}` }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold" style={{ ...MF, color: C.sub }}>Meridian Consulting Group</span>
              <span className="text-[8px]" style={{ color: C.outline }}>·</span>
              <span className="text-[9px]" style={{ ...IF, color: C.outline }}>5 departments · 23 processes</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded" style={{ backgroundColor: C.s2, border: `1px solid ${C.s3}`, color: C.muted, ...IF }}>
              <Zap className="w-2.5 h-2.5" style={{ color: C.glow }} />
              Refresh AI Analysis
            </div>
          </div>

          {/* Map area with nodes */}
          <div className="absolute inset-0 pt-9">
            {/* SVG edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
              {EDGES.map(([from, to]) => {
                const a = center(from), b = center(to);
                const mx = (a.cx + b.cx) / 2, my = (a.cy + b.cy) / 2;
                return (
                  <path
                    key={`${from}-${to}`}
                    d={`M${a.cx},${a.cy} Q${mx},${my - 20} ${b.cx},${b.cy}`}
                    fill="none"
                    stroke={C.s4}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity={0.6}
                  />
                );
              })}
            </svg>

            {/* Department nodes */}
            {DEPTS.map((dept) => {
              const statusColor = dept.status === "Healthy" ? C.green : dept.status === "At Risk" ? C.red : C.amber;
              return (
                <div
                  key={dept.id}
                  className="absolute rounded-lg overflow-hidden"
                  style={{
                    left: dept.x, top: dept.y + 8,
                    width: 180,
                    backgroundColor: C.s2,
                    border: `1px solid ${C.s3}`,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="h-[2px]" style={{ backgroundColor: dept.color }} />
                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="text-[10px] font-bold" style={{ ...MF, color: C.text }}>{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: statusColor }} />
                        <span className="text-[8px] font-semibold" style={{ color: statusColor, ...IF }}>{dept.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[8px]" style={{ color: C.outline, ...IF }}>
                      <span style={{ color: C.muted }}>{dept.hrs}h/wk</span>
                      <span>·</span>
                      <span style={{ color: C.muted }}>{dept.procs} processes</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.s3 }}>
                      <div className="h-full rounded-full" style={{ width: `${[55, 72, 40, 63, 48][DEPTS.indexOf(dept)]}%`, backgroundColor: dept.color, opacity: 0.6 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Logo marquee ───────────────────────────────────────────────── */
const COMPANIES = [
  "Thornwick & Co.", "Barlow Digital", "Fenwick Media", "Ostler Group",
  "Castlewood Retail", "Meridian Consulting", "Halden Studio", "Vantage Partners",
  "Greyfield Labs", "Pembroke Ventures", "Langdon Foods", "Clifton Advisory",
];

function LogoMarquee() {
  const doubled = [...COMPANIES, ...COMPANIES];
  return (
    <section className="py-14 overflow-hidden" style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}` }}>
      <p className="text-center text-[10px] font-bold tracking-[0.15em] uppercase mb-8" style={{ ...IF, color: C.outline }}>
        Trusted by forward-thinking businesses
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${C.s1}, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${C.s1}, transparent)` }} />
        {/* Track */}
        <div className="flex" style={{ animation: "bv-marquee 28s linear infinite" }}>
          {doubled.map((name, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-2 rounded-full px-4 py-2 mx-3 text-xs font-medium"
              style={{ ...IF, color: C.muted, backgroundColor: C.s2, border: `1px solid ${C.s3}`, whiteSpace: "nowrap" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.s4 }} />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature: Business Map ──────────────────────────────────────── */
function FeatureMap() {
  return (
    <section className="py-28" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Text */}
          <div className="bv-reveal">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-5" style={{ ...IF, color: C.blue }}>Business Map</p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6" style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>
              See every corner of<br />your operation.
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ ...IF, color: C.muted, maxWidth: "44ch" }}>
              Every department. Every process. Every workflow rendered as an interactive
              canvas — colour-coded by health, filterable by load, and always up to date.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: Network,  text: "Interactive drag-and-drop canvas" },
                { icon: Activity, text: "Colour-coded health status per department" },
                { icon: Clock,    text: "Hours-per-week and workload breakdown" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm" style={{ ...IF, color: C.sub }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${C.blue}12`, border: `1px solid ${C.blue}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: C.blue }} strokeWidth={1.5} />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="bv-reveal bv-reveal-d2">
            <MapFeatureVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function MapFeatureVisual() {
  const nodes = [
    { x: 0,   y: 0,   name: "Marketing",  color: C.blue,  procs: 4, hrs: 18, manual: 55 },
    { x: 220, y: 0,   name: "Sales",       color: C.green, procs: 6, hrs: 32, manual: 72 },
    { x: 110, y: 140, name: "Operations",  color: C.amber, procs: 8, hrs: 41, manual: 80 },
    { x: 0,   y: 270, name: "Finance",     color: C.purple,procs: 3, hrs: 11, manual: 30 },
    { x: 220, y: 270, name: "Support",     color: C.red,   procs: 5, hrs: 27, manual: 65 },
  ];
  return (
    <div className="relative rounded-xl p-6 overflow-hidden" style={{ backgroundColor: C.s1, border: `1px solid ${C.s3}` }}>
      <div className="relative" style={{ height: 380 }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          {[[0,2],[1,2],[2,3],[2,4]].map(([ai,bi]) => {
            const a = nodes[ai], b = nodes[bi];
            const ax = a.x + 90, ay = a.y + 40, bx = b.x + 90, by = b.y + 40;
            return <path key={`${ai}-${bi}`} d={`M${ax},${ay} Q${(ax+bx)/2},${(ay+by)/2 - 15} ${bx},${by}`} fill="none" stroke={C.s4} strokeWidth="1.5" strokeDasharray="4 4" opacity={0.7} />;
          })}
        </svg>
        {nodes.map((n, i) => (
          <div
            key={n.name}
            className="absolute rounded-lg overflow-hidden"
            style={{ left: n.x, top: n.y, width: 180, backgroundColor: C.s2, border: `1px solid ${C.s3}`, boxShadow: "0 4px 16px rgba(0,0,0,0.35)" }}
          >
            <div className="h-[2px]" style={{ backgroundColor: n.color }} />
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold" style={{ ...MF, color: C.text }}>{n.name}</span>
                <span className="text-[8px]" style={{ color: n.manual > 70 ? C.red : C.muted, ...IF }}>{n.manual}% manual</span>
              </div>
              <div className="flex gap-3 text-[9px] mb-2" style={{ color: C.outline, ...IF }}>
                <span style={{ color: C.muted }}>{n.procs} procs</span>
                <span style={{ color: C.muted }}>{n.hrs}h/wk</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.s3 }}>
                <div className="h-full rounded-full" style={{ width: `${n.manual}%`, backgroundColor: n.manual > 70 ? C.amber : n.manual > 45 ? C.blue : C.green, opacity: 0.8 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature: AI Analysis (dark) ───────────────────────────────── */
function FeatureAI() {
  const OPPS = [
    { agent: "Email Triage Agent",     dept: "Customer Success", hrs: 8.5, savings: "$1,240", complexity: "Low",    color: C.green  },
    { agent: "Report Generator",       dept: "Finance",          hrs: 5.0, savings: "$730",  complexity: "Medium", color: C.blue   },
    { agent: "Lead Scoring AI",        dept: "Sales",            hrs: 7.0, savings: "$1,020", complexity: "Medium", color: C.blue   },
    { agent: "Inventory Reorder Bot",  dept: "Operations",       hrs: 6.5, savings: "$950",  complexity: "Low",    color: C.green  },
  ];

  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}` }}>
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px]" style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(77,142,255,0.06) 0%, transparent 65%)` }} />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">

        {/* Centered header */}
        <div className="text-center max-w-2xl mx-auto mb-16 bv-reveal">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-5" style={{ ...IF, color: C.blue }}>AI Opportunities</p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5" style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>
            Know exactly which agents<br />to deploy first.
          </h2>
          <p className="text-base leading-relaxed" style={{ ...IF, color: C.muted }}>
            Not vague advice. Named agents, estimated hours saved, monthly cost impact,
            and setup complexity — tailored specifically to your business.
          </p>
        </div>

        {/* Opportunities panel */}
        <div className="bv-reveal bv-reveal-d2 rounded-xl overflow-hidden" style={{ border: `1px solid ${C.s3}` }}>
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: C.s2, borderBottom: `1px solid ${C.s3}` }}>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" style={{ color: C.blue }} strokeWidth={1.5} />
              <span className="text-sm font-semibold" style={{ ...MF, color: C.text }}>AI Opportunities</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${C.blue}15`, color: C.blue, ...IF }}>8 found</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ ...IF, color: C.outline }}>Est. monthly savings</span>
              <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>$4,230</span>
            </div>
          </div>
          {/* Rows */}
          {OPPS.map((opp, i) => (
            <div
              key={opp.agent}
              className="flex items-center gap-4 px-6 py-4 bv-feat-card"
              style={{ backgroundColor: i % 2 === 0 ? C.bg : C.s1, borderBottom: `1px solid ${C.s3}` }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${opp.color}12`, border: `1px solid ${opp.color}20` }}>
                <Zap className="w-3.5 h-3.5" style={{ color: opp.color }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ ...MF, color: C.text }}>{opp.agent}</p>
                <p className="text-xs" style={{ ...IF, color: C.outline }}>{opp.dept}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm font-bold tabular-nums" style={{ ...MF, color: C.text }}>{opp.hrs}h</p>
                  <p className="text-[9px]" style={{ ...IF, color: C.outline }}>saved/wk</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ ...MF, color: C.green }}>{opp.savings}</p>
                  <p className="text-[9px]" style={{ ...IF, color: C.outline }}>monthly</p>
                </div>
                <div
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ ...IF, backgroundColor: `${opp.color}12`, color: opp.color }}
                >
                  {opp.complexity}
                </div>
              </div>
            </div>
          ))}
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3.5" style={{ backgroundColor: C.s2 }}>
            <span className="text-xs" style={{ ...IF, color: C.outline }}>Showing 4 of 8 opportunities</span>
            <Link href="/opportunities" className="inline-flex items-center gap-1 text-xs font-medium" style={{ ...IF, color: C.blue }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Feature: How it works ─────────────────────────────────────── */
function FeatureHowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Answer 18 structured questions",
      desc: "Walk through departments, processes, tools, time allocation, pain points, and goals. Structured like a business consultant's first engagement — but instant.",
      icon: BarChart3, color: C.blue,
    },
    {
      n: "02",
      title: "Get your interactive Business Map",
      desc: "An AI-rendered canvas of your entire operation. Every department is a node. Every process sits inside it. Health status, time spent, and manual load — all visible.",
      icon: Network, color: C.glow,
    },
    {
      n: "03",
      title: "Deploy specific AI agents",
      desc: "Named agents with implementation guides, estimated hours saved, cost impact, and complexity scores. Your custom roadmap to an AI-powered operation.",
      icon: Zap, color: C.green,
    },
  ];

  return (
    <section className="py-28" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 lg:gap-24 items-start">

          {/* Sticky left */}
          <div className="lg:sticky lg:top-24 bv-reveal">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-5" style={{ ...IF, color: C.blue }}>How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5" style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>
              From blank slate to<br />AI action plan.
            </h2>
            <p className="text-sm leading-relaxed" style={{ ...IF, color: C.muted }}>
              Under 15 minutes from first question to your full business map and AI agent recommendations.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
              style={{ ...IF, background: C.text, color: C.s0 }}
            >
              Start now <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className={`bv-reveal bv-reveal-d${i + 1} bv-feat-card flex gap-6 p-7 rounded-xl cursor-default`}
                style={{ backgroundColor: C.s1, border: `1px solid ${C.s3}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.s4; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.s3; }}
              >
                <span className="text-5xl font-extrabold tabular-nums shrink-0 leading-none select-none" style={{ ...MF, color: C.s3, letterSpacing: "-0.04em", WebkitTextStroke: `1px ${C.s4}` }}>
                  {step.n}
                </span>
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${step.color}12`, border: `1px solid ${step.color}20` }}>
                      <step.icon className="w-4 h-4" style={{ color: step.color }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-bold" style={{ ...MF, color: C.text, letterSpacing: "-0.01em" }}>{step.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ ...IF, color: C.muted }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ──────────────────────────────────────────────────────── */
function Stats() {
  const items = [
    { value: "18", label: "Onboarding questions", sub: "covering every facet of your business" },
    { value: "~23h", label: "Average hours saved", sub: "per week after AI agent deployment" },
    { value: "$4.2k", label: "Monthly savings found", sub: "on average per business analysed" },
    { value: "< 15m", label: "Time to your map", sub: "from first answer to full AI plan" },
  ];

  return (
    <section style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}` }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 bv-reveal">
          {items.map((item, i) => (
            <div
              key={item.label}
              className="px-6 py-10"
              style={{ borderRight: i < 3 ? `1px solid ${C.s3}` : "none" }}
            >
              <p className="text-4xl font-extrabold mb-1.5 tabular-nums" style={{ ...MF, color: C.text, letterSpacing: "-0.04em" }}>
                {item.value}
              </p>
              <p className="text-xs font-semibold mb-1" style={{ ...IF, color: C.sub }}>{item.label}</p>
              <p className="text-[11px] leading-snug" style={{ ...IF, color: C.outline }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-28" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div
          className="rounded-2xl px-10 md:px-20 py-20 md:py-24 text-center relative overflow-hidden bv-reveal"
          style={{ backgroundColor: C.s1, border: `1px solid ${C.s3}` }}
        >
          {/* Corner glows */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96" style={{ background: `radial-gradient(circle at 0% 0%, rgba(77,142,255,0.07) 0%, transparent 65%)` }} />
          <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96" style={{ background: `radial-gradient(circle at 100% 100%, rgba(173,198,255,0.05) 0%, transparent 65%)` }} />

          <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-6 relative" style={{ ...IF, color: C.blue }}>Ready?</p>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 relative" style={{ ...MF, color: C.text, letterSpacing: "-0.035em" }}>
            Your business map is<br />15 minutes away.
          </h2>
          <p className="text-base leading-relaxed mb-10 mx-auto relative" style={{ ...IF, color: C.muted, maxWidth: "44ch" }}>
            No account. No setup. No credit card.
            Just answer the questions and walk away with a full AI action plan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded text-sm font-bold transition-all duration-150 active:scale-[0.97] w-full sm:w-auto justify-center"
              style={{ ...IF, background: C.text, color: C.s0 }}
            >
              Map my business now
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { heading: "Product", links: ["Business Map", "AI Opportunities", "Process Audit", "Time Analysis"] },
    { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
    { heading: "Resources", links: ["Documentation", "API", "Changelog", "Status"] },
    { heading: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
  ];

  return (
    <footer style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}` }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.glow})` }}>
                <BizLogo size={13} />
              </div>
              <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>BizView</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ ...IF, color: C.muted, maxWidth: "26ch" }}>
              The AI workspace that understands your entire business operation.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green, animation: "bv-pulse-dot 2s ease-in-out infinite" }} />
              <span className="text-[10px]" style={{ ...IF, color: C.outline }}>All systems operational</span>
            </div>
          </div>
          {/* Link cols */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ ...IF, color: C.outline }}>{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <span
                      className="text-xs cursor-pointer transition-colors duration-150"
                      style={{ ...IF, color: C.muted }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                    >{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: `1px solid ${C.s3}` }}>
          <p className="text-[11px]" style={{ ...IF, color: C.outline }}>
            © 2026 BizView. Built with Claude AI. Local-first — your data never leaves your machine.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms"].map((l) => (
              <span key={l} className="text-[11px] cursor-pointer" style={{ ...IF, color: C.outline }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Shared logo mark ───────────────────────────────────────────── */
function BizLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

/* ─── Root ───────────────────────────────────────────────────────── */
export function LandingPage() {
  useReveal();

  return (
    <div style={{ backgroundColor: C.bg }}>
      <Nav />
      <Hero />
      <LogoMarquee />
      <FeatureMap />
      <FeatureAI />
      <FeatureHowItWorks />
      <Stats />
      <FinalCTA />
      <Footer />
    </div>
  );
}
