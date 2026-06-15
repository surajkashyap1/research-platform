import { createClient } from "@/lib/supabase/server";

const PROFILE_ASSETS_BUCKET = "profile-assets";
const MAX_PROFILE_ASSET_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_ASSET_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function safeFilename(name: string): string {
  const fallback = "upload";
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

export async function uploadProfileAsset({
  userId,
  file,
  folder,
}: {
  userId: string;
  file: File;
  folder: "avatars" | "certifications";
}): Promise<string> {
  if (file.size > MAX_PROFILE_ASSET_BYTES) {
    throw new Error("Profile uploads must be 5MB or smaller.");
  }
  if (!ALLOWED_PROFILE_ASSET_TYPES.has(file.type)) {
    throw new Error("Profile uploads must be a PDF, JPG, PNG, or WebP file.");
  }

  const supabase = await createClient();
  const path = `${userId}/${folder}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
  const { error } = await supabase.storage
    .from(PROFILE_ASSETS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(PROFILE_ASSETS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export function getOptionalFile(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}
