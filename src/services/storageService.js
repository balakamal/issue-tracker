import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_TASKS } from './initialData';

const STORAGE_KEYS = {
  USERS: 'vantage_loop_users_firebase_v3',
  CURRENT_USER_ID: 'vantage_loop_current_user_firebase_v3',
  PROJECTS: 'vantage_loop_projects_firebase_v3',
  TASKS: 'vantage_loop_tasks_firebase_v3',
  THEME: 'vantage_loop_theme_firebase_v3',
  SIDEBAR_COLLAPSED: 'vantage_loop_sidebar_collapsed_v1',
  FIREBASE_CONFIG: 'vantage_loop_firebase_config_v2' // keep user's entered firebase config intact
};

export const storageService = {
  // Sidebar Collapsed Preference
  getSidebarCollapsed() {
    try {
      return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
    } catch {
      return false;
    }
  },

  setSidebarCollapsed(collapsed) {
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
    } catch (e) {
      console.error('Failed to save sidebar collapsed state', e);
    }
  },

  // Theme
  getTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.error('Failed to set theme in localStorage', e);
    }
  },

  // Users
  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        this.saveUsers(INITIAL_USERS);
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users', e);
    }
  },

  getCurrentUserId() {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return id || (INITIAL_USERS[0]?.id || 'user-1');
    } catch {
      return 'user-1';
    }
  },

  setCurrentUserId(id) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    } catch (e) {
      console.error('Error saving current user ID', e);
    }
  },

  // Projects
  getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        this.saveProjects(INITIAL_PROJECTS);
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects', e);
    }
  },

  // Tasks (Clean slate - zero dummy data)
  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks || []));
    } catch (e) {
      console.error('Error saving tasks', e);
    }
  },

  // Export / Import
  exportWorkspaceJSON() {
    const payload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      projects: this.getProjects(),
      tasks: this.getTasks()
    };
    return JSON.stringify(payload, null, 2);
  },

  importWorkspaceJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.tasks || !parsed.projects) {
        throw new Error('Invalid workspace data format. Expected projects and tasks arrays.');
      }
      if (Array.isArray(parsed.users)) {
        this.saveUsers(parsed.users);
      }
      if (Array.isArray(parsed.projects)) {
        this.saveProjects(parsed.projects);
      }
      if (Array.isArray(parsed.tasks)) {
        this.saveTasks(parsed.tasks);
      }
      return { success: true, message: `Successfully restored ${parsed.tasks.length} tasks and ${parsed.projects.length} projects.` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resetToDefaults() {
    this.saveUsers(INITIAL_USERS);
    this.saveProjects(INITIAL_PROJECTS);
    this.saveTasks([]);
    this.setCurrentUserId(INITIAL_USERS[0]?.id || 'user-1');
    return true;
  },

  clearAllData() {
    this.saveTasks([]);
    return true;
  }
};
