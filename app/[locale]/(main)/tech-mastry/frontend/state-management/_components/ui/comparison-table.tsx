"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";

type Rating = "excellent" | "good" | "average" | "poor" | "na";

interface ComparisonItem {
  feature: string;
  description: string;
  ratings: Record<string, Rating>;
}

interface ComparisonTableProps {
  title: string;
  libraries: string[];
  items: ComparisonItem[];
}

export function ComparisonTable({
  title,
  libraries,
  items,
}: ComparisonTableProps) {
  const getRatingIcon = (rating: Rating) => {
    switch (rating) {
      case "excellent":
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-1" />
            <span>Excellent</span>
          </div>
        );
      case "good":
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-blue-500 mr-1" />
            <span>Bon</span>
          </div>
        );
      case "average":
        return (
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-1" />
            <span>Moyen</span>
          </div>
        );
      case "poor":
        return (
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-1" />
            <span>Faible</span>
          </div>
        );
      case "na":
        return (
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 text-gray-400 mr-1" />
            <span>N/A</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getRatingColor = (rating: Rating) => {
    switch (rating) {
      case "excellent":
        return "bg-green-50 dark:bg-green-900/20";
      case "good":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "average":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "poor":
        return "bg-red-50 dark:bg-red-900/20";
      case "na":
        return "";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Fonctionnalité</TableHead>
              {libraries.map((lib) => (
                <TableHead key={lib} className="text-center">
                  {lib}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div>{item.feature}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </TableCell>
                {libraries.map((lib) => (
                  <TableCell
                    key={lib}
                    className={`text-center ${getRatingColor(
                      item.ratings[lib]
                    )}`}
                  >
                    {getRatingIcon(item.ratings[lib])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
