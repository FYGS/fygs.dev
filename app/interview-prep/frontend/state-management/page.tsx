import { Metadata } from "next";
import { StateManagementHero } from "./_components/hero";
import { StateManagementContent } from "./_components/content";

export const metadata: Metadata = {
  title: "State Management | Interview Prep",
  description:
    "Maîtrisez les différentes approches de gestion d&apos;état dans React: Context API, Redux, Zustand, et React Query",
};

export default function StateManagementPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <StateManagementHero />
      <StateManagementContent />
    </main>
  );
}
