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
import { SkillForm } from "./SkillForm";
import { deleteSkill, reorderSkills } from "@/lib/actions/skills";
import type { Skill } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

const CATEGORY_LABELS: Record<string, string> = {
  stack: "Stack",
  fonctionnel: "Fonctionnel",
  qualite: "Qualités",
};

export function SkillList({ initial }: { initial: Skill[] }) {
  const [items, setItems] = useState(initial);
  const [editTarget, setEditTarget] = useState<Skill | null>(null);
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
    await reorderSkills(reordered.map((item, idx) => ({ id: item.id, order: idx })));
  };

  return (
    <>
      <Toaster richColors />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Compétences</h1>
        <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />Ajouter
        </Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((skill) => (
              <SortableItem key={skill.id} id={skill.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="secondary" className="shrink-0 text-xs">{CATEGORY_LABELS[skill.category] ?? skill.category}</Badge>
                    <p className="font-medium truncate">{skill.name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditTarget(skill)} aria-label="Modifier"><Pencil className="size-4" /></Button>
                    <DeleteButton onDelete={async () => { await deleteSkill(skill.id); setItems((p) => p.filter((i) => i.id !== skill.id)); }} />
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Modifier la compétence</DialogTitle></DialogHeader>
          {editTarget && <SkillForm skill={editTarget} onSuccess={() => { setEditTarget(null); window.location.reload(); }} />}
        </DialogContent>
      </Dialog>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Ajouter une compétence</DialogTitle></DialogHeader>
          <SkillForm defaultOrder={items.length} onSuccess={() => { setAddOpen(false); window.location.reload(); }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
