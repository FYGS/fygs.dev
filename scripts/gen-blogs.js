const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "..", "content", "blog");

function w(filename, content) {
  const filePath = path.join(BLOG_DIR, filename);
  fs.writeFileSync(filePath, content.trimStart());
  console.log(`✅ Created: ${filePath}`);
}

// ═══════════════════════════════════════════════════════════════════════
// BLOG 1: La Programmation Orientée Objet — Le Guide Complet
// ═══════════════════════════════════════════════════════════════════════
w(
  "mastering-object-oriented-programming.mdx",
  `
---
title: "Maîtriser la Programmation Orientée Objet : Le Guide Ultime Appliqué"
excerpt: "De l'encapsulation au polymorphisme, maîtrisez tous les concepts de la POO à travers la construction complète d'un système de gestion bancaire en TypeScript. Cas réels, design patterns et bonnes pratiques."
date: "2025-06-15"
author: "Fernand SOUALO"
categories: ["OOP", "TypeScript", "Architecture", "Design Patterns", "Clean Code"]
coverImage: "/blog/oop-mastery.webp"
---

# Maîtriser la Programmation Orientée Objet : Le Guide Ultime Appliqué

## Table of Contents

1. [Pourquoi la POO ?](#pourquoi-poo)
2. [Les 4 Piliers Fondamentaux](#piliers)
3. [Encapsulation en Profondeur](#encapsulation)
4. [Héritage et Composition](#heritage)
5. [Polymorphisme Avancé](#polymorphisme)
6. [Abstraction et Interfaces](#abstraction)
7. [Projet Fil Rouge : Système Bancaire](#projet)
8. [Design Patterns Essentiels](#patterns)
9. [SOLID en Pratique](#solid)
10. [Anti-Patterns à Éviter](#anti-patterns)
11. [Tests Unitaires en POO](#tests)
12. [POO vs Fonctionnel — Quand Utiliser Quoi ?](#poo-vs-fp)
13. [Conclusion et Ressources](#conclusion)

## Pourquoi la POO ? <a name="pourquoi-poo"></a>

La Programmation Orientée Objet n'est pas juste un paradigme de programmation — c'est une **manière de modéliser le monde réel** en code. Quand vous concevez un système de paiement, vous manipulez des \`Transactions\`, des \`Comptes\`, des \`Utilisateurs\`. La POO vous permet de structurer votre code exactement comme vous pensez au problème.

> **Le problème fondamental** : Sans POO, un système bancaire de 50 000 lignes devient un plat de spaghetti où changer le calcul des intérêts casse les transferts internationaux. Avec la POO, chaque concept vit dans sa propre classe, testable et modifiable indépendamment.

### Ce que vous allez construire

Dans cet article, nous allons construire un **système bancaire complet** avec :
- Comptes courants, épargne et investissement
- Transactions avec validation et historique
- Système de notifications multi-canal
- Calcul d'intérêts et de frais dynamiques
- Reports et analytics

Chaque concept de POO sera illustré à travers ce projet réel.

## Les 4 Piliers Fondamentaux <a name="piliers"></a>

Avant de plonger dans le code, comprenons les 4 piliers qui soutiennent toute la POO :

| Pilier | Description | Analogie Réelle |
|--------|-------------|-----------------|
| **Encapsulation** | Cacher les détails internes, exposer une interface publique | Un DAB : vous insérez votre carte et entrez un PIN, la mécanique interne est cachée |
| **Héritage** | Créer des classes spécialisées à partir de classes générales | Un compte épargne **est un** compte bancaire avec des fonctionnalités supplémentaires |
| **Polymorphisme** | Un même message, des comportements différents | \`calculerIntérêts()\` se comporte différemment pour un compte épargne vs un compte investissement |
| **Abstraction** | Définir le "quoi" sans le "comment" | Une interface \`Notifiable\` dit qu'on peut notifier, sans dire comment (email, SMS, push) |

## Encapsulation en Profondeur <a name="encapsulation"></a>

L'encapsulation est le fondement de la POO. Elle consiste à **regrouper les données et les comportements qui les manipulent**, tout en contrôlant l'accès.

### Le Problème Sans Encapsulation

\`\`\`typescript
// ❌ MAUVAIS — Données exposées, logique éparpillée
const account = {
  balance: 1000,
  owner: "Alice",
  transactions: [],
};

// N'importe qui peut modifier directement le solde !
account.balance = -999999; // 💥 Incohérence totale
account.transactions.push({ amount: -999999 }); // Pas de validation
\`\`\`

### La Solution avec Encapsulation

\`\`\`typescript
class BankAccount {
  // Propriétés privées — inaccessibles de l'extérieur
  private _balance: number;
  private _transactions: Transaction[] = [];
  private readonly _accountNumber: string;
  private readonly _owner: string;
  private readonly _createdAt: Date;

  constructor(owner: string, initialDeposit: number = 0) {
    if (initialDeposit < 0) {
      throw new Error("Le dépôt initial ne peut pas être négatif");
    }
    this._owner = owner;
    this._balance = initialDeposit;
    this._accountNumber = this.generateAccountNumber();
    this._createdAt = new Date();

    if (initialDeposit > 0) {
      this.recordTransaction("DEPOT_INITIAL", initialDeposit);
    }
  }

  // Getter — accès en lecture seule au solde
  get balance(): number {
    return this._balance;
  }

  get owner(): string {
    return this._owner;
  }

  get accountNumber(): string {
    return this._accountNumber;
  }

  // Méthode publique avec validation
  deposit(amount: number, description?: string): void {
    if (amount <= 0) {
      throw new InvalidAmountError("Le montant du dépôt doit être positif");
    }
    if (amount > 1_000_000) {
      throw new LimitExceededError("Dépôt supérieur à la limite autorisée");
    }

    this._balance += amount;
    this.recordTransaction("DEPOT", amount, description);
  }

  withdraw(amount: number, description?: string): void {
    if (amount <= 0) {
      throw new InvalidAmountError("Le montant du retrait doit être positif");
    }
    if (amount > this._balance) {
      throw new InsufficientFundsError(
        \`Fonds insuffisants. Solde: \${this._balance}, Demandé: \${amount}\`
      );
    }

    this._balance -= amount;
    this.recordTransaction("RETRAIT", -amount, description);
  }

  // Méthode privée — détail d'implémentation caché
  private recordTransaction(
    type: string,
    amount: number,
    description?: string
  ): void {
    this._transactions.push({
      id: crypto.randomUUID(),
      type,
      amount,
      balanceAfter: this._balance,
      timestamp: new Date(),
      description: description ?? type,
    });
  }

  private generateAccountNumber(): string {
    return \`FR\${Date.now()}\${Math.random().toString(36).slice(2, 8).toUpperCase()}\`;
  }

  // Copie défensive — on retourne une copie, pas la référence
  getTransactionHistory(): ReadonlyArray<Transaction> {
    return [...this._transactions];
  }

  getStatement(from?: Date, to?: Date): string {
    let transactions = this._transactions;
    if (from) transactions = transactions.filter(t => t.timestamp >= from);
    if (to) transactions = transactions.filter(t => t.timestamp <= to);

    return transactions
      .map(t => \`[\${t.timestamp.toLocaleDateString()}] \${t.type}: \${t.amount > 0 ? '+' : ''}\${t.amount}€ → Solde: \${t.balanceAfter}€\`)
      .join("\\n");
  }
}
\`\`\`

### Les 3 Niveaux d'Accès en TypeScript

\`\`\`typescript
class Example {
  public name: string;       // Accessible partout (défaut)
  protected id: number;      // Accessible dans la classe et ses enfants
  private secret: string;    // Accessible uniquement dans cette classe
  readonly createdAt: Date;  // Accessible en lecture seule après initialisation
}
\`\`\`

> **Règle d'or** : Commencez toujours par \`private\`. Passez à \`protected\` uniquement si une sous-classe en a besoin. Utilisez \`public\` uniquement pour l'API de votre classe.

## Héritage et Composition <a name="heritage"></a>

L'héritage permet de créer des hiérarchies de classes. Un \`SavingsAccount\` **est un** \`BankAccount\` avec des capacités supplémentaires.

### Héritage : La Hiérarchie des Comptes

\`\`\`typescript
// Classe abstraite — ne peut pas être instanciée directement
abstract class BankAccount {
  private _balance: number;
  private _transactions: Transaction[] = [];

  constructor(
    protected readonly owner: string,
    initialDeposit: number = 0
  ) {
    this._balance = initialDeposit;
  }

  get balance(): number {
    return this._balance;
  }

  deposit(amount: number): void {
    this.validateAmount(amount);
    this._balance += amount;
    this.recordTransaction("DEPOT", amount);
  }

  withdraw(amount: number): void {
    this.validateAmount(amount);
    this.validateWithdrawal(amount);
    this._balance -= amount;
    this.recordTransaction("RETRAIT", -amount);
  }

  // Méthode abstraite — chaque sous-classe DOIT l'implémenter
  abstract calculateInterest(): number;
  abstract getAccountType(): string;

  // Méthode protégée — accessible dans les sous-classes
  protected validateAmount(amount: number): void {
    if (amount <= 0) throw new InvalidAmountError("Montant invalide");
  }

  // Hook method — les sous-classes peuvent override
  protected validateWithdrawal(amount: number): void {
    if (amount > this._balance) {
      throw new InsufficientFundsError("Fonds insuffisants");
    }
  }

  protected adjustBalance(amount: number): void {
    this._balance += amount;
  }

  private recordTransaction(type: string, amount: number): void {
    this._transactions.push({
      id: crypto.randomUUID(),
      type,
      amount,
      balanceAfter: this._balance,
      timestamp: new Date(),
    });
  }
}

// ── Compte Courant ──────────────────────────────────────────────
class CheckingAccount extends BankAccount {
  private overdraftLimit: number;

  constructor(owner: string, initialDeposit = 0, overdraftLimit = 500) {
    super(owner, initialDeposit); // Appel au constructeur parent
    this.overdraftLimit = overdraftLimit;
  }

  // Override de la validation de retrait
  protected validateWithdrawal(amount: number): void {
    if (amount > this.balance + this.overdraftLimit) {
      throw new InsufficientFundsError(
        \`Retrait impossible. Solde + découvert autorisé: \${this.balance + this.overdraftLimit}€\`
      );
    }
  }

  calculateInterest(): number {
    return 0; // Pas d'intérêts sur un compte courant
  }

  getAccountType(): string {
    return "COURANT";
  }
}

// ── Compte Épargne ──────────────────────────────────────────────
class SavingsAccount extends BankAccount {
  private readonly interestRate: number;
  private readonly minimumBalance: number;
  private withdrawalsThisMonth: number = 0;
  private readonly maxWithdrawalsPerMonth: number = 3;

  constructor(
    owner: string,
    initialDeposit: number,
    interestRate: number = 0.02,
    minimumBalance: number = 100
  ) {
    super(owner, initialDeposit);
    this.interestRate = interestRate;
    this.minimumBalance = minimumBalance;
  }

  protected validateWithdrawal(amount: number): void {
    super.validateWithdrawal(amount); // Appel à la validation parent

    if (this.balance - amount < this.minimumBalance) {
      throw new MinimumBalanceError(
        \`Le solde ne peut pas descendre en dessous de \${this.minimumBalance}€\`
      );
    }

    if (this.withdrawalsThisMonth >= this.maxWithdrawalsPerMonth) {
      throw new WithdrawalLimitError(
        \`Limite de \${this.maxWithdrawalsPerMonth} retraits/mois atteinte\`
      );
    }

    this.withdrawalsThisMonth++;
  }

  calculateInterest(): number {
    const interest = this.balance * this.interestRate;
    this.adjustBalance(interest);
    return interest;
  }

  getAccountType(): string {
    return "EPARGNE";
  }

  resetMonthlyWithdrawals(): void {
    this.withdrawalsThisMonth = 0;
  }
}

// ── Compte Investissement ────────────────────────────────────────
class InvestmentAccount extends BankAccount {
  private portfolio: Map<string, { shares: number; pricePerShare: number }> = new Map();
  private readonly managementFeeRate: number;

  constructor(owner: string, initialDeposit: number, managementFeeRate = 0.015) {
    super(owner, initialDeposit);
    this.managementFeeRate = managementFeeRate;
  }

  buyStock(symbol: string, shares: number, pricePerShare: number): void {
    const totalCost = shares * pricePerShare;
    this.withdraw(totalCost);

    const existing = this.portfolio.get(symbol);
    if (existing) {
      const totalShares = existing.shares + shares;
      const avgPrice = (existing.shares * existing.pricePerShare + totalCost) / totalShares;
      this.portfolio.set(symbol, { shares: totalShares, pricePerShare: avgPrice });
    } else {
      this.portfolio.set(symbol, { shares, pricePerShare });
    }
  }

  sellStock(symbol: string, shares: number, currentPrice: number): number {
    const holding = this.portfolio.get(symbol);
    if (!holding || holding.shares < shares) {
      throw new Error(\`Actions insuffisantes pour \${symbol}\`);
    }

    const revenue = shares * currentPrice;
    this.deposit(revenue);

    holding.shares -= shares;
    if (holding.shares === 0) this.portfolio.delete(symbol);

    return revenue;
  }

  calculateInterest(): number {
    // Les comptes d'investissement n'ont pas d'intérêts fixes,
    // mais des frais de gestion
    const fee = this.balance * this.managementFeeRate;
    this.adjustBalance(-fee);
    return -fee;
  }

  getAccountType(): string {
    return "INVESTISSEMENT";
  }

  getPortfolioValue(): number {
    let total = 0;
    for (const [, holding] of this.portfolio) {
      total += holding.shares * holding.pricePerShare;
    }
    return total;
  }
}
\`\`\`

### Composition : "Préférer la Composition à l'Héritage"

L'héritage crée un couplage fort entre parent et enfant. La composition offre plus de flexibilité :

\`\`\`typescript
// ── COMPOSITION : Services injectables ─────────────────────────

interface NotificationService {
  notify(recipient: string, message: string): Promise<void>;
}

interface AuditLogger {
  log(event: AuditEvent): void;
}

interface InterestCalculator {
  calculate(balance: number, accountType: string): number;
}

// Implémentations concrètes
class EmailNotification implements NotificationService {
  async notify(recipient: string, message: string): Promise<void> {
    console.log(\`📧 Email à \${recipient}: \${message}\`);
    // Appel réel à un service d'email
  }
}

class SMSNotification implements NotificationService {
  async notify(recipient: string, message: string): Promise<void> {
    console.log(\`📱 SMS à \${recipient}: \${message}\`);
  }
}

class ConsoleAuditLogger implements AuditLogger {
  log(event: AuditEvent): void {
    console.log(\`[AUDIT] \${event.timestamp.toISOString()} — \${event.action}: \${event.details}\`);
  }
}

// ── La classe utilise la COMPOSITION ────────────────────────────
class EnhancedBankAccount extends BankAccount {
  constructor(
    owner: string,
    initialDeposit: number,
    private notifier: NotificationService,    // Injecté
    private auditor: AuditLogger,             // Injecté
    private interestCalc: InterestCalculator   // Injecté
  ) {
    super(owner, initialDeposit);
  }

  async deposit(amount: number): Promise<void> {
    super.deposit(amount);
    this.auditor.log({
      action: "DEPOSIT",
      details: \`\${amount}€ deposited\`,
      timestamp: new Date(),
    });
    await this.notifier.notify(
      this.owner,
      \`Dépôt de \${amount}€ effectué. Nouveau solde: \${this.balance}€\`
    );
  }

  calculateInterest(): number {
    return this.interestCalc.calculate(this.balance, this.getAccountType());
  }

  getAccountType(): string {
    return "ENHANCED";
  }
}

// Utilisation — facile à tester et à faire évoluer
const account = new EnhancedBankAccount(
  "Alice",
  1000,
  new EmailNotification(),    // On peut changer en SMSNotification
  new ConsoleAuditLogger(),   // On peut changer en DatabaseAuditLogger
  new StandardInterestCalc()  // On peut changer la stratégie
);
\`\`\`

> **Règle** : Utilisez l'héritage pour les relations "est un" (\`SavingsAccount\` est un \`BankAccount\`). Utilisez la composition pour les relations "a un" (un compte **a** un notifier, un logger, un calculateur).

## Polymorphisme Avancé <a name="polymorphisme"></a>

Le polymorphisme permet de traiter des objets de types différents de manière uniforme.

### Polymorphisme de Sous-type

\`\`\`typescript
class Bank {
  private accounts: BankAccount[] = [];

  addAccount(account: BankAccount): void {
    this.accounts.push(account);
  }

  // Polymorphisme : calculateInterest() fait la bonne chose
  // selon le type RÉEL de chaque compte
  applyMonthlyInterest(): Map<string, number> {
    const results = new Map<string, number>();

    for (const account of this.accounts) {
      const interest = account.calculateInterest();
      results.set(account.accountNumber, interest);
      console.log(
        \`[\${account.getAccountType()}] \${account.owner}: \${interest > 0 ? '+' : ''}\${interest.toFixed(2)}€\`
      );
    }

    return results;
  }

  // On traite tous les comptes de la même manière
  getTotalAssets(): number {
    return this.accounts.reduce((total, acc) => total + acc.balance, 0);
  }

  generateReport(): AccountReport[] {
    return this.accounts.map(acc => ({
      owner: acc.owner,
      type: acc.getAccountType(),
      balance: acc.balance,
      interestRate: acc.calculateInterest(),
    }));
  }
}

// Utilisation
const bank = new Bank();
bank.addAccount(new CheckingAccount("Alice", 5000));
bank.addAccount(new SavingsAccount("Bob", 10000, 0.03));
bank.addAccount(new InvestmentAccount("Charlie", 50000));

// Chaque compte calcule ses intérêts différemment !
bank.applyMonthlyInterest();
// [COURANT] Alice: 0.00€
// [EPARGNE] Bob: +300.00€
// [INVESTISSEMENT] Charlie: -750.00€ (frais de gestion)
\`\`\`

### Polymorphisme ad hoc (Surcharge de méthodes)

TypeScript supporte la surcharge via les signatures multiples :

\`\`\`typescript
class TransactionProcessor {
  // Signatures multiples (surcharge)
  process(transaction: SingleTransaction): TransactionResult;
  process(transactions: SingleTransaction[]): TransactionResult[];
  process(
    input: SingleTransaction | SingleTransaction[]
  ): TransactionResult | TransactionResult[] {
    if (Array.isArray(input)) {
      return input.map(tx => this.processOne(tx));
    }
    return this.processOne(input);
  }

  private processOne(tx: SingleTransaction): TransactionResult {
    // Logique de traitement unique
    return {
      id: tx.id,
      status: "SUCCESS",
      processedAt: new Date(),
    };
  }
}
\`\`\`

## Abstraction et Interfaces <a name="abstraction"></a>

L'abstraction définit un **contrat** que les implémentations doivent respecter.

\`\`\`typescript
// Interface = contrat pur
interface PaymentProcessor {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}

interface FraudDetector {
  analyze(transaction: TransactionData): Promise<FraudAnalysis>;
  reportFraud(transactionId: string): Promise<void>;
}

// Classe abstraite = contrat + code commun
abstract class BasePaymentProcessor implements PaymentProcessor {
  constructor(protected readonly apiKey: string) {}

  // Implémentation commune (Template Method Pattern)
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    // 1. Validation commune
    this.validateAmount(amount);
    this.validateCurrency(currency);

    // 2. Vérification fraude commune
    const fraudCheck = await this.checkFraud({ amount, currency });
    if (fraudCheck.isHighRisk) {
      throw new FraudDetectedError("Transaction bloquée par le système anti-fraude");
    }

    // 3. Traitement spécifique (délégué aux sous-classes)
    return this.executePayment(amount, currency);
  }

  // Méthodes abstraites — chaque processeur les implémente
  protected abstract executePayment(amount: number, currency: string): Promise<PaymentResult>;
  abstract refund(transactionId: string, amount: number): Promise<RefundResult>;
  abstract getTransactionStatus(transactionId: string): Promise<TransactionStatus>;

  // Méthode commune
  private validateAmount(amount: number): void {
    if (amount <= 0) throw new Error("Montant invalide");
    if (amount > 100_000) throw new Error("Montant supérieur au plafond");
  }

  private validateCurrency(currency: string): void {
    const supported = ["EUR", "USD", "GBP"];
    if (!supported.includes(currency)) {
      throw new Error(\`Devise non supportée: \${currency}\`);
    }
  }

  protected async checkFraud(data: Partial<TransactionData>): Promise<FraudAnalysis> {
    // Logique commune de détection de fraude
    return { isHighRisk: false, score: 0.1 };
  }
}

// ── Implémentation Stripe ──────────────────────────────────────
class StripeProcessor extends BasePaymentProcessor {
  protected async executePayment(amount: number, currency: string): Promise<PaymentResult> {
    // Appel réel à l'API Stripe
    console.log(\`[Stripe] Traitement de \${amount} \${currency}\`);
    return { transactionId: \`stripe_\${Date.now()}\`, status: "SUCCESS" };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    console.log(\`[Stripe] Remboursement \${transactionId}: \${amount}€\`);
    return { refundId: \`ref_\${Date.now()}\`, status: "REFUNDED" };
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    return { id: transactionId, status: "COMPLETED", provider: "stripe" };
  }
}

// ── Implémentation PayPal ──────────────────────────────────────
class PayPalProcessor extends BasePaymentProcessor {
  protected async executePayment(amount: number, currency: string): Promise<PaymentResult> {
    console.log(\`[PayPal] Traitement de \${amount} \${currency}\`);
    return { transactionId: \`pp_\${Date.now()}\`, status: "SUCCESS" };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    console.log(\`[PayPal] Remboursement \${transactionId}: \${amount}€\`);
    return { refundId: \`ppref_\${Date.now()}\`, status: "REFUNDED" };
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    return { id: transactionId, status: "COMPLETED", provider: "paypal" };
  }
}
\`\`\`

## Projet Fil Rouge : Système Bancaire Complet <a name="projet"></a>

Assemblons tous les concepts dans une architecture complète :

\`\`\`typescript
// ── Types et Interfaces ─────────────────────────────────────────
interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  timestamp: Date;
  description?: string;
}

interface AuditEvent {
  action: string;
  details: string;
  timestamp: Date;
  userId?: string;
}

interface AccountReport {
  owner: string;
  type: string;
  balance: number;
  interestRate: number;
}

// ── Exceptions Métier ────────────────────────────────────────────
class BankError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class InsufficientFundsError extends BankError {
  constructor(message: string) { super(message, "INSUFFICIENT_FUNDS"); }
}

class InvalidAmountError extends BankError {
  constructor(message: string) { super(message, "INVALID_AMOUNT"); }
}

class MinimumBalanceError extends BankError {
  constructor(message: string) { super(message, "MINIMUM_BALANCE"); }
}

class WithdrawalLimitError extends BankError {
  constructor(message: string) { super(message, "WITHDRAWAL_LIMIT"); }
}

class AccountNotFoundError extends BankError {
  constructor(accountId: string) {
    super(\`Compte \${accountId} introuvable\`, "ACCOUNT_NOT_FOUND");
  }
}

// ── Service de Transfert ────────────────────────────────────────
class TransferService {
  constructor(
    private auditor: AuditLogger,
    private notifier: NotificationService
  ) {}

  async transfer(
    from: BankAccount,
    to: BankAccount,
    amount: number,
    description?: string
  ): Promise<TransferResult> {
    // Validation
    if (from.accountNumber === to.accountNumber) {
      throw new BankError("Impossible de transférer vers le même compte", "SAME_ACCOUNT");
    }

    try {
      // Transaction (pas de vrai ACID ici, mais le concept est montré)
      from.withdraw(amount);
      to.deposit(amount);

      const result: TransferResult = {
        id: crypto.randomUUID(),
        from: from.accountNumber,
        to: to.accountNumber,
        amount,
        timestamp: new Date(),
        status: "SUCCESS",
      };

      // Audit & Notifications
      this.auditor.log({
        action: "TRANSFER",
        details: \`\${amount}€ de \${from.owner} vers \${to.owner}\`,
        timestamp: new Date(),
      });

      await this.notifier.notify(
        from.owner,
        \`Virement de \${amount}€ vers \${to.owner} effectué\`
      );
      await this.notifier.notify(
        to.owner,
        \`Vous avez reçu \${amount}€ de \${from.owner}\`
      );

      return result;
    } catch (error) {
      // Rollback en cas d'échec du dépôt
      if (error instanceof Error && from.balance < amount) {
        from.deposit(amount); // Restore
      }
      throw error;
    }
  }
}

interface TransferResult {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  status: "SUCCESS" | "FAILED";
}
\`\`\`

### Architecture Finale

\`\`\`typescript
// ── Point d'entrée : La Banque ───────────────────────────────────
class BankingSystem {
  private accounts = new Map<string, BankAccount>();
  private transferService: TransferService;

  constructor(
    private notifier: NotificationService,
    private auditor: AuditLogger
  ) {
    this.transferService = new TransferService(auditor, notifier);
  }

  openAccount(type: "checking" | "savings" | "investment", owner: string, deposit: number): BankAccount {
    let account: BankAccount;

    switch (type) {
      case "checking":
        account = new CheckingAccount(owner, deposit);
        break;
      case "savings":
        account = new SavingsAccount(owner, deposit);
        break;
      case "investment":
        account = new InvestmentAccount(owner, deposit);
        break;
    }

    this.accounts.set(account.accountNumber, account);
    this.auditor.log({
      action: "ACCOUNT_OPENED",
      details: \`Compte \${type} ouvert pour \${owner} avec \${deposit}€\`,
      timestamp: new Date(),
    });

    return account;
  }

  getAccount(accountNumber: string): BankAccount {
    const account = this.accounts.get(accountNumber);
    if (!account) throw new AccountNotFoundError(accountNumber);
    return account;
  }

  async transfer(fromId: string, toId: string, amount: number): Promise<TransferResult> {
    const from = this.getAccount(fromId);
    const to = this.getAccount(toId);
    return this.transferService.transfer(from, to, amount);
  }

  applyMonthlyInterest(): void {
    for (const account of this.accounts.values()) {
      const interest = account.calculateInterest();
      if (interest !== 0) {
        console.log(\`[\${account.getAccountType()}] \${account.owner}: \${interest > 0 ? '+' : ''}\${interest.toFixed(2)}€\`);
      }
    }
  }

  generateMonthlyReport(): AccountReport[] {
    return Array.from(this.accounts.values()).map(acc => ({
      owner: acc.owner,
      type: acc.getAccountType(),
      balance: acc.balance,
      interestRate: acc.calculateInterest(),
    }));
  }
}
\`\`\`

## Design Patterns Essentiels <a name="patterns"></a>

### Observer Pattern — Système de Notifications

\`\`\`typescript
interface Observer<T> {
  update(event: T): void;
}

interface Observable<T> {
  subscribe(observer: Observer<T>): void;
  unsubscribe(observer: Observer<T>): void;
  notifyAll(event: T): void;
}

class AccountEventEmitter implements Observable<AccountEvent> {
  private observers: Set<Observer<AccountEvent>> = new Set();

  subscribe(observer: Observer<AccountEvent>): void {
    this.observers.add(observer);
  }

  unsubscribe(observer: Observer<AccountEvent>): void {
    this.observers.delete(observer);
  }

  notifyAll(event: AccountEvent): void {
    for (const observer of this.observers) {
      observer.update(event);
    }
  }
}

class FraudDetectionObserver implements Observer<AccountEvent> {
  update(event: AccountEvent): void {
    if (event.type === "WITHDRAWAL" && event.amount > 5000) {
      console.warn(\`🚨 Retrait suspect : \${event.amount}€ sur le compte \${event.accountId}\`);
    }
  }
}

class AnalyticsObserver implements Observer<AccountEvent> {
  update(event: AccountEvent): void {
    // Envoyer vers le système d'analytics
    console.log(\`📊 Analytics: \${event.type} — \${event.amount}€\`);
  }
}
\`\`\`

### Strategy Pattern — Calcul d'Intérêts

\`\`\`typescript
interface InterestStrategy {
  calculate(balance: number): number;
  getName(): string;
}

class SimpleInterest implements InterestStrategy {
  constructor(private rate: number) {}

  calculate(balance: number): number {
    return balance * this.rate;
  }

  getName(): string {
    return \`Intérêt simple (\${this.rate * 100}%)\`;
  }
}

class CompoundInterest implements InterestStrategy {
  constructor(
    private annualRate: number,
    private compoundingPeriods: number = 12
  ) {}

  calculate(balance: number): number {
    const monthlyRate = this.annualRate / this.compoundingPeriods;
    return balance * monthlyRate;
  }

  getName(): string {
    return \`Intérêt composé (\${this.annualRate * 100}% annuel)\`;
  }
}

class TieredInterest implements InterestStrategy {
  private tiers = [
    { threshold: 10_000, rate: 0.01 },
    { threshold: 50_000, rate: 0.02 },
    { threshold: Infinity, rate: 0.03 },
  ];

  calculate(balance: number): number {
    let remaining = balance;
    let totalInterest = 0;
    let prevThreshold = 0;

    for (const tier of this.tiers) {
      const amount = Math.min(remaining, tier.threshold - prevThreshold);
      totalInterest += amount * tier.rate;
      remaining -= amount;
      prevThreshold = tier.threshold;
      if (remaining <= 0) break;
    }

    return totalInterest;
  }

  getName(): string {
    return "Intérêt par paliers";
  }
}

// Utilisation
class FlexibleSavingsAccount extends BankAccount {
  constructor(
    owner: string,
    initialDeposit: number,
    private strategy: InterestStrategy // Injecté
  ) {
    super(owner, initialDeposit);
  }

  calculateInterest(): number {
    return this.strategy.calculate(this.balance);
  }

  // On peut changer de stratégie à l'exécution !
  setInterestStrategy(strategy: InterestStrategy): void {
    this.strategy = strategy;
  }

  getAccountType(): string {
    return "EPARGNE_FLEXIBLE";
  }
}
\`\`\`

## SOLID en Pratique <a name="solid"></a>

Récapitulons comment notre projet bancaire applique les principes SOLID :

| Principe | Application dans notre projet |
|----------|-------------------------------|
| **S** — Single Responsibility | \`BankAccount\` gère les comptes, \`TransferService\` gère les virements, \`NotificationService\` gère les notifications |
| **O** — Open/Closed | Nouveau type de compte ? Créer une sous-classe. Nouveau processeur de paiement ? Implémenter l'interface |
| **L** — Liskov Substitution | \`SavingsAccount\` et \`CheckingAccount\` sont interchangeables dans \`Bank.applyMonthlyInterest()\` |
| **I** — Interface Segregation | \`NotificationService\`, \`AuditLogger\` et \`InterestCalculator\` sont des interfaces disttinctes |
| **D** — Dependency Inversion | \`EnhancedBankAccount\` dépend d'interfaces, pas de classes concrètes |

## Anti-Patterns à Éviter <a name="anti-patterns"></a>

### 1. God Class (Classe Dieu)

\`\`\`typescript
// ❌ MAUVAIS — Une classe qui fait tout
class EverythingService {
  createUser() { /* ... */ }
  processPayment() { /* ... */ }
  sendEmail() { /* ... */ }
  generateReport() { /* ... */ }
  validateInput() { /* ... */ }
  connectToDatabase() { /* ... */ }
  // 50 autres méthodes...
}

// ✅ BON — Responsabilités séparées
class UserService { createUser() { /* ... */ } }
class PaymentService { processPayment() { /* ... */ } }
class EmailService { sendEmail() { /* ... */ } }
class ReportService { generateReport() { /* ... */ } }
\`\`\`

### 2. Inheritance Hell (Enfer de l'Héritage)

\`\`\`typescript
// ❌ MAUVAIS — Hiérarchie trop profonde
class Entity { /* ... */ }
class LivingEntity extends Entity { /* ... */ }
class Animal extends LivingEntity { /* ... */ }
class Mammal extends Animal { /* ... */ }
class DomesticMammal extends Mammal { /* ... */ }
class Dog extends DomesticMammal { /* ... */ }
class GoldenRetriever extends Dog { /* ... */ }

// ✅ BON — Composition avec interfaces
interface Walkable { walk(): void; }
interface Feedable { feed(food: Food): void; }
interface Trainable { train(command: string): void; }

class Pet implements Walkable, Feedable, Trainable {
  constructor(
    private walker: WalkBehavior,
    private feeder: FeedBehavior,
    private trainer: TrainBehavior
  ) {}

  walk() { this.walker.walk(); }
  feed(food: Food) { this.feeder.feed(food); }
  train(command: string) { this.trainer.train(command); }
}
\`\`\`

### 3. Anemic Domain Model

\`\`\`typescript
// ❌ MAUVAIS — Objet sans logique métier
class Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
}

// La logique est dans un service séparé
class OrderService {
  calculateTotal(order: Order) {
    order.total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
  validate(order: Order) { /* ... */ }
  apply discount(order: Order) { /* ... */ }
}

// ✅ BON — Modèle riche avec logique métier
class Order {
  private _items: OrderItem[] = [];
  private _status: OrderStatus = "DRAFT";

  get total(): number {
    return this._items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  addItem(item: OrderItem): void {
    if (this._status !== "DRAFT") throw new Error("Commande déjà finalisée");
    this._items.push(item);
  }

  applyDiscount(code: string): number {
    // Logique métier dans le modèle
    const discount = this.calculateDiscount(code);
    return discount;
  }

  finalize(): void {
    if (this._items.length === 0) throw new Error("Commande vide");
    this._status = "FINALIZED";
  }
}
\`\`\`

## Tests Unitaires en POO <a name="tests"></a>

\`\`\`typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("BankAccount", () => {
  let account: CheckingAccount;

  beforeEach(() => {
    account = new CheckingAccount("Alice", 1000);
  });

  describe("deposit", () => {
    it("augmente le solde du montant déposé", () => {
      account.deposit(500);
      expect(account.balance).toBe(1500);
    });

    it("rejette les montants négatifs", () => {
      expect(() => account.deposit(-100)).toThrow(InvalidAmountError);
    });

    it("rejette les montants nuls", () => {
      expect(() => account.deposit(0)).toThrow(InvalidAmountError);
    });
  });

  describe("withdraw", () => {
    it("diminue le solde", () => {
      account.withdraw(300);
      expect(account.balance).toBe(700);
    });

    it("autorise le découvert jusqu'à la limite", () => {
      account.withdraw(1400); // 1000 solde + 500 découvert
      expect(account.balance).toBe(-400);
    });

    it("rejette au-delà de la limite de découvert", () => {
      expect(() => account.withdraw(2000)).toThrow(InsufficientFundsError);
    });
  });
});

describe("SavingsAccount", () => {
  let account: SavingsAccount;

  beforeEach(() => {
    account = new SavingsAccount("Bob", 5000, 0.03, 100);
  });

  it("calcule les intérêts correctement", () => {
    const interest = account.calculateInterest();
    expect(interest).toBe(150); // 5000 * 0.03
  });

  it("limite les retraits mensuels", () => {
    account.withdraw(100);
    account.withdraw(100);
    account.withdraw(100);
    expect(() => account.withdraw(100)).toThrow(WithdrawalLimitError);
  });

  it("empêche de descendre sous le solde minimum", () => {
    expect(() => account.withdraw(4950)).toThrow(MinimumBalanceError);
  });
});

describe("TransferService", () => {
  it("transfère correctement entre deux comptes", async () => {
    const mockNotifier: NotificationService = {
      notify: vi.fn().mockResolvedValue(undefined),
    };
    const mockAuditor: AuditLogger = { log: vi.fn() };

    const service = new TransferService(mockAuditor, mockNotifier);
    const from = new CheckingAccount("Alice", 1000);
    const to = new CheckingAccount("Bob", 500);

    await service.transfer(from, to, 300);

    expect(from.balance).toBe(700);
    expect(to.balance).toBe(800);
    expect(mockNotifier.notify).toHaveBeenCalledTimes(2);
    expect(mockAuditor.log).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

## POO vs Fonctionnel — Quand Utiliser Quoi ? <a name="poo-vs-fp"></a>

| Critère | POO | Fonctionnel |
|---------|-----|-------------|
| **État** | État encapsulé dans des objets | Éviter l'état mutable, fonctions pures |
| **Idéal pour** | Modéliser des entités du domaine (User, Order, Account) | Transformations de données (map, filter, reduce) |
| **Extension** | Ajouter de nouveaux types facile (nouvelle sous-classe) | Ajouter de nouvelles opérations facile (nouvelle fonction) |
| **Tests** | Mocking des dépendances | Fonctions pures, pas de mocking nécessaire |
| **Quand utiliser** | Systèmes avec beaucoup d'entités et de comportements | Pipelines de données, traitement de flux |

> **En pratique** : Combinez les deux ! Utilisez la POO pour votre domaine métier et le fonctionnel pour les transformations de données.

\`\`\`typescript
// Combinaison POO + FP dans un projet réel
class AccountAnalytics {
  constructor(private accounts: BankAccount[]) {}

  // Style fonctionnel pour les transformations
  getHighValueAccounts(threshold: number): BankAccount[] {
    return this.accounts
      .filter(acc => acc.balance > threshold)
      .sort((a, b) => b.balance - a.balance);
  }

  getTotalByType(): Map<string, number> {
    return this.accounts.reduce((map, acc) => {
      const type = acc.getAccountType();
      map.set(type, (map.get(type) ?? 0) + acc.balance);
      return map;
    }, new Map<string, number>());
  }

  getAverageBalance(): number {
    if (this.accounts.length === 0) return 0;
    const total = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    return total / this.accounts.length;
  }
}
\`\`\`

## Conclusion et Ressources <a name="conclusion"></a>

La POO n'est pas juste 4 mots-clés à mémoriser — c'est une discipline de conception qui, bien appliquée, produit du code :

- **Compréhensible** : Le code reflète le domaine métier
- **Maintenable** : Chaque modification est isolée
- **Testable** : Les dépendances sont injectables et mockables
- **Extensible** : Nouveaux comportements sans modifier l'existant

### Checklist POO

- [ ] Mes classes ont une seule responsabilité ?
- [ ] J'utilise la composition plutôt que l'héritage profond ?
- [ ] Mes dépendances sont injectées via des interfaces ?
- [ ] Mes propriétés sont privées par défaut ?
- [ ] Mes exceptions sont typées et explicites ?
- [ ] Mes tests couvrent les cas limites ?

### Pour aller plus loin

- **Clean Code** de Robert C. Martin — Les bases de l'écriture de code propre
- **Design Patterns: Elements of Reusable Object-Oriented Software** (Gang of Four) — La référence des design patterns
- **Head First Design Patterns** — Version accessible avec illustrations
- **Refactoring** de Martin Fowler — Comment améliorer du code existant
`,
);

console.log("\\n═══ Blog 1 (OOP) terminé ═══\\n");

// ═══════════════════════════════════════════════════════════════════════
// BLOG 2: Comprendre Git de A à Z
// ═══════════════════════════════════════════════════════════════════════
w(
  "mastering-git-complete-guide.mdx",
  `
---
title: "Comprendre Git de A à Z : Le Guide Complet de l'Expert"
excerpt: "Du premier commit aux stratégies avancées de branching, maîtrisez Git en profondeur. Rebase interactif, cherry-pick, bisect, worktrees, hooks et workflows d'équipe — le guide qui transforme votre utilisation de Git."
date: "2025-07-01"
author: "Fernand SOUALO"
categories: ["Git", "DevOps", "Workflow", "Collaboration", "Productivité"]
coverImage: "/blog/git-mastery.webp"
---

# Comprendre Git de A à Z : Le Guide Complet de l'Expert

## Table of Contents

1. [Pourquoi maîtriser Git ?](#pourquoi)
2. [Le Modèle Mental de Git](#modele)
3. [Les Fondamentaux Maîtrisés](#fondamentaux)
4. [Branching Stratégique](#branching)
5. [Merge vs Rebase — Le Débat Tranché](#merge-rebase)
6. [Rebase Interactif — L'Outil Magique](#rebase-interactif)
7. [Git Stash — Votre Brouillon Temporaire](#stash)
8. [Cherry-Pick et Bisect](#cherry-bisect)
9. [Git Worktrees — Travailler sur Plusieurs Branches](#worktrees)
10. [Reflog — Votre Filet de Sécurité](#reflog)
11. [Git Hooks — Automatiser Votre Workflow](#hooks)
12. [Stratégies de Branching en Équipe](#strategies)
13. [Résolution de Conflits Comme un Pro](#conflits)
14. [Astuces de Productivité](#astuces)
15. [.gitconfig Ultime](#gitconfig)
16. [Conclusion](#conclusion)

## Pourquoi maîtriser Git ? <a name="pourquoi"></a>

Git n'est pas juste un outil de versioning — c'est le **système nerveux central** de tout projet logiciel moderne. Pourtant, la plupart des développeurs n'utilisent que 10% de ses capacités : \`add\`, \`commit\`, \`push\`, \`pull\`, \`merge\`. 

Maîtriser Git signifie :
- ⏱️ **Gagner des heures** en évitant les galères de merge
- 🔍 **Débugger en minutes** grâce à \`bisect\`
- 📦 **Livrer du code propre** avec un historique lisible
- 🤝 **Collaborer efficacement** avec des workflows clairs

## Le Modèle Mental de Git <a name="modele"></a>

Avant les commandes, comprenez le **modèle de données** de Git :

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│                    ZONES DE TRAVAIL GIT                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Working Directory    Staging Area     Local Repo    Remote  │
│  (vos fichiers)       (index)          (.git/)       (origin)│
│                                                              │
│      ──git add──►      ──git commit──►   ──git push──►       │
│      ◄──git checkout── ◄──git reset──    ◄──git fetch──      │
│                                          ◄──git pull──       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### Les 3 Objets Fondamentaux

\`\`\`bash
# 1. BLOB — Le contenu d'un fichier (sans le nom)
git hash-object -w myfile.txt
# Retourne: a1b2c3d... (SHA-1 du contenu)

# 2. TREE — Un dossier (liste de blobs et d'autres trees)
git ls-tree HEAD
# 100644 blob a1b2c3d  src/index.ts
# 040000 tree e4f5g6h  src/components/

# 3. COMMIT — Un snapshot + métadonnées
git cat-file -p HEAD
# tree a1b2c3d...
# parent f7g8h9j...
# author Fernand SOUALO <fygs@dev.com> 1700000000 +0100
# committer Fernand SOUALO <fygs@dev.com> 1700000000 +0100
# 
# feat: add user authentication
\`\`\`

> **Insight clé** : Un commit ne stocke pas les diffs — il stocke un **snapshot complet** du projet. Git est ultra-efficace car il déduplique via les hashes SHA.

### Les Branches sont des Pointeurs

\`\`\`bash
# Une branche est juste un fichier contenant un hash de commit
cat .git/refs/heads/main
# a1b2c3d4e5f6g7h8i9j0... (40 caractères)

# HEAD est un pointeur vers la branche courante
cat .git/HEAD
# ref: refs/heads/main
\`\`\`

## Les Fondamentaux Maîtrisés <a name="fondamentaux"></a>

### Commit comme un Pro

\`\`\`bash
# ── Conventional Commits — Standard de l'industrie ──
git commit -m "feat: add user registration with email verification"
git commit -m "fix: resolve race condition in payment processing"
git commit -m "docs: update API documentation for v2 endpoints"
git commit -m "refactor: extract validation logic into shared module"
git commit -m "perf: optimize database queries with proper indexing"
git commit -m "test: add unit tests for TransferService"
git commit -m "chore: upgrade dependencies to latest versions"

# ── Commit avec body détaillé ──
git commit -m "feat: implement real-time notifications" -m "
- Add WebSocket connection for live updates
- Implement notification queue with retry logic
- Add read/unread status tracking
- Support email, SMS, and push notification channels

Closes #142"
\`\`\`

### Anatomie d'un git log Parfait

\`\`\`bash
# ── Visualiser l'historique comme un graph ──
git log --oneline --graph --all --decorate

# ── Format personnalisé ──
git log --pretty=format:"%C(yellow)%h%C(reset) %C(green)(%cr)%C(reset) %C(bold blue)<%an>%C(reset) %s%C(red)%d%C(reset)" --graph

# ── Chercher dans l'historique ──
git log --grep="payment"               # Par message de commit
git log -S "processPayment"            # Par contenu modifié (pickaxe)
git log --author="Fernand"             # Par auteur
git log --since="2 weeks ago"          # Par date
git log --follow -- src/services/auth.ts # Suivre un fichier renommé
git log --all -- "**/auth*"            # Tous fichiers contenant "auth"
\`\`\`

### git diff — Comprendre les Changements

\`\`\`bash
# Diff entre working dir et staging
git diff

# Diff entre staging et dernier commit
git diff --staged
git diff --cached   # Alias

# Diff entre deux commits
git diff abc123..def456

# Diff entre branches
git diff main..feature/auth

# Diff avec stats
git diff --stat main..feature/auth
#  src/auth/login.ts      | 45 +++++++++++
#  src/auth/middleware.ts  | 12 ++-
#  tests/auth.test.ts     | 89 +++++++++++++++++
#  3 files changed, 143 insertions(+), 3 deletions(-)

# Diff d'un seul fichier
git diff HEAD~3 -- src/services/user.ts

# Diff avec couleurs de mots (pas de lignes)
git diff --word-diff
\`\`\`

## Branching Stratégique <a name="branching"></a>

\`\`\`bash
# ── Créer et basculer en une commande ──
git switch -c feature/user-auth
# Équivalent moderne de: git checkout -b feature/user-auth

# ── Lister les branches avec infos ──
git branch -vv
# * feature/auth  a1b2c3d [origin/feature/auth: ahead 2] feat: add JWT
#   main          d4e5f6g [origin/main] chore: release v2.1

# ── Supprimer les branches mergées ──
git branch --merged main | grep -v "main" | xargs git branch -d

# ── Renommer une branche ──
git branch -m old-name new-name

# ── Suivre une branche distante ──
git switch --track origin/feature/new-api
\`\`\`

### Stratégie de Nommage

\`\`\`bash
# Convention de nommage recommandée
feature/user-authentication      # Nouvelle fonctionnalité
fix/payment-race-condition       # Correction de bug
hotfix/security-vulnerability    # Correction urgente en prod
refactor/extract-validation      # Refactoring
docs/api-v2-documentation        # Documentation
chore/upgrade-dependencies       # Maintenance
release/v2.1.0                   # Release
\`\`\`

## Merge vs Rebase — Le Débat Tranché <a name="merge-rebase"></a>

### git merge — Préserve l'Historique

\`\`\`bash
# Merge avec commit de merge (--no-ff)
git switch main
git merge --no-ff feature/auth
# Crée un commit de merge M qui unit les deux historiques

# Résultat dans le graph :
#   * M (merge commit)
#   |\\
#   | * feat: add JWT validation
#   | * feat: add login endpoint
#   |/
#   * previous commit on main
\`\`\`

### git rebase — Historique Linéaire

\`\`\`bash
# Rebase votre branche SUR main
git switch feature/auth
git rebase main

# AVANT le rebase :
#   * feat: add JWT (feature/auth)
#   * feat: add login
#   |
#   | * hotfix: security patch (main)
#   |/
#   * commit commun

# APRÈS le rebase :
#   * feat: add JWT (feature/auth)
#   * feat: add login
#   * hotfix: security patch (main)
#   * commit commun
\`\`\`

### Quand Utiliser Quoi ?

| Situation | Recommandation | Pourquoi |
|-----------|---------------|----------|
| Feature branch → main | **Squash merge** | Un commit propre par feature |
| Main → votre branche | **Rebase** | Historique linéaire, pas de merge commits parasites |
| Branche partagée | **Merge** | Ne jamais rebase une branche partagée ! |
| Release → main | **Merge --no-ff** | Préserver l'historique de la release |
| Hotfix → main + develop | **Merge** | Traçabilité claire du fix |

> **Règle d'or** : Ne JAMAIS rebase une branche qui a été poussée et que d'autres utilisent. Le rebase réécrit l'historique.

## Rebase Interactif — L'Outil Magique <a name="rebase-interactif"></a>

Le rebase interactif est probablement la fonctionnalité la plus puissante de Git :

\`\`\`bash
# Réécrire les 5 derniers commits
git rebase -i HEAD~5

# L'éditeur s'ouvre avec :
pick a1b2c3d feat: add user model
pick d4e5f6g fix: typo in user model
pick h7i8j9k feat: add user service
pick l0m1n2o wip: testing stuff
pick p3q4r5s feat: add user controller

# Vous pouvez :
# pick   = garder le commit tel quel
# reword = garder mais modifier le message
# edit   = s'arrêter pour modifier le commit
# squash = fusionner avec le commit précédent (garder les messages)
# fixup  = fusionner avec le commit précédent (supprimer le message)
# drop   = supprimer le commit
# reorder = changer l'ordre des lignes

# Résultat souhaité :
pick a1b2c3d feat: add user model
fixup d4e5f6g fix: typo in user model
pick h7i8j9k feat: add user service
drop l0m1n2o wip: testing stuff
pick p3q4r5s feat: add user controller
\`\`\`

### Cas d'Usage Courants

\`\`\`bash
# ── Fusionner les 3 derniers commits en un seul ──
git rebase -i HEAD~3
# Mettre "squash" sur les 2 derniers, garder "pick" sur le premier

# ── Auto-squash avec --fixup ──
# 1. Faire le commit de fix en référençant le commit à fixer
git commit --fixup=a1b2c3d

# 2. Rebase avec auto-squash
git rebase -i --autosquash main
# Les fixup commits sont automatiquement placés après leur cible

# ── Modifier un ancien commit ──
git rebase -i HEAD~5
# Mettre "edit" sur le commit à modifier
# Git s'arrête à ce commit
git add forgotten-file.ts
git commit --amend --no-edit
git rebase --continue
\`\`\`

## Git Stash — Votre Brouillon Temporaire <a name="stash"></a>

\`\`\`bash
# ── Stash basique ──
git stash                         # Stash tout (tracked modifiés + staged)
git stash -u                      # Inclure les fichiers non-trackés
git stash -a                      # Inclure les fichiers ignorés aussi

# ── Stash avec message ──
git stash push -m "WIP: refactoring auth middleware"

# ── Stash sélectif ──
git stash push -p                 # Mode interactif, stash hunk par hunk
git stash push src/auth/          # Stash seulement certains fichiers

# ── Gérer les stashes ──
git stash list
# stash@{0}: On feature/auth: WIP: refactoring auth middleware
# stash@{1}: WIP on main: fix: update deps

git stash show -p stash@{0}       # Voir le contenu d'un stash
git stash apply stash@{0}         # Appliquer sans supprimer
git stash pop                     # Appliquer et supprimer
git stash drop stash@{1}          # Supprimer un stash
git stash clear                   # Supprimer tous les stashes

# ── Créer une branche depuis un stash ──
git stash branch feature/from-stash stash@{0}
\`\`\`

## Cherry-Pick et Bisect <a name="cherry-bisect"></a>

### Cherry-Pick — Prendre un Commit Spécifique

\`\`\`bash
# Appliquer un commit spécifique sur la branche courante
git cherry-pick a1b2c3d

# Cherry-pick sans commit (garder les changements en staging)
git cherry-pick --no-commit a1b2c3d

# Cherry-pick de plusieurs commits
git cherry-pick a1b2c3d d4e5f6g h7i8j9k

# Cherry-pick d'un range
git cherry-pick main~5..main~2

# En cas de conflit
git cherry-pick --continue   # Après résolution
git cherry-pick --abort      # Annuler
\`\`\`

### Bisect — Trouver le Commit Fautif

\`\`\`bash
# ── Le scénario ──
# "Le bug n'était pas là il y a 2 semaines, mais il est là maintenant"
# Au lieu de vérifier 200 commits un par un...

# 1. Démarrer bisect
git bisect start

# 2. Marquer le commit actuel comme mauvais
git bisect bad

# 3. Marquer un commit ancien comme bon
git bisect good v2.0.0    # ou un hash

# 4. Git checkout automatiquement au milieu
# Tester → marquer bon ou mauvais
git bisect good   # ou
git bisect bad

# 5. Répéter — Git fait une recherche binaire
# En 7 étapes max, trouve le coupable parmi 128 commits !

# 6. Terminer
git bisect reset

# ── Bisect automatisé (le top !) ──
git bisect start HEAD v2.0.0
git bisect run npm test
# Git teste automatiquement chaque commit et trouve le fautif !

git bisect run ./test-specific-bug.sh
# Votre script doit retourner 0 (bon) ou 1 (mauvais)
\`\`\`

## Git Worktrees — Travailler sur Plusieurs Branches <a name="worktrees"></a>

Besoin de travailler sur un hotfix pendant que votre feature branch compile ? Les worktrees vous permettent d'avoir **plusieurs checkouts du même repo** :

\`\`\`bash
# ── Créer un worktree ──
git worktree add ../project-hotfix hotfix/critical-fix
# Crée un dossier ../project-hotfix avec la branche hotfix

# ── Lister les worktrees ──
git worktree list
# /home/dev/project          a1b2c3d [feature/auth]
# /home/dev/project-hotfix   d4e5f6g [hotfix/critical-fix]

# ── Travailler dans le worktree ──
cd ../project-hotfix
# Faire vos modifications...
git add . && git commit -m "fix: critical security patch"
git push

# ── Revenir et supprimer ──
cd ../project
git worktree remove ../project-hotfix

# ── Cas d'usage avancé : review une PR ──
git worktree add ../pr-review origin/feature/new-api
cd ../pr-review
# Tester, reviewer...
cd ../project
git worktree remove ../pr-review
\`\`\`

## Reflog — Votre Filet de Sécurité <a name="reflog"></a>

Le reflog enregistre **tout mouvement de HEAD**. C'est votre machine à remonter le temps :

\`\`\`bash
# ── Voir le reflog ──
git reflog
# a1b2c3d HEAD@{0}: commit: feat: add new feature
# d4e5f6g HEAD@{1}: rebase -i (finish): returning to refs/heads/main
# h7i8j9k HEAD@{2}: rebase -i (pick): feat: add service
# l0m1n2o HEAD@{3}: rebase -i (start): checkout main
# p3q4r5s HEAD@{4}: commit: wip: testing stuff

# ── Récupérer un commit "perdu" ──
# Vous avez fait un rebase et perdu un commit ?
git reflog
# Trouvez le hash avant le rebase
git checkout p3q4r5s
# Ou créez une branche
git branch recovered-work p3q4r5s

# ── Annuler un rebase raté ──
git reflog
# Trouvez l'état avant le rebase (HEAD@{N})
git reset --hard HEAD@{4}

# ── Récupérer après un reset --hard ──
# Même après un reset --hard, le reflog conserve la trace
git reset --hard HEAD~5     # Oups ! 5 commits perdus
git reflog                  # Trouver le hash avant le reset
git reset --hard HEAD@{1}   # Restaurer !
\`\`\`

> **Le reflog est local** : il n'est pas poussé vers le remote. Il expire après 90 jours par défaut. C'est votre filet de sécurité personnel.

## Git Hooks — Automatiser Votre Workflow <a name="hooks"></a>

\`\`\`bash
# Les hooks vivent dans .git/hooks/
# Pour les partager avec l'équipe, utilisez husky

# ── Installation avec Husky ──
npx husky init
\`\`\`

\`\`\`javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Lint les fichiers staged seulement
npx lint-staged
\`\`\`

\`\`\`json
// package.json — lint-staged config
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
\`\`\`

\`\`\`bash
# .husky/commit-msg — Valider le format des commits
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"

# commitlint.config.js
# module.exports = {
#   extends: ['@commitlint/config-conventional'],
#   rules: {
#     'type-enum': [2, 'always', [
#       'feat', 'fix', 'docs', 'style', 'refactor',
#       'perf', 'test', 'chore', 'ci', 'build'
#     ]],
#   },
# };
\`\`\`

\`\`\`bash
# .husky/pre-push — Vérifications avant push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."
npm test

echo "🔍 Type checking..."
npx tsc --noEmit

echo "✅ All checks passed. Pushing..."
\`\`\`

## Stratégies de Branching en Équipe <a name="strategies"></a>

### GitHub Flow (Recommandé pour la plupart des projets)

\`\`\`
main (toujours déployable)
  │
  ├── feature/user-auth ──── PR ──── merge ──── deploy
  │
  ├── fix/payment-bug ──── PR ──── merge ──── deploy
  │
  └── feature/dashboard ──── PR ──── merge ──── deploy
\`\`\`

\`\`\`bash
# Workflow quotidien
git switch main
git pull origin main
git switch -c feature/new-feature

# Travailler...
git add . && git commit -m "feat: implement feature"

# Mettre à jour avec les derniers changements de main
git fetch origin
git rebase origin/main

# Pousser et créer une PR
git push -u origin feature/new-feature
gh pr create --title "feat: implement new feature" --body "Description..."
\`\`\`

### Trunk-Based Development (Pour les équipes expérimentées)

\`\`\`bash
# Tout le monde travaille proche de main
# Branches de feature ultra-courtes (< 1 jour)
git switch -c feature/small-change
# ... modifications ...
git commit -m "feat: small focused change"
git push -u origin feature/small-change
# PR → merge rapide (< 24h)

# Feature flags pour les features incomplètes
if (featureFlags.isEnabled("new-dashboard")) {
  return <NewDashboard />;
}
return <OldDashboard />;
\`\`\`

## Résolution de Conflits Comme un Pro <a name="conflits"></a>

\`\`\`bash
# ── Quand un conflit survient ──
git merge feature/auth
#   CONFLICT (content): Merge conflict in src/auth.ts
#   Automatic merge failed; fix conflicts and then commit the result.

# ── Les marqueurs de conflit ──
# <<<<<<< HEAD (votre code actuel)
# const authMethod = "jwt";
# =======
# const authMethod = "session";
# >>>>>>> feature/auth (le code entrant)

# ── Stratégies de résolution ──
# 1. Résolution manuelle dans l'éditeur
# 2. Accepter l'un ou l'autre
git checkout --ours src/auth.ts    # Garder notre version
git checkout --theirs src/auth.ts  # Garder leur version

# 3. Merge tool visuel
git mergetool

# ── Prévenir les conflits ──
# - Rebase fréquent sur main
# - Petites branches, petites PRs
# - Communication d'équipe sur les fichiers modifiés
# - Code ownership clair
\`\`\`

### Résoudre les Conflits de Rebase

\`\`\`bash
# Pendant un rebase, pour chaque conflit :
git rebase main
# CONFLICT in file.ts

# 1. Résoudre le conflit dans l'éditeur
# 2. Ajouter le fichier résolu
git add src/file.ts

# 3. Continuer le rebase
git rebase --continue

# Si ça devient trop compliqué :
git rebase --abort   # Annule tout le rebase
\`\`\`

## Astuces de Productivité <a name="astuces"></a>

\`\`\`bash
# ── Alias Git essentiels ──
git config --global alias.co "checkout"
git config --global alias.sw "switch"
git config --global alias.br "branch"
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "reset HEAD --"
git config --global alias.amend "commit --amend --no-edit"
git config --global alias.wip "commit -am 'WIP'"
git config --global alias.undo "reset --soft HEAD~1"
git config --global alias.cleanup "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs git branch -d"

# ── Commandes méconnues mais ultra-utiles ──

# Voir qui a modifié chaque ligne
git blame src/auth.ts
git blame -L 50,70 src/auth.ts   # Lignes 50-70 seulement

# Rechercher dans tous les commits
git grep "processPayment" $(git rev-list --all)

# Voir les fichiers modifiés entre deux branches
git diff --name-only main..feature/auth

# Compter les commits par auteur
git shortlog -sn --no-merges

# Restaurer un fichier d'un ancien commit
git restore --source=HEAD~3 -- src/config.ts

# Créer un patch
git diff > my-changes.patch
git apply my-changes.patch

# Signer ses commits
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY_ID
\`\`\`

## .gitconfig Ultime <a name="gitconfig"></a>

\`\`\`ini
# ~/.gitconfig

[user]
    name = Fernand SOUALO
    email = fygs.dev@gmail.com
    signingkey = YOUR_KEY

[core]
    editor = code --wait
    autocrlf = input
    pager = delta    # Meilleur diff viewer (cargo install git-delta)

[init]
    defaultBranch = main

[pull]
    rebase = true

[push]
    autoSetupRemote = true
    default = current

[fetch]
    prune = true
    prunetags = true

[merge]
    conflictStyle = diff3
    tool = vscode

[mergetool "vscode"]
    cmd = code --wait $MERGED

[diff]
    colorMoved = default
    tool = vscode

[difftool "vscode"]
    cmd = code --wait --diff $LOCAL $REMOTE

[rebase]
    autoSquash = true
    autoStash = true

[rerere]
    enabled = true
    # "REuse REcorded REsolution" — Git se souvient des résolutions de conflits

[commit]
    gpgsign = true

[alias]
    co = checkout
    sw = switch
    br = branch -vv
    st = status -sb
    lg = log --oneline --graph --all --decorate --color
    last = log -1 HEAD --format='%C(yellow)%h%C(reset) %s %C(green)(%cr)%C(reset)'
    amend = commit --amend --no-edit
    undo = reset --soft HEAD~1
    wip = !git add -A && git commit -m 'WIP'
    unwip = reset HEAD~1
    cleanup = !git branch --merged | grep -v '\\\\*\\\\|main\\\\|develop' | xargs git branch -d
    fresh = !git fetch --all && git rebase origin/main
    contributors = shortlog -sn --no-merges
    today = log --since=midnight --oneline --no-merges
    week = log --since='1 week ago' --oneline --no-merges
    files = diff --name-status
    
[delta]
    navigate = true
    side-by-side = true
    line-numbers = true
\`\`\`

## Conclusion <a name="conclusion"></a>

Git est un outil immensément puissant dont la maîtrise sépare les développeurs efficaces des autres. Voici votre **checklist de progression** :

### Niveau Débutant ✅
- \`add\`, \`commit\`, \`push\`, \`pull\`
- Créer et merger des branches
- Résoudre les conflits basiques

### Niveau Intermédiaire 🔄
- Rebase interactif
- Stash stratégique
- Cherry-pick
- Conventional Commits
- Git hooks avec Husky

### Niveau Expert 🏆
- Bisect automatisé
- Worktrees
- Reflog comme filet de sécurité
- .gitconfig optimisé
- Stratégies de branching d'équipe
- Rerere pour auto-résolution de conflits

> **Conseil final** : Pratiquez dans un repo de test. Créez un repo, faites des commits, branchez, rebasez, cassez tout, utilisez le reflog pour récupérer. C'est en expérimentant sans risque que vous deviendrez vraiment à l'aise.
`,
);

console.log("\\n═══ Blog 2 (Git) terminé ═══\\n");

// ═══════════════════════════════════════════════════════════════════════
// BLOG 3: Les Microservices avec NestJS
// ═══════════════════════════════════════════════════════════════════════
w(
  "mastering-microservices-nestjs.mdx",
  `
---
title: "Maîtriser les Microservices avec NestJS : Projet Complet de A à Z"
excerpt: "Architecture, implémentation et déploiement d'un système e-commerce en microservices avec NestJS. API Gateway, communication inter-services, CQRS, Event Sourcing, Docker et Kubernetes — le guide ultime."
date: "2025-08-10"
author: "Fernand SOUALO"
categories: ["NestJS", "Microservices", "Node.js", "Architecture", "TypeScript"]
coverImage: "/blog/microservices-nestjs.webp"
---

# Maîtriser les Microservices avec NestJS : Projet Complet de A à Z

## Table of Contents

1. [Pourquoi les Microservices ?](#pourquoi)
2. [Architecture du Projet E-Commerce](#architecture)
3. [Setup du Monorepo NestJS](#setup)
4. [API Gateway — Point d'Entrée Unique](#gateway)
5. [User Service — Authentification & Profils](#user-service)
6. [Product Service — Catalogue & Inventaire](#product-service)
7. [Order Service — Commandes & Paiements](#order-service)
8. [Notification Service — Emails & Push](#notification-service)
9. [Communication Inter-Services](#communication)
10. [Event-Driven Architecture avec RabbitMQ](#events)
11. [CQRS Pattern en Pratique](#cqrs)
12. [Base de Données par Service](#database)
13. [Observabilité — Logs, Metrics, Tracing](#observabilite)
14. [Tests d'Intégration](#tests)
15. [Docker & Docker Compose](#docker)
16. [Déploiement Kubernetes](#kubernetes)
17. [Patterns de Résilience](#resilience)
18. [Conclusion et Leçons Apprises](#conclusion)

## Pourquoi les Microservices ? <a name="pourquoi"></a>

Avant de foncer dans le code, posons la question honnêtement : **avez-vous vraiment besoin de microservices ?**

### Monolithe vs Microservices — La Vérité

| Critère | Monolithe | Microservices |
|---------|-----------|---------------|
| **Complexité de départ** | Simple | Complexe |
| **Déploiement** | Un seul artifact | N services indépendants |
| **Scaling** | Tout ou rien | Granulaire (scale le service qui en a besoin) |
| **Team size** | 1-8 devs | 8+ devs (1 team par service) |
| **Cohérence des données** | Transaction ACID simple | Saga pattern, eventual consistency |
| **Debugging** | Stack trace linéaire | Distributed tracing nécessaire |
| **Latence** | Appels en mémoire | Appels réseau (+ latence) |
| **Idéal quand** | MVP, startup early-stage | Scale, équipes multiples, domaine complexe |

> **Règle** : Commencez par un monolithe bien structuré. Migrez vers les microservices quand la douleur l'exige (déploiements trop fréquents, équipes qui se marchent dessus, scaling de fonctionnalités spécifiques).

### Notre Projet : E-Commerce "ShopScale"

Nous allons construire un e-commerce avec 5 microservices :

\`\`\`
┌─────────────────────────────────────────────────┐
│                   CLIENTS                        │
│          (Web App, Mobile App, API)              │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│               API GATEWAY (NestJS)               │
│      Auth, Rate Limiting, Request Routing        │
└──────┬──────┬──────┬──────────┬─────────────────┘
       │      │      │          │
       ▼      ▼      ▼          ▼
┌──────┐ ┌────┐ ┌────┐  ┌──────────────┐
│ User │ │Prod│ │Ord.│  │ Notification │
│ Svc  │ │Svc │ │Svc │  │    Service   │
└──┬───┘ └──┬─┘ └──┬─┘  └──────┬───────┘
   │        │      │           │
   ▼        ▼      ▼           ▼
┌──────┐ ┌────┐ ┌────┐  ┌──────────────┐
│Postgr│ │Mong│ │Post│  │    Redis      │
│  DB  │ │oDB │ │ DB │  │   Pub/Sub     │
└──────┘ └────┘ └────┘  └──────────────┘

       ┌─────────────────────────┐
       │  RabbitMQ (Event Bus)   │
       └─────────────────────────┘
\`\`\`

## Setup du Monorepo NestJS <a name="setup"></a>

\`\`\`bash
# Initialiser le workspace NestJS
nest new shopscale --strict
cd shopscale

# Créer les apps (microservices)
nest generate app api-gateway
nest generate app user-service
nest generate app product-service
nest generate app order-service
nest generate app notification-service

# Créer les librairies partagées
nest generate library common       # DTOs, interfaces, utils
nest generate library database     # Database connections
nest generate library messaging    # RabbitMQ helpers
\`\`\`

### Structure du projet

\`\`\`
shopscale/
├── apps/
│   ├── api-gateway/          # API Gateway (HTTP → microservices)
│   ├── user-service/         # Gestion utilisateurs + auth
│   ├── product-service/      # Catalogue produits
│   ├── order-service/        # Commandes + paiements
│   └── notification-service/ # Notifications multi-canal
├── libs/
│   ├── common/               # DTOs, interfaces, constantes
│   ├── database/             # Config Prisma/TypeORM
│   └── messaging/            # RabbitMQ wrappers
├── docker-compose.yml
├── nest-cli.json
└── package.json
\`\`\`

### Configuration du nest-cli.json

\`\`\`json
{
  "collection": "@nestjs/schematics",
  "monorepo": true,
  "root": "apps/api-gateway",
  "compilerOptions": {
    "webpack": true,
    "tsConfigPath": "apps/api-gateway/tsconfig.app.json"
  },
  "projects": {
    "api-gateway": {
      "type": "application",
      "root": "apps/api-gateway",
      "entryFile": "main",
      "sourceRoot": "apps/api-gateway/src"
    },
    "user-service": {
      "type": "application",
      "root": "apps/user-service",
      "entryFile": "main",
      "sourceRoot": "apps/user-service/src"
    },
    "common": {
      "type": "library",
      "root": "libs/common",
      "entryFile": "index",
      "sourceRoot": "libs/common/src"
    }
  }
}
\`\`\`

## API Gateway — Point d'Entrée Unique <a name="gateway"></a>

L'API Gateway est le seul point d'entrée HTTP. Il route les requêtes vers les bons microservices :

\`\`\`typescript
// apps/api-gateway/src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle("ShopScale API")
    .setDescription("E-Commerce Microservices API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config));

  await app.listen(3000);
  console.log("🚀 API Gateway running on http://localhost:3000");
}
bootstrap();
\`\`\`

\`\`\`typescript
// apps/api-gateway/src/app.module.ts
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ThrottlerModule } from "@nestjs/throttler";
import { UsersController } from "./controllers/users.controller";
import { ProductsController } from "./controllers/products.controller";
import { OrdersController } from "./controllers/orders.controller";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Connexion aux microservices via RabbitMQ
    ClientsModule.register([
      {
        name: "USER_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
          queue: "user_queue",
          queueOptions: { durable: true },
        },
      },
      {
        name: "PRODUCT_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
          queue: "product_queue",
          queueOptions: { durable: true },
        },
      },
      {
        name: "ORDER_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
          queue: "order_queue",
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [UsersController, ProductsController, OrdersController],
  providers: [AuthGuard],
})
export class AppModule {}
\`\`\`

\`\`\`typescript
// apps/api-gateway/src/controllers/orders.controller.ts
import {
  Body, Controller, Get, Inject, Param, Post, UseGuards, Req
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth.guard";
import { CreateOrderDto } from "@app/common/dto/create-order.dto";
import { firstValueFrom, timeout } from "rxjs";

@ApiTags("Orders")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(
    @Inject("ORDER_SERVICE") private readonly orderClient: ClientProxy,
    @Inject("PRODUCT_SERVICE") private readonly productClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new order" })
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    // 1. Vérifier le stock auprès du Product Service
    const stockCheck = await firstValueFrom(
      this.productClient.send("check_stock", { items: dto.items }).pipe(timeout(5000))
    );

    if (!stockCheck.available) {
      return { success: false, message: "Some items are out of stock", unavailable: stockCheck.unavailable };
    }

    // 2. Créer la commande via l'Order Service
    const order = await firstValueFrom(
      this.orderClient.send("create_order", {
        ...dto,
        userId: req.user.id,
      }).pipe(timeout(10000))
    );

    return { success: true, order };
  }

  @Get()
  @ApiOperation({ summary: "Get user orders" })
  async getUserOrders(@Req() req: any) {
    return firstValueFrom(
      this.orderClient.send("get_user_orders", { userId: req.user.id }).pipe(timeout(5000))
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order by ID" })
  async getOrder(@Param("id") id: string, @Req() req: any) {
    return firstValueFrom(
      this.orderClient.send("get_order", { id, userId: req.user.id }).pipe(timeout(5000))
    );
  }
}
\`\`\`

## User Service — Authentification & Profils <a name="user-service"></a>

\`\`\`typescript
// apps/user-service/src/main.ts
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { UserServiceModule } from "./user-service.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
        queue: "user_queue",
        queueOptions: { durable: true },
        prefetchCount: 10,
      },
    },
  );

  await app.listen();
  console.log("👤 User Service is listening on RabbitMQ");
}
bootstrap();
\`\`\`

\`\`\`typescript
// apps/user-service/src/user.controller.ts
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload, EventPattern } from "@nestjs/microservices";
import { UserService } from "./user.service";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern("register_user")
  async register(@Payload() data: RegisterDto) {
    return this.userService.register(data);
  }

  @MessagePattern("login_user")
  async login(@Payload() data: LoginDto) {
    return this.userService.login(data);
  }

  @MessagePattern("validate_token")
  async validateToken(@Payload() data: { token: string }) {
    return this.userService.validateToken(data.token);
  }

  @MessagePattern("get_user_profile")
  async getProfile(@Payload() data: { userId: string }) {
    return this.userService.getProfile(data.userId);
  }

  @EventPattern("order_completed")
  async handleOrderCompleted(@Payload() data: { userId: string; orderId: string }) {
    // Mettre à jour les stats utilisateur
    await this.userService.incrementOrderCount(data.userId);
  }
}
\`\`\`

\`\`\`typescript
// apps/user-service/src/user.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@app/database";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email });

    return { success: true, user, token };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwt.sign({ sub: user.id, email: user.email });

    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwt.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, role: true },
      });
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orderCount: true,
        createdAt: true,
      },
    });
  }

  async incrementOrderCount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { orderCount: { increment: 1 } },
    });
  }
}
\`\`\`

## Communication Inter-Services <a name="communication"></a>

### Patterns de Communication

\`\`\`typescript
// ── 1. Request-Response (Synchrone) ──
// Quand on a besoin d'une réponse immédiate

// Côté émetteur (API Gateway)
const user = await firstValueFrom(
  this.userClient.send("get_user_profile", { userId: "123" })
    .pipe(timeout(5000))
);

// Côté récepteur (User Service)
@MessagePattern("get_user_profile")
async getProfile(@Payload() data: { userId: string }) {
  return this.userService.getProfile(data.userId);
}

// ── 2. Event-Based (Asynchrone) ──
// Fire-and-forget, pas de réponse attendue

// Côté émetteur (Order Service)
this.notificationClient.emit("order_created", {
  orderId: order.id,
  userId: order.userId,
  items: order.items,
  total: order.total,
});

// Côté récepteur (Notification Service)
@EventPattern("order_created")
async handleOrderCreated(@Payload() data: OrderCreatedEvent) {
  await this.sendOrderConfirmation(data);
}
\`\`\`

### Shared DTOs (libs/common)

\`\`\`typescript
// libs/common/src/dto/create-order.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class OrderItemDto {
  @ApiProperty({ example: "prod_123" })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: "123 Rue de Paris, 75001" })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}

// libs/common/src/events/order.events.ts
export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: string;
  createdAt: Date;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  userId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  timestamp: Date;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
\`\`\`

## Event-Driven Architecture avec RabbitMQ <a name="events"></a>

\`\`\`typescript
// libs/messaging/src/rabbitmq.module.ts
import { DynamicModule, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

interface RmqModuleOptions {
  name: string;
  queue: string;
}

@Module({})
export class RmqModule {
  static register(options: RmqModuleOptions[]): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.register(
          options.map(({ name, queue }) => ({
            name,
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
              queue,
              queueOptions: { durable: true },
              socketOptions: {
                heartbeatIntervalInSeconds: 60,
                reconnectTimeInSeconds: 5,
              },
            },
          }))
        ),
      ],
      exports: [ClientsModule],
    };
  }
}
\`\`\`

\`\`\`typescript
// apps/order-service/src/order.service.ts — Saga Pattern
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout, catchError } from "rxjs";

@Injectable()
export class OrderService {
  constructor(
    @Inject("PRODUCT_SERVICE") private productClient: ClientProxy,
    @Inject("NOTIFICATION_SERVICE") private notificationClient: ClientProxy,
    private prisma: PrismaService,
  ) {}

  async createOrder(data: CreateOrderInput): Promise<OrderResult> {
    // ── SAGA : Séquence de transactions compensables ──

    // Étape 1 : Réserver le stock
    const reservation = await firstValueFrom(
      this.productClient.send("reserve_stock", { items: data.items })
        .pipe(
          timeout(5000),
          catchError(err => {
            throw new Error(\`Stock reservation failed: \${err.message}\`);
          })
        )
    );

    if (!reservation.success) {
      return { success: false, error: "Stock unavailable" };
    }

    try {
      // Étape 2 : Créer la commande en DB
      const order = await this.prisma.order.create({
        data: {
          userId: data.userId,
          status: "PENDING",
          total: reservation.total,
          shippingAddress: data.shippingAddress,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: reservation.prices[item.productId],
            })),
          },
        },
        include: { items: true },
      });

      // Étape 3 : Émettre l'événement (asynchrone)
      this.notificationClient.emit("order_created", {
        orderId: order.id,
        userId: data.userId,
        items: order.items,
        total: order.total,
      });

      return { success: true, order };
    } catch (error) {
      // ── COMPENSATION : Annuler la réservation en cas d'échec ──
      await firstValueFrom(
        this.productClient.send("release_stock", {
          reservationId: reservation.id,
        })
      );

      throw error;
    }
  }
}
\`\`\`

## Docker & Docker Compose <a name="docker"></a>

\`\`\`dockerfile
# Dockerfile (Multi-stage build)
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG SERVICE_NAME
RUN npx nest build \${SERVICE_NAME}

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
USER nestjs
ARG SERVICE_NAME
CMD ["node", "dist/apps/\${SERVICE_NAME}/main"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
version: "3.8"

services:
  # ── Infrastructure ──
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: rabbitmq-diagnostics check_running
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-users:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: users
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pg_users_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  postgres-orders:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pg_orders_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

  mongodb-products:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # ── Microservices ──
  api-gateway:
    build:
      context: .
      args:
        SERVICE_NAME: api-gateway
    ports:
      - "3000:3000"
    environment:
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      JWT_SECRET: your-super-secret-key
    depends_on:
      rabbitmq:
        condition: service_healthy

  user-service:
    build:
      context: .
      args:
        SERVICE_NAME: user-service
    environment:
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      DATABASE_URL: postgresql://postgres:postgres@postgres-users:5432/users
      JWT_SECRET: your-super-secret-key
    depends_on:
      rabbitmq:
        condition: service_healthy
      postgres-users:
        condition: service_started

  product-service:
    build:
      context: .
      args:
        SERVICE_NAME: product-service
    environment:
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      MONGODB_URL: mongodb://admin:admin@mongodb-products:27017/products?authSource=admin
    depends_on:
      rabbitmq:
        condition: service_healthy
      mongodb-products:
        condition: service_started

  order-service:
    build:
      context: .
      args:
        SERVICE_NAME: order-service
    environment:
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      DATABASE_URL: postgresql://postgres:postgres@postgres-orders:5432/orders
    depends_on:
      rabbitmq:
        condition: service_healthy
      postgres-orders:
        condition: service_started

  notification-service:
    build:
      context: .
      args:
        SERVICE_NAME: notification-service
    environment:
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      REDIS_URL: redis://redis:6379
      SMTP_HOST: mailhog
      SMTP_PORT: 1025
    depends_on:
      rabbitmq:
        condition: service_healthy
      redis:
        condition: service_started

volumes:
  rabbitmq_data:
  pg_users_data:
  pg_orders_data:
  mongo_data:
\`\`\`

## Patterns de Résilience <a name="resilience"></a>

\`\`\`typescript
// ── Circuit Breaker Pattern ──
import { Injectable } from "@nestjs/common";

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
}

@Injectable()
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(private options: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeout: 30000,
  }) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN — service unavailable");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.options.failureThreshold) {
      this.state = "OPEN";
      console.warn("🔴 Circuit breaker OPENED — too many failures");
    }
  }
}

// Utilisation dans un service
@Injectable()
export class ResilientOrderService {
  private productBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 15000 });

  async checkStock(items: OrderItemDto[]) {
    return this.productBreaker.execute(async () => {
      return firstValueFrom(
        this.productClient.send("check_stock", { items }).pipe(timeout(5000))
      );
    });
  }
}
\`\`\`

\`\`\`typescript
// ── Retry avec Backoff Exponentiel ──
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(\`Retry \${attempt + 1}/\${maxRetries} after \${Math.round(delay)}ms\`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
\`\`\`

## Tests d'Intégration <a name="tests"></a>

\`\`\`typescript
// apps/order-service/test/order.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestMicroservice } from "@nestjs/common";
import { Transport } from "@nestjs/microservices";
import { OrderServiceModule } from "../src/order-service.module";

describe("Order Service (e2e)", () => {
  let app: INestMicroservice;
  let orderService: OrderService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrderServiceModule],
    })
    .overrideProvider("PRODUCT_SERVICE")
    .useValue({
      send: jest.fn().mockReturnValue(of({
        success: true,
        total: 99.99,
        prices: { prod_1: 49.99, prod_2: 50.00 },
      })),
      emit: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
    });

    orderService = moduleFixture.get<OrderService>(OrderService);
    await app.listen();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create an order successfully", async () => {
    const result = await orderService.createOrder({
      userId: "user_123",
      items: [
        { productId: "prod_1", quantity: 1 },
        { productId: "prod_2", quantity: 1 },
      ],
      shippingAddress: "123 Rue de Paris",
    });

    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order.total).toBe(99.99);
    expect(result.order.status).toBe("PENDING");
  });

  it("should handle stock unavailability", async () => {
    // Override le mock pour retourner stock indisponible
    jest.spyOn(orderService["productClient"], "send")
      .mockReturnValueOnce(of({ success: false, unavailable: ["prod_1"] }));

    const result = await orderService.createOrder({
      userId: "user_123",
      items: [{ productId: "prod_1", quantity: 100 }],
      shippingAddress: "123 Rue de Paris",
    });

    expect(result.success).toBe(false);
  });
});
\`\`\`

## Conclusion et Leçons Apprises <a name="conclusion"></a>

### Les 10 Commandements des Microservices

1. **Un service = un domaine métier** — Pas de service "utils" fourre-tout
2. **Base de données par service** — Jamais de DB partagée entre services
3. **Communication asynchrone par défaut** — Sync uniquement quand nécessaire
4. **Idempotence partout** — Chaque message peut être reçu plusieurs fois
5. **Circuit breaker obligatoire** — Ne jamais appeler un service sans protection
6. **Observabilité dès le jour 1** — Logs structurés, metrics, distributed tracing
7. **Tests d'intégration** — Tester les contrats entre services
8. **Déploiement indépendant** — Chaque service a son CI/CD
9. **Documentation des API** — Swagger/OpenAPI pour chaque service
10. **Commencer monolithe** — Migrer vers les microservices quand c'est justifié

### Quand NE PAS utiliser les microservices

- Équipe < 5 développeurs
- MVP ou prototype
- Domaine simple et bien compris
- Pas de besoin de scaling indépendant
- Pas d'expertise DevOps dans l'équipe

> **Le meilleur microservice est celui que vous n'avez pas besoin de créer.** Commencez par un monolithe modulaire bien structuré, et extrayez des services quand la douleur l'impose.
`,
);

console.log("\\n═══ Blog 3 (Microservices NestJS) terminé ═══\\n");

// ═══════════════════════════════════════════════════════════════════════
// BLOG 4: Développement Full-Stack Moderne avec Next.js
// ═══════════════════════════════════════════════════════════════════════
w(
  "mastering-fullstack-nextjs.mdx",
  `
---
title: "Développement Full-Stack Moderne avec Next.js : Le Guide Ultime"
excerpt: "Construisez une application SaaS complète avec Next.js 15+, Server Components, Server Actions, Prisma, Tailwind CSS et le déploiement. Du setup initial au monitoring en production — tout ce qu'il faut savoir."
date: "2025-09-01"
author: "Fernand SOUALO"
categories: ["Next.js", "React", "Full-Stack", "TypeScript", "Web Development"]
coverImage: "/blog/fullstack-nextjs.webp"
---

# Développement Full-Stack Moderne avec Next.js : Le Guide Ultime

## Table of Contents

1. [Pourquoi Next.js ?](#pourquoi)
2. [Architecture du Projet SaaS](#architecture)
3. [Setup du Projet](#setup)
4. [App Router en Profondeur](#app-router)
5. [Server Components vs Client Components](#server-client)
6. [Server Actions — Le Nouveau Paradigme](#server-actions)
7. [Base de Données avec Prisma](#database)
8. [Authentification](#auth)
9. [Formulaires et Validation](#forms)
10. [API Routes et Route Handlers](#api)
11. [Gestion d'État](#state)
12. [Styling avec Tailwind CSS](#styling)
13. [Optimisation des Performances](#performance)
14. [SEO et Metadata](#seo)
15. [Middleware et Sécurité](#middleware)
16. [Testing](#testing)
17. [Déploiement et CI/CD](#deployment)
18. [Monitoring en Production](#monitoring)
19. [Conclusion](#conclusion)

## Pourquoi Next.js ? <a name="pourquoi"></a>

Next.js n'est pas juste un framework React — c'est un **framework full-stack** qui résout les problèmes que les développeurs rencontrent dans chaque projet :

| Problème | Solution Next.js |
|----------|-----------------|
| SEO avec React SPA | Server-Side Rendering + Static Generation |
| Performance initiale | Streaming, Suspense, Server Components |
| Routing | App Router basé sur le file system |
| Data fetching | Server Components + Server Actions |
| API backend | Route Handlers |
| Optimisation images | Composant Image avec optimisation automatique |
| Bundle size | Tree shaking, code splitting automatique |

### Ce qu'on va Construire

Un **SaaS de gestion de projets** ("TaskFlow") avec :
- Dashboard avec analytics temps réel
- Gestion de projets et tâches (CRUD complet)
- Authentification multi-provider
- Abonnements et quotas
- Paramètres utilisateur
- Dark/light mode

## Architecture du Projet <a name="architecture"></a>

\`\`\`
taskflow/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Routes d'authentification
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/         # Routes protégées
│   │   │   ├── layout.tsx       # Sidebar + Header
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx     # Liste des projets
│   │   │   │   ├── [id]/page.tsx # Détail projet
│   │   │   │   └── new/page.tsx # Créer un projet
│   │   │   ├── tasks/
│   │   │   │   └── [id]/page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/                  # Route Handlers
│   │   │   ├── webhooks/
│   │   │   └── cron/
│   │   ├── layout.tsx            # Root layout
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── dashboard/            # Dashboard-specific
│   │   ├── projects/             # Project-related
│   │   └── shared/               # Shared components
│   ├── lib/
│   │   ├── db.ts                 # Prisma client
│   │   ├── auth.ts               # Auth config
│   │   ├── validators.ts         # Zod schemas
│   │   └── utils.ts              # Utilities
│   ├── actions/                  # Server Actions
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   └── user.ts
│   ├── hooks/                    # Custom hooks
│   └── types/                    # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── next.config.ts
├── tailwind.config.ts
└── package.json
\`\`\`

## App Router en Profondeur <a name="app-router"></a>

### Fichiers Spéciaux

\`\`\`typescript
// app/layout.tsx — Layout racine (s'applique à toutes les pages)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TaskFlow — Project Management",
    template: "%s | TaskFlow",
  },
  description: "Modern project management for modern teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

// app/loading.tsx — Skeleton global
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

// app/error.tsx — Error boundary global
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

// app/not-found.tsx — Page 404
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
\`\`\`

### Route Groups et Layouts

\`\`\`typescript
// app/(dashboard)/layout.tsx — Layout avec sidebar
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
\`\`\`

## Server Components vs Client Components <a name="server-client"></a>

### Règle de Décision

\`\`\`typescript
// ── SERVER Component (par défaut) ──
// Utiliser quand : data fetching, accès DB/filesystem, secrets, pas d'interactivité
export default async function ProjectsPage() {
  // Accès direct à la base de données — pas d'API nécessaire !
  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projets</h1>
        <CreateProjectButton />  {/* Client Component */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

// ── CLIENT Component ──
// Utiliser quand : event handlers, hooks, browser APIs, interactivité
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/actions/projects";
import { toast } from "sonner";

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createProject(formData);
      if (result.success) {
        toast.success("Projet créé !");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nouveau projet
      </Button>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <form action={handleSubmit}>
              <Input name="name" placeholder="Nom du projet" required />
              <Textarea name="description" placeholder="Description" />
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création..." : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
\`\`\`

### Composition Server + Client

\`\`\`typescript
// La clé : Server Components peuvent CONTENIR des Client Components
// Mais PAS l'inverse

// ✅ BON — Server Component wrapping Client Component
export default async function Dashboard() {
  const stats = await getStats(); // Server-side
  const projects = await getProjects(); // Server-side

  return (
    <div>
      <StatsCards stats={stats} />           {/* Server (pas d'interactivité) */}
      <InteractiveChart data={stats} />       {/* Client (chart interactive) */}
      <ProjectList projects={projects} />     {/* Server */}
    </div>
  );
}

// ❌ MAUVAIS — Client Component importants un Server Component
"use client";
import { ServerComponent } from "./server-component"; // ⚠️ Sera converti en client !

// ✅ BON — Passer le Server Component comme children
"use client";
export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return isOpen ? <div>{children}</div> : null;
}

// Dans un Server Component parent :
<ClientWrapper>
  <ServerDataComponent /> {/* Reste un Server Component ! */}
</ClientWrapper>
\`\`\`

## Server Actions — Le Nouveau Paradigme <a name="server-actions"></a>

Les Server Actions remplacent les API routes pour les mutations :

\`\`\`typescript
// src/actions/projects.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Schéma de validation Zod
const createProjectSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function createProject(formData: FormData) {
  // 1. Authentification
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non authentifié" };
  }

  // 2. Validation
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Vérification des quotas
  const projectCount = await db.project.count({
    where: { userId: session.user.id },
  });

  const maxProjects = session.user.plan === "PRO" ? 50 : 5;
  if (projectCount >= maxProjects) {
    return {
      success: false,
      error: \`Limite de \${maxProjects} projets atteinte. Passez au plan Pro.\`,
    };
  }

  // 4. Création
  try {
    const project = await db.project.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    // 5. Revalidation du cache
    revalidatePath("/projects");

    return { success: true, project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Erreur lors de la création du projet" };
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  // Vérifier la propriété
  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    return { success: false, error: "Projet non trouvé" };
  }

  const data = createProjectSchema.partial().parse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
  });

  await db.project.update({
    where: { id: projectId },
    data,
  });

  revalidatePath(\`/projects/\${projectId}\`);
  revalidatePath("/projects");

  return { success: true };
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  await db.project.delete({
    where: { id: projectId, userId: session.user.id },
  });

  revalidatePath("/projects");
  return { success: true };
}
\`\`\`

### Server Actions avec useActionState (React 19)

\`\`\`typescript
"use client";

import { useActionState } from "react";
import { createProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_prevState, formData) => {
      return await createProject(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom du projet</Label>
        <Input
          id="name"
          name="name"
          required
          className={state?.fieldErrors?.name ? "border-red-500" : ""}
        />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-red-500 mt-1">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>

      {state?.error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Création en cours...
          </>
        ) : (
          "Créer le projet"
        )}
      </Button>
    </form>
  );
}
\`\`\`

## Base de Données avec Prisma <a name="database"></a>

\`\`\`prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  plan      Plan     @default(FREE)
  
  projects  Project[]
  sessions  Session[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#6366F1")
  archived    Boolean  @default(false)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  tasks       Task[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  position    Int        @default(0)
  
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  assigneeId  String?
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([projectId])
  @@index([status])
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
\`\`\`

\`\`\`typescript
// src/lib/db.ts — Singleton Prisma (Next.js compatible)
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
\`\`\`

## Optimisation des Performances <a name="performance"></a>

\`\`\`typescript
// ── Streaming avec Suspense ──
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Les stats se chargent immédiatement */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>
      
      {/* Les projets récents streament après */}
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <RecentProjects />
      </Suspense>
      
      {/* L'activité récente stream en dernier */}
      <Suspense fallback={<ActivityFeedSkeleton />}>
        <ActivityFeed />
      </Suspense>
    </div>
  );
}

// Chaque composant fait son propre data fetching
async function StatsCards() {
  const stats = await db.project.aggregate({
    where: { userId: session.user.id },
    _count: true,
  });
  // ... render
}

// ── Parallel Data Fetching ──
async function DashboardContent() {
  // Ces requêtes s'exécutent EN PARALLÈLE, pas séquentiellement !
  const [projects, tasks, activity] = await Promise.all([
    db.project.findMany({ where: { userId: session.user.id }, take: 6 }),
    db.task.findMany({ where: { assigneeId: session.user.id, status: "TODO" } }),
    db.activity.findMany({ where: { userId: session.user.id }, take: 10 }),
  ]);

  return <Dashboard projects={projects} tasks={tasks} activity={activity} />;
}

// ── Dynamic Imports pour le Code Splitting ──
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // N'exécuter que côté client
});

// ── Image Optimization ──
import Image from "next/image";

export function ProjectAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      width={40}
      height={40}
      className="rounded-full"
      placeholder="blur"
      blurDataURL="data:image/png;base64,..."
    />
  );
}
\`\`\`

## SEO et Metadata <a name="seo"></a>

\`\`\`typescript
// app/(dashboard)/projects/[id]/page.tsx
import type { Metadata } from "next";

// Metadata dynamique basée sur les données
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.name,
    description: project.description ?? \`Manage \${project.name} on TaskFlow\`,
    openGraph: {
      title: \`\${project.name} — TaskFlow\`,
      description: project.description ?? "Project management made simple",
      type: "website",
    },
  };
}
\`\`\`

## Middleware et Sécurité <a name="middleware"></a>

\`\`\`typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/projects", "/settings", "/tasks"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session-token")?.value;

  // Rediriger les utilisateurs non authentifiés
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rediriger les utilisateurs authentifiés loin des pages auth
  if (authPaths.some(path => pathname.startsWith(path))) {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/projects", request.url));
    }
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
\`\`\`

## Testing <a name="testing"></a>

\`\`\`typescript
// __tests__/actions/projects.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProject, deleteProject } from "@/actions/projects";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  db: {
    project: {
      create: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("createProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).mockResolvedValue({
      user: { id: "user_1", plan: "FREE" },
    });
  });

  it("creates a project successfully", async () => {
    (db.project.count as any).mockResolvedValue(0);
    (db.project.create as any).mockResolvedValue({
      id: "proj_1",
      name: "Test Project",
    });

    const formData = new FormData();
    formData.set("name", "Test Project");

    const result = await createProject(formData);
    expect(result.success).toBe(true);
    expect(result.project?.name).toBe("Test Project");
  });

  it("rejects when quota exceeded", async () => {
    (db.project.count as any).mockResolvedValue(5); // Free plan limit

    const formData = new FormData();
    formData.set("name", "Over Limit");

    const result = await createProject(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Limite");
  });

  it("validates input data", async () => {
    const formData = new FormData();
    formData.set("name", ""); // Empty name

    const result = await createProject(formData);
    expect(result.success).toBe(false);
    expect(result.fieldErrors?.name).toBeDefined();
  });
});
\`\`\`

## Conclusion <a name="conclusion"></a>

Next.js est devenu **le framework full-stack de référence** pour le développement web moderne. En combinant React Server Components, Server Actions, et les optimisations automatiques, il permet de construire des applications performantes avec une expérience développeur exceptionnelle.

### Checklist du Développeur Next.js

- [ ] **Architecture** : App Router avec Route Groups
- [ ] **Data Fetching** : Server Components par défaut, Client uniquement pour l'interactivité
- [ ] **Mutations** : Server Actions avec validation Zod
- [ ] **Base de données** : Prisma avec singleton pattern
- [ ] **Auth** : Middleware + session checks dans les layouts
- [ ] **Performance** : Suspense, streaming, parallel data fetching
- [ ] **SEO** : Metadata API dynamique + sitemap + robots.txt
- [ ] **Sécurité** : Middleware, CSRF, rate limiting, input validation
- [ ] **Tests** : Vitest pour unit/integration, Playwright pour e2e
- [ ] **Monitoring** : Error tracking, analytics, performance metrics

> **Conseil final** : Next.js évolue rapidement. Suivez les [release notes officielles](https://nextjs.org/blog) et la [documentation](https://nextjs.org/docs) pour rester à jour sur les meilleures pratiques.
`,
);

console.log("\\n═══ Blog 4 (Full-Stack Next.js) terminé ═══\\n");
console.log("✅ 4 blogs créés avec succès !");

// ═══════════════════════════════════════════════════════════════════════
// BLOG 5: Maîtriser Vim/Neovim de Zéro à Expert
// ═══════════════════════════════════════════════════════════════════════
w("mastering-vim-neovim-complete-guide.mdx", `
---
title: "Maîtriser Vim/Neovim : De Zéro à Expert — Le Guide Ultime"
excerpt: "Transformez votre productivité avec Vim/Neovim. Modes, mouvements, text objects, macros, configuration moderne avec Lua, LSP, TreeSitter, plugins essentiels et workflow pratique. Le guide complet pour passer de débutant à expert."
date: "2025-10-05"
author: "Fernand SOUALO"
categories: ["Vim", "Neovim", "Productivité", "Éditeur", "DevTools", "Terminal"]
coverImage: "/blog/vim-neovim-mastery.webp"
---

# Maîtriser Vim/Neovim : De Zéro à Expert — Le Guide Ultime

## Table of Contents

1. [Pourquoi Vim/Neovim ?](#pourquoi)
2. [Installation et Première Configuration](#installation)
3. [Les Modes — Le Cœur de Vim](#modes)
4. [Mouvements Fondamentaux](#mouvements)
5. [Opérateurs et Text Objects — La Grammaire de Vim](#operateurs)
6. [Recherche et Navigation](#recherche)
7. [Buffers, Windows et Tabs](#buffers)
8. [Mode Visuel — Sélection Multiple](#visual)
9. [Registres et Presse-Papiers](#registres)
10. [Macros — Automatisation Puissante](#macros)
11. [Configuration .vimrc / init.lua](#configuration)
12. [Neovim Moderne : Lua, LSP, TreeSitter](#neovim-moderne)
13. [Plugins Essentiels](#plugins)
14. [Workflow Pratique en Développement](#workflow)
15. [Astuces Avancées](#astuces)
16. [Raccourcis Personnalisés](#raccourcis)
17. [Debugging dans Vim](#debugging)
18. [Conclusion et Ressources](#conclusion)

## Pourquoi Vim/Neovim ? <a name="pourquoi"></a>

Vim n'est pas juste un éditeur de texte — c'est un **langage pour manipuler du texte**. Une fois maîtrisé, vous éditez du code à la vitesse de la pensée.

### Les Avantages

| Avantage | Explication |
|----------|-------------|
| **Vitesse** | Édition sans souris, tout au clavier |
| **Ubiquité** | Disponible sur tous les systèmes Unix, SSH-friendly |
| **Légèreté** | Démarre instantanément, consomme peu de ressources |
| **Composabilité** | Opérateurs + mouvements = grammaire de l'édition |
| **Extensibilité** | Écosystème de plugins massif |
| **Productivité** | Macros, répétitions, text objects — automatisation totale |

### Vim vs Neovim

\`\`\`
┌──────────────────────────────────────────────────────────┐
│                    Vim vs Neovim                          │
├──────────────────────────────────────────────────────────┤
│ Vim                  │ Neovim                            │
├──────────────────────┼───────────────────────────────────┤
│ Vimscript            │ Lua + Vimscript                   │
│ Single-threaded      │ Async jobs natifs                 │
│ Pas de LSP intégré   │ LSP intégré (nvim-lspconfig)      │
│ Syntax highlighting  │ TreeSitter (AST-based)            │
│ Terminal rudimentaire│ Terminal moderne avec :terminal   │
│ API plugins complexe │ API Lua moderne et rapide         │
└──────────────────────┴───────────────────────────────────┘
\`\`\`

> **Recommandation** : Commencez avec Neovim. Il conserve 100% de compatibilité Vim tout en offrant des fonctionnalités modernes.

## Installation et Première Configuration <a name="installation"></a>

\`\`\`bash
# ── Installation Neovim ──
# macOS
brew install neovim

# Ubuntu/Debian
sudo apt install neovim

# Arch Linux
sudo pacman -S neovim

# Windows (avec Chocolatey)
choco install neovim

# Vérifier l'installation
nvim --version
# NVIM v0.10.0+

# ── Créer la structure de config ──
# Neovim cherche la config dans ~/.config/nvim/
mkdir -p ~/.config/nvim
touch ~/.config/nvim/init.lua

# ── Configuration minimale pour démarrer ──
cat > ~/.config/nvim/init.lua << 'EOF'
-- Configuration Neovim basique

-- Options générales
vim.opt.number = true              -- Numéros de ligne
vim.opt.relativenumber = true      -- Numéros relatifs
vim.opt.mouse = 'a'                -- Souris activée
vim.opt.ignorecase = true          -- Recherche insensible à la casse
vim.opt.smartcase = true           -- Sauf si majuscule dans la recherche
vim.opt.hlsearch = false           -- Pas de highlight permanent de recherche
vim.opt.wrap = false               -- Pas de retour à la ligne automatique
vim.opt.breakindent = true         -- Indent sur les lignes wrappées
vim.opt.tabstop = 2                -- Tab = 2 espaces
vim.opt.shiftwidth = 2             -- Indent = 2 espaces
vim.opt.expandtab = true           -- Tab → espaces
vim.opt.termguicolors = true       -- Support 24-bit colors

-- Leader key (espace)
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

-- Raccourcis basiques
vim.keymap.set('n', '<leader>w', ':w<CR>', { desc = 'Save file' })
vim.keymap.set('n', '<leader>q', ':q<CR>', { desc = 'Quit' })
vim.keymap.set('n', '<leader>e', ':Ex<CR>', { desc = 'File explorer' })

print("Neovim configuré !")
EOF

# Lancer Neovim
nvim
\`\`\`

## Les Modes — Le Cœur de Vim <a name="modes"></a>

Vim a **plusieurs modes** pour différentes tâches :

\`\`\`
┌────────────────────────────────────────────────────────────┐
│                      LES 6 MODES PRINCIPAUX                 │
├────────────────────────────────────────────────────────────┤
│ Mode          │ Déclencheur │ Usage                        │
├───────────────┼─────────────┼──────────────────────────────┤
│ NORMAL        │ <Esc>       │ Navigation, commandes        │
│ INSERT        │ i a o I A O │ Insertion de texte           │
│ VISUAL        │ v V Ctrl-v  │ Sélection de texte           │
│ COMMAND       │ :           │ Commandes ex (:w, :q, etc.)  │
│ REPLACE       │ R           │ Remplacer caractère par car. │
│ TERMINAL      │ :terminal   │ Terminal intégré (Neovim)    │
└───────────────┴─────────────┴──────────────────────────────┘
\`\`\`

### Mode Normal — Le Mode par Défaut

Le mode Normal est le **mode de repos**. Vous n'y écrivez pas, vous **commandez** l'éditeur.

\`\`\`vim
" Toujours revenir en Normal avec <Esc> ou <Ctrl-[>
<Esc>        " Retour en mode Normal
<Ctrl-[>     " Alternative à Esc (plus ergonomique)

" Mouvement basique
h  " ← gauche
j  " ↓ bas
k  " ↑ haut
l  " → droite

" Astuce : jamais de flèches directionnelles ! Force-toi à utiliser hjkl
\`\`\`

### Mode Insert — Écriture de Texte

Plusieurs façons d'entrer en mode Insert :

\`\`\`vim
i   " Insert avant le curseur
a   " Insert après le curseur (append)
o   " Insert nouvelle ligne en dessous
I   " Insert au début de la ligne
A   " Insert à la fin de la ligne
O   " Insert nouvelle ligne au-dessus

" Exemple pratique :
" Curseur sur le "d" de "hello world"
" Taper 'A' → curseur à la fin "hello world|" (en insert)
" Taper '!' → "hello world!"
" <Esc> → retour en Normal
\`\`\`

### Mode Visual — Sélection de Texte

\`\`\`vim
v        " Visual mode (caractère par caractère)
V        " Visual Line mode (ligne entière)
Ctrl-v   " Visual Block mode (colonne rectangulaire)

" Exemple :
" 1. Taper 'v' → mode Visual
" 2. Taper 'jjj' → sélectionne 3 lignes vers le bas
" 3. Taper 'd' → supprime la sélection
\`\`\`

## Mouvements Fondamentaux <a name="mouvements"></a>

La puissance de Vim vient de ses mouvements combinables.

### Mouvements par Mot

\`\`\`vim
w   " Next word (début du mot suivant)
b   " Previous word (début du mot précédent)
e   " End of word (fin du mot courant)
W   " Next WORD (ignore ponctuation)
B   " Previous WORD
E   " End of WORD

" Exemple sur "hello-world test" (curseur sur 'h'):
w   → curseur sur '-'
W   → curseur sur 't' (ignore le '-')
e   → curseur sur 'o' (fin de "hello")
\`\`\`

### Mouvements par Ligne

\`\`\`vim
0   " Début de ligne (colonne 0)
^   " Premier caractère non-blanc de la ligne
$   " Fin de ligne
g_  " Dernier caractère non-blanc

" Exemple :
"   hello world   "  (espaces avant/après)
0  → curseur sur premier espace
^  → curseur sur 'h'
$  → curseur après "world"
g_ → curseur sur 'd'
\`\`\`

### Mouvements par Écran

\`\`\`vim
H   " High — haut de l'écran
M   " Middle — milieu de l'écran
L   " Low — bas de l'écran

gg  " Début du fichier
G   " Fin du fichier
50G " Aller à la ligne 50
:50 " Alternative (commande)

Ctrl-u  " Scroll up (half page)
Ctrl-d  " Scroll down (half page)
Ctrl-b  " Page up
Ctrl-f  " Page down

zz      " Centrer la ligne courante à l'écran
zt      " Ligne courante en haut (top)
zb      " Ligne courante en bas (bottom)
\`\`\`

### Mouvements par Recherche

\`\`\`vim
f{char}   " Find — saute au prochain {char} sur la ligne
F{char}   " Find backward
t{char}   " Until — saute juste avant le prochain {char}
T{char}   " Until backward
;         " Répète le dernier f/F/t/T
,         " Répète le dernier f/F/t/T en sens inverse

" Exemple sur "const name = value;"
" Curseur sur 'c'
f=  → curseur sur '='
fa  → curseur sur 'a' de "name"
t;  → curseur sur 'e' (juste avant ';')
\`\`\`

### Mouvements par Paragraphe/Fonction

\`\`\`vim
{   " Paragraph backward (bloc vide précédent)
}   " Paragraph forward (bloc vide suivant)
[[  " Section backward (fonction précédente en C)
]]  " Section forward (fonction suivante)
\`\`\`

## Opérateurs et Text Objects — La Grammaire de Vim <a name="operateurs"></a>

La vraie puissance de Vim : **Opérateur + Mouvement = Action**

### Les Opérateurs Clés

\`\`\`vim
d   " Delete (coupe)
c   " Change (supprime et passe en Insert)
y   " Yank (copie)
v   " Visual select
>   " Indent right
<   " Indent left
=   " Auto-indent
gu  " Lowercase
gU  " Uppercase
\`\`\`

### La Grammaire de Vim

\`\`\`
[count] [operator] [motion]

Exemples :
d2w     → Delete 2 words
c$      → Change jusqu'à la fin de ligne
y5j     → Yank 5 lines down
>3j     → Indent 3 lines down
=ap     → Auto-indent a paragraph
gUiw    → Uppercase inner word
\`\`\`

### Text Objects — Le Superpouvoir

Les text objects permettent de cibler des unités sémantiques :

\`\`\`vim
iw  " Inner word (mot sans espaces)
aw  " A word (mot avec espaces)
is  " Inner sentence
as  " A sentence
ip  " Inner paragraph
ap  " A paragraph

i"  " Inner " quotes
a"  " A " quotes (inclut les guillemets)
i'  " Inner ' quotes
a'  " A ' quotes
i(  " Inner parentheses
a(  " A parentheses (inclut les parenthèses)
i{  " Inner braces
a{  " A braces
i[  " Inner brackets
a[  " A brackets
it  " Inner tag (HTML/XML)
at  " A tag

" Exemples concrets :
" Curseur n'importe où dans "hello"
ciw → supprime "hello" et passe en Insert (change inner word)
daw → supprime "hello" et l'espace après (delete a word)

" Curseur dans "const name = 'John Doe';"
ci' → supprime "John Doe" et passe en Insert
da' → supprime 'John Doe' (avec les quotes)

" Curseur dans une fonction JavaScript :
" function test() { return 42; }
di{ → supprime le contenu de la fonction (inner braces)
da{ → supprime tout {return 42;} y compris les accolades
\`\`\`

### Combinaisons Puissantes

\`\`\`vim
" Changer un mot en majuscules
gUiw  (curseur sur le mot)

" Supprimer tout jusqu'au prochain ;
dt;

" Copier une fonction JSON complète
ya}   (curseur dans l'objet)

" Supprimer le contenu des parenthèses
di(

" Changer le contenu des guillemets doubles
ci"

" Indenter un bloc if entier
>a{   (curseur dans le if)

" Dupliquer une ligne
Yp    (Y = yank line, p = paste below)
yyp   (alternative)
\`\`\`

## Recherche et Navigation <a name="recherche"></a>

\`\`\`vim
/pattern      " Rechercher en avant
?pattern      " Rechercher en arrière
n             " Prochaine occurrence
N             " Occurrence précédente
*             " Rechercher le mot sous le curseur (forward)
#             " Rechercher le mot sous le curseur (backward)

" Options de recherche
:set ignorecase     " Insensible à la casse
:set smartcase      " Sensible si majuscule dans le pattern
:set hlsearch       " Highlight les résultats
:set incsearch      " Recherche incrémentale (montre au fur et à mesure)
:noh                " Clear highlight temporairement

" Recherche et remplacement
:s/old/new/         " Replace first occurrence sur la ligne
:s/old/new/g        " Replace all sur la ligne
:%s/old/new/g       " Replace all dans tout le fichier
:%s/old/new/gc      " Replace all avec confirmation
:'<,'>s/old/new/g   " Replace dans la sélection visuelle

" Regex avancées
:%s/\\v(\\w+)\\s(\\w+)/\\2 \\1/g   " Inverser deux mots (very magic mode)
\`\`\`

## Buffers, Windows et Tabs <a name="buffers"></a>

\`\`\`vim
" ── BUFFERS (fichiers ouverts en mémoire) ──
:ls              " List buffers
:b2              " Switch to buffer 2
:bn              " Next buffer
:bp              " Previous buffer
:bd              " Delete (close) current buffer
:b <Tab>         " Autocomplete buffer name
Ctrl-^           " Switch to alternate buffer (dernier buffer visité)

" ── WINDOWS (splits) ──
:split file      " Horizontal split
:vsplit file     " Vertical split
Ctrl-w s         " Split horizontal
Ctrl-w v         " Split vertical
Ctrl-w q         " Quit window
Ctrl-w w         " Next window
Ctrl-w h/j/k/l   " Navigate windows (gauche/bas/haut/droite)
Ctrl-w H/J/K/L   " Move window (changer disposition)
Ctrl-w =         " Make windows equal size
Ctrl-w |         " Maximize width
Ctrl-w _         " Maximize height

" ── TABS (collections de windows) ──
:tabnew file     " New tab
:tabn            " Next tab
:tabp            " Previous tab
:tabc            " Close tab
:tabo            " Close all other tabs
gt               " Next tab (normal mode)
gT               " Previous tab
3gt              " Go to tab 3
\`\`\`

## Mode Visuel — Sélection Multiple <a name="visual"></a>

\`\`\`vim
" ── Visual mode ──
v     " Character-wise
V     " Line-wise
Ctrl-v " Block-wise (colonnes)

" Une fois en visual :
o     " Move to other end of selection
O     " Move to other corner (block mode)

" ── Visual Block = Édition multi-ligne ──
" Exemple : commenter plusieurs lignes en // en JS/TS
1. Ctrl-v           " Visual block
2. jjjj             " Sélectionner 4 lignes
3. I                " Insert at beginning of block
4. //               " Taper //
5. <Esc>            " Applique sur toutes les lignes !

" Exemple : ajouter ; à la fin de plusieurs lignes
1. Ctrl-v
2. jjjj             " 4 lignes
3. $                " Aller à la fin de chaque ligne
4. A                " Append après le block
5. ;                " Taper ;
6. <Esc>            " Applique partout !
\`\`\`

## Registres et Presse-Papiers <a name="registres"></a>

Vim a **plusieurs presse-papiers** appelés registres :

\`\`\`vim
" ── Registres nommés ──
"a    " Registre 'a' (a-z disponibles)
"A    " Append au registre 'a'

" Usage :
"ayiw  " Yank inner word dans registre 'a'
"ap    " Paste depuis registre 'a'
"Ayy   " Append current line au registre 'a'

" ── Registres spéciaux ──
""    " Default register (dernier yank/delete)
"0    " Dernier yank (pas delete)
"1-9  " Historique des deletes
"+    " System clipboard (Ctrl-C/Ctrl-V)
"*    " Selection clipboard (Linux middle-click)
"%    " Nom du fichier courant
":    " Dernière commande
"/    " Dernier pattern de recherche

" ── Copier vers le clipboard système ──
"+yy  " Yank line to system clipboard
"+p   " Paste from system clipboard

" Configuration pour utiliser system clipboard par défaut :
" Dans init.lua :
vim.opt.clipboard = "unnamedplus"  -- Tous les yank/delete vont dans '+'

" ── Voir les registres ──
:registers      " List all registers
:reg a b c      " Show specific registers
\`\`\`

## Macros — Automatisation Puissante <a name="macros"></a>

Les macros enregistrent une séquence de commandes et la rejouent :

\`\`\`vim
" ── Enregistrer une macro ──
q{register}     " Démarre l'enregistrement dans le registre (a-z)
... commands ...
q               " Arrête l'enregistrement

" ── Jouer une macro ──
@{register}     " Joue la macro du registre
@@              " Rejoue la dernière macro
10@a            " Joue la macro 'a' 10 fois

" ── Exemple pratique : Transformer une liste ──
" Avant :
" apple
" banana
" cherry

" Objectif :
" { name: 'apple' },
" { name: 'banana' },
" { name: 'cherry' },

" Macro :
qa              " Start recording in register 'a'
I{ name: '<Esc> " Insert at beginning
A' },<Esc>      " Append at end
j0              " Down to next line, beginning
q               " Stop recording

" Exécuter :
2@a             " Apply to next 2 lines

" ── Éditer une macro ──
" Les macros sont stockées dans les registres !
:let @a='...'   " Set register 'a' directly
:put a          " Paste register 'a' content for editing
# Edit the line
"ayy             " Yank back into register 'a'
\`\`\`

## Configuration .vimrc / init.lua <a name="configuration"></a>

### Structure Recommandée

\`\`\`
~/.config/nvim/
├── init.lua              # Point d'entrée
├── lua/
│   ├── options.lua       # Options Neovim
│   ├── keymaps.lua       # Raccourcis clavier
│   ├── plugins.lua       # Gestion des plugins
│   └── lsp.lua           # Configuration LSP
└── after/
    └── plugin/           # Config post-plugins
\`\`\`

### init.lua de Base

\`\`\`lua
-- ~/.config/nvim/init.lua
require('options')
require('keymaps')
require('plugins')
require('lsp')
\`\`\`

### options.lua — Options Essentielles

\`\`\`lua
-- ~/.config/nvim/lua/options.lua
local opt = vim.opt

-- ── Apparence ──
opt.number = true                -- Line numbers
opt.relativenumber = true        -- Relative line numbers
opt.termguicolors = true         -- 24-bit colors
opt.signcolumn = 'yes'           -- Always show sign column (LSP diagnostics)
opt.cursorline = true            -- Highlight current line
opt.showmode = false             -- Don't show mode (statusline shows it)

-- ── Indentation ──
opt.tabstop = 2
opt.shiftwidth = 2
opt.expandtab = true
opt.smartindent = true

-- ── Recherche ──
opt.ignorecase = true
opt.smartcase = true
opt.hlsearch = false             -- No persistent highlight
opt.incsearch = true

-- ── Editing ──
opt.wrap = false                 -- No line wrap
opt.scrolloff = 8                -- Keep 8 lines visible above/below cursor
opt.sidescrolloff = 8
opt.updatetime = 250             -- Faster completion (default 4000ms)
opt.timeoutlen = 300             -- Faster key sequence timeout

-- ── Files ──
opt.swapfile = false             -- No swap files
opt.backup = false
opt.undofile = true              -- Persistent undo
opt.undodir = os.getenv("HOME") .. "/.vim/undodir"

-- ── Splits ──
opt.splitright = true            -- Vertical splits to the right
opt.splitbelow = true            -- Horizontal splits below

-- ── Clipboard ──
opt.clipboard = "unnamedplus"    -- Use system clipboard

-- ── Mouse ──
opt.mouse = 'a'                  -- Enable mouse in all modes

-- ── Completion ──
opt.completeopt = { 'menu', 'menuone', 'noselect' }
\`\`\`

### keymaps.lua — Raccourcis Clavier

\`\`\`lua
-- ~/.config/nvim/lua/keymaps.lua
local keymap = vim.keymap.set
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

-- ── General ──
keymap('n', '<leader>w', ':w<CR>', { desc = 'Save' })
keymap('n', '<leader>q', ':q<CR>', { desc = 'Quit' })
keymap('n', '<leader>x', ':x<CR>', { desc = 'Save and quit' })

-- Clear search highlight on pressing <Esc> in normal mode
keymap('n', '<Esc>', ':noh<CR><Esc>', { silent = true })

-- ── Better window navigation ──
keymap('n', '<C-h>', '<C-w>h', { desc = 'Go to left window' })
keymap('n', '<C-j>', '<C-w>j', { desc = 'Go to lower window' })
keymap('n', '<C-k>', '<C-w>k', { desc = 'Go to upper window' })
keymap('n', '<C-l>', '<C-w>l', { desc = 'Go to right window' })

-- ── Resize windows ──
keymap('n', '<C-Up>', ':resize +2<CR>', { silent = true })
keymap('n', '<C-Down>', ':resize -2<CR>', { silent = true })
keymap('n', '<C-Left>', ':vertical resize -2<CR>', { silent = true })
keymap('n', '<C-Right>', ':vertical resize +2<CR>', { silent = true })

-- ── Buffer navigation ──
keymap('n', '<S-l>', ':bnext<CR>', { desc = 'Next buffer' })
keymap('n', '<S-h>', ':bprevious<CR>', { desc = 'Previous buffer' })
keymap('n', '<leader>bd', ':bd<CR>', { desc = 'Delete buffer' })

-- ── Better indenting (Visual mode) ──
keymap('v', '<', '<gv', { desc = 'Indent left and reselect' })
keymap('v', '>', '>gv', { desc = 'Indent right and reselect' })

-- ── Move lines ──
keymap('n', '<A-j>', ':m .+1<CR>==', { desc = 'Move line down' })
keymap('n', '<A-k>', ':m .-2<CR>==', { desc = 'Move line up' })
keymap('v', '<A-j>', ":m '>+1<CR>gv=gv", { desc = 'Move selection down' })
keymap('v', '<A-k>', ":m '<-2<CR>gv=gv", { desc = 'Move selection up' })

-- ── Stay in indent mode ──
keymap('v', '<', '<gv')
keymap('v', '>', '>gv')

-- ── Paste without yanking in visual mode ──
keymap('x', 'p', '"_dP')

-- ── Quick semicolon at end of line ──
keymap('n', '<leader>;', 'A;<Esc>', { desc = 'Add semicolon at end' })

-- ── Better escape in terminal mode ──
keymap('t', '<Esc>', '<C-\\\\><C-n>', { desc = 'Exit terminal mode' })
\`\`\`

## Neovim Moderne : Lua, LSP, TreeSitter <a name="neovim-moderne"></a>

### Plugin Manager : lazy.nvim

\`\`\`lua
-- ~/.config/nvim/lua/plugins.lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup({
  -- ── Theme ──
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    config = function()
      vim.cmd[[colorscheme tokyonight]]
    end,
  },

  -- ── TreeSitter (AST-based highlighting) ──
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function()
      require("nvim-treesitter.configs").setup({
        ensure_installed = {
          "lua", "vim", "typescript", "javascript", "tsx",
          "python", "rust", "go", "json", "yaml", "markdown"
        },
        highlight = { enable = true },
        indent = { enable = true },
      })
    end,
  },

  -- ── LSP Configuration ──
  {
    "neovim/nvim-lspconfig",
    dependencies = {
      "williamboman/mason.nvim",
      "williamboman/mason-lspconfig.nvim",
      "hrsh7th/cmp-nvim-lsp",
    },
  },

  -- ── Autocompletion ──
  {
    "hrsh7th/nvim-cmp",
    dependencies = {
      "hrsh7th/cmp-buffer",
      "hrsh7th/cmp-path",
      "L3MON4D3/LuaSnip",
      "saadparwaiz1/cmp_luasnip",
    },
    config = function()
      local cmp = require('cmp')
      cmp.setup({
        snippet = {
          expand = function(args)
            require('luasnip').lsp_expand(args.body)
          end,
        },
        mapping = cmp.mapping.preset.insert({
          ['<C-b>'] = cmp.mapping.scroll_docs(-4),
          ['<C-f>'] = cmp.mapping.scroll_docs(4),
          ['<C-Space>'] = cmp.mapping.complete(),
          ['<C-e>'] = cmp.mapping.abort(),
          ['<CR>'] = cmp.mapping.confirm({ select = true }),
        }),
        sources = cmp.config.sources({
          { name = 'nvim_lsp' },
          { name = 'luasnip' },
        }, {
          { name = 'buffer' },
        })
      })
    end,
  },

  -- ── File Explorer ──
  {
    "nvim-tree/nvim-tree.lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("nvim-tree").setup()
      vim.keymap.set('n', '<leader>e', ':NvimTreeToggle<CR>')
    end,
  },

  -- ── Fuzzy Finder ──
  {
    "nvim-telescope/telescope.nvim",
    tag = '0.1.5',
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local builtin = require('telescope.builtin')
      vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = 'Find files' })
      vim.keymap.set('n', '<leader>fg', builtin.live_grep, { desc = 'Live grep' })
      vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = 'Find buffers' })
      vim.keymap.set('n', '<leader>fh', builtin.help_tags, { desc = 'Help tags' })
    end,
  },

  -- ── Git Integration ──
  {
    "lewis6991/gitsigns.nvim",
    config = function()
      require('gitsigns').setup()
    end,
  },

  -- ── Status Line ──
  {
    "nvim-lualine/lualine.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require('lualine').setup({
        options = { theme = 'tokyonight' }
      })
    end,
  },

  -- ── Which Key (Découvre les raccourcis) ──
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    init = function()
      vim.o.timeout = true
      vim.o.timeoutlen = 300
    end,
    config = function()
      require("which-key").setup()
    end,
  },
})
\`\`\`

### LSP Configuration

\`\`\`lua
-- ~/.config/nvim/lua/lsp.lua
local lspconfig = require('lspconfig')
local mason = require('mason')
local mason_lspconfig = require('mason-lspconfig')

-- Setup Mason
mason.setup()
mason_lspconfig.setup({
  ensure_installed = {
    "ts_ls",       -- TypeScript
    "lua_ls",      -- Lua
    "pyright",     -- Python
    "rust_analyzer", -- Rust
    "gopls",       -- Go
  },
})

-- Keymaps after LSP attaches
local on_attach = function(client, bufnr)
  local opts = { buffer = bufnr }
  vim.keymap.set('n', 'gd', vim.lsp.buf.definition, opts)
  vim.keymap.set('n', 'gD', vim.lsp.buf.declaration, opts)
  vim.keymap.set('n', 'gr', vim.lsp.buf.references, opts)
  vim.keymap.set('n', 'gi', vim.lsp.buf.implementation, opts)
  vim.keymap.set('n', 'K', vim.lsp.buf.hover, opts)
  vim.keymap.set('n', '<C-k>', vim.lsp.buf.signature_help, opts)
  vim.keymap.set('n', '<leader>rn', vim.lsp.buf.rename, opts)
  vim.keymap.set('n', '<leader>ca', vim.lsp.buf.code_action, opts)
  vim.keymap.set('n', '<leader>f', function()
    vim.lsp.buf.format({ async = true })
  end, opts)
  vim.keymap.set('n', '[d', vim.diagnostic.goto_prev, opts)
  vim.keymap.set('n', ']d', vim.diagnostic.goto_next, opts)
end

-- Capabilities for nvim-cmp
local capabilities = require('cmp_nvim_lsp').default_capabilities()

-- Setup language servers
mason_lspconfig.setup_handlers({
  function(server_name)
    lspconfig[server_name].setup({
      on_attach = on_attach,
      capabilities = capabilities,
    })
  end,
  
  -- Lua specific config
  ["lua_ls"] = function()
    lspconfig.lua_ls.setup({
      on_attach = on_attach,
      capabilities = capabilities,
      settings = {
        Lua = {
          diagnostics = {
            globals = { 'vim' }
          }
        }
      }
    })
  end,
})
\`\`\`

## Workflow Pratique en Développement <a name="workflow"></a>

### Workflow Quotidien

\`\`\`bash
# 1. Ouvrir un projet
nvim .

# 2. Naviguer dans les fichiers
<leader>ff    # Fuzzy find files (Telescope)
<leader>fg    # Grep dans tous les fichiers
<leader>fb    # Liste des buffers ouverts
<leader>e     # Toggle file explorer

# 3. Éditer du code
gd            # Go to definition (LSP)
gr            # Find references
K             # Hover documentation
<leader>ca    # Code actions
<leader>rn    # Rename symbol
<leader>f     # Format file

# 4. Multi-fichiers
:vs path/to/file  # Split vertical
Ctrl-w v          # Split vertical vide
Ctrl-w s          # Split horizontal
Ctrl-h/j/k/l      # Navigate splits

# 5. Git integration (avec gitsigns)
]c            # Next hunk
[c            # Previous hunk
<leader>hs    # Stage hunk
<leader>hr    # Reset hunk
<leader>hp    # Preview hunk
:Gitsigns diffthis  # Diff current file

# 6. Terminal intégré
:terminal     # Ouvrir terminal
<C-\\><C-n>   # Exit terminal mode
<leader>tt    # Toggle terminal (avec plugin)
\`\`\`

### Refactoring Rapide

\`\`\`vim
" Exemple : Extraire une constante d'une valeur répétée
" Avant :
const url1 = "http://api.example.com/users";
const url2 = "http://api.example.com/posts";
const url3 = "http://api.example.com/comments";

" 1. Yank la base URL
/http<CR>      " Chercher "http"
vt/<CR>        " Visual select jusqu'au "/"
y              " Yank
iO<Esc>        " Insert line above
const BASE_URL = "<Esc>pa";<Esc>

" 2. Replace avec macro
qa             " Record macro 'a'
ciw\${BASE_URL}<Esc>
f"i\${<Esc>
f/i}<Esc>
j0             " Next line
q              " Stop recording
2@a            " Apply to next 2 lines

" Résultat :
const BASE_URL = "http://api.example.com";
const url1 = \`\${BASE_URL}/users\`;
const url2 = \`\${BASE_URL}/posts\`;
const url3 = \`\${BASE_URL}/comments\`;
\`\`\`

## Astuces Avancées <a name="astuces"></a>

### Marks — Bookmarks Locaux et Globaux

\`\`\`vim
m{a-z}     " Set local mark (fichier courant)
m{A-Z}     " Set global mark (persiste entre fichiers)
`{mark}    " Jump to mark (ligne + colonne)
'{mark}    " Jump to mark (début de ligne)

" Special marks
``         " Jump to last jump
'"         " Jump to last edit position
'[         " Jump to start of last change
']         " Jump to end of last change

" List marks
:marks

" Exemple pratique :
" 1. mA sur une fonction importante
" 2. Naviguer ailleurs
" 3. `A pour y retourner instantanément
\`\`\`

### Répétition avec . (Dot Command)

\`\`\`vim
" Le '.' répète la dernière modification
" Exemple : ajouter ; à la fin de plusieurs lignes
A;<Esc>    " Add ; at end
j          " Down
.          " Repeat on this line
j.         " Next line
j.         " Next line

" Combining with search
/const<CR>  " Find "const"
ciwlet<Esc> " Change to "let"
n           " Next "const"
.           " Repeat change
n.          " Next and repeat
\`\`\`

### Global Commands

\`\`\`vim
:g/pattern/command   " Execute command on lines matching pattern
:v/pattern/command   " Execute on non-matching lines

" Exemples :
:g/console.log/d     " Delete all console.log lines
:g/TODO/normal A!    " Add ! at end of all TODO lines
:g/^$/d              " Delete all empty lines
:v/function/d        " Delete all lines NOT containing "function"
:g/import/m0         " Move all imports to top
\`\`\`

### Ex Commands Pratiques

\`\`\`vim
:earlier 5m    " Undo back 5 minutes
:later 2m      " Redo forward 2 minutes
:w !sudo tee %  " Save file with sudo (si ouvert sans sudo)
:.!date        " Replace current line with date command output
:r !command    " Insert command output below cursor
:%!jq .        " Format JSON with jq (entire file)
:'<,'>!sort    " Sort visual selection
:TOhtml        " Convert to HTML with syntax highlighting
\`\`\`

## Conclusion et Ressources <a name="conclusion"></a>

Maîtriser Vim/Neovim est un **investissement long terme**. Après 2-3 mois de pratique quotidienne, vous éditez du code 2-3x plus vite qu'avec un éditeur classique.

### Plan de Progression (30 jours)

**Semaine 1 : Les Fondamentaux**
- Jours 1-3 : Modes (Normal, Insert, Visual), mouvements hjkl, wbe, ^$
- Jours 4-5 : Opérateurs d, c, y + répétition avec .
- Jours 6-7 : Recherche /, n, *, f/t

**Semaine 2 : Text Objects**
- Jours 8-10 : ciw, daw, di(, da{, ci", etc.
- Jours 11-12 : Visual mode + indentation
- Jours 13-14 : Buffers, windows, splits

**Semaine 3 : Automatisation**
- Jours 15-17 : Registres ("a, "+, etc.)
- Jours 18-20 : Macros (enregistrer et rejouer)
- Jours 21 : Marks et global commands

**Semaine 4 : Configuration Moderne**
- Jours 22-24 : Configuration Neovim (Lua)
- Jours 25-27 : LSP, TreeSitter, plugins
- Jours 28-30 : Workflow personnalisé

### Ressources Essentielles

**Pratique Interactive**
- \`vimtutor\` — Lancez cette commande dans le terminal (30 minutes bien investies)
- [Vim Adventures](https://vim-adventures.com/) — Jeu pour apprendre Vim
- [OpenVim](https://www.openvim.com/) — Tutorial interactif

**Documentation**
- \`:help\` dans Neovim — La meilleure doc, au bout des doigts
- [Neovim Documentation](https://neovim.io/doc/)
- [Learn Vimscript the Hard Way](https://learnvimscriptthehardway.stevelosh.com/)
- [Lua Guide for Neovim](https://github.com/nanotee/nvim-lua-guide)

**Communauté**
- [r/neovim](https://reddit.com/r/neovim) — Communauté active
- [Neovim Discourse](https://neovim.discourse.group/)
- [Awesome Neovim](https://github.com/rockerBOO/awesome-neovim) — Liste de plugins

**Configurations Complètes (pour inspiration)**
- [LazyVim](https://www.lazyvim.org/) — Distribution prête à l'emploi
- [NvChad](https://nvchad.com/) — Configuration moderne et rapide
- [AstroNvim](https://astronvim.com/) — Configuration avec LSP/TreeSitter

### Checklist de Maîtrise

**Niveau Débutant ✅**
- [ ] Navigation hjkl, wbe, ^$, gg, G
- [ ] Modes Normal, Insert, Visual
- [ ] Opérateurs d, c, y + mouvements
- [ ] Sauvegarder :w, quitter :q
- [ ] Undo u, redo Ctrl-r

**Niveau Intermédiaire 🔄**
- [ ] Text objects iw, aw, i(, a{, etc.
- [ ] Recherche /, *, #, n, N
- [ ] Substitution :%s///g
- [ ] Buffers, windows, splits
- [ ] Registres nommés "a, clipboard "+
- [ ] Macros qa...q, @a

**Niveau Avancé 🏆**
- [ ] Marks m{a-Z}, `{mark}
- [ ] Global commands :g/pattern/command
- [ ] Configuration Lua complète
- [ ] LSP avec go-to-definition, refactoring
- [ ] Plugins personnalisés
- [ ] Workflow multi-fichiers fluide

> **Le secret** : Pratiquez TOUS LES JOURS pendant 1 mois. Ne retournez pas à votre ancien éditeur, même si c'est frustrant. Après 1 mois, vous ne pourrez plus vous en passer.

**Bon voyage dans l'univers de Vim/Neovim ! 🚀**
`);

console.log("\\n═══ Blog 5 (Vim/Neovim) terminé ═══\\n");
console.log("✅ 5 blogs créés avec succès !");

