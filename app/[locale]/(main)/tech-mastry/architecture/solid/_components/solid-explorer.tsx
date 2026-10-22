"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Principle {
  letter: string;
  name: string;
  fullName: string;
  description: string;
  violation: { label: string; code: string };
  correct: { label: string; code: string };
  color: string;
}

const principles: Principle[] = [
  {
    letter: "S",
    name: "Single Responsibility",
    fullName: "Principe de responsabilité unique",
    description: "Une classe ne devrait avoir qu'une seule raison de changer. Chaque module ou classe doit être responsable d'une seule partie de la fonctionnalité.",
    violation: {
      label: "❌ Violation",
      code: `class UserService {
  createUser(data: UserDTO) { /* create user */ }
  sendWelcomeEmail(user: User) { /* send email */ }
  generateReport(user: User) { /* generate PDF */ }
  logActivity(user: User) { /* log to file */ }
  // Cette classe fait trop de choses !
}`,
    },
    correct: {
      label: "✅ Correct",
      code: `class UserService {
  createUser(data: UserDTO) { /* create user only */ }
}

class EmailService {
  sendWelcomeEmail(user: User) { /* emails only */ }
}

class ReportService {
  generateReport(user: User) { /* reporting only */ }
}

class ActivityLogger {
  logActivity(user: User) { /* logging only */ }
}`,
    },
    color: "text-blue-500",
  },
  {
    letter: "O",
    name: "Open/Closed",
    fullName: "Principe ouvert/fermé",
    description: "Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification. Utilisez l'abstraction pour ajouter du comportement sans modifier le code existant.",
    violation: {
      label: "❌ Violation",
      code: `class AreaCalculator {
  calculate(shape: any) {
    if (shape.type === "circle")
      return Math.PI * shape.radius ** 2;
    if (shape.type === "rectangle")
      return shape.width * shape.height;
    // Ajouter un nouveau type = modifier cette classe
    if (shape.type === "triangle")
      return 0.5 * shape.base * shape.height;
  }
}`,
    },
    correct: {
      label: "✅ Correct",
      code: `interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area() { return this.width * this.height; }
}

// Ajouter un nouveau type = créer une nouvelle classe
class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  area() { return 0.5 * this.base * this.height; }
}

// Le calculateur ne change JAMAIS
function totalArea(shapes: Shape[]) {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}`,
    },
    color: "text-green-500",
  },
  {
    letter: "L",
    name: "Liskov Substitution",
    fullName: "Principe de substitution de Liskov",
    description: "Les objets d'une sous-classe doivent pouvoir remplacer ceux de la classe parente sans altérer le programme. Si S est un sous-type de T, alors les objets T peuvent être remplacés par des objets S.",
    violation: {
      label: "❌ Violation",
      code: `class Bird {
  fly() { return "Flying!"; }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Penguins can't fly!");
    // Viole LSP : on ne peut pas remplacer
    // Bird par Penguin partout
  }
}`,
    },
    correct: {
      label: "✅ Correct",
      code: `interface Bird {
  move(): string;
}

interface FlyingBird extends Bird {
  fly(): string;
}

class Eagle implements FlyingBird {
  move() { return "Moving"; }
  fly() { return "Flying high!"; }
}

class Penguin implements Bird {
  move() { return "Swimming!"; }
  // Pas de méthode fly() — correct !
}`,
    },
    color: "text-yellow-500",
  },
  {
    letter: "I",
    name: "Interface Segregation",
    fullName: "Principe de ségrégation des interfaces",
    description: "Les clients ne devraient pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas. Préférez plusieurs petites interfaces spécifiques.",
    violation: {
      label: "❌ Violation",
      code: `interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeReport(): void;
}

// Un robot doit implémenter eat() et sleep() ?
class Robot implements Worker {
  work() { /* ok */ }
  eat() { throw new Error("Robots don't eat"); }
  sleep() { throw new Error("Robots don't sleep"); }
  attendMeeting() { /* ok */ }
  writeReport() { /* ok */ }
}`,
    },
    correct: {
      label: "✅ Correct",
      code: `interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
  sleep(): void;
}

interface Reportable {
  attendMeeting(): void;
  writeReport(): void;
}

class Human implements Workable, Feedable, Reportable {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
  attendMeeting() { /* ... */ }
  writeReport() { /* ... */ }
}

class Robot implements Workable, Reportable {
  work() { /* ... */ }
  attendMeeting() { /* ... */ }
  writeReport() { /* ... */ }
  // Pas besoin de eat/sleep !
}`,
    },
    color: "text-orange-500",
  },
  {
    letter: "D",
    name: "Dependency Inversion",
    fullName: "Principe d'inversion des dépendances",
    description: "Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions. Les abstractions ne doivent pas dépendre des détails.",
    violation: {
      label: "❌ Violation",
      code: `class MySQLDatabase {
  save(data: any) { /* MySQL specific */ }
}

class UserRepository {
  // Dépend directement de MySQL !
  private db = new MySQLDatabase();

  saveUser(user: User) {
    this.db.save(user);
  }
  // Impossible de changer de BDD sans modifier ce code
}`,
    },
    correct: {
      label: "✅ Correct",
      code: `// Abstraction
interface Database {
  save(data: any): Promise<void>;
}

// Implémentation concrète
class MySQLDatabase implements Database {
  async save(data: any) { /* MySQL */ }
}

class MongoDatabase implements Database {
  async save(data: any) { /* MongoDB */ }
}

// Dépend de l'abstraction
class UserRepository {
  constructor(private db: Database) {}

  async saveUser(user: User) {
    await this.db.save(user);
  }
}

// Injection — facile de changer !
const repo = new UserRepository(new MongoDatabase());`,
    },
    color: "text-red-500",
  },
];

export function SolidExplorer() {
  const [activePrinciple, setActivePrinciple] = useState(0);
  const principle = principles[activePrinciple];

  return (
    <section className="space-y-8">
      {/* Letter selector */}
      <div className="flex justify-center gap-2">
        {principles.map((p, i) => (
          <button
            key={p.letter}
            onClick={() => setActivePrinciple(i)}
            className={cn(
              "w-14 h-14 rounded-xl text-2xl font-black transition-all duration-300",
              activePrinciple === i
                ? `bg-primary text-primary-foreground shadow-lg scale-110`
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105"
            )}
          >
            {p.letter}
          </button>
        ))}
      </div>

      {/* Principle Detail */}
      <Card className="p-8 space-y-6 border-border/40">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={cn("text-3xl font-black", principle.color)}>
              {principle.letter}
            </span>
            <div>
              <h2 className="text-2xl font-bold">{principle.name}</h2>
              <p className="text-sm text-muted-foreground">{principle.fullName}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-4">
            {principle.description}
          </p>
        </div>

        {/* Side by side code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge variant="destructive" className="text-xs">
              {principle.violation.label}
            </Badge>
            <pre className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 overflow-x-auto text-sm" tabIndex={0}>
              <code>{principle.violation.code}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <Badge className="bg-green-500/10 text-green-500 text-xs">
              {principle.correct.label}
            </Badge>
            <pre className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 overflow-x-auto text-sm" tabIndex={0}>
              <code>{principle.correct.code}</code>
            </pre>
          </div>
        </div>
      </Card>
    </section>
  );
}
