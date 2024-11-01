import { useCallback, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface PreviewPosition {
  position: Position;
  updatePosition: (event: React.MouseEvent, elementRect: DOMRect) => void;
}

export function usePreviewPosition(
  previewWidth = 400,
  previewHeight = 400,
  margin = 20
): PreviewPosition {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const updatePosition = useCallback(
    (event: React.MouseEvent, elementRect: DOMRect) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Position par défaut (à droite de l'élément)
      let x = elementRect.right + margin;
      let y = elementRect.top;

      // Vérifier si la prévisualisation dépasse à droite
      if (x + previewWidth > viewportWidth) {
        x = elementRect.left - previewWidth - margin;
      }

      // Vérifier si la prévisualisation dépasse en bas
      if (y + previewHeight > viewportHeight) {
        y = viewportHeight - previewHeight - margin;
      }

      // Vérifier si la prévisualisation dépasse en haut
      if (y < 0) {
        y = margin;
      }

      setPosition({ x, y });
    },
    [previewWidth, previewHeight, margin]
  );

  return { position, updatePosition };
}
