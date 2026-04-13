"use client";

import React, { useEffect, useState } from "react";

interface CosmicParallaxBgProps {
  /** Main heading text. Pass empty string to hide. */
  head?: string;
  /** Subtitle — comma-separated string split into staggered animated parts. Pass empty string to hide. */
  text?: string;
  /** Whether text animations loop. @default true */
  loop?: boolean;
  /** className forwarded to the container */
  className?: string;
}

const CosmicParallaxBg: React.FC<CosmicParallaxBgProps> = ({
  head = "",
  text = "",
  loop = true,
  className = "",
}) => {
  const [smallStars,  setSmallStars]  = useState("");
  const [mediumStars, setMediumStars] = useState("");
  const [bigStars,    setBigStars]    = useState("");

  const textParts = text ? text.split(",").map((p) => p.trim()).filter(Boolean) : [];

  const genShadows = (count: number): string => {
    const shadows: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      shadows.push(`${x}px ${y}px #FFF`);
    }
    return shadows.join(", ");
  };

  useEffect(() => {
    setSmallStars(genShadows(700));
    setMediumStars(genShadows(200));
    setBigStars(genShadows(100));
    document.documentElement.style.setProperty(
      "--animation-iteration",
      loop ? "infinite" : "1",
    );
  }, [loop]);

  return (
    <div className={`cosmic-parallax-container ${className}`}>
      {/* Star layers — CSS custom property carries shadow to ::after for seamless loop */}
      <div
        id="stars"
        className="cosmic-stars"
        style={{ "--small-stars": smallStars } as React.CSSProperties}
      />
      <div
        id="stars2"
        className="cosmic-stars-medium"
        style={{ "--medium-stars": mediumStars } as React.CSSProperties}
      />
      <div
        id="stars3"
        className="cosmic-stars-large"
        style={{ "--large-stars": bigStars } as React.CSSProperties}
      />

      {/* Horizon glow + Earth — themed to blue palette */}
      <div id="horizon">
        <div className="glow" />
      </div>
      <div id="earth" />

      {/* Optional built-in title / subtitle */}
      {head && <div id="cosmic-title">{head.toUpperCase()}</div>}
      {textParts.length > 0 && (
        <div id="cosmic-subtitle">
          {textParts.map((part, i) => (
            <React.Fragment key={i}>
              <span className={`subtitle-part-${i + 1}`}>{part.toUpperCase()}</span>
              {i < textParts.length - 1 && " "}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export { CosmicParallaxBg };
