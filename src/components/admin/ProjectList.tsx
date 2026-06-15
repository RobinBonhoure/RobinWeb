"use client";

import { useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { DeleteButton } from "./DeleteButton";
import { ProjectForm } from "./ProjectForm";
import { deleteProject, reorderProjects } from "@/lib/actions/projects";
import type { Project } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Star } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export function ProjectList({ initial }: { initial: Project[] }) {
  const [items, setItems] = useState(initial);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    setItems(reordered);
    await reorderProjects(reordered.map((item, idx) => ({ id: item.id, order: idx })));
  };

  return (
    <>
      <Toaster richColors />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Projets</h1>
        <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />Ajouter
        </Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((project) => (
              <SortableItem key={project.id} id={project.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {project.featured && <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{project.titleFr}</p>
                      <p className="text-xs text-muted-foreground">{project.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditTarget(project)} aria-label="Modifier"><Pencil className="size-4" /></Button>
                    <DeleteButton onDelete={async () => { await deleteProject(project.id); setItems((p) => p.filter((i) => i.id !== project.id)); }} />
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {items.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">
          Aucun projet pour l&apos;instant — ajoutez-en un.
        </p>
      )}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier le projet</DialogTitle></DialogHeader>
          {editTarget && <ProjectForm project={editTarget} onSuccess={() => { setEditTarget(null); window.location.reload(); }} />}
        </DialogContent>
      </Dialog>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ajouter un projet</DialogTitle></DialogHeader>
          <ProjectForm defaultOrder={items.length} onSuccess={() => { setAddOpen(false); window.location.reload(); }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
