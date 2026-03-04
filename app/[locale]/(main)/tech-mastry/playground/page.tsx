import { Metadata } from "next";
import { PgLayout } from "./_components/pg-layout";

export const metadata: Metadata = {
  title: "Code Playground | FYGS",
  description:
    "World-class code playground — write, run, and share TypeScript, JavaScript, HTML/CSS, React, and more with instant preview and collaboration.",
};

export default function PlaygroundPage() {
  return <PgLayout />;
}
