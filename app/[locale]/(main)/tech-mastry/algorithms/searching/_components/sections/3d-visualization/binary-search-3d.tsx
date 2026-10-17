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

// Types pour la visualisation
type ElementState =
  | "default"
  | "current"
  | "found"
  | "not-found"
  | "searching"
  | "range";

type ArrayElement = {
  value: number;
  state: ElementState;
};

function createSortedArray(size: number): ArrayElement[] {
  const newArray: ArrayElement[] = [];
  for (let i = 0; i < size; i++) {
    newArray.push({
      value: i * 2 + 1, // Valeurs impaires pour un tableau trié
      state: "default",
    });
  }
  return newArray;
}

export function BinarySearch3D() {
  // État pour le tableau et la cible
  const arraySize = 15; // Taille fixe pour simplifier
  const [array, setArray] = useState<ArrayElement[]>(() => createSortedArray(arraySize));
  const [target, setTarget] = useState<number>(15);

  // Obtenir la couleur en fonction de l'état
  const getColorForState = useCallback((state: string): number => {
    switch (state) {
      case "default":
        return 0xcccccc;
      case "current":
        return 0x3b82f6; // blue-500
      case "found":
        return 0x10b981; // emerald-500
      case "not-found":
        return 0xef4444; // red-500
      case "range":
        return 0xf59e0b; // amber-500
      case "searching":
        return 0x8b5cf6; // violet-500
      default:
        return 0xcccccc;
    }
  }, []);

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

  // Type pour les étapes de l'algorithme
  type SearchStep = {
    left?: number;
    right?: number;
    mid?: number;
    state:
      | "default"
      | "current"
      | "found"
      | "not-found"
      | "searching"
      | "range";
    message?: string;
  };

  // Algorithme de recherche binaire
  const binarySearch = () => {
    const steps: SearchStep[] = [];
    const arr = array.map((item) => item.value);
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      steps.push({
        left,
        right,
        mid,
        state: "searching",
        message: `Comparaison de ${arr[mid]} avec ${target}`,
      });

      if (arr[mid] === target) {
        steps.push({
          left,
          right,
          mid,
          state: "found",
          message: `L'élément ${target} est trouvé à l'index ${mid}.`,
        });
        return { steps, found: true, foundIndex: mid };
      }

      if (arr[mid] < target) {
        left = mid + 1;
        steps.push({
          left,
          right,
          state: "range",
          message: `L'élément ${arr[mid]} est plus petit que ${target}, on cherche à droite.`,
        });
      } else {
        right = mid - 1;
        steps.push({
          left,
          right,
          state: "range",
          message: `L'élément ${arr[mid]} est plus grand que ${target}, on cherche à gauche.`,
        });
      }
    }

    steps.push({
      state: "not-found",
      message: `L'élément ${target} n'est pas trouvé dans le tableau.`,
    });

    return { steps, found: false, foundIndex: -1 };
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
    const { steps } = binarySearch();
    setTotalSteps(steps.length);

    // Fonction pour animer les étapes
    let stepIndex = 0;

    const animate = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setCurrentStep(stepIndex + 1);
        setResult(step.message || "");

        // Mettre à jour l'état du tableau
        setArray((prev) => {
          const newArray = [...prev].map((item) => ({
            ...item,
            state: "default" as ElementState,
          }));

          if (step.state === "searching") {
            // Marquer l'élément en cours de comparaison
            if (step.mid !== undefined) {
              newArray[step.mid].state = "current";
            }

            // Marquer la plage de recherche
            if (step.left !== undefined && step.right !== undefined) {
              for (let i = step.left; i <= step.right; i++) {
                if (i !== step.mid && i < newArray.length) {
                  newArray[i].state = "range";
                }
              }
            }
          } else if (step.state === "found") {
            // Marquer l'élément trouvé
            if (step.mid !== undefined) {
              newArray[step.mid].state = "found";
            }
          } else if (step.state === "not-found") {
            // Marquer tous les éléments comme non trouvés
            newArray.forEach((item) => {
              item.state = "not-found";
            });
          } else if (step.state === "range") {
            // Marquer la plage de recherche
            if (step.left !== undefined && step.right !== undefined) {
              for (let i = step.left; i <= step.right; i++) {
                if (i < newArray.length) {
                  newArray[i].state = "range";
                }
              }
            }
          }

          return newArray;
        });

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

  // Mettre en pause ou reprendre l'animation - non utilisé pour l'instant mais pourrait être utile plus tard
  // const toggleAnimation = () => {
  //   setIsRunning(!isRunning);
  //   if (!isRunning) {
  //     runAnimation();
  //   } else if (animationRef.current) {
  //     cancelAnimationFrame(animationRef.current);
  //     animationRef.current = null;
  //   }
  // };

  // Créer les cubes pour représenter le tableau
  const createCubes = useCallback(() => {
    if (!sceneRef.current) return;

    // Supprimer uniquement les cubes et sprites, pas les lumières ni le plan
    const objectsToRemove = [];
    for (let i = 0; i < sceneRef.current.children.length; i++) {
      const object = sceneRef.current.children[i];
      // Ne supprime pas les lumières ni le plan (qui est le premier mesh ajouté)
      if (
        (object instanceof THREE.Mesh &&
          object.geometry instanceof THREE.BoxGeometry) ||
        object instanceof THREE.Sprite
      ) {
        objectsToRemove.push(object);
      }
    }

    // Maintenant supprime les objets identifiés
    objectsToRemove.forEach((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      } else if (object instanceof THREE.Sprite) {
        if (
          object.material instanceof THREE.SpriteMaterial &&
          object.material.map
        ) {
          object.material.map.dispose();
        }
        object.material.dispose();
      }
      sceneRef.current?.remove(object);
    });

    cubesRef.current = [];

    // Créer de nouveaux cubes
    const cubes: THREE.Mesh[] = [];

    array.forEach((item, index) => {
      const cubeGeometry = new THREE.BoxGeometry(1, item.value / 2, 1);
      const cubeMaterial = new THREE.MeshStandardMaterial({
        color: getColorForState(item.state),
      });

      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(
        index * 1.5 - (array.length * 1.5) / 2 + 0.75,
        item.value / 4,
        0
      );

      // Créer un sprite pour afficher la valeur
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = 64;
        canvas.height = 64;
        context.fillStyle = "#000000";
        context.font = "Bold 24px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(item.value.toString(), 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(
          index * 1.5 - (array.length * 1.5) / 2 + 0.75,
          item.value / 2 + 1,
          0
        );
        sprite.scale.set(1, 1, 1);

        sceneRef.current?.add(cube);
        sceneRef.current?.add(sprite);
      } else {
        sceneRef.current?.add(cube);
      }

      cubes.push(cube);
    });

    cubesRef.current = cubes;
  }, [array, getColorForState]);

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
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Capturer la référence au container pour le nettoyage
    const container = containerRef.current;

    // Nettoyer lors du démontage
    return () => {
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
      }

      // Nettoyer la scène complète
      if (sceneRef.current) {
        // Supprimer tous les objets de la scène
        while (sceneRef.current.children.length > 0) {
          const object = sceneRef.current.children[0];
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          } else if (object instanceof THREE.Sprite) {
            if (
              object.material instanceof THREE.SpriteMaterial &&
              object.material.map
            ) {
              object.material.map.dispose();
            }
            object.material.dispose();
          }
          sceneRef.current.remove(object);
        }

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

    array.forEach((item, index) => {
      if (index < cubesRef.current.length) {
        const cube = cubesRef.current[index];
        if (
          !Array.isArray(cube.material) &&
          cube.material instanceof THREE.MeshStandardMaterial
        ) {
          cube.material.color.set(getColorForState(item.state));
        }
      }
    });
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
        <div className="flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#cccccc]"></div>
            <span>Non visité</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
            <span>Plage de recherche</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span>Élément courant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <span>Trouvé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500"></div>
            <span>Non trouvé</span>
          </div>
        </div>

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
