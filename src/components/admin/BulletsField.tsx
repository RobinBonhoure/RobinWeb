"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}

export function BulletsField({ value, onChange, label }: Props) {
  const add = () => onChange([...value, ""]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, v: string) =>
    onChange(value.map((item, idx) => (idx === i ? v : item)));

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      {value.map((bullet, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={bullet}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Bullet ${i + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(i)}
            aria-label="Supprimer"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus className="size-3.5" />
        Ajouter
      </Button>
    </div>
  );
}
