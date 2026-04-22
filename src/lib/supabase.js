import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn(
    "[ap-hub] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in Supabase credentials."
  );
}

export const supabase = createClient(url || "", anon || "");

// --- Subjects API -----------------------------------------------------------

export async function fetchSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchSubject(id) {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSubject(subject) {
  const { error } = await supabase
    .from("subjects")
    .upsert({ ...subject, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

// --- Auth helpers -----------------------------------------------------------

export async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_e, session) => cb(session));
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
