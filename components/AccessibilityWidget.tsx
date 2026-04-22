"use client";

import { useEffect, useRef } from "react";
import { Accessibility } from "accessibility";

export function AccessibilityWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !initialized.current) {
      initialized.current = true;
      
      try {
        new Accessibility({
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
            speechToText: 'דיבור לטקסט',
            disableAnimations: 'ביטול אנימציות',
            increaseLineHeight: 'הגדל מרווח שורות',
            decreaseLineHeight: 'הקטן מרווח שורות',
            hotkeyPrefix: 'מקש קיצור:'
          }
        });

        // Layout properties to reposition the accessibility icon to the right side
        document.body.style.setProperty('--_access-icon-left', 'unset');
        document.body.style.setProperty('--_access-icon-right', '20px');
        document.body.style.setProperty('--_access-icon-bottom', '80px');

        // Force z-index high enough so it sits above chat window but below modals
        setTimeout(() => {
          const accIcon = document.querySelector('.accessibility-icon');
          if (accIcon) {
            (accIcon as HTMLElement).style.zIndex = "9999";
          }
        }, 500);
      } catch (err) {
        console.error("Failed to initialize accessibility widget", err);
      }
    }
  }, []);

  return null;
}
