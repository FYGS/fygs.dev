import { Metadata } from "next";
import { AdminReviewsNav } from "./_components/admin-reviews-nav";

export const metadata: Metadata = {
  title: "Gestion des avis | Administration",
  description: "Interface d'administration pour la modération et la gestion des avis étudiants",
};

export default function AdminReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminReviewsNav />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}