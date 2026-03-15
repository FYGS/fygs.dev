"use client";

import { useCallback } from "react";

interface HeadingAnchorProps {
  id: string;
  className?: string;
}

export function HeadingAnchor({ id, className }: HeadingAnchorProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const url = new URL(window.location.href);
      url.hash = id;
      navigator.clipboard.writeText(url.toString());
      window.history.pushState(null, "", url.toString());
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    },
    [id],
  );

  return (
    <a
      href={"#" + id}
      className={className}
      aria-label="Copy link to section"
      onClick={handleClick}
    >
      #
    </a>
  );
}
