"use client";

import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { ContactModal } from "@/components/leads/ContactModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Sidebar onImplementationClick={() => setContactOpen(true)} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      <MobileNav />
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        source="dashboard"
      />
    </>
  );
}
