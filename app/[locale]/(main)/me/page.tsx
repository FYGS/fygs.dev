import { Section } from "@/app/_components/Section";
import { useIntlayer } from "next-intlayer/server";
import { CertificationsCard } from "./_components/certifications-card";
import { CtaSection } from "./_components/cta-section";
import { CvPreviewSection } from "./_components/cv-preview-section";
import { DescriptionSection } from "./_components/description-section";
import { ExperienceEducation } from "./_components/experience-education";
import { LanguagesCard } from "./_components/languages-card";
import { PreferencesCard } from "./_components/preferences-card";
import { ResumeHeader } from "./_components/resume-header";
import { SoftSkillsCard } from "./_components/soft-skills-card";
import { TechnicalSkillsCard } from "./_components/technical-skills-card";
import {
  buildExperienceItems,
  buildExpertiseItems,
  buildServicesItems,
  buildWhyMeItems,
} from "./_data/description-items";
import {
  buildLocalizedEducation,
  buildLocalizedExperiences,
  buildLocalizedLanguages,
  buildLocalizedSoftSkills,
  buildLocalizedTechnicalSkills,
} from "./_data/localized-cv";
import { buildPreferenceSections } from "./_data/preference-sections";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ResumePage({ params }: Props) {
  const { locale } = await params;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const cv = useIntlayer("cv-page", locale);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const cvData = useIntlayer("cv-data", locale);

  // Combine localized data with icons
  const experienceItems = buildExperienceItems(cvData);
  const expertiseItems = buildExpertiseItems(cvData);
  const servicesItems = buildServicesItems(cvData);
  const whyMeItems = buildWhyMeItems(cvData);
  const preferenceSections = buildPreferenceSections(cvData);

  // Build localized items
  const localizedExperiences = buildLocalizedExperiences(cvData, locale);
  const localizedEducation = buildLocalizedEducation(cvData);
  const localizedTechnicalSkills = buildLocalizedTechnicalSkills(cvData);
  const localizedLanguages = buildLocalizedLanguages(cvData);
  const localizedSoftSkills = buildLocalizedSoftSkills(cvData);

  return (
    <Section className="flex flex-col gap-8 py-8">
      {/* Header */}
      <ResumeHeader cv={cv} />

      {/* Description Section avec effets de survol */}
      <DescriptionSection
        cvData={cvData}
        experienceItems={experienceItems}
        expertiseItems={expertiseItems}
        servicesItems={servicesItems}
        whyMeItems={whyMeItems}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <ExperienceEducation
          cv={cv}
          localizedExperiences={localizedExperiences}
          localizedEducation={localizedEducation}
        />

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Technical Skills avec effets de survol */}
          <TechnicalSkillsCard
            cv={cv}
            localizedTechnicalSkills={localizedTechnicalSkills}
          />

          {/* Languages */}
          <LanguagesCard cv={cv} localizedLanguages={localizedLanguages} />

          {/* Soft Skills */}
          <SoftSkillsCard cv={cv} localizedSoftSkills={localizedSoftSkills} />

          {/* Certifications */}
          <CertificationsCard cv={cv} cvData={cvData} />

          {/* Preferences Section */}
          <PreferencesCard
            cv={cv}
            cvData={cvData}
            preferenceSections={preferenceSections}
          />
        </div>
      </div>

      {/* CV Preview Section */}
      <CvPreviewSection cv={cv} />

      {/* Call to Action Section */}
      <CtaSection cv={cv} />
    </Section>
  );
}
