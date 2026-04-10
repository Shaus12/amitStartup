import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function StepCard({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = "Continue",
  nextDisabled = false,
  showBack = true,
}: StepCardProps) {
  return (
    <div className="w-full">
      {/* Heading block */}
      <div className="mb-9">
        <h2
          className="text-[2rem] font-bold leading-tight mb-3"
          style={{
            fontFamily: "var(--font-manrope)",
            color: "#e2e2eb",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm leading-relaxed max-w-[52ch]"
            style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="mb-10">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6" style={{ borderTop: "1px solid #282a30" }}>
        <div>
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-medium transition-colors duration-150 group"
              style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c2c6d6")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8c909f")}
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" strokeWidth={2} />
              Back
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
          style={{
            fontFamily: "var(--font-inter)",
            background: nextDisabled
              ? "#282a30"
              : "linear-gradient(135deg, #4d8eff, #adc6ff)",
            color: nextDisabled ? "#424754" : "#001a42",
            cursor: nextDisabled ? "not-allowed" : "pointer",
            boxShadow: nextDisabled ? "none" : "0 4px 16px rgba(77,142,255,0.25)",
          }}
        >
          {nextLabel}
          {!nextDisabled && <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}
