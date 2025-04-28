"use client";

import { useEffect } from "react";
import { initParticles } from "./particles";

export function ParticlesInitializer() {
  useEffect(() => {
    // Initialiser les particules après le rendu du composant
    initParticles();

    // Réinitialiser les particules lors du redimensionnement de la fenêtre
    const handleResize = () => {
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
