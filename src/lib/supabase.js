import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anon);

if (!hasSupabase) {
  console.warn(
    "[ap-hub] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Running in local-only mode — tiles render from the hardcoded subject list, DB-backed features (admin, deploy URLs) are disabled."
  );
}

// If env vars are missing, createClient() with empty strings throws synchronously
// and kills the whole app before React mounts. Guard it so the hub still loads
// in local-only mode and the Home page can fall back to AP_SUBJECTS.
export const supabase = hasSupabase
  ? createClient(url, anon)
  : null;

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

// --- Subjects API -----------------------------------------------------------

export async function fetchSubjects() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchSubject(id) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSubject(subject) {
  const client = requireSupabase();
  const { error } = await client
    .from("subjects")
    .upsert({ ...subject, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

// --- Activities API ---------------------------------------------------------
// Activities are the actual mini-apps. Each subject is a folder of activities.

export async function fetchActivities(subjectId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("subject_id", subjectId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchActivity(subjectId, activityId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("id", activityId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Returns the count of activities per subject_id, for the "n apps" tile badges.
export async function fetchActivityCounts() {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("activities")
    .select("subject_id");
  if (error) throw error;
  const counts = {};
  for (const row of data || []) {
    counts[row.subject_id] = (counts[row.subject_id] || 0) + 1;
  }
  return counts;
}

export async function upsertActivity(activity) {
  const client = requireSupabase();
  const { error } = await client
    .from("activities")
    .upsert({ ...activity, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteActivity(activityId) {
  const client = requireSupabase();
  const { error } = await client
    .from("activities")
    .delete()
    .eq("id", activityId);
  if (error) throw error;
}

// --- Auth helpers -----------------------------------------------------------

export async function signInWithPassword(email, password) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  if (!supabase) {
    cb(null);
    return { data: { subscription: { unsubscribe() {} } } };
  }
  return supabase.auth.onAuthStateChange((_e, session) => cb(session));
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
