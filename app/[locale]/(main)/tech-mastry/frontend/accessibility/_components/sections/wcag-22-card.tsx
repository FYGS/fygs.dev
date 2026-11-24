import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const newCriteria = [
  {
    id: "2.4.11",
    name: "Focus Not Obscured (Minimum)",
    level: "AA",
    summary:
      "A focused element must not be entirely hidden by author-created content such as sticky headers, cookie banners or chat widgets. Use scroll-padding / scroll-margin so focused items scroll into a visible area.",
  },
  {
    id: "2.5.7",
    name: "Dragging Movements",
    level: "AA",
    summary:
      "Anything that can be done by dragging must also be possible with a single pointer without dragging (buttons to move an item, click-to-place, and so on).",
  },
  {
    id: "2.5.8",
    name: "Target Size (Minimum)",
    level: "AA",
    summary:
      "Pointer targets are at least 24 by 24 CSS pixels, unless there is enough spacing around them, the target is inline in text, or the size is determined by the browser. (The 44 by 44 pixel target size of 2.5.5 remains a level AAA criterion.)",
  },
  {
    id: "3.2.6",
    name: "Consistent Help",
    level: "A",
    summary:
      "When a help mechanism (contact details, chat, FAQ link) appears on several pages, it keeps the same relative place in the page.",
  },
  {
    id: "3.3.7",
    name: "Redundant Entry",
    level: "A",
    summary:
      "Information already entered in the same process is auto-populated or selectable, instead of asking the user to type it again (with exceptions such as security).",
  },
  {
    id: "3.3.8",
    name: "Accessible Authentication (Minimum)",
    level: "AA",
    summary:
      "Logging in must not rely on a cognitive function test (remembering a password, solving a puzzle) unless an alternative exists: allow password managers and paste, and offer other methods such as passkeys or email links.",
  },
];

export function Wcag22Card() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>WCAG 2.2 at a glance</CardTitle>
        <CardDescription>
          WCAG 2.2 is a W3C Recommendation (October 2023). It is backward
          compatible with 2.1 and adds new success criteria; criterion 4.1.1
          Parsing was removed as obsolete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          The contrast thresholds shown in the Color Contrast tab are unchanged
          since WCAG 2.0 and 2.1. New criteria at levels A and AA introduced by
          2.2:
        </p>
        <ul className="space-y-3">
          {newCriteria.map((c) => (
            <li key={c.id} className="text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{c.id}</Badge>
                <strong>{c.name}</strong>
                <Badge variant="secondary">Level {c.level}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{c.summary}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          WCAG 2.2 also adds level AAA criteria (2.4.12 Focus Not Obscured
          (Enhanced), 2.4.13 Focus Appearance, 3.3.9 Accessible Authentication
          (Enhanced)). Which version and level you must meet depends on the
          applicable regulation or contract: check it, since some texts still
          reference WCAG 2.1.
        </p>
      </CardContent>
    </Card>
  );
}
