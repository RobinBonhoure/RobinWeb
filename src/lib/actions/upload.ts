"use server";

import { put } from "@vercel/blob";
import { requireSession } from "@/lib/session";

/** Uploads a file to Vercel Blob and returns its public URL. */
export async function uploadFile(formData: FormData): Promise<string> {
  await requireSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }
  const folder = (formData.get("folder") as string | null) ?? "uploads";
  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}
