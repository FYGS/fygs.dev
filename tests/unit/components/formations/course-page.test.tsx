/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { CourseCurriculum } from "@/app/[locale]/(main)/formations/[slug]/_components/course-curriculum";
import { CourseResumeBanner } from "@/app/[locale]/(main)/formations/[slug]/_components/course-resume-banner";
import { LockedNotice } from "@/app/[locale]/(main)/formations/[slug]/_components/locked-notice";
import { CatalogPager } from "@/app/[locale]/(main)/formations/_components/catalog-pager";
import { CourseOfferPanel, type CourseOfferPanelProps } from "@/app/_components/payment/course-offer-panel";
import { buildCurriculumView, curriculumStats } from "@/lib/learning/curriculum-view";
import { sampleOutline } from "../../../support/learning-fixtures";

const m = vi.hoisted(() => ({ enroll: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock("@/app/[locale]/(main)/dashboard/actions/enrollCourse", () => ({ enrollCourse: m.enroll }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: m.push, refresh: m.refresh }) }));
vi.mock("@/lib/analytics-batch", () => ({ enqueueAnalytics: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/link", () => ({
  default: ({ children, href, prefetch: _p, ...props }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => vi.clearAllMocks());
// Intl separates "€" and thousands with no-break spaces (U+00A0, U+202F)
const text = (s: string | null | undefined) => (s ?? "").replace(/[  ]/g, " ");

describe("CourseCurriculum", () => {
  const outline = sampleOutline();
  const sections = buildCurriculumView(outline, "react", {
    isDone: (i) => i.id === "l1",
    nextId: "l2",
    canOpen: (i) => i.kind === "lesson" && i.id !== "l3",
  });
  const render_ = () => render(<CourseCurriculum sections={sections} stats={curriculumStats(outline)} resourceCount={3} initiallyOpen={0} />);

  it("summarises the course, resources included", () => {
    render_();
    expect(screen.getByText(/2 modules · 3 leçons · 1 quiz · examen final · 3 ressources · 30 min/)).toBeTruthy();
  });

  it("opens the section of the next step and links what can be opened", () => {
    render_();
    expect(screen.getByRole("link", { name: /Variables/ }).getAttribute("href")).toBe("/learn/react/lessons/variables");
    expect(screen.getByText("Aperçu gratuit")).toBeTruthy();
    expect(screen.getByText("Suivant")).toBeTruthy();
    expect(screen.getByText(/\(terminé\)/)).toBeTruthy();
    expect(screen.queryByText("Asynchrone")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Avancé/ }));
    expect(screen.getByText("Asynchrone")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Asynchrone/ })).toBeNull();
  });

  it("says when no lesson is published yet", () => {
    render(<CourseCurriculum sections={[]} stats={{ modules: 0, lessons: 0, quizzes: 0, hasExam: false, minutes: 0 }} resourceCount={0} initiallyOpen={0} />);
    expect(screen.getByText("Aucune leçon n’est encore publiée dans cette formation.")).toBeTruthy();
  });
});

describe("CourseResumeBanner", () => {
  const banner = (props: Partial<Parameters<typeof CourseResumeBanner>[0]>) => (
    <CourseResumeBanner percent={0} done={0} total={5} next={null} completedHref="/learn/react/completed" hasCertificate={false} {...props} />
  );

  it("continues where the learner left off", () => {
    render(banner({ percent: 40, done: 2, next: { title: "Quiz des bases", href: "/learn/react/quizzes/q1" } }));
    expect(screen.getByText("2 étapes sur 5")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Reprendre/ }).getAttribute("href")).toBe("/learn/react/quizzes/q1");
  });

  it("offers to start when nothing is done, and the certificate when everything is", () => {
    const { rerender } = render(banner({ next: { title: "Variables", href: "/learn/react/lessons/variables" } }));
    expect(screen.getByRole("link", { name: /Commencer/ })).toBeTruthy();
    rerender(banner({ percent: 100, done: 5, hasCertificate: true }));
    expect(screen.getByRole("link", { name: /Voir mon certificat/ }).getAttribute("href")).toBe("/learn/react/completed");
  });

  it("an enrolled learner of a course with nothing published is not told it is finished", () => {
    render(banner({ total: 0 }));
    expect(screen.queryByText(/terminée/)).toBeNull();
    expect(screen.getByText(/pas encore publiées/)).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("LockedNotice", () => {
  const base = { signedIn: true, free: false, eligible: false, lapsed: null, unpublished: false, returnTo: "/learn/react/lessons/hooks" } as const;

  it("tells a lapsed learner why, by reason", () => {
    const { rerender } = render(<LockedNotice {...base} lapsed="subscription_ended" />);
    expect(screen.getByRole("alert").textContent).toContain("abonnement n’est plus actif");
    rerender(<LockedNotice {...base} lapsed="refunded" />);
    expect(screen.getByRole("alert").textContent).toContain("remboursé");
  });

  it("asks a visitor to sign in and comes back to the step asked for", () => {
    render(<LockedNotice {...base} signedIn={false} free />);
    expect(screen.getByRole("link", { name: "Se connecter" }).getAttribute("href")).toBe(
      "/auth/login?callbackUrl=%2Flearn%2Freact%2Flessons%2Fhooks",
    );
  });

  it("free course: enrol; premium: buy or subscribe; already open: start; withdrawn: says so", () => {
    const { rerender } = render(<LockedNotice {...base} free />);
    expect(screen.getByRole("alert").textContent).toContain("Inscrivez-vous");
    rerender(<LockedNotice {...base} />);
    expect(screen.getByRole("alert").textContent).toContain("Premium");
    rerender(<LockedNotice {...base} eligible />);
    expect(screen.getByRole("alert").textContent).toContain("Commencer la formation");
    rerender(<LockedNotice {...base} unpublished />);
    expect(screen.getByRole("alert").textContent).toContain("n’est plus proposée");
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("CatalogPager", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<CatalogPager page={1} pageCount={1} params={{}} />);
    expect(container.innerHTML).toBe("");
  });

  it("keeps the filters in every link and marks the current page", () => {
    render(<CatalogPager page={3} pageCount={6} params={{ category: "CLOUD", access: "free", sort: "recent", search: undefined }} />);
    const nav = screen.getByRole("navigation", { name: "Pagination du catalogue" });
    expect(within(nav).getByRole("link", { name: /Précédent/ }).getAttribute("href")).toBe("/formations?category=CLOUD&access=free&sort=recent&page=2#courses");
    expect(within(nav).getByRole("link", { name: "Page 3" }).getAttribute("aria-current")).toBe("page");
  });
});

describe("CourseOfferPanel", () => {
  const props = (over: Partial<CourseOfferPanelProps>): CourseOfferPanelProps => ({
    course: { id: "c1", slug: "react", title: "React" },
    offer: { kind: "premium", price: 49.99 },
    state: "none",
    source: null,
    lapsed: null,
    continueHref: "/learn/react",
    continueLabel: "Commencer la formation",
    hasPreview: false,
    paymentPending: false,
    includes: { lessons: 12, minutes: 185, resources: 2, quizzes: 3, hasExam: true },
    ...over,
  });

  it("premium not owned: the exact price, the subscription alternative, the 14-day refund", () => {
    render(<CourseOfferPanel {...props({})} />);
    expect(text(screen.getByRole("button", { name: /Acheter/ }).textContent)).toContain("49,99 €");
    expect(screen.getByRole("link", { name: /abonnement Premium/ }).getAttribute("href")).toBe("/pricing");
    expect(text(document.body.textContent)).toContain("sous 14 jours");
  });

  it("what is included comes from the course: lessons, duration, quizzes, exam, resources, certificate", () => {
    render(<CourseOfferPanel {...props({})} />);
    const list = text(screen.getByRole("list").textContent);
    for (const expected of ["12 leçons · 3 h 05", "3 quiz", "Un examen final", "2 ressources", "certificat vérifiable"]) {
      expect(list).toContain(expected);
    }
  });

  it("a free course is joined without payment, and says so", async () => {
    m.enroll.mockResolvedValue({ success: true, message: "ok" });
    render(<CourseOfferPanel {...props({ offer: { kind: "free" } })} />);
    expect(screen.queryByRole("button", { name: /Acheter/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "S’inscrire gratuitement" }));
    await vi.waitFor(() => expect(m.push).toHaveBeenCalledWith("/learn/react"));
    expect(m.enroll).toHaveBeenCalledWith({ courseId: "c1" });
  });

  it("an entitled learner continues; a subscriber who did not start is one click away", () => {
    const { rerender } = render(<CourseOfferPanel {...props({ state: "entitled", source: "subscription", continueHref: "/learn/react/lessons/hooks", continueLabel: "Reprendre la formation" })} />);
    expect(screen.getByRole("link", { name: /Reprendre la formation/ }).getAttribute("href")).toBe("/learn/react/lessons/hooks");
    expect(screen.getByText(/tant qu’il est actif/)).toBeTruthy();
    expect(screen.queryByText(/49,99/)).toBeNull();
    rerender(<CourseOfferPanel {...props({ state: "eligible", source: "subscription" })} />);
    expect(screen.getByRole("button", { name: /Commencer la formation/ })).toBeTruthy();
  });

  it("a lapsed learner reads why and can buy again; a visitor signs in first", () => {
    const { rerender } = render(<CourseOfferPanel {...props({ state: "lapsed", lapsed: "refunded" })} />);
    expect(screen.getByRole("note").textContent).toContain("remboursé");
    expect(screen.getByRole("button", { name: /Racheter/ })).toBeTruthy();
    rerender(<CourseOfferPanel {...props({ state: "anonymous", hasPreview: true })} />);
    expect(screen.getByRole("link", { name: "Se connecter pour acheter" }).getAttribute("href")).toBe("/auth/login?callbackUrl=%2Fformations%2Freact");
    expect(screen.getByRole("link", { name: /aperçu gratuit/ }).getAttribute("href")).toBe("/learn/react");
  });

  it("while a payment is being confirmed, buying again is impossible", () => {
    render(<CourseOfferPanel {...props({ paymentPending: true })} />);
    const button = screen.getByRole("button", { name: /Paiement en cours de confirmation/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("a premium course without a valid price is only offered through the subscription", () => {
    render(<CourseOfferPanel {...props({ offer: { kind: "premium", price: null } })} />);
    expect(screen.queryByRole("button", { name: /Acheter/ })).toBeNull();
    expect(screen.getByRole("link", { name: /S’abonner à Premium/ }).getAttribute("href")).toBe("/pricing");
  });
});
