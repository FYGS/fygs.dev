import type { Certification, Education, Language, Skill } from "@/types/cv";
import { jsPDF } from "jspdf";
import {
  CERTIFICATIONS,
  DESCRIPTION,
  EDUCATION_ITEMS,
  EXPERIENCE_ITEMS,
  SKILLS,
} from "../[locale]/(main)/me/data";

// ─── Design Tokens ──────────────────────────────────────────────────────────

const C = {
  sidebar: "#1a2332",
  sidebarLight: "#243044",
  sidebarText: "#e2e8f0",
  sidebarMuted: "#94a3b8",
  accent: "#38bdf8",
  accentDark: "#0284c7",
  accentBg: "#eef9ff",
  heading: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  line: "#e2e8f0",
  cardBg: "#f8fafc",
  white: "#ffffff",
  green: "#059669",
};

const L = {
  pageW: 210,
  pageH: 297,
  sideW: 64,
  mainX: 72,
  mainW: 130,
  mainR: 202, // mainX + mainW
  sideL: 8,
  sideR: 56,
  footerY: 285,
};

// ─── Generator ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generatePDF = (locale: string = "en") => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  const font = (
    weight: "normal" | "bold" | "italic" = "normal",
    size = 9,
    color = C.body,
  ) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color);
  };

  const pageBreak = (need: number) => {
    if (y + need > L.footerY - 6) {
      doc.addPage();
      y = 14;
      sidebarBg();
      return true;
    }
    return false;
  };

  const sidebarBg = () => {
    doc.setFillColor(C.sidebar);
    doc.rect(0, 0, L.sideW, L.pageH, "F");
  };

  /** Safe wrapped text — always stays within maxW */
  const wrap = (
    text: string,
    x: number,
    maxW: number,
    lh = 4.5,
    color = C.body,
    size = 8,
    weight: "normal" | "bold" | "italic" = "normal",
  ) => {
    font(weight, size, color);
    const lines: string[] = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      pageBreak(lh + 1);
      doc.text(line, x, y);
      y += lh;
    }
  };

  /** Sidebar wrapped text — independent y tracking */
  const sideWrap = (
    text: string,
    x: number,
    maxW: number,
    startY: number,
    lh = 3.6,
    color = C.sidebarMuted,
    size = 6.5,
  ): number => {
    font("normal", size, color);
    const lines: string[] = doc.splitTextToSize(text, maxW);
    let sy = startY;
    for (const line of lines) {
      doc.text(line, x, sy);
      sy += lh;
    }
    return sy;
  };

  const pill = (
    label: string,
    x: number,
    py: number,
    bg: string,
    fg: string,
    sz = 6,
  ): number => {
    font("normal", sz, fg);
    const tw = doc.getTextWidth(label);
    const pw = tw + 4;
    const ph = sz * 0.65 + 2;
    doc.setFillColor(bg);
    doc.roundedRect(x, py - ph / 2 - 0.3, pw, ph, 1, 1, "F");
    doc.text(label, x + 2, py + 0.3);
    return pw;
  };

  // ════════════════════════════════════════════════════════════════
  //  SIDEBAR
  // ════════════════════════════════════════════════════════════════

  const drawSidebar = () => {
    sidebarBg();

    // Top accent strip
    doc.setFillColor(C.accent);
    doc.rect(0, 0, L.sideW, 3, "F");

    let s = 15;
    const sw = L.sideR - L.sideL; // usable sidebar width

    // Name
    font("bold", 14, C.white);
    doc.text("Fernand", L.sideW / 2, s, { align: "center" });
    s += 6;
    doc.text("SOUALO", L.sideW / 2, s, { align: "center" });

    s += 6;
    font("normal", 7, C.accent);
    doc.text("Senior Software Engineer", L.sideW / 2, s, { align: "center" });

    // Divider
    s += 6;
    doc.setDrawColor(C.sidebarLight);
    doc.setLineWidth(0.3);
    doc.line(L.sideL, s, L.sideR, s);

    // ─ Contact ─
    s += 5;
    font("bold", 7, C.accent);
    doc.text("CONTACT", L.sideL, s);
    s += 5;

    const contacts = [
      { k: "Email", v: "fygs.dev@gmail.com" },
      { k: "Phone", v: "+33 6 44 80 85 30" },
      { k: "LinkedIn", v: "linkedin.com/in/fernandsoualo" },
      { k: "Web", v: "fygs.dev" },
      { k: "Location", v: "Paris, France" },
    ];
    for (const c of contacts) {
      font("normal", 5.5, C.sidebarMuted);
      doc.text(c.k, L.sideL, s);
      s += 3;
      font("normal", 6.5, C.sidebarText);
      // Wrap long contact values
      s = sideWrap(c.v, L.sideL, sw, s, 3.4, C.sidebarText, 6.5);
      s += 2;
    }

    // Divider
    s += 1;
    doc.setDrawColor(C.sidebarLight);
    doc.line(L.sideL, s, L.sideR, s);

    // ─ Technical Skills ─
    s += 5;
    font("bold", 7, C.accent);
    doc.text("TECHNICAL SKILLS", L.sideL, s);
    s += 5;

    for (const group of SKILLS.technical as Skill[]) {
      font("bold", 6, C.sidebarText);
      doc.text(group.category, L.sideL, s);
      s += 3.5;
      // Display skills as comma-separated to save space
      font("normal", 5.5, C.sidebarMuted);
      const skillText = group.skills.join(", ");
      s = sideWrap(skillText, L.sideL + 1, sw - 2, s, 3.2, C.sidebarMuted, 5.5);
      s += 2.5;
    }

    // Divider
    doc.setDrawColor(C.sidebarLight);
    doc.line(L.sideL, s, L.sideR, s);

    // ─ Languages ─
    s += 5;
    font("bold", 7, C.accent);
    doc.text("LANGUAGES", L.sideL, s);
    s += 5;

    for (const lang of SKILLS.languages as Language[]) {
      font("normal", 6.5, C.sidebarText);
      doc.text(lang.language, L.sideL, s);
      font("normal", 6, C.sidebarMuted);
      const lx = L.sideL + doc.getTextWidth(lang.language) + 1.5;
      doc.text(`- ${lang.level}`, lx, s);
      s += 5;
    }

    // Divider
    s += 2;
    doc.setDrawColor(C.sidebarLight);
    doc.line(L.sideL, s, L.sideR, s);

    // ─ Soft Skills ─
    s += 5;
    font("bold", 7, C.accent);
    doc.text("SOFT SKILLS", L.sideL, s);
    s += 5;

    for (const sk of SKILLS.soft as string[]) {
      font("normal", 6, C.sidebarMuted);
      doc.text(`- ${sk}`, L.sideL + 1, s);
      s += 3.8;
    }
  };

  // ════════════════════════════════════════════════════════════════
  //  MAIN CONTENT HELPERS
  // ════════════════════════════════════════════════════════════════

  const contentX = L.mainX + 4;
  const contentW = L.mainW - 8; // safe content width

  const sectionTitle = (title: string) => {
    pageBreak(14);

    // Accent bar
    doc.setFillColor(C.accent);
    doc.roundedRect(L.mainX, y, 2.5, 6, 0.8, 0.8, "F");

    font("bold", 11, C.heading);
    doc.text(title, L.mainX + 6, y + 4.5);

    // Decorative line
    const tw = doc.getTextWidth(title);
    doc.setDrawColor(C.line);
    doc.setLineWidth(0.2);
    doc.line(L.mainX + 6 + tw + 3, y + 3, L.mainR - 4, y + 3);

    y += 11;
  };

  // ════════════════════════════════════════════════════════════════
  //  ABOUT
  // ════════════════════════════════════════════════════════════════

  const drawAbout = () => {
    sectionTitle("About");
    wrap(DESCRIPTION.intro.description, contentX, contentW, 4.5, C.body, 8);
    y += 5;
  };

  // ════════════════════════════════════════════════════════════════
  //  EXPERIENCE (all items, properly paginated)
  // ════════════════════════════════════════════════════════════════

  const drawExperience = () => {
    sectionTitle("Professional Experience");

    EXPERIENCE_ITEMS.forEach((exp, idx) => {
      // Estimate space needed for header (title + company + date ~ 18mm)
      pageBreak(22);

      // Timeline dot
      doc.setFillColor(idx === 0 ? C.accent : C.line);
      doc.circle(L.mainX + 1.5, y + 1.5, 1.2, "F");

      // Title — wrap within safe bounds
      font("bold", 8.5, C.heading);
      const titleLines: string[] = doc.splitTextToSize(exp.title, contentW - 6);
      for (const tl of titleLines) {
        doc.text(tl, contentX, y + 2);
        y += 4;
      }

      // Company + location on same line, wrapped if needed
      font("normal", 7.5, C.accent);
      const companyText = `${exp.company} — ${exp.location}`;
      const companyLines: string[] = doc.splitTextToSize(
        companyText,
        contentW - 6,
      );
      for (const cl of companyLines) {
        doc.text(cl, contentX, y + 1);
        y += 3.8;
      }
      y += 1;

      // Date + badge
      font("normal", 7, C.muted);
      doc.text(exp.date, contentX, y);
      if (exp.current) {
        const dw = doc.getTextWidth(exp.date);
        pill("Active", contentX + dw + 3, y, C.green, C.white, 5.5);
      }
      y += 4.5;

      // Tech pills (compact, wrapped)
      if (exp.technologies && exp.technologies.length > 0) {
        let px = contentX;
        for (const tech of exp.technologies) {
          font("normal", 5.5, C.accentDark);
          const tw = doc.getTextWidth(tech) + 4;
          if (px + tw > L.mainR - 6) {
            px = contentX;
            y += 4.5;
            pageBreak(5);
          }
          pill(tech, px, y, C.accentBg, C.accentDark, 5.5);
          px += tw + 2;
        }
        y += 5.5;
      }

      // Description bullets — ALL items
      for (const desc of exp.description) {
        pageBreak(6);
        font("normal", 7, C.accent);
        doc.text("-", contentX, y);
        wrap(desc, contentX + 3.5, contentW - 10, 3.8, C.body, 7);
        y += 0.5;
      }

      // Achievements — styled consistently
      if (exp.achievements && exp.achievements.length > 0) {
        pageBreak(6);
        y += 1;
        font("bold", 6.5, C.green);
        doc.text("Key Achievements", contentX, y);
        y += 3.8;
        for (const ach of exp.achievements) {
          pageBreak(5);
          // Use wrap for achievements to prevent overflow
          font("normal", 6.5, C.body);
          doc.text("-", contentX + 2, y);
          wrap(ach, contentX + 5, contentW - 12, 3.5, C.body, 6.5);
          y += 0.5;
        }
        y += 1;
      }

      // Separator between experiences
      if (idx < EXPERIENCE_ITEMS.length - 1) {
        y += 2;
        doc.setDrawColor(C.line);
        doc.setLineWidth(0.12);
        doc.line(contentX, y, L.mainR - 6, y);
        y += 5;
      }
    });

    y += 4;
  };

  // ════════════════════════════════════════════════════════════════
  //  EDUCATION
  // ════════════════════════════════════════════════════════════════

  const drawEducation = () => {
    sectionTitle("Education");

    EDUCATION_ITEMS.forEach((edu: Education, idx: number) => {
      pageBreak(18);

      doc.setFillColor(C.accent);
      doc.circle(L.mainX + 1.5, y + 1.5, 1, "F");

      // Title — wrapped
      font("bold", 8.5, C.heading);
      const titleLines: string[] = doc.splitTextToSize(edu.title, contentW - 6);
      for (const tl of titleLines) {
        doc.text(tl, contentX, y + 2);
        y += 4;
      }

      // Institution + location — wrapped
      font("normal", 7.5, C.accent);
      const instText = `${edu.institution} — ${edu.location}`;
      const instLines: string[] = doc.splitTextToSize(instText, contentW - 6);
      for (const il of instLines) {
        doc.text(il, contentX, y);
        y += 3.5;
      }

      // Date + GPA
      font("normal", 7, C.muted);
      doc.text(edu.date, contentX, y);
      if (edu.gpa) {
        const dw = doc.getTextWidth(edu.date);
        pill(
          `GPA: ${edu.gpa}`,
          contentX + dw + 3,
          y,
          C.accentBg,
          C.accentDark,
          5.5,
        );
      }
      y += 4.5;

      // Description (max 2)
      for (const desc of edu.description.slice(0, 2)) {
        pageBreak(5);
        font("normal", 6.5, C.accent);
        doc.text("-", contentX, y);
        wrap(desc, contentX + 3.5, contentW - 10, 3.5, C.body, 6.5);
        y += 0.5;
      }

      if (idx < EDUCATION_ITEMS.length - 1) y += 3;
    });

    y += 4;
  };

  // ════════════════════════════════════════════════════════════════
  //  CERTIFICATIONS
  // ════════════════════════════════════════════════════════════════

  const drawCertifications = () => {
    sectionTitle("Certifications");

    for (const cert of CERTIFICATIONS as Certification[]) {
      pageBreak(14);

      doc.setFillColor(C.cardBg);
      doc.roundedRect(L.mainX + 2, y, contentW, 11, 1.5, 1.5, "F");

      // Title — wrapped within card
      font("bold", 7.5, C.heading);
      const certLines: string[] = doc.splitTextToSize(cert.title, contentW - 8);
      let cy = y + 4;
      for (const cl of certLines) {
        doc.text(cl, contentX + 2, cy);
        cy += 3.5;
      }

      font("normal", 6.5, C.muted);
      doc.text(`${cert.issuer}  ·  ${cert.date}`, contentX + 2, cy);

      y += 14;
    }

    y += 3;
  };

  // ════════════════════════════════════════════════════════════════
  //  SERVICES
  // ════════════════════════════════════════════════════════════════

  const drawServices = () => {
    sectionTitle("Services");

    let px = contentX;

    for (const svc of DESCRIPTION.services.items as string[]) {
      font("normal", 6, C.body);
      const tw = doc.getTextWidth(svc) + 4;
      if (px + tw > L.mainR - 6) {
        px = contentX;
        y += 5.5;
        pageBreak(6);
      }
      pill(svc, px, y, C.cardBg, C.body, 6);
      px += tw + 2;
    }
    y += 6;
  };

  // ════════════════════════════════════════════════════════════════
  //  FOOTER
  // ════════════════════════════════════════════════════════════════

  const addFooter = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);

      font("normal", 5.5, C.sidebarMuted);
      doc.text(`${i} / ${pages}`, L.sideW / 2, L.pageH - 5, {
        align: "center",
      });

      doc.setDrawColor(C.line);
      doc.setLineWidth(0.15);
      doc.line(L.mainX, L.pageH - 9, L.mainR - 4, L.pageH - 9);

      font("normal", 6, C.muted);
      doc.text("Generated from fygs.dev", L.mainX + contentW / 2, L.pageH - 5, {
        align: "center",
      });
    }
  };

  // ════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════

  drawSidebar();
  y = 14;
  drawAbout();
  drawExperience();
  drawEducation();
  drawCertifications();
  drawServices();
  addFooter();

  return doc;
};

export default generatePDF;
