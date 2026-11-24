export interface SemverVersion {
  major: number;
  minor: number;
  patch: number;
}

export type SemverPart = keyof SemverVersion;

/**
 * Incrémente une partie d'une version SemVer en appliquant la règle de la
 * spécification : augmenter MAJOR remet MINOR et PATCH à 0, augmenter MINOR
 * remet PATCH à 0, augmenter PATCH ne touche à rien d'autre.
 */
export function bumpSemver(version: SemverVersion, part: SemverPart): SemverVersion {
  switch (part) {
    case "major":
      return { major: version.major + 1, minor: 0, patch: 0 };
    case "minor":
      return { major: version.major, minor: version.minor + 1, patch: 0 };
    case "patch":
      return { ...version, patch: version.patch + 1 };
  }
}
