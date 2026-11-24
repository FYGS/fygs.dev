import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { monthlyReportCsv, parseRange } from "@/lib/services/admin-analytics";

/** The monthly figures of the analytics page, as a CSV file. Administrators only. */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const months = parseRange(new URL(request.url).searchParams.get("range"));
  const csv = await monthlyReportCsv(months);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fygs-analytics-${months}-mois.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
