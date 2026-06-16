"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  id: string | number;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-shadow ${
        isDragging ? "opacity-50 shadow-md ring-1 ring-ring" : "hover:shadow-md hover:border-border/80"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 touch-none"
        aria-label="Réordonner"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
