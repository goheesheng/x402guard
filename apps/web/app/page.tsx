"use client";

import {
  Navigation,
  HeroToggle,
  Problem,
  AgentSkills,
  Solution,
  Scanner,
  Integration,
  FAQ,
  Footer,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <HeroToggle />
        <Problem />
        <AgentSkills />
        <Solution />
        <Scanner />
        <Integration />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
