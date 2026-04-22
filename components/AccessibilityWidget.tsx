"use client";

import Script from "next/script";

export function AccessibilityWidget() {
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/accessibility/dist/accessibility.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && typeof (window as any).Accessibility === "function") {
          // Initialize accessibility plugin
          new (window as any).Accessibility({
            icon: {
              position: {
                bottom: { size: 20, units: 'px' },
                left: { size: 85, units: 'px' },
                type: 'fixed'
              }
            },
            labels: {
              resetTitle: 'איפוס תפריט',
              closeTitle: 'סגירה',
              menuTitle: 'תפריט נגישות',
              increaseText: 'הגדל טקסט',
              decreaseText: 'הקטן טקסט',
              increaseTextSpacing: 'הגדל מרווח',
              decreaseTextSpacing: 'הקטן מרווח',
              invertColors: 'צבעים הפוכים',
              grayHues: 'גווני אפור',
              underlineLinks: 'קו תחתון לקישורים',
              bigCursor: 'סמן גדול',
              readingGuide: 'סרגל קריאה',
              textToSpeech: 'טקסט לדיבור',
              speechToText: 'דיבור לטקסט'
            }
          });
          
          // Force z-index high enough so it sits above chat window but below modals
          setTimeout(() => {
            const accIcon = document.querySelector('.accessibility-icon');
            if (accIcon) {
              (accIcon as HTMLElement).style.zIndex = "999";
            }
          }, 500);
        }
      }}
    />
  );
}
