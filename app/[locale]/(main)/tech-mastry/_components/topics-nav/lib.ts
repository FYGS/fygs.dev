export const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Nouveau":
      return "default";
    case "Essentiel":
      return "secondary";
    case "Avancé":
      return "outline";
    case "Expert":
      return "destructive";
    case "Soft Skills":
      return "blue";
    case "Interactif":
      return "green";
    default:
      return "secondary";
  }
};
