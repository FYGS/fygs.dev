import type {
  Certification,
  Education,
  Language,
  Preference,
  Skill,
} from "@/types/cv";
import { jsPDF } from "jspdf";
import { CERTIFICATIONS, DESCRIPTION, EDUCATION_ITEMS, EXPERIENCE_ITEMS, PREFERENCES, SKILLS } from "../[locale]/(main)/me/data";

// Types
interface TextOptions {
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  maxWidth?: number;
}

interface PDFConfig {
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    content: number;
  };
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  lineHeight: number;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    border: string;
    background: string;
    accent: string;
    success: string;
    warning: string;
  };
  fontSize: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    small: number;
  };
  sections: {
    spacing: number;
    headerHeight: number;
  };
}

export const generatePDF = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    floatPrecision: 16,
  });

  // Configuration
  const config: PDFConfig = {
    margin: {
      top: 15,
      right: 20,
      bottom: 15,
      left: 20,
      content: 15,
    },
    pageWidth: doc.internal.pageSize.width,
    pageHeight: doc.internal.pageSize.height,
    contentWidth: doc.internal.pageSize.width - 40,
    lineHeight: 1.5,
    colors: {
      primary: "#0ea5e9",
      secondary: "#6366f1",
      text: "#1f2937",
      muted: "#6b7280",
      border: "#e5e7eb",
      background: "#f8fafc",
      accent: "#f1f5f9",
      success: "#22c55e",
      warning: "#f59e0b",
    },
    fontSize: {
      h1: 26,
      h2: 20,
      h3: 16,
      body: 11,
      small: 9,
    },
    sections: {
      spacing: 12,
      headerHeight: 50,
    },
  };

  let yPos = config.margin.top;

  // Utilitaires
  const checkPageBreak = (neededSpace: number): boolean => {
    if (yPos + neededSpace > config.pageHeight - config.margin.bottom) {
      doc.addPage();
      yPos = config.margin.top;
      return true;
    }
    return false;
  };

  const addText = (
    text: string,
    x: number,
    y: number,
    options: TextOptions = {}
  ): number => {
    const {
      fontSize = config.fontSize.body,
      color = config.colors.text,
      align = "left",
      maxWidth = config.contentWidth,
    } = options;

    doc.setFontSize(fontSize);
    doc.setTextColor(color);

    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y, { align });
      return (lines.length * (fontSize * config.lineHeight)) / 2;
    }
    doc.text(text, x, y, { align });
    return (fontSize * config.lineHeight) / 2;
  };

  const addSection = (title: string) => {
    checkPageBreak(config.sections.spacing * 2);

    // Section header with background
    const headerHeight = 10;
    doc.setFillColor(config.colors.primary);
    doc.rect(config.margin.left, yPos, 4, headerHeight, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(config.fontSize.h2);
    doc.setTextColor(config.colors.primary);

    const titleX = config.margin.left + 8;
    addText(title, titleX, yPos + 7);

    // Decorative line
    doc.setDrawColor(config.colors.border);
    doc.setLineWidth(0.5);
    doc.line(
      titleX + doc.getTextWidth(title) + 10,
      yPos + 5,
      config.pageWidth - config.margin.right,
      yPos + 5
    );

    yPos += config.sections.spacing + headerHeight;
  };

  // Header Section
  const addHeader = () => {
    // Header background
    doc.setFillColor(config.colors.primary);
    doc.rect(0, 0, config.pageWidth, config.sections.headerHeight, "F");

    // Name and title
    doc.setTextColor("#ffffff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(config.fontSize.h1);
    addText("Fernand SOUALO", config.margin.left, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(config.fontSize.h3);
    addText("Senior Software Engineer", config.margin.left, 35);

    // Contact info with icons
    const contactInfo = [
      { icon: "", text: "fygs.dev@gmail.com" },
      { icon: "", text: "+33 6 44 80 85 30" },
      { icon: "", text: "linkedin.com/in/fernandsoualo" },
    ];

    let xPos = config.margin.left;
    contactInfo.forEach((info) => {
      const text = `${info.icon} ${info.text}`;
      addText(text, xPos, 45, {
        fontSize: config.fontSize.body,
        color: "#ffffff",
      });
      xPos += doc.getTextWidth(text) + 20;
    });

    yPos = config.sections.headerHeight + config.margin.top;
  };

  // About Section
  const addAboutSection = () => {
    addSection("About Me");

    // Title with margin
    yPos += 10; // Margin before title
    addText(DESCRIPTION.intro.title, config.margin.left, yPos, {
      fontSize: config.fontSize.h3,
      color: config.colors.primary,
    });

    yPos += 12; // Margin after title

    // Subtitle with margin
    addText(DESCRIPTION.intro.subtitle, config.margin.left, yPos, {
      fontSize: config.fontSize.body,
      color: config.colors.muted,
    });

    yPos += 8; // Margin after subtitle

    // Main text with overflow handling and margin
    const mainTextLines = doc.splitTextToSize(
      DESCRIPTION.intro.mainText,
      config.contentWidth - 10
    );
    mainTextLines.forEach((line: string) => {
      addText(line, config.margin.left, yPos, {
        fontSize: config.fontSize.h3,
        color: config.colors.text,
      });
      yPos += 8; // Add spacing between lines
    });

    yPos += 10; // Additional margin after main text

    // Description with margin
    const descLines = doc.splitTextToSize(
      DESCRIPTION.intro.description,
      config.contentWidth - 10
    );
    descLines.forEach((line: string) => {
      addText(line, config.margin.left, yPos, {
        maxWidth: config.contentWidth - 10,
        color: config.colors.muted,
      });
      yPos += 8; // Add spacing between lines
    });

    yPos += 15; // Additional margin after the description

    // Draw a separator line
    doc.setDrawColor(config.colors.border);
    doc.setLineWidth(0.5);
    doc.line(
      config.margin.left,
      yPos,
      config.pageWidth - config.margin.right,
      yPos
    );
    yPos += 10;

    // Industry Experience
    addText("Industry Experience", config.margin.left, yPos, {
      fontSize: config.fontSize.h3,
      color: config.colors.primary,
    });
    yPos += 10;

    DESCRIPTION.experience.items.forEach((item) => {
      doc.setFillColor(config.colors.accent);
      doc.roundedRect(
        config.margin.left,
        yPos - 3,
        config.contentWidth,
        25,
        2,
        2,
        "F"
      );

      addText(item.company, config.margin.left + 5, yPos + 4, {
        fontSize: config.fontSize.body,
        color: config.colors.primary,
      });

      addText(item.role, config.margin.left + 5, yPos + 12, {
        color: config.colors.muted,
      });

      yPos += 30;
    });

    // Services
    addText("Services Offered", config.margin.left, yPos, {
      fontSize: config.fontSize.h3,
      color: config.colors.primary,
    });
    yPos += 10;

    let servicesXPos = config.margin.left;
    DESCRIPTION.services.items.forEach((service) => {
      const serviceWidth = doc.getTextWidth(service) + 20;

      if (
        servicesXPos + serviceWidth >
        config.pageWidth - config.margin.right
      ) {
        yPos += 12;
        servicesXPos = config.margin.left;
      }

      doc.setFillColor(config.colors.accent);
      doc.roundedRect(servicesXPos, yPos - 3, serviceWidth, 8, 2, 2, "F");

      addText(service, servicesXPos + 5, yPos + 2, {
        fontSize: config.fontSize.small,
        color: config.colors.text,
      });

      servicesXPos += serviceWidth + 5;
    });

    yPos += 20;
  };

  // Experience Section
  const addExperienceSection = () => {
    addSection("Professional Experience");

    EXPERIENCE_ITEMS.forEach((exp, index) => {
      checkPageBreak(50);

      // Timeline
      doc.setFillColor(config.colors.primary);
      doc.circle(config.margin.left + 3, yPos + 4, 1.5, "F");

      if (index < EXPERIENCE_ITEMS.length - 1) {
        doc.setDrawColor(config.colors.border);
        doc.line(
          config.margin.left + 3,
          yPos + 6,
          config.margin.left + 3,
          yPos + 40
        );
      }

      // Title and Company
      addText(exp.title, config.margin.left + 10, yPos + 4, {
        fontSize: config.fontSize.h3,
        color: config.colors.text,
      });

      addText(
        `${exp.company} | ${exp.location}`,
        config.margin.left + 10,
        yPos + 12,
        {
          color: config.colors.muted,
        }
      );

      addText(exp.date, config.margin.left + 10, yPos + 20, {
        color: config.colors.muted,
      });

      // Current badge if applicable
      if (exp.current) {
        const currentText = "Current";
        const badgeWidth = doc.getTextWidth(currentText) + 10;
        doc.setFillColor(config.colors.success);
        doc.roundedRect(
          config.margin.left + 10,
          yPos + 24,
          badgeWidth,
          6,
          2,
          2,
          "F"
        );
        addText(currentText, config.margin.left + 15, yPos + 28, {
          fontSize: config.fontSize.small,
          color: "#ffffff",
        });
      }

      yPos += 35;

      // Technologies
      if (exp.technologies) {
        let techXPos = config.margin.left + 10;
        exp.technologies.forEach((tech) => {
          const techWidth = doc.getTextWidth(tech) + 10;

          if (techXPos + techWidth > config.pageWidth - config.margin.right) {
            yPos += 10;
            techXPos = config.margin.left + 10;
          }

          doc.setFillColor(config.colors.accent);
          doc.roundedRect(techXPos, yPos - 3, techWidth, 6, 2, 2, "F");
          addText(tech, techXPos + 5, yPos + 1, {
            fontSize: config.fontSize.small,
            color: config.colors.primary,
          });

          techXPos += techWidth + 5;
        });
        yPos += 15;
      }

      // Description
      exp.description.forEach((desc) => {
        checkPageBreak(8);
        doc.setFillColor(config.colors.primary);
        doc.circle(config.margin.left + 12, yPos + 2, 1, "F");
        const height = addText(desc, config.margin.left + 20, yPos + 2, {
          maxWidth: config.contentWidth - 25,
          color: config.colors.text,
        });
        yPos += height + 4;
      });

      yPos += 15;
    });
  };

  // Skills Section
  const addSkillsSection = () => {
    addSection("Technical Skills");

    // Technical Skills
    SKILLS.technical.forEach((skillGroup: Skill) => {
      checkPageBreak(30);

      // Category header
      doc.setFillColor(config.colors.primary);
      doc.roundedRect(
        config.margin.left,
        yPos - 3,
        config.contentWidth,
        8,
        2,
        2,
        "F"
      );
      addText(skillGroup.category, config.margin.left + 5, yPos + 2, {
        fontSize: config.fontSize.body,
        color: "#ffffff",
      });
      yPos += 12;

      // Skills badges
      let xPos = config.margin.left;
      skillGroup.skills.forEach((skill: string) => {
        const skillWidth = doc.getTextWidth(skill) + 10;

        if (xPos + skillWidth > config.pageWidth - config.margin.right) {
          yPos += 10;
          xPos = config.margin.left;
        }

        doc.setFillColor(config.colors.accent);
        doc.roundedRect(xPos, yPos - 3, skillWidth, 6, 2, 2, "F");
        addText(skill, xPos + 5, yPos + 1, {
          fontSize: config.fontSize.small,
          color: config.colors.text,
        });

        xPos += skillWidth + 5;
      });

      yPos += 20;
    });

    // Languages
    addText("Languages", config.margin.left, yPos, {
      fontSize: config.fontSize.h3,
      color: config.colors.primary,
    });
    yPos += 10;

    SKILLS.languages.forEach((lang: Language) => {
      doc.setFillColor(config.colors.accent);
      const langWidth = doc.getTextWidth(lang.language) + 10;
      const levelWidth = doc.getTextWidth(lang.level) + 10;

      // Language
      doc.roundedRect(config.margin.left, yPos - 3, langWidth, 6, 2, 2, "F");
      addText(lang.language, config.margin.left + 5, yPos + 1, {
        fontSize: config.fontSize.small,
        color: config.colors.text,
      });

      // Level
      doc.setFillColor(config.colors.primary);
      doc.roundedRect(
        config.margin.left + langWidth + 5,
        yPos - 3,
        levelWidth,
        6,
        2,
        2,
        "F"
      );
      addText(lang.level, config.margin.left + langWidth + 10, yPos + 1, {
        fontSize: config.fontSize.small,
        color: "#ffffff",
      });

      // Proficiency
      addText(
        `(${lang.proficiency})`,
        config.margin.left + langWidth + levelWidth + 15,
        yPos + 1,
        {
          fontSize: config.fontSize.small,
          color: config.colors.muted,
        }
      );

      yPos += 10;
    });
  };

  // Education Section
  const addEducationSection = () => {
    addSection("Education");

    EDUCATION_ITEMS.forEach((edu: Education, index: number) => {
      checkPageBreak(40);

      // Timeline
      doc.setFillColor(config.colors.primary);
      doc.circle(config.margin.left + 3, yPos + 4, 1.5, "F");

      if (index < EDUCATION_ITEMS.length - 1) {
        doc.setDrawColor(config.colors.border);
        doc.line(
          config.margin.left + 3,
          yPos + 6,
          config.margin.left + 3,
          yPos + 30
        );
      }

      // Title and Institution
      addText(edu.title, config.margin.left + 10, yPos + 4, {
        fontSize: config.fontSize.h3,
        color: config.colors.text,
      });

      addText(
        `${edu.institution} | ${edu.location}`,
        config.margin.left + 10,
        yPos + 12,
        {
          color: config.colors.muted,
        }
      );

      addText(edu.date, config.margin.left + 10, yPos + 20, {
        color: config.colors.muted,
      });

      if (edu.gpa) {
        const gpaText = `GPA: ${edu.gpa}`;
        const gpaWidth = doc.getTextWidth(gpaText) + 10;
        doc.setFillColor(config.colors.primary);
        doc.roundedRect(
          config.margin.left + 10,
          yPos + 24,
          gpaWidth,
          6,
          2,
          2,
          "F"
        );
        addText(gpaText, config.margin.left + 15, yPos + 28, {
          fontSize: config.fontSize.small,
          color: "#ffffff",
        });
      }

      yPos += 35;

      // Description
      edu.description.forEach((desc: string) => {
        checkPageBreak(8);
        doc.setFillColor(config.colors.primary);
        doc.circle(config.margin.left + 12, yPos + 2, 1, "F");
        const height = addText(desc, config.margin.left + 20, yPos + 2, {
          maxWidth: config.contentWidth - 25,
          color: config.colors.text,
        });
        yPos += height + 4;
      });

      yPos += 15;
    });
  };

  // Certifications Section
  const addCertificationsSection = () => {
    addSection("Certifications");

    CERTIFICATIONS.forEach((cert: Certification) => {
      checkPageBreak(30);

      // Certificate box
      doc.setFillColor(config.colors.accent);
      doc.roundedRect(
        config.margin.left,
        yPos - 3,
        config.contentWidth,
        25,
        2,
        2,
        "F"
      );

      // Title
      addText(cert.title, config.margin.left + 5, yPos + 4, {
        fontSize: config.fontSize.body,
        color: config.colors.primary,
      });

      // Issuer and date
      const dateText = `${cert.date} - ${cert.validUntil}`;
      addText(cert.issuer, config.margin.left + 5, yPos + 12, {
        color: config.colors.muted,
      });

      addText(
        dateText,
        config.pageWidth - config.margin.right - doc.getTextWidth(dateText) - 5,
        yPos + 12,
        {
          color: config.colors.muted,
        }
      );

      // Credential ID
      addText(
        `Credential ID: ${cert.credentialId}`,
        config.margin.left + 5,
        yPos + 20,
        {
          fontSize: config.fontSize.small,
          color: config.colors.muted,
        }
      );

      yPos += 30;
    });
  };

  // Preferences Section
  const addPreferencesSection = () => {
    addSection("Work Preferences");

    PREFERENCES.sections.forEach((section: Preference) => {
      checkPageBreak(25);

      // Section title with icon
      addText(section.title, config.margin.left, yPos, {
        fontSize: config.fontSize.h3,
        color: config.colors.primary,
      });
      yPos += 8;

      // Options with current selection highlighted
      let xPos = config.margin.left;
      section.options.forEach((option: string) => {
        const isSelected = option === section.current;
        const optionWidth = doc.getTextWidth(option) + 10;

        if (xPos + optionWidth > config.pageWidth - config.margin.right) {
          yPos += 10;
          xPos = config.margin.left;
        }

        // Option badge
        doc.setFillColor(
          isSelected ? config.colors.primary : config.colors.accent
        );
        doc.roundedRect(xPos, yPos - 3, optionWidth, 6, 2, 2, "F");
        addText(option, xPos + 5, yPos + 1, {
          fontSize: config.fontSize.small,
          color: isSelected ? "#ffffff" : config.colors.text,
        });

        xPos += optionWidth + 5;
      });

      yPos += 15;
    });

    // Additional note
    yPos += 5;
    doc.setDrawColor(config.colors.border);
    doc.line(
      config.margin.left,
      yPos,
      config.pageWidth - config.margin.right,
      yPos
    );
    yPos += 8;

    addText(
      "Open to discussing flexible arrangements based on project requirements",
      config.margin.left,
      yPos,
      {
        fontSize: config.fontSize.small,
        color: config.colors.muted,
      }
    );
  };

  // Footer
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Decorative line
      doc.setDrawColor(config.colors.border);
      doc.line(
        config.margin.left,
        config.pageHeight - 15,
        config.pageWidth - config.margin.right,
        config.pageHeight - 15
      );

      // Footer text
      doc.setFontSize(config.fontSize.small);
      doc.setTextColor(config.colors.muted);

      const footerText = `Generated from fygs.dev | Page ${i} of ${pageCount}`;
      addText(footerText, config.pageWidth / 2, config.pageHeight - 10, {
        align: "center",
      });
    }
  };

  // Main document generation
  const generateDocument = () => {
    addHeader();
    addAboutSection();
    addExperienceSection();
    addSkillsSection();
    addEducationSection();
    addCertificationsSection();
    addPreferencesSection();
    addFooter();
  };

  generateDocument();
  return doc;
};
export default generatePDF;
