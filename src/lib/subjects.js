// Canonical list of AP subjects.
//
// **This list is the gate.** Only subjects uncommented here appear on the hub
// home grid, in the admin dropdown, and as valid `/s/:id` routes. Commented
// subjects are ignored even if they exist in Supabase.
//
// To enable a subject: uncomment its line. To hide one: re-comment it.

export const AP_SUBJECTS = [
  // Arts
  // { id: "ap-art-history",   name: "AP Art History",                        short: "Art History",   icon: "🎨", color: "#c98c6b", category: "Arts" },
  // { id: "ap-art-2d",        name: "AP 2-D Art and Design",                 short: "2-D Art",       icon: "🖌️", color: "#d9986d", category: "Arts" },
  // { id: "ap-art-3d",        name: "AP 3-D Art and Design",                 short: "3-D Art",       icon: "🗿", color: "#a78362", category: "Arts" },
  // { id: "ap-art-drawing",   name: "AP Drawing",                            short: "Drawing",       icon: "✏️", color: "#b7956a", category: "Arts" },
  // { id: "ap-music-theory",  name: "AP Music Theory",                       short: "Music Theory",  icon: "🎼", color: "#8e6fbf", category: "Arts" },

  // English
  // { id: "ap-eng-lang",      name: "AP English Language and Composition",   short: "Eng Lang",      icon: "✍️", color: "#6b8ec9", category: "English" },
  // { id: "ap-eng-lit",       name: "AP English Literature and Composition", short: "Eng Lit",       icon: "📖", color: "#5a7bb0", category: "English" },

  // History & Social Science
  // { id: "ap-afam",          name: "AP African American Studies",           short: "AfAm Studies",  icon: "🌍", color: "#b5823e", category: "History" },
  // { id: "ap-comp-gov",      name: "AP Comparative Gov & Politics",         short: "Comp Gov",      icon: "🏛️", color: "#8a7a5c", category: "History" },
  // { id: "ap-euro",          name: "AP European History",                   short: "Euro",          icon: "🏰", color: "#7a6a8e", category: "History" },
  { id: "ap-hug",           name: "AP Human Geography",                    short: "HUG",           icon: "🗺️", color: "#4a9b7e", category: "History" },
  // { id: "ap-macro",         name: "AP Macroeconomics",                     short: "Macro",         icon: "📈", color: "#3f8a6e", category: "History" },
  // { id: "ap-micro",         name: "AP Microeconomics",                     short: "Micro",         icon: "📊", color: "#3f8a6e", category: "History" },
  // { id: "ap-psych",         name: "AP Psychology",                         short: "Psych",         icon: "🧠", color: "#c96b93", category: "History" },
  // { id: "ap-us-gov",        name: "AP US Gov & Politics",                  short: "US Gov",        icon: "🦅", color: "#3d5a80", category: "History" },
  // { id: "ap-us-history",    name: "AP US History",                         short: "APUSH",         icon: "🗽", color: "#c14b4b", category: "History" },
  // { id: "ap-world",         name: "AP World History: Modern",              short: "APWH",          icon: "🌐", color: "#4b7bc1", category: "History" },

  // Math & CS
  // { id: "ap-calc-ab",       name: "AP Calculus AB",                        short: "Calc AB",       icon: "∫",  color: "#e07a5f", category: "Math" },
  // { id: "ap-calc-bc",       name: "AP Calculus BC",                        short: "Calc BC",       icon: "∞",  color: "#cc6144", category: "Math" },
  // { id: "ap-precalc",       name: "AP Precalculus",                        short: "Precalc",       icon: "📐", color: "#e69a7a", category: "Math" },
  // { id: "ap-stats",         name: "AP Statistics",                         short: "Stats",         icon: "📉", color: "#d9844f", category: "Math" },
  // { id: "ap-csa",           name: "AP Computer Science A",                 short: "CS A",          icon: "💻", color: "#2d6a8a", category: "CS" },
  { id: "ap-csp",           name: "AP Computer Science Principles",        short: "CSP",           icon: "🖥️", color: "#3a87ab", category: "CS" },

  // Sciences
  // { id: "ap-bio",           name: "AP Biology",                            short: "Bio",           icon: "🧬", color: "#5ba85c", category: "Science" },
  // { id: "ap-chem",          name: "AP Chemistry",                          short: "Chem",          icon: "⚗️", color: "#a85b9a", category: "Science" },
  // { id: "ap-env",           name: "AP Environmental Science",              short: "APES",          icon: "🌱", color: "#6fa84f", category: "Science" },
  // { id: "ap-phys-1",        name: "AP Physics 1",                          short: "Phys 1",        icon: "⚛️", color: "#5b8aa8", category: "Science" },
  // { id: "ap-phys-2",        name: "AP Physics 2",                          short: "Phys 2",        icon: "🔭", color: "#4a779a", category: "Science" },
  // { id: "ap-phys-cm",       name: "AP Physics C: Mechanics",               short: "Phys C Mech",   icon: "🎱", color: "#3a688a", category: "Science" },
  // { id: "ap-phys-ce",       name: "AP Physics C: E&M",                     short: "Phys C E&M",    icon: "⚡", color: "#2d5e7a", category: "Science" },

  // World Languages
  // { id: "ap-chinese",       name: "AP Chinese Language and Culture",       short: "Chinese",       icon: "🀄", color: "#c14b4b", category: "Language" },
  // { id: "ap-french",        name: "AP French Language and Culture",        short: "French",        icon: "🥖", color: "#4b6bc1", category: "Language" },
  // { id: "ap-german",        name: "AP German Language and Culture",        short: "German",        icon: "🍺", color: "#b59a3e", category: "Language" },
  // { id: "ap-italian",       name: "AP Italian Language and Culture",       short: "Italian",       icon: "🍝", color: "#3e8a5a", category: "Language" },
  // { id: "ap-japanese",      name: "AP Japanese Language and Culture",      short: "Japanese",      icon: "🗾", color: "#c96b8a", category: "Language" },
  // { id: "ap-latin",         name: "AP Latin",                              short: "Latin",         icon: "📜", color: "#8a7a4a", category: "Language" },
  // { id: "ap-spanish-lang",  name: "AP Spanish Language and Culture",       short: "Span Lang",     icon: "🌶️", color: "#d97a3e", category: "Language" },
  // { id: "ap-spanish-lit",   name: "AP Spanish Literature and Culture",     short: "Span Lit",      icon: "💃", color: "#b5602d", category: "Language" },

  // Capstone
  // { id: "ap-research",      name: "AP Research",                           short: "Research",      icon: "🔬", color: "#6a6a8a", category: "Capstone" },
  // { id: "ap-seminar",       name: "AP Seminar",                            short: "Seminar",       icon: "🎓", color: "#5a5a7a", category: "Capstone" },
];

// Categories available in the filter bar. Only categories that have at least
// one active subject are useful; we compute this dynamically below.
export const ALL_CATEGORIES = [
  "Arts",
  "English",
  "History",
  "Math",
  "CS",
  "Science",
  "Language",
  "Capstone",
];

// Only categories that have at least one uncommented subject — keeps the
// filter bar from showing empty tabs.
export const CATEGORIES = ALL_CATEGORIES.filter((c) =>
  AP_SUBJECTS.some((s) => s.category === c)
);

export function findSubject(id) {
  return AP_SUBJECTS.find((s) => s.id === id) || null;
}

// Used by merge logic on Home/Admin so remote rows for commented-out
// subjects don't bleed through.
export function isActiveSubjectId(id) {
  return AP_SUBJECTS.some((s) => s.id === id);
}
