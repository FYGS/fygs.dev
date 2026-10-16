export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  switch (difficulty) {
    case "beginner":
      return (
        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded border border-green-500/20">
          Beginner
        </span>
      );
    case "intermediate":
      return (
        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/20">
          Intermediate
        </span>
      );
    case "advanced":
      return (
        <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded border border-orange-500/20">
          Advanced
        </span>
      );
    case "expert":
      return (
        <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded border border-red-500/20">
          Expert
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 bg-gray-500/10 text-gray-500 text-xs rounded border border-gray-500/20">
          Unknown
        </span>
      );
  }
}
