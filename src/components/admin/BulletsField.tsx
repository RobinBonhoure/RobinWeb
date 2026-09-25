"use client";

import { useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}

export function BulletsField({ value, onChange, label }: Props) {
  // Stable ids so inputs keep focus/state while being reordered
  const makeId = () => crypto.randomUUID();
  const [ids, setIds] = useState<string[]>(() => value.map(makeId));
  if (ids.length !== value.length) setIds(value.map(makeId));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const add = () => {
    setIds([...ids, makeId()]);
    onChange([...value, ""]);
  };
  const remove = (i: number) => {
    setIds(ids.filter((_, idx) => idx !== i));
    onChange(value.filter((_, idx) => idx !== i));
  };
  const update = (i: number, v: string) =>
    onChange(value.map((item, idx) => (idx === i ? v : item)));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    setIds(arrayMove(ids, oldIndex, newIndex));
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {value.map((bullet, i) => (
            <SortableBullet
              key={ids[i]}
              id={ids[i]}
              value={bullet}
              placeholder={`Bullet ${i + 1}`}
              onChange={(v) => update(i, v)}
              onRemove={() => remove(i)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus className="size-3.5" />
        Ajouter
      </Button>
    </div>
  );
}

interface BulletProps {
  id: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}

function SortableBullet({ id, value, placeholder, onChange, onRemove }: BulletProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-md bg-background ${isDragging ? "relative z-10 opacity-70" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 touch-none"
        aria-label="Réordonner"
      >
        <GripVertical className="size-4" />
      </button>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Supprimer">
        <X className="size-4" />
      </Button>
    </div>
  );
}
