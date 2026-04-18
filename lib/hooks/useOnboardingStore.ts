"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  OnboardingAnswers,
  EMPTY_ANSWERS,
  RANDOM_ANSWERS,
  ONBOARDING_TOTAL_STEPS,
} from "@/lib/types/onboarding";

export const TOTAL_STEPS = ONBOARDING_TOTAL_STEPS;

interface OnboardingStore {
  currentStep: number;
  answers: OnboardingAnswers;
  businessId: string | null;
  registrationMode: "quick" | "full" | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateAnswers: (partial: Partial<OnboardingAnswers>) => void;
  setBusinessId: (id: string) => void;
  setRegistrationMode: (mode: "quick" | "full") => void;
  reset: () => void;
  fillRandom: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: EMPTY_ANSWERS,
      businessId: null,
      registrationMode: null,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((s) => ({
          currentStep: Math.min(s.currentStep + 1, ONBOARDING_TOTAL_STEPS - 1),
        })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      updateAnswers: (partial) =>
        set((s) => ({ answers: { ...s.answers, ...partial } })),
      setBusinessId: (id) => set({ businessId: id }),
      setRegistrationMode: (mode) => set({ registrationMode: mode }),
      reset: () =>
        set({ currentStep: 0, answers: EMPTY_ANSWERS, businessId: null, registrationMode: null }),
      fillRandom: () =>
        set({ answers: RANDOM_ANSWERS }),
    }),
    {
      name: "onboarding-store",
    }
  )
);
