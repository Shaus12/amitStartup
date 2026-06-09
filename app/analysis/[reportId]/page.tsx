"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, Quote, Target, Loader2, ChevronDown, ChevronUp, CheckCircle2, Clock, Check } from "lucide-react";
import { ContactModal } from "@/components/leads/ContactModal";

// Types based on the expected JSON structure
interface Pain {
  title: string;
  description: string;
  hoursPerMonth: number;
  costPerMonth: number;
  quote: string;
}

interface MaturityAxis {
  name: string;
  score: number;
  explanation: string;
}

interface Opportunity {
  title: string;
  description: string;
  before: string;
  after: string;
  hoursPerMonth: number;
  costPerMonth: number;
  difficulty: string;
  timeToImplement: string;
  tools: string[];
  isQuickWin: boolean;
  priority: number;
}

interface QuickWin {
  title: string;
  description: string;
  timeToImplement: string;
  impact: string;
}

interface PlanPeriod {
  period: string;
  title: string;
  actions: string[];
  outcome: string;
}

interface AnalysisReport {
  businessName: string;
  ownerName: string;
  summary: string;
  totalHoursWasted: number;
  totalMoneyWasted: number;
  pains: Pain[];
  digitalMaturityScore: number;
  maturityAxes: MaturityAxis[];
  benchmarkScore: number;
  benchmarkContext: string;
  benchmarkSampleSize: number;
  benchmarkIndustry: string;
  opportunities: Opportunity[];
  quickWins: QuickWin[];
  plan90Days: PlanPeriod[];
  userQuotes: string[];
}

const CountUp = ({ to, duration = 1.5, suffix = "", prefix = "" }: { to: number, duration?: number, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * to));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [to, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

export default function AnalysisReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const router = useRouter();
  const { reportId } = use(params);
  
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOpp, setExpandedOpp] = useState<number | null>(null);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const handleEnterDashboard = async () => {
    setActivatingTrial(true);
    try {
      localStorage.setItem("bizmap:lastAnalysisReportId", reportId);
    } catch {
      // localStorage not critical
    }

    let targetBusinessId = businessId;
    if (!targetBusinessId) {
      try {
        const res = await fetch(`/api/analysis-report/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          targetBusinessId = data.businessId ?? data.business_id ?? null;
          setBusinessId(targetBusinessId);
        }
      } catch (err) {
        console.error("[analysis] failed to fetch businessId before loading redirect:", err);
      }
    }

    if (!targetBusinessId) {
      console.error("[analysis] missing businessId — redirecting to onboarding-chat");
      router.push("/onboarding-chat");
      return;
    }

    const pushLoading = (trialError = false) => {
      const params = new URLSearchParams({
        businessId: targetBusinessId,
        from: "analysis",
      });
      if (trialError) params.set("trial_error", "1");
      router.push(`/loading?${params.toString()}`);
    };

    const attemptActivate = async (): Promise<boolean> => {
      try {
        const res = await fetch("/api/trial/activate", { method: "POST" });
        return res.ok;
      } catch (err) {
        console.error("[analysis] trial/activate attempt failed:", err);
        return false;
      }
    };

    const firstOk = await attemptActivate();
    if (!firstOk) {
      console.warn("[analysis] trial/activate first attempt failed, retrying once…");
      const secondOk = await attemptActivate();
      if (!secondOk) {
        console.error("[analysis] trial/activate failed after retry — continuing through loading with trial_error=1");
        pushLoading(true);
        return;
      }
    }

    pushLoading();
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/analysis-report/${reportId}`);
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        setReport(data.content);
        setBusinessId(data.businessId ?? data.business_id ?? null);
      } catch (err) {
        console.error("Failed to load report", err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-medium">טוען את הניתוח שלך...</h2>
      </div>
    );
  }

  if (!report) return null;

  const dateStr = new Date().toLocaleDateString("he-IL", { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans" dir="rtl">
      {/* Aurora Background Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-32 pb-32">
        
        {/* SECTION 1: HERO */}
        <section className="text-center space-y-12 pt-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {report.businessName} — הניתוח שלך
            </h1>
            <p className="text-xl text-gray-400">
              הוכן במיוחד עבור {report.ownerName} · {dateStr}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            {[
              { val: report.totalHoursWasted, label: "שעות", sub: "נבזבזות בחודש על תהליכים ידניים" },
              { val: report.totalMoneyWasted, label: "₪", prefix: "₪", sub: "עלות חודשית שאפשר לחסוך" },
              { val: report.opportunities.length, label: "הזדמנויות", sub: "לייעול וחיסכון שזוהו" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="text-4xl font-bold text-indigo-400 mb-2">
                  <CountUp to={stat.val} prefix={stat.prefix} /> {stat.label !== "₪" && stat.label}
                </div>
                <div className="text-gray-400 text-sm">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 2: EXECUTIVE SUMMARY */}
        <section>
          <FadeIn>
            <h2 className="text-3xl font-bold mb-6">סיכום מנהלים</h2>
            <div className="text-xl md:text-2xl leading-relaxed text-gray-300 border-r-4 border-indigo-500 pr-6 py-2">
              {report.summary}
            </div>
          </FadeIn>
        </section>

        {/* SECTION 3: PAINS */}
        <section className="space-y-8">
          <FadeIn>
            <h2 className="text-3xl font-bold">הכאבים שזיהינו בעסק שלך</h2>
            <p className="text-gray-400 mt-2">בהתבסס על מה שסיפרת לנו</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.pains.map((pain, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] -mr-16 -mt-16" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
                      <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-2xl font-bold">{pain.title}</h3>
                  </div>
                  <p className="text-gray-300 flex-grow mb-6">{pain.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{pain.hoursPerMonth} שעות/חודש</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">₪{pain.costPerMonth}/חודש</span>
                  </div>

                  <div className="mt-auto p-4 rounded-2xl bg-black/30 border border-white/5">
                    <p className="italic text-gray-400 text-sm">"{pain.quote}"</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* SECTION 4: USER QUOTES */}
        <section className="space-y-8">
          <FadeIn>
            <h2 className="text-3xl font-bold">המילים שלך</h2>
            <p className="text-gray-400 mt-2">אלה הדברים שאמרת בשיחה · המילים שלך, בלי סינון</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {report.userQuotes.map((quote, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-6 rounded-3xl bg-indigo-900/10 border border-indigo-500/20 h-full">
                  <Quote className="w-8 h-8 text-indigo-500/50 mb-4" />
                  <p className="text-lg text-gray-200">"{quote}"</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <p className="italic text-center text-gray-500 mt-8">
              "אנחנו לא ממציאים את הכאב. אתה הגדרת אותו, אנחנו רק מגדירים את הפתרון."
            </p>
          </FadeIn>
        </section>

        {/* SECTION 5: BENCHMARK */}
        <section className="space-y-8 bg-white/5 p-8 md:p-12 rounded-[3rem] border border-white/10 backdrop-blur-sm">
          <FadeIn>
            <h2 className="text-3xl font-bold">איפה אתה עומד מול עסקים דומים</h2>
            <p className="text-gray-400 mt-2">הנתונים מבוססים על {report.benchmarkSampleSize} עסקים דומים בישראל ({report.benchmarkIndustry})</p>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="relative pt-12 pb-8">
              {/* Scale labels */}
              <div className="absolute top-0 w-full flex justify-between text-sm text-gray-500 font-medium px-1">
                <span>חלש (0)</span>
                <span>מצוין (10)</span>
              </div>
              
              {/* Gradient Bar */}
              <div className="h-4 w-full rounded-full bg-gradient-to-l from-emerald-500 via-yellow-500 to-red-500 relative">
                
                {/* Market Avg Marker */}
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${(10 - 5.6) * 10}%` }}>
                  <div className="w-1 h-6 bg-white/50 rounded-full mb-1" />
                  <span className="text-xs text-gray-400 absolute top-8 whitespace-nowrap">ממוצע השוק</span>
                </div>
                
                {/* Industry Leaders Marker */}
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${(10 - 8.2) * 10}%` }}>
                  <div className="w-1 h-6 bg-white/50 rounded-full mb-1" />
                  <span className="text-xs text-gray-400 absolute top-8 whitespace-nowrap">מובילי הענף</span>
                </div>
                
                {/* Current Business Marker */}
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-10" style={{ left: `${(10 - report.benchmarkScore) * 10}%` }}>
                  <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] border-4 border-indigo-500" />
                  <span className="text-sm font-bold text-white absolute bottom-8 whitespace-nowrap bg-indigo-500 px-3 py-1 rounded-full">{report.businessName}</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-gray-300 mt-12 text-center">{report.benchmarkContext}</p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <FadeIn delay={0.3}>
              <div className="p-6 rounded-2xl bg-black/20 text-center">
                <div className="text-3xl font-bold text-white mb-1">3 חודשים</div>
                <div className="text-sm text-gray-400">זמן ממוצע להחזר השקעה</div>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="p-6 rounded-2xl bg-black/20 text-center">
                <div className="text-3xl font-bold text-white mb-1">32 שעות</div>
                <div className="text-sm text-gray-400">חיסכון ממוצע לעסקים דומים אחרי יישום</div>
              </div>
            </FadeIn>
            <FadeIn delay={0.5}>
              <div className="p-6 rounded-2xl bg-black/20 text-center">
                <div className="text-3xl font-bold text-white mb-1">68%</div>
                <div className="text-sm text-gray-400">מהעסקים הדומים חלשים ממך</div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* SECTION 6: DIGITAL MATURITY */}
        <section className="space-y-8">
          <FadeIn>
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{report.digitalMaturityScore}/10</h2>
              <span className="text-2xl text-gray-400">ציון הבשלות הדיגיטלית של העסק שלך</span>
            </div>
          </FadeIn>

          <div className="space-y-6">
            {report.maturityAxes.map((axis, i) => {
              const colorClass = axis.score < 4 ? "bg-red-500" : axis.score <= 6 ? "bg-yellow-500" : "bg-emerald-500";
              const textColor = axis.score < 4 ? "text-red-400" : axis.score <= 6 ? "text-yellow-400" : "text-emerald-400";
              
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-48 font-medium shrink-0">{axis.name}</div>
                    <div className="flex-grow">
                      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${axis.score * 10}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                          className={`h-full rounded-full ${colorClass}`}
                        />
                      </div>
                    </div>
                    <div className={`w-12 font-bold text-left shrink-0 ${textColor}`}>{axis.score}</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 md:pl-16">{axis.explanation}</p>
                </FadeIn>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: QUICK WINS */}
        <section className="space-y-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
              <Zap className="fill-yellow-400" />
              ניצחונות מהירים — התחל מחר בבוקר
            </h2>
            <p className="text-gray-400 mt-2">דברים שאפשר לעשות עכשיו, בלי להשקיע הרבה זמן</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.quickWins.map((win, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 h-full">
                  <h3 className="text-xl font-bold mb-3">{win.title}</h3>
                  <p className="text-gray-300 mb-6">{win.description}</p>
                  <div className="flex gap-4 text-sm mt-auto">
                    <div className="bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Clock size={16} className="text-yellow-400" />
                      זמן יישום: {win.timeToImplement}
                    </div>
                    <div className="bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Target size={16} className="text-emerald-400" />
                      השפעה: {win.impact}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* SECTION 8: OPPORTUNITIES */}
        <section className="space-y-8">
          <FadeIn>
            <h2 className="text-3xl font-bold">הזדמנויות לייעול וחיסכון</h2>
            <p className="text-gray-400 mt-2">ממוינות לפי השפעה — מהחשובה ביותר</p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="p-4 rounded-2xl bg-indigo-500/20 text-center border border-indigo-500/30">
              <span className="text-lg text-indigo-200">
                יחד, ההזדמנויות האלו חוסכות <strong className="text-white">{report.totalHoursWasted} שעות בחודש</strong> בשווי <strong className="text-white">₪{(report.totalMoneyWasted * 12).toLocaleString()} בשנה</strong>
              </span>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {report.opportunities.map((opp, i) => {
              const isExpanded = expandedOpp === i;
              
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div 
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer
                      ${isExpanded ? 'bg-white/10 border-indigo-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    onClick={() => setExpandedOpp(isExpanded ? null : i)}
                  >
                    {/* Collapsed State Header */}
                    <div className="p-6 flex items-center gap-4 md:gap-6">
                      <div className="text-3xl font-black text-white/20 w-12 shrink-0">
                        {String(opp.priority).padStart(2, '0')}
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold mb-2">{opp.title}</h3>
                        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-md">
                            חיסכון: {opp.hoursPerMonth} שעות / ₪{opp.costPerMonth}
                          </span>
                          <span className="px-2.5 py-1 bg-white/10 rounded-md text-gray-300">
                            קושי: {opp.difficulty}
                          </span>
                          {opp.tools.map((tool, j) => (
                            <span key={j} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 text-gray-500">
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>

                    {/* Expanded State */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-6 pt-0 border-t border-white/10 mt-2">
                            <p className="text-gray-300 mb-8 mt-4">{opp.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                                <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                  <AlertTriangle size={18} /> מצב קיים
                               </h4>
                                <p className="text-gray-300 text-sm">{opp.before}</p>
                              </div>
                              
                              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                                  <CheckCircle2 size={18} /> אחרי יישום
                                </h4>
                                <p className="text-gray-300 text-sm">{opp.after}</p>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                              <Clock size={16} /> זמן ליישום: {opp.timeToImplement}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </section>

        {/* SECTION 9: 90-DAY PLAN */}
        <section className="space-y-12">
          <FadeIn>
            <h2 className="text-3xl font-bold">תוכנית פעולה ל-90 יום</h2>
            <p className="text-gray-400 mt-2">שלב אחר שלב, מה לעשות ומתי</p>
          </FadeIn>

          <div className="relative border-r-2 border-white/10 pr-8 space-y-12 ml-4 md:ml-0">
            {report.plan90Days.map((period, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="relative">
                  <div className="absolute w-4 h-4 bg-indigo-500 rounded-full right-[-39px] top-1 shadow-[0_0_10px_rgba(99,102,241,0.8)] border-2 border-[#0A0A0A]" />
                  <div className="text-sm font-bold text-indigo-400 mb-1">{period.period}</div>
                  <h3 className="text-2xl font-bold mb-4">{period.title}</h3>
                  
                  <ul className="space-y-2 mb-6">
                    {period.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-3 text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2 shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 inline-block">
                    <strong className="text-white">תוצאה:</strong> <span className="text-gray-300">{period.outcome}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* SECTION 10: CTA */}
        <FadeIn delay={0.2}>
          <section className="relative overflow-hidden rounded-[3rem] p-10 md:p-16 text-center mt-32 border border-white/20 bg-gradient-to-b from-indigo-900/40 to-black/60 shadow-[0_0_50px_rgba(79,70,229,0.15)]">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">קיבלת את הניתוח שלך 🎉</h2>
              <p className="text-xl text-gray-300">
                עכשיו הגיע הזמן ליישם — קבל שבוע חינם במערכת המלאה
              </p>
              
              <div className="flex flex-col items-center gap-3 text-lg text-gray-200">
                <div className="flex items-center gap-2"><Check className="text-emerald-400" /> מפה ויזואלית של העסק שלך</div>
                <div className="flex items-center gap-2"><Check className="text-emerald-400" /> לוח משימות מותאם אישית</div>
                <div className="flex items-center gap-2"><Check className="text-emerald-400" /> יועץ AI שמכיר את העסק שלך לעומק</div>
              </div>
              
              <div className="pt-8">
                <button
                  type="button"
                  onClick={handleEnterDashboard}
                  disabled={activatingTrial}
                  className="px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  {activatingTrial ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      מפעילים את השבוע החינמי...
                    </span>
                  ) : (
                    "כנס למערכת — שבוע חינם ←"
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-6">ללא כרטיס אשראי · ללא התחייבות · ביטול בכל עת</p>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* SECTION 11: IMPLEMENTATION */}
        <FadeIn delay={0.2}>
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold">רוצה שנעשה את זה בשבילך?</h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-gray-400">
                יש לך את הניתוח — עכשיו אפשר לתת לנו לטפל בכל היישום. אנחנו מיישמים את כל ההזדמנויות עבורך, מהתחלה ועד סוף.
              </p>
            </div>

            <div className="mx-auto max-w-3xl rounded-[2rem] bg-gradient-to-l from-indigo-500/70 via-purple-500/55 to-amber-400/65 p-px shadow-[0_28px_90px_rgba(99,102,241,0.22)]">
              <div className="rounded-[calc(2rem-1px)] bg-[#10111d]/95 p-6 text-center backdrop-blur-2xl md:p-9">
                <div className="grid gap-4 text-right text-base text-gray-200 sm:grid-cols-2">
                  {[
                    "יישום כל האוטומציות מהניתוח",
                    "הגדרת כל הכלים והחיבורים",
                    "הדרכה לצוות",
                    "תמיכה שוטפת",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-gradient-to-l from-indigo-500 via-violet-500 to-amber-400 px-8 py-4 text-base font-black text-white shadow-[0_18px_48px_rgba(99,102,241,0.3)] transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#10111d]"
                >
                  אני מעוניין — השאר פרטים ←
                </button>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="mx-auto mt-8 max-w-2xl border-t border-white/10 pt-5 text-center text-xs leading-6 text-gray-500">
          שילמת ולא קיבלת ערך? אנחנו עומדים מאחורי ההבטחה שלנו — החזר כספי מלא ללא שאלות. פנה אלינו:{" "}
          <a
            href="mailto:support@bizmapai.com"
            className="text-gray-400 underline underline-offset-4 transition-colors hover:text-gray-200"
          >
            support@bizmapai.com
          </a>
        </div>

      </div>
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        source="analysis_report"
      />
    </div>
  );
}
