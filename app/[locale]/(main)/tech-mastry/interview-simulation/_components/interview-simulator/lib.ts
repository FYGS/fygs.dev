// Format time as MM:SS
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// French display labels for question difficulty
export const difficultyLabels: Record<string, string> = {
  easy: "facile",
  medium: "moyen",
  hard: "difficile",
};
