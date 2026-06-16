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
import { ExperienceForm } from "./ExperienceForm";
import { deleteExperience, reorderExperiences } from "@/lib/actions/experiences";
import type { Experience } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export function ExperienceList({ initial }: { initial: Experience[] }) {
  const [items, setItems] = useState(initial);
  const [editTarget, setEditTarget] = useState<Experience | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await reorderExperiences(reordered.map((item, idx) => ({ id: item.id, order: idx })));
  };

  return (
    <>
      <Toaster richColors />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Expériences</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} entrée{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" className="gap-2 rounded-lg" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />Ajouter
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((exp) => (
              <SortableItem key={exp.id} id={exp.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{exp.roleFr} · {exp.period}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="size-8 rounded-md" onClick={() => setEditTarget(exp)} aria-label="Modifier">
                      <Pencil className="size-3.5" />
                    </Button>
                    <DeleteButton onDelete={async () => { await deleteExperience(exp.id); setItems((p) => p.filter((i) => i.id !== exp.id)); }} />
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Aucune expérience — ajoutez-en une.</p>
        </div>
      )}

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier l&apos;expérience</DialogTitle></DialogHeader>
          {editTarget && <ExperienceForm experience={editTarget} onSuccess={() => { setEditTarget(null); window.location.reload(); }} />}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ajouter une expérience</DialogTitle></DialogHeader>
          <ExperienceForm defaultOrder={items.length} onSuccess={() => { setAddOpen(false); window.location.reload(); }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
