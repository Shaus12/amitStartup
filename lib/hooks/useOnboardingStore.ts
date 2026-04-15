"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OnboardingAnswers, EMPTY_ANSWERS, RANDOM_ANSWERS } from "@/lib/types/onboarding";

export const TOTAL_STEPS = 20; // 0-19

interface OnboardingStore {
  currentStep: number;
  answers: OnboardingAnswers;
  businessId: string | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateAnswers: (partial: Partial<OnboardingAnswers>) => void;
  setBusinessId: (id: string) => void;
  reset: () => void;
  fillRandom: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: EMPTY_ANSWERS,
      businessId: null,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((s) => ({ currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS - 1) })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      updateAnswers: (partial) =>
        set((s) => ({ answers: { ...s.answers, ...partial } })),
      setBusinessId: (id) => set({ businessId: id }),
      reset: () =>
        set({ currentStep: 0, answers: EMPTY_ANSWERS, businessId: null }),
      fillRandom: () =>
        set({ answers: RANDOM_ANSWERS }),
    }),
    {
      name: "onboarding-store",
    }
  )
);
