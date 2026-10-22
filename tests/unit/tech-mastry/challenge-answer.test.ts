import { describe, expect, it } from "vitest";
import {
  evaluateChallengeAnswer,
  parseChallengeAnswer,
} from "@/app/[locale]/(main)/tech-mastry/_utils/challenge-answer";

// Même forme que le « verify » du défi Coin Change (input multi-parties).
const coinChange = (input: string) => {
  const [coinsStr, amountStr] = input.split("|").map((s) => s.trim());
  const coins = coinsStr.split(",").map(Number);
  const amount = parseInt(amountStr);
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++)
    for (const c of coins) if (i >= c) dp[i] = Math.min(dp[i], dp[i - c] + 1);
  return dp[amount] === Infinity ? "-1" : String(dp[amount]);
};

describe("parseChallengeAnswer", () => {
  it("sépare l'input de la réponse sur le dernier =>", () => {
    expect(parseChallengeAnswer("1,2,5 | 11 => 3")).toEqual({ input: "1,2,5 | 11", answer: "3" });
  });
  it("sans => la réponse est absente", () => {
    expect(parseChallengeAnswer("5")).toEqual({ input: "5", answer: null });
  });
});

describe("evaluateChallengeAnswer", () => {
  it("accepte la bonne réponse pour un input multi-parties", () => {
    expect(evaluateChallengeAnswer(coinChange, "1,2,5 | 11 => 3").correct).toBe(true);
  });
  it("refuse une mauvaise réponse et renvoie la sortie attendue", () => {
    expect(evaluateChallengeAnswer(coinChange, "1,2,5 | 11 => 4")).toEqual({
      expected: "3",
      correct: false,
    });
  });
  it("ne valide pas sans réponse (l'input seul n'est jamais « correct »)", () => {
    expect(evaluateChallengeAnswer(coinChange, "1,2,5 | 11").correct).toBe(false);
  });
  it("ne valide pas la réponse d'un autre exemple", () => {
    // 2 | 3 vaut -1 ; 3 est la réponse de l'exemple 1,2,5 | 11
    expect(evaluateChallengeAnswer(coinChange, "2 | 3 => 3").correct).toBe(false);
    expect(evaluateChallengeAnswer(coinChange, "2 | 3 => -1").correct).toBe(true);
  });
  it("gère une entrée invalide sans lever d'exception", () => {
    const res = evaluateChallengeAnswer(coinChange, "a | b => 1");
    expect(res.correct).toBe(false);
  });
});
