"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info, Maximize, Minimize, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSortedArray } from "./binary-search-3d/elements";
import { Legend } from "./binary-search-3d/legend";
import {
  disposeScene,
  rebuildCubes,
  updateCubeColors,
} from "./binary-search-3d/scene";
import { applySearchStep, binarySearchSteps } from "./binary-search-3d/search-steps";
import type { ArrayElement } from "./binary-search-3d/types";

export function BinarySearch3D() {
  // État pour le tableau et la cible
  const arraySize = 15; // Taille fixe pour simplifier
  const [array, setArray] = useState<ArrayElement[]>(() => createSortedArray(arraySize));
  const [target, setTarget] = useState<number>(15);

  // État pour l'animation
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(50);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [result, setResult] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Références pour l'animation et le rendu 3D
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cubesRef = useRef<THREE.Mesh[]>([]);

  // Générer un tableau trié
  const generateArray = useCallback(() => {
    const newArray = createSortedArray(arraySize);
    setArray(newArray);

    // Réinitialiser la visualisation
    setIsRunning(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setResult("");
  }, [arraySize]);

  // Réinitialiser la visualisation
  const resetVisualization = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setResult("");

    // Réinitialiser l'état des éléments
    setArray((prev) =>
      prev.map((item) => ({
        ...item,
        state: "default",
      }))
    );

    // Annuler toute animation en cours
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Mettre à jour la visualisation 3D
    updateCubesState();
  };

  // Exécuter l'animation
  const runAnimation = () => {
    // Annuler toute animation en cours
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Réinitialiser l'état
    resetVisualization();

    // Obtenir les étapes de l'algorithme
    const { steps } = binarySearchSteps(
      array.map((item) => item.value),
      target
    );
    setTotalSteps(steps.length);

    // Fonction pour animer les étapes
    let stepIndex = 0;

    const animate = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setCurrentStep(stepIndex + 1);
        setResult(step.message || "");

        // Mettre à jour l'état du tableau
        setArray((prev) => applySearchStep(prev, step));

        // Mettre à jour la visualisation 3D
        updateCubesState();

        // Planifier la prochaine étape
        stepIndex++;
        const delay = 1000 - speed * 10; // Convertir la vitesse en délai
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, delay);
      } else {
        // Animation terminée
        setIsRunning(false);
      }
    };

    // Démarrer l'animation
    setIsRunning(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  // Créer les cubes pour représenter le tableau
  const createCubes = useCallback(() => {
    if (!sceneRef.current) return;
    cubesRef.current = rebuildCubes(sceneRef.current, array);
  }, [array]);

  // Initialiser la scène 3D
  useEffect(() => {
    if (!containerRef.current) return;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);
    cameraRef.current = camera;

    // Créer le renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ajouter les contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Ajouter l'éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Ajouter un plan
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    scene.add(plane);

    // Créer les cubes pour représenter le tableau
    createCubes();

    // Fonction d'animation
    let frameId = 0;
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      frameId = requestAnimationFrame(animate);
    };

    animate();

    // Capturer la référence au container pour le nettoyage
    const container = containerRef.current;

    // Nettoyer lors du démontage
    return () => {
      // Arrêter la boucle de rendu
      cancelAnimationFrame(frameId);

      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
      }

      // Nettoyer la scène complète
      if (sceneRef.current) {
        // Supprimer tous les objets de la scène
        disposeScene(sceneRef.current);

        cubesRef.current = [];
      }
    };
  }, [createCubes]);

  // Mettre à jour la taille du renderer lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && rendererRef.current && cameraRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Mettre à jour l'état des cubes
  const updateCubesState = () => {
    if (!sceneRef.current) return;

    updateCubeColors(cubesRef.current, array);
  };

  // Basculer en mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);

    // Mettre à jour la taille du renderer après un court délai
    setTimeout(() => {
      if (containerRef.current && rendererRef.current && cameraRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    }, 100);
  };

  // Nettoyer l'animation lors du démontage
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Mettre à jour les cubes lorsque le tableau change
  useEffect(() => {
    if (sceneRef.current) {
      createCubes();
    }
  }, [array.length, createCubes]);

  return (
    <Card
      className={`w-full ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recherche Binaire en 3D</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => resetVisualization()}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Visualisation en 3D de l&apos;algorithme de recherche binaire.
          Utilisez la souris pour faire pivoter la vue.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contrôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target">Élément à rechercher</Label>
            <div className="flex items-center gap-2">
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-24"
                min={1}
                max={100}
              />
              <Button onClick={runAnimation} disabled={isRunning}>
                {isRunning ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isRunning ? "Pause" : "Démarrer"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="speed">Vitesse</Label>
              <span className="text-sm text-muted-foreground">{speed}%</span>
            </div>
            <Slider
              id="speed"
              min={10}
              max={100}
              step={10}
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
            />
          </div>
        </div>

        {/* Visualisation 3D */}
        <div
          ref={containerRef}
          className={`border rounded-md ${
            isFullscreen ? "h-[calc(100vh-200px)]" : "h-[400px]"
          }`}
        ></div>

        {/* Légende */}
        <Legend />

        {/* Résultat et progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span>
                {result || "Cliquez sur Démarrer pour lancer la visualisation"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Étape {currentStep}/{totalSteps}
            </div>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-primary"
              style={{
                width: totalSteps
                  ? `${(currentStep / totalSteps) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => generateArray()}>
          Générer un nouveau tableau
        </Button>
        <Button
          variant="outline"
          onClick={() => setTarget(Math.floor(Math.random() * (arraySize * 2)))}
        >
          Cible aléatoire
        </Button>
      </CardFooter>
    </Card>
  );
}
