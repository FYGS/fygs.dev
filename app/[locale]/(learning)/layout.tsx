/**
 * Immersive Learning Layout — Focus/Cinema mode
 * No header, no footer. Just a top bar + collapsible sidebar + content.
 */
export default function LearningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
