// Clean workspace configuration for Issue Tracker
// Firebase Cloud Firestore is the source of truth; all dummy sample tasks cleared.

export const INITIAL_USERS = [
  {
    id: "user-admin",
    name: "Bala Kamal",
    email: "balakamal.cloud@gmail.com",
    role: "Admin",
    avatarColor: "#0077E6",
    bio: "Workspace Administrator."
  }
];

export const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    name: "Main Platform",
    key: "MAIN",
    description: "Primary engineering platform project",
    color: "#0077E6",
    memberIds: ["user-admin"]
  }
];

export const INITIAL_TASKS = [];
