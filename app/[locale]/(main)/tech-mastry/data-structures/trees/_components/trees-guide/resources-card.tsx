import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResourcesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BookIcon className="h-5 w-5 text-primary" />
          Ressources et Lectures Complémentaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Introduction to Algorithms</strong> par Cormen,
              Leiserson, Rivest et Stein - Chapitres sur les arbres et
              graphes
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Algorithms, 4th Edition</strong> par Robert Sedgewick
              et Kevin Wayne
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Visualgo</strong> - Visualisations interactives
              d&apos;algorithmes et structures de données
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>LeetCode</strong> - Collection de problèmes sur les
              arbres et graphes pour s&apos;entraîner
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

// Book icon component
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
