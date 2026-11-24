/**
 * Immersive Learning Layout — Focus/Cinema mode
 * No site header or footer: the shell (top bar, course plan, content) is in learn/[slug]/layout.tsx.
 */
export default function LearningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
