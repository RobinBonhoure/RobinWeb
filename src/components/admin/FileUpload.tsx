"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/actions/upload";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
}

export function FileUpload({
  value,
  onChange,
  folder = "uploads",
  accept = "*/*",
  label = "Ajouter un fichier",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const url = await uploadFile(fd);
      onChange(url);
      toast.success("Fichier uploadé");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4 shrink-0" />
          <a href={value} target="_blank" rel="noreferrer" className="underline truncate max-w-xs">
            Fichier actuel
          </a>
          <button type="button" onClick={() => onChange("")} aria-label="Supprimer">
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-2"
      >
        <Upload className="size-4" />
        {uploading ? "Upload…" : value ? "Changer" : label}
      </Button>
    </div>
  );
}
