import { Section } from "./Section";

export const Footer = () => {
  return (
    <footer className="bg-card">
      <Section className="py-8 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          © 2024 Fernand Soualo. All rights reserved.
        </p>
      </Section>
    </footer>
  );
};
