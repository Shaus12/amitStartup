"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Timer, Activity, Flame } from "lucide-react";
import { useState, useEffect } from "react";

export function useCountUp(target: number, durationMs = 500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(target * ease);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, durationMs]);

  return count;
}

interface MetricCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
  color?: string;
}

function MetricCard({ icon, value, label, suffix = "", decimals = 0, color = "#e2e2eb" }: MetricCardProps) {
  const count = useCountUp(value);
  
  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-300"
      style={{
        backgroundColor: "#1e1f26",
        borderColor: "#282a30",
      }}
    >
      <div 
        className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center opacity-90"
        style={{ color: color, backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div 
          className="text-2xl font-bold font-mono tracking-tight truncate"
          style={{ color: "#e2e2eb" }}
        >
          {count.toFixed(decimals)}{suffix}
        </div>
        <div 
          className="text-[11px] font-medium truncate"
          style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export function DashboardStats({ businessId }: { businessId: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('dashboard_stats_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('dashboard_stats_collapsed', String(next));
    } catch {}
  };

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats", businessId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats?businessId=${businessId}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    // Prevent excessive calls on focus
    staleTime: 60 * 1000, 
  });

  const getHealthColor = (score: number) => {
    if (score >= 70) return "#34d399"; 
    if (score >= 40) return "#fbbf24"; 
    return "#ef4444"; 
  };

  if (!isMounted) return null;

  return (
    <div className="shrink-0 transition-all duration-300" style={{ backgroundColor: "#111319", borderBottom: "1px solid #1e1f26" }}>
      <button 
        onClick={toggleCollapse} 
        className="w-full h-8 flex items-center justify-center gap-1.5 transition-colors"
        style={{ 
          backgroundColor: isCollapsed ? "transparent" : "rgba(25,27,34,0.4)",
        }}
      >
        <span className="text-xs font-semibold tracking-wide" style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}>
          סטטיסטיקות
        </span>
        <svg 
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c909f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          maxHeight: isCollapsed ? 0 : 500,
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        <div className="px-6 py-4" style={{ borderTop: "1px solid #1e1f26" }}>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[74px] rounded-xl border animate-pulse" style={{ backgroundColor: "#1e1f26", borderColor: "#282a30" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const stats = data || { tasks_completed_this_week: 0, hours_saved: 0, health_score: 0, streak: 0 };
                return (
                  <>
                    <MetricCard 
                      icon={<Flame className="w-5 h-5" />}
                      value={stats.streak}
                      label="ימים רצופים"
                      color="#f97316"
                    />
                    <MetricCard 
                      icon={<Check className="w-5 h-5" />}
                      value={stats.tasks_completed_this_week}
                      label="הושלמו השבוע"
                      color="#60a5fa"
                    />
                    <MetricCard 
                      icon={<Timer className="w-5 h-5" />}
                      value={stats.hours_saved}
                      label="שעות נחסכו"
                      suffix="h"
                      decimals={1}
                      color="#a78bfa"
                    />
                    <MetricCard 
                      icon={<Activity className="w-5 h-5" />}
                      value={stats.health_score}
                      label="בריאות עסק"
                      color={getHealthColor(stats.health_score)}
                    />
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
