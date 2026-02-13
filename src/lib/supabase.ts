import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_NAME = "referencias-fotos";

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

export function isLegacyPhoto(foto: string | null): boolean {
  if (!foto) return false;
  return !foto.startsWith("http");
}

export function resolvePhotoUrl(foto: string | null): string | null {
  if (!foto) return null;
  if (foto.startsWith("http")) return foto;
  return `https://florlinda.store/pcpflorlinda/uploads/referencias/${foto}`;
}
