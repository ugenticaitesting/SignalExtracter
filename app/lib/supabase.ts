import { createClient } from "@supabase/supabase-js";
import type { Signal } from "@/app/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchSignals(): Promise<Signal[]> {
  const { data, error } = await supabase
    .from("Texts")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Signal[]) ?? [];
}

export async function updateSignalText(
  id: string,
  originalText: string
): Promise<Signal> {
  const { data, error } = await supabase
    .from("Texts")
    .update({ original_text: originalText })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Signal;
}
