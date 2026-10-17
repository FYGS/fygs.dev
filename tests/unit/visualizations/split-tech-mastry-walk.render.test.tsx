import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";
import { PracticeExercises } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/practice-exercises";
import { FilesystemCaseStudy } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/case-studies/filesystem-case";
import { ServerCaseStudy } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/case-studies/server-case";
import { MemoizationSection } from "@/app/[locale]/(main)/tech-mastry/frontend/performance/_components/sections/memoization-section";
import { AriaSection } from "@/app/[locale]/(main)/tech-mastry/frontend/accessibility/_components/sections/aria-section";
import { GraphDatabaseView } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql/graph-database-view";
import MachineLearningPage from "@/app/[locale]/(main)/tech-mastry/data-science/machine-learning/page";
import ArraysPage from "@/app/[locale]/(main)/tech-mastry/data-structures/arrays/page";
import { ServiceMeshExplanation } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/service-mesh-explanation";
import { DPRealWorld } from "@/app/[locale]/(main)/tech-mastry/algorithms/_components/dp-real-world";
import { DynamicProgrammingGuide } from "@/app/[locale]/(main)/tech-mastry/algorithms/_components/dynamic-programming-guide";
import { SortingQuizzes } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/sorting-quizzes";
import { SortingAlgorithmsOverview } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/sorting-algorithms-overview";
import { SearchingAlgorithmsOverview } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/searching-algorithms-overview";
import { BinarySearch3D } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/3d-visualization/binary-search-3d";
import { renderWalkSim } from "./render-walk-sim";

// jsdom has no WebGL: every three.js class becomes a stub that accepts any call, so that
// the React side (state, controls, animation steps) can be walked.
vi.mock("three", () => {
  const stub = (): unknown => {
    let canvas: HTMLCanvasElement | null = null;
    return new Proxy(function () {}, {
      get: (_t, prop) =>
        prop === "domElement"
          ? (canvas ??= document.createElement("canvas"))
          : prop === Symbol.toPrimitive
            ? () => 0
            : stub(),
      apply: () => stub(),
      construct: () => stub() as object,
      set: () => true,
    });
  };
  const names = [
    "Scene", "Color", "PerspectiveCamera", "WebGLRenderer", "AmbientLight", "DirectionalLight",
    "PlaneGeometry", "MeshStandardMaterial", "DoubleSide", "Mesh", "BoxGeometry", "Sprite",
    "SpriteMaterial", "CanvasTexture",
  ];
  return Object.fromEntries(
    names.map((name) => [name, class { constructor() { return stub() as object; } }]),
  );
});
vi.mock("three/examples/jsm/controls/OrbitControls.js", () => ({
  OrbitControls: class { update() {} },
}));

// Characterisation of the large components that were split into smaller files: the
// markup reached by clicking through them must not change when the files move.
Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn() }, configurable: true });

const cases: [string, ComponentType][] = [
  ["practice-exercises", PracticeExercises],
  ["filesystem-case", FilesystemCaseStudy],
  ["server-case", ServerCaseStudy],
  ["memoization-section", MemoizationSection],
  ["aria-section", AriaSection],
  ["graph-database-simple", () => <GraphDatabaseView queryType="simple" />],
  ["graph-database-complex", () => <GraphDatabaseView queryType="complex" />],
  ["graph-database-aggregation", () => <GraphDatabaseView queryType="aggregation" />],
  ["graph-database-update", () => <GraphDatabaseView queryType="update" />],
  ["machine-learning-page", MachineLearningPage],
  ["arrays-page", ArraysPage],
  ["service-mesh-explanation-istio", () => <ServiceMeshExplanation serviceMeshType="istio" />],
  ["service-mesh-explanation-linkerd", () => <ServiceMeshExplanation serviceMeshType="linkerd" />],
  ["service-mesh-explanation-consul", () => <ServiceMeshExplanation serviceMeshType="consul" />],
  ["service-mesh-explanation-app-mesh", () => <ServiceMeshExplanation serviceMeshType="app-mesh" />],
  ["dp-real-world", DPRealWorld],
  ["dynamic-programming-guide", DynamicProgrammingGuide],
  ["sorting-quizzes", SortingQuizzes],
  ["sorting-algorithms-overview", SortingAlgorithmsOverview],
  ["searching-algorithms-overview", SearchingAlgorithmsOverview],
  ["binary-search-3d", BinarySearch3D],
];

describe("tech-mastry components split into smaller files", () => {
  it.each(cases)("%s renders the same markup in every state reachable by clicking", (_name, Component) => {
    const { hashes } = renderWalkSim(Component, { passes: 2, stepMs: 700 });
    expect(hashes).toMatchSnapshot();
  });
});

vi.setConfig({ testTimeout: 60000 });
