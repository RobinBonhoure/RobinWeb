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
import { EducationForm } from "./EducationForm";
import { deleteEducation, reorderEducations } from "@/lib/actions/educations";
import type { Education } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export function EducationList({ initial }: { initial: Education[] }) {
  const [items, setItems] = useState(initial);
  const [editTarget, setEditTarget] = useState<Education | null>(null);
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
    await reorderEducations(reordered.map((item, idx) => ({ id: item.id, order: idx })));
  };

  return (
    <>
      <Toaster richColors />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Formations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} entrée{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" className="gap-2 rounded-lg" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />Ajouter
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((edu) => (
              <SortableItem key={edu.id} id={edu.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{edu.school}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{edu.titleFr} · {edu.period}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="size-8 rounded-md" onClick={() => setEditTarget(edu)} aria-label="Modifier">
                      <Pencil className="size-3.5" />
                    </Button>
                    <DeleteButton onDelete={async () => { await deleteEducation(edu.id); setItems((p) => p.filter((i) => i.id !== edu.id)); }} />
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Aucune formation — ajoutez-en une.</p>
        </div>
      )}

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier la formation</DialogTitle></DialogHeader>
          {editTarget && <EducationForm education={editTarget} onSuccess={() => { setEditTarget(null); window.location.reload(); }} />}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ajouter une formation</DialogTitle></DialogHeader>
          <EducationForm defaultOrder={items.length} onSuccess={() => { setAddOpen(false); window.location.reload(); }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
