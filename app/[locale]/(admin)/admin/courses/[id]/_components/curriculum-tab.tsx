"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Layers } from "lucide-react";
import { reorderModules } from "../_actions/module-actions";
import { reorderLessons } from "../_actions/lesson-actions";
import type { CurriculumTabProps } from "./curriculum/types";
import { SortableModuleCard } from "./curriculum/sortable-module-card";
import { AddModuleForm } from "./curriculum/add-module-form";

export function CurriculumTab({ courseId, modules }: CurriculumTabProps) {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id)),
  );
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [localModules, setLocalModules] = useState(modules);
  const [, startReorderTransition] = useTransition();

  // Sync local state when server data updates
  useEffect(() => {
    setLocalModules(modules);
  }, [modules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localModules.findIndex((m) => m.id === active.id);
    const newIndex = localModules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(localModules, oldIndex, newIndex);
    setLocalModules(reordered);

    // Persist new order
    startReorderTransition(async () => {
      const orders = reordered.map((m, i) => ({ id: m.id, order: i + 1 }));
      const result = await reorderModules(courseId, orders);
      if (result.success) {
        toast.success("Modules réordonnés");
        router.refresh();
      } else {
        // Revert on failure
        setLocalModules(modules);
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleLessonDragEnd = (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const mod = localModules.find((m) => m.id === moduleId);
    if (!mod) return;

    const oldIndex = mod.lessons.findIndex((l) => l.id === active.id);
    const newIndex = mod.lessons.findIndex((l) => l.id === over.id);
    const reorderedLessons = arrayMove(mod.lessons, oldIndex, newIndex);

    // Update local state
    setLocalModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: reorderedLessons } : m,
      ),
    );

    // Persist
    startReorderTransition(async () => {
      const orders = reorderedLessons.map((l, i) => ({
        id: l.id,
        order: i + 1,
      }));
      const result = await reorderLessons(moduleId, orders);
      if (result.success) {
        router.refresh();
      } else {
        setLocalModules(modules);
        toast.error(result.error || "Erreur");
      }
    });
  };

  const totalLessons = localModules.reduce(
    (acc, m) => acc + m.lessons.length,
    0,
  );
  const publishedLessons = localModules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.published).length,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {localModules.length}
          </div>
          <div className="text-body-sm text-muted-foreground">Modules</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {totalLessons}
          </div>
          <div className="text-body-sm text-muted-foreground">Leçons</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {publishedLessons}/{totalLessons}
          </div>
          <div className="text-body-sm text-muted-foreground">Publiées</div>
        </div>
      </div>

      {/* Modules List with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleModuleDragEnd}
      >
        <SortableContext
          items={localModules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {localModules.map((module) => (
              <SortableModuleCard
                key={module.id}
                module={module}
                courseId={courseId}
                isExpanded={expandedModules.has(module.id)}
                onToggle={() => toggleModule(module.id)}
                isAddingLesson={addingLessonTo === module.id}
                onStartAddLesson={() => setAddingLessonTo(module.id)}
                onCancelAddLesson={() => setAddingLessonTo(null)}
                onLessonAdded={() => {
                  setAddingLessonTo(null);
                  router.refresh();
                }}
                onModuleDeleted={() => router.refresh()}
                onLessonDragEnd={(event) =>
                  handleLessonDragEnd(module.id, event)
                }
                sensors={sensors}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Module */}
      {isAddingModule ? (
        <AddModuleForm
          courseId={courseId}
          nextOrder={modules.length + 1}
          onCancel={() => setIsAddingModule(false)}
          onCreated={() => {
            setIsAddingModule(false);
            router.refresh();
          }}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setIsAddingModule(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un module
        </Button>
      )}

      {/* Empty state */}
      {modules.length === 0 && !isAddingModule && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-heading-3 text-foreground mb-2">
              Aucun module
            </h3>
            <p className="text-body-sm text-muted-foreground text-center max-w-sm">
              Commencez par créer des modules pour structurer votre formation.
              Chaque module contiendra des leçons.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
