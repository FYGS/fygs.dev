import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { completeCourseIfDone } from "@/lib/learning/completion";

export interface CertificateAttempt {
  success: boolean;
  certificate?: { id: string; code: string; issuedAt: Date };
  /** The certificate existed before this call. */
  alreadyIssued?: boolean;
  error?: "UNAUTHORIZED" | "NOT_ELIGIBLE";
  /** Where the course stands when nothing was issued. */
  eligibility?: { completionPercentage: number };
}

/**
 * What the app does after a lesson, quiz or exam, for the signed-in test user: the completion pipeline issues the
 * certificate when every step is done and the learner holds the course (there is no public "issue" action).
 */
export async function issueCertificate({ courseId }: { courseId: string }): Promise<CertificateAttempt> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };
  const outcome = await completeCourseIfDone(session.user.id, courseId);
  if (!outcome.certificate) {
    return { success: false, error: "NOT_ELIGIBLE", eligibility: { completionPercentage: outcome.progress.percent } };
  }
  return { success: true, certificate: outcome.certificate, alreadyIssued: !outcome.justIssued };
}
