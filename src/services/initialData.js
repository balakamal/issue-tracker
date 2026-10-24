// Clean workspace configuration for Vantage Loop
// Firebase Cloud Firestore is the source of truth; all dummy sample tasks cleared.

export const INITIAL_USERS = [
  {
    id: "user-1",
    name: "Kamal Thiruveedhula",
    email: "kamal.t@pal.tech",
    role: "Lead Engineer",
    avatarColor: "#0077E6",
    bio: "Engineering Lead."
  }
];

export const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    name: "Main Platform",
    key: "MAIN",
    description: "Primary project classification",
    color: "#0077E6"
  }
];

export const INITIAL_TASKS = [];
