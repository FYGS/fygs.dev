"use client";

import { useEffect, useRef } from "react";

export function ParticlesContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 50;
    
    // Vider le conteneur des particules existantes
    container.innerHTML = "";

    // Créer de nouvelles particules
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      
      // Position aléatoire
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Taille aléatoire
      const size = Math.random() * 3 + 1;
      
      // Couleurs modernes et futuristes
      const colors = [
        "rgba(99, 102, 241, 0.6)", // indigo-500
        "rgba(168, 85, 247, 0.6)",  // purple-500
        "rgba(236, 72, 153, 0.6)",  // pink-500
        "rgba(14, 165, 233, 0.6)",  // sky-500
        "rgba(79, 70, 229, 0.6)",   // indigo-600
        "rgba(217, 70, 239, 0.6)",  // fuchsia-500
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Appliquer les styles avec Tailwind quand possible, inline styles quand nécessaire
      particle.className = "absolute rounded-full";
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.opacity = (Math.random() * 0.5 + 0.3).toString();
      
      // Animation sophistiquée avec variation
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      // Choisir aléatoirement entre différentes animations
      const animations = ["float", "pulse", "drift"];
      const animation = animations[Math.floor(Math.random() * animations.length)];
      
      // Appliquer l'animation
      particle.style.animation = `${animation} ${duration}s ${delay}s infinite alternate ease-in-out`;
      
      // Ajouter un effet de flou pour certaines particules
      if (Math.random() > 0.7) {
        particle.style.filter = `blur(${Math.random() * 2}px)`;
      }
      
      // Ajouter la particule au conteneur
      container.appendChild(particle);
    }

    // Ajouter des animations CSS
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 0.3;
        }
        25% {
          transform: translate(10px, 10px) scale(1.2);
          opacity: 0.6;
        }
        50% {
          transform: translate(0, 20px) scale(1);
          opacity: 0.4;
        }
        75% {
          transform: translate(-10px, 10px) scale(0.8);
          opacity: 0.5;
        }
        100% {
          transform: translate(0, 0) scale(1);
          opacity: 0.3;
        }
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.5;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 0.5;
        }
      }

      @keyframes drift {
        0% {
          transform: rotate(0deg) translateX(0) translateY(0);
        }
        25% {
          transform: rotate(3deg) translateX(5px) translateY(-5px);
        }
        50% {
          transform: rotate(0deg) translateX(10px) translateY(5px);
        }
        75% {
          transform: rotate(-3deg) translateX(5px) translateY(10px);
        }
        100% {
          transform: rotate(0deg) translateX(0) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Nettoyer lors du démontage du composant
    return () => {
      container.innerHTML = "";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
