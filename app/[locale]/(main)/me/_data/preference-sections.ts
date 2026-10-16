import { Building2, Calendar, Clock, MapPin, Train } from "lucide-react";
import type { CvData } from "./cv-types";

export function buildPreferenceSections(cvData: CvData) {
  return [
    {
      icon: Clock,
      title: cvData.preferences.workSchedule.title,
      options: ["5 days/week", "1-4 days/week"],
      current: "5 days/week",
      details: {
        "5 days/week": cvData.preferences.workSchedule.detail5days,
        "1-4 days/week": cvData.preferences.workSchedule.detail1to4days,
      },
    },
    {
      icon: Calendar,
      title: cvData.preferences.contractDuration.title,
      options: ["0-6 months", "6+ months"],
      current: "6+ months",
      details: {
        "0-6 months": cvData.preferences.contractDuration.detailShort,
        "6+ months": cvData.preferences.contractDuration.detailLong,
      },
    },
    {
      icon: Building2,
      title: cvData.preferences.workEnvironment.title,
      options: ["On-site", "Hybrid", "Remote"],
      current: "Hybrid",
      details: {
        "On-site": cvData.preferences.workEnvironment.detailOnsite,
        Hybrid: cvData.preferences.workEnvironment.detailHybrid,
        Remote: cvData.preferences.workEnvironment.detailRemote,
      },
    },
    {
      icon: Train,
      title: cvData.preferences.mobility.title,
      options: ["Île-de-France region"],
      current: "Île-de-France region",
      details: {
        "Île-de-France region": cvData.preferences.mobility.detail,
      },
    },
    {
      icon: MapPin,
      title: cvData.preferences.location.title,
      options: ["Paris, France"],
      current: "Paris, France",
      details: {
        "Paris, France": cvData.preferences.location.detail,
      },
    },
  ];
}
