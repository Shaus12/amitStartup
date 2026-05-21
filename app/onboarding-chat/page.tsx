"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Message = {
  role: "assistant" | "user";
  content: string;
};

// --- Animations & Styles ---
const globalStyles = `
  @keyframes blob1 {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes blob2 {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(-30px, 50px) scale(1.2); }
    66% { transform: translate(20px, -20px) scale(0.8); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes blob3 {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(40px, 20px) scale(0.9); }
    66% { transform: translate(-40px, -20px) scale(1.1); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes spinBorder {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .aurora-blob {
    position: absolute;
    filter: blur(80px);
    opacity: 0.15;
    z-index: 0;
    pointer-events: none;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .check-stroke {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCheck 0.8s ease forwards 0.5s;
  }
  @keyframes drawCheck {
    to { stroke-dashoffset: 0; }
  }
  .shimmer-btn {
    position: relative;
    overflow: hidden;
  }
  .shimmer-btn::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
    transform: skewX(-20deg);
    transition: all 0.5s;
  }
  .shimmer-btn:hover::after {
    left: 150%;
  }
`;

const BizMapAvatar = ({ isTyping = false, pop = false }: { isTyping?: boolean; pop?: boolean }) => {
  return (
    <motion.div
      initial={pop ? { scale: 0.5 } : false}
      animate={pop ? { scale: [0.5, 1.2, 1] } : { scale: isTyping ? [1, 1.1, 1] : [1, 1.05, 1] }}
      transition={pop ? { duration: 0.3 } : { duration: isTyping ? 1 : 2, repeat: Infinity }}
      className="relative shrink-0 w-9 h-9 rounded-full flex items-center justify-center z-10"
      style={{
        background: "linear-gradient(135deg, #4f46e5, #0ea5e9)",
        boxShadow: "0 0 15px rgba(79, 70, 229, 0.3)"
      }}
    >
      <span className="text-white font-bold text-sm">B</span>
      {isTyping && (
        <div
          className="absolute inset-[-2px] rounded-full border-[2px] border-transparent"
          style={{
            background: "linear-gradient(135deg, #4f46e5, #0ea5e9) border-box",
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            animation: "spinBorder 1s linear infinite"
          }}
        />
      )}
    </motion.div>
  );
};

const StreamingMessage = ({ content, onComplete }: { content: string; onComplete: () => void }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(content.slice(0, i + 1));
      i++;
      if (i >= content.length) {
        clearInterval(interval);
        onComplete();
      }
    }, 20);
    return () => clearInterval(interval);
  }, [content, onComplete]);

  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const stages = [
  { id: 1, title: "מכירים את העסק", icon: "🏢" },
  { id: 2, title: "מוצאים את הכאב", icon: "🎯" },
  { id: 3, title: "בונים את הניתוח", icon: "✨" },
];

export default function OnboardingChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // New states for redesign
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [stageOverlay, setStageOverlay] = useState<string | null>(null);

  const [isFinalizing, setIsFinalizing] = useState(false);

  // ... (keep messagesEndRef and useEffects intact)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isStreaming]);

  // Handle final submission
  const handleFinalize = async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);
    
    try {
      const storedData = localStorage.getItem("onboarding_chat_data");
      if (!storedData) {
        console.error("No chat data found to finalize");
        router.push("/loading?source=chat");
        return;
      }
      
      const chatData = JSON.parse(storedData);
      const res = await fetch("/api/onboarding-chat/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatData),
      });

      if (!res.ok) {
        throw new Error("Failed to finalize onboarding");
      }

      const data = await res.json();
      if (data.businessId) {
        router.push(`/loading?businessId=${data.businessId}`);
      } else {
        router.push("/loading?source=chat");
      }
    } catch (error) {
      console.error(error);
      router.push("/loading?source=chat");
    } finally {
      setIsFinalizing(false);
    }
  };

  useEffect(() => {
    const checkAuthAndInitialize = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login?next=/onboarding-chat");
        return;
      }

      const storedSessionId = localStorage.getItem("onboarding_chat_session_id");
      
      if (storedSessionId) {
        setSessionId(storedSessionId);
        try {
          const res = await fetch(`/api/onboarding-chat?sessionId=${storedSessionId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages);
            }
            if (data.stage) setCurrentStage(data.stage);
            if (data.isComplete) setIsComplete(true);
          } else {
            startNewChat();
          }
        } catch (error) {
          console.error("Failed to fetch session", error);
          startNewChat();
        }
      } else {
        startNewChat();
      }
      setIsInitializing(false);
    };

    const startNewChat = () => {
      setMessages([
        {
          role: "assistant",
          content: "שלום! אני BizMap, מערכת הניתוח החכמה. אני כאן כדי לבנות מפה מלאה של העסק שלך וניתן לך ניתוח שבאמת מדויק עבורך. בואו נתחיל — מה שמך, ומה שם העסק שלך?"
        }
      ]);
      setIsStreaming(true);
    };

    checkAuthAndInitialize();
  }, [router]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isComplete || isStreaming) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/onboarding-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          sessionId,
          messages: messages // send history
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?next=/onboarding-chat");
          return;
        }
        throw new Error("Failed to send message");
      }

      const data = await res.json();
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("onboarding_chat_session_id", data.sessionId);
      }

      let aiContent = data.reply;
      
      let newStage = currentStage;
      
      // If AI explicitly sends a higher stage
      if (data.stage && data.stage > currentStage) {
        newStage = data.stage;
      }
      
      // If AI signals the current stage is complete
      if (data.stageComplete && data.stage) {
        // Only advance if we are actually completing the current stage or a newer one
        if (data.stage >= currentStage) {
          newStage = data.stage + 1;
        }
      }

      if (newStage > currentStage) {
        if (currentStage === 1 && newStage === 2) {
          setStageOverlay("מעולה — יש לי תמונה ברורה של הבסיס. עכשיו בואו נמצא את הכאבים האמיתיים 🎯");
        } else if (currentStage === 2 && newStage >= 3) {
          setStageOverlay("מצוין — הבנתי את האתגרים שלך. עכשיו אני בונה את הניתוח המלא ✨");
        }
        setCurrentStage(newStage);
        
        // Hide overlay after 2.5s
        setTimeout(() => setStageOverlay(null), 2500);
      }

      // Handle completion
      if (data.isComplete || aiContent.includes("[ANALYSIS_READY]")) {
        let jsonString = "";
        
        if (aiContent.includes("[ANALYSIS_READY]")) {
          const jsonStart = aiContent.indexOf("[ANALYSIS_READY]") + "[ANALYSIS_READY]".length;
          const jsonEnd = aiContent.indexOf("[/ANALYSIS_READY]");
          jsonString = aiContent.substring(jsonStart, jsonEnd).trim();
          aiContent = aiContent.substring(0, aiContent.indexOf("[ANALYSIS_READY]")).trim();
        }

        if (jsonString) {
          try {
            const collectedData = JSON.parse(jsonString);
            localStorage.setItem("onboarding_chat_data", JSON.stringify(collectedData));
          } catch (e) {
            console.error("Could not parse JSON on client", e);
          }
        }
        
        setIsComplete(true);
      }

      if (aiContent) {
        setMessages(prev => [...prev, { role: "assistant", content: aiContent }]);
        setIsStreaming(true);
      }
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const userMessagesCount = messages.filter(m => m.role === "user").length;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#050510] relative" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="aurora-blob w-[600px] h-[600px] rounded-full left-[-100px] top-[-100px]"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)", animation: "blob1 8s infinite alternate" }}
        />
        <div 
          className="aurora-blob w-[500px] h-[500px] rounded-full right-[-50px] bottom-[10%]"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", animation: "blob2 12s infinite alternate" }}
        />
        <div 
          className="aurora-blob w-[400px] h-[400px] rounded-full left-[20%] top-[30%]"
          style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)", animation: "blob3 10s infinite alternate" }}
        />
      </div>
      
      {/* Top Bar */}
      <div className="shrink-0 glass-card border-b-0 border-white/5 flex flex-col z-20">
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BizMap" className="w-8 h-8 object-contain" />
            <span className="font-bold tracking-tight text-lg text-white" style={{ fontFamily: "var(--font-manrope)" }}>
              BizMap
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:block text-indigo-200" style={{ fontFamily: "var(--font-inter)" }}>
              BizMap מנתחת את העסק שלך
            </div>
            <button 
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="text-xs px-3 py-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-transparent hover:border-white/20"
            >
              התנתק
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-14 flex items-center justify-center px-4">
          <div className="flex items-center w-full max-w-2xl justify-between relative">
            {/* Connecting lines */}
            <div className="absolute left-[10%] right-[10%] h-[2px] bg-white/10 top-1/2 -translate-y-1/2 z-0" />
            <div 
              className="absolute right-[10%] h-[2px] bg-indigo-500 top-1/2 -translate-y-1/2 z-0 transition-all duration-700 ease-out" 
              style={{ width: currentStage === 1 ? '0%' : currentStage === 2 ? '40%' : '80%' }}
            />
            
            {stages.map((stage) => {
              const isActive = currentStage === stage.id;
              const isCompleted = currentStage > stage.id || isComplete;
              return (
                <div key={stage.id} className="relative z-10 flex flex-col items-center gap-1">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.6)] text-white' : 
                      isCompleted ? 'bg-indigo-900/80 border border-indigo-500/50 text-indigo-300' : 
                      'bg-[#1a1c25] border border-white/10 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 text-indigo-300" /> : <span className="text-sm">{stage.icon}</span>}
                  </div>
                  <span className={`text-[10px] font-medium absolute -bottom-5 w-24 text-center transition-colors ${
                    isActive ? 'text-indigo-200' : isCompleted ? 'text-indigo-400/70' : 'text-gray-600'
                  }`}>
                    {stage.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 relative z-10 scrollbar-hide">
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6 pb-20 mt-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              if (!msg.content) return null;
              
              const isAssistant = msg.role === "assistant";
              const isLastAssistantMessage = isAssistant && i === messages.length - 1;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"} w-full items-end gap-3`}
                >
                  {isAssistant && (
                    <BizMapAvatar pop={true} isTyping={false} />
                  )}
                  
                  <div 
                    className={`max-w-[85%] md:max-w-[75%] p-4 text-sm md:text-base leading-relaxed relative ${
                      isAssistant ? "rounded-2xl rounded-br-sm glass-card text-white/90" 
                      : "rounded-2xl rounded-bl-sm bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    }`}
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {isLastAssistantMessage && isStreaming ? (
                      <StreamingMessage content={msg.content} onComplete={() => setIsStreaming(false)} />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start w-full items-end gap-3"
            >
              <BizMapAvatar isTyping={true} />
              <div className="rounded-2xl rounded-br-sm glass-card p-4 h-[52px] flex items-center">
                <div className="flex items-center gap-1.5 h-6">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-white/60" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-white/60" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-white/60" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage Overlay Notification */}
          <AnimatePresence>
            {stageOverlay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="my-6 flex justify-center w-full"
              >
                <div className="glass-card px-6 py-3 rounded-full border-indigo-500/30 text-indigo-200 text-sm font-medium shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                  {stageOverlay}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion Card */}
          {isComplete && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", damping: 20 }}
              className="mt-8 flex justify-center w-full"
            >
              <div className="w-full max-w-md rounded-3xl p-8 text-center flex flex-col items-center glass-card border-t-white/20 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
                
                {/* SVG Checkmark */}
                <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center bg-indigo-500/20 border border-indigo-400/30 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="check-stroke" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: "var(--font-manrope)" }}>
                  הניתוח שלך מוכן! 🎉
                </h3>
                <p className="text-sm mb-8 text-indigo-200/80" style={{ fontFamily: "var(--font-inter)" }}>
                  בנינו פרופיל מלא של העסק שלך
                </p>
                
                <div className="flex justify-between w-full mb-8 bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-white">{userMessagesCount}</span>
                    <span className="text-[10px] text-white/50">תובנות נאספו</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-white">8</span>
                    <span className="text-[10px] text-white/50">נושאים נותחו</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-emerald-400">98%</span>
                    <span className="text-[10px] text-emerald-400/70">מוכנות לניתוח</span>
                  </div>
                </div>

                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing}
                  className="shimmer-btn w-full py-4 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 text-white shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #0ea5e9)", fontFamily: "var(--font-inter)" }}
                >
                  {isFinalizing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>ראה את הניתוח שלי <Send size={16} className="rotate-180" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!isComplete && (
        <div className="shrink-0 p-4 z-20">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isComplete || isStreaming}
              placeholder="כתוב את תשובתך..."
              className="flex-1 h-14 px-5 rounded-2xl text-sm outline-none transition-all disabled:opacity-50 glass-card text-white focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(79,70,229,0.2)] placeholder-white/30"
              style={{ fontFamily: "var(--font-inter)" }}
              autoFocus
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || isComplete || isStreaming}
              className="h-14 px-6 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shrink-0"
              style={{ 
                background: (!inputValue.trim() || isLoading || isComplete || isStreaming) ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #4f46e5, #0ea5e9)", 
                color: (!inputValue.trim() || isLoading || isComplete || isStreaming) ? "rgba(255,255,255,0.3)" : "white", 
                fontFamily: "var(--font-inter)",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              שלח <Send size={16} className="rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
