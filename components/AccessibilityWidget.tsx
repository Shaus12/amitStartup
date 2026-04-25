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

        // Force z-index, make draggable, and restore saved position
        setTimeout(() => {
          const accIcon = document.querySelector('.accessibility-icon') as HTMLElement | null;
          if (!accIcon) return;

          accIcon.style.zIndex = "9999";
          accIcon.style.cursor = "grab";
          accIcon.style.touchAction = "none";
          (accIcon.style as CSSStyleDeclaration & { userSelect: string }).userSelect = "none";

          let offsetX = 0, offsetY = 0;
          let startX = 0, startY = 0, initX = 0, initY = 0;
          let dragging = false, wasDragging = false;

          try {
            const saved = localStorage.getItem("a11y-pos");
            if (saved) { const p = JSON.parse(saved); offsetX = p.x; offsetY = p.y; accIcon.style.transform = `translate(${offsetX}px,${offsetY}px)`; }
          } catch {}

          accIcon.addEventListener("pointerdown", (e) => {
            const pe = e as PointerEvent;
            if (pe.button !== 0) return;
            accIcon.setPointerCapture(pe.pointerId);
            startX = pe.clientX; startY = pe.clientY;
            initX = offsetX; initY = offsetY;
            dragging = false; wasDragging = false;
          });

          accIcon.addEventListener("pointermove", (e) => {
            const pe = e as PointerEvent;
            const dx = pe.clientX - startX, dy = pe.clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragging = true;
            if (dragging) { offsetX = initX + dx; offsetY = initY + dy; accIcon.style.transform = `translate(${offsetX}px,${offsetY}px)`; }
          });

          accIcon.addEventListener("pointerup", () => {
            if (dragging) {
              wasDragging = true;
              try { localStorage.setItem("a11y-pos", JSON.stringify({ x: offsetX, y: offsetY })); } catch {}
              setTimeout(() => { wasDragging = false; }, 300);
            }
            dragging = false;
          });

          accIcon.addEventListener("click", (e) => {
            if (wasDragging) { e.stopImmediatePropagation(); wasDragging = false; }
          }, true);
        }, 800);
      } catch (err) {
        console.error("Failed to initialize accessibility widget", err);
      }
    }
  }, []);

  return null;
}
