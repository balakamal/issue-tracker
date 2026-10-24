import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  writeBatch
} from 'firebase/firestore';

const STORAGE_KEY_FIREBASE = 'vantage_loop_firebase_config_v2';

export const firebaseService = {
  // Get active Firebase configuration
  getConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored Firebase config', e);
    }

    // Fallback to Vite environment variables if present
    if (import.meta.env.VITE_FIREBASE_API_KEY) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
    }

    return null;
  },

  isEnvConfigured() {
    return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
  },

  // Save custom configuration from UI
  saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Error saving Firebase config', e);
      return false;
    }
  },

  clearConfig() {
    try {
      localStorage.removeItem(STORAGE_KEY_FIREBASE);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Initialize or retrieve Firebase app and Firestore
  getFirestoreInstance() {
    const config = this.getConfig();
    if (!config || !config.apiKey || !config.projectId) {
      return null;
    }

    try {
      const app = getApps().length === 0 ? initializeApp(config) : getApp();
      return getFirestore(app);
    } catch (err) {
      console.error('Failed to initialize Firebase / Firestore:', err);
      return null;
    }
  },

  // Test connection to Firestore
  async testConnection(config) {
    try {
      const testApp = initializeApp(config, `test-${Date.now()}`);
      const testDb = getFirestore(testApp);
      // Attempt to read or touch a collection
      const snap = await getDocs(collection(testDb, 'projects'));
      return { success: true, count: snap.size };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Real-time listener for tasks
  subscribeToTasks(callback, onError) {
    const db = this.getFirestoreInstance();
    if (!db) return () => {};

    const tasksCol = collection(db, 'tasks');
    return onSnapshot(tasksCol, (snapshot) => {
      const tasks = [];
      snapshot.forEach(docSnap => {
        tasks.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(tasks);
    }, (err) => {
      console.error('Firestore tasks subscription error:', err);
      if (onError) onError(err);
    });
  },

  // Real-time listener for projects
  subscribeToProjects(callback, onError) {
    const db = this.getFirestoreInstance();
    if (!db) return () => {};

    const projCol = collection(db, 'projects');
    return onSnapshot(projCol, (snapshot) => {
      const projects = [];
      snapshot.forEach(docSnap => {
        projects.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(projects);
    }, (err) => {
      console.error('Firestore projects subscription error:', err);
      if (onError) onError(err);
    });
  },

  // Real-time listener for users
  subscribeToUsers(callback, onError) {
    const db = this.getFirestoreInstance();
    if (!db) return () => {};

    const usersCol = collection(db, 'users');
    return onSnapshot(usersCol, (snapshot) => {
      const users = [];
      snapshot.forEach(docSnap => {
        users.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(users);
    }, (err) => {
      console.error('Firestore users subscription error:', err);
      if (onError) onError(err);
    });
  },

  // Write single task
  async saveTask(task) {
    const db = this.getFirestoreInstance();
    if (!db) return false;
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await setDoc(taskRef, task, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to write task to Firestore:', err);
      throw err;
    }
  },

  // Delete single task
  async deleteTask(taskId) {
    const db = this.getFirestoreInstance();
    if (!db) return false;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      return true;
    } catch (err) {
      console.error('Failed to delete task in Firestore:', err);
      throw err;
    }
  },

  // Write single project
  async saveProject(project) {
    const db = this.getFirestoreInstance();
    if (!db) return false;
    try {
      await setDoc(doc(db, 'projects', project.id), project, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to write project to Firestore:', err);
      throw err;
    }
  },

  // Delete single project
  async deleteProject(projectId) {
    const db = this.getFirestoreInstance();
    if (!db) return false;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      return true;
    } catch (err) {
      console.error('Failed to delete project in Firestore:', err);
      throw err;
    }
  },

  // Write single user
  async saveUser(user) {
    const db = this.getFirestoreInstance();
    if (!db) return false;
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to write user to Firestore:', err);
      throw err;
    }
  },

  // Batch seed existing data to Firestore
  async seedWorkspaceToFirestore(users, projects, tasks) {
    const db = this.getFirestoreInstance();
    if (!db) throw new Error('Firebase is not connected. Configure credentials first.');

    const batch = writeBatch(db);

    // Add users
    users.forEach(u => {
      const ref = doc(db, 'users', u.id);
      batch.set(ref, u, { merge: true });
    });

    // Add projects
    projects.forEach(p => {
      const ref = doc(db, 'projects', p.id);
      batch.set(ref, p, { merge: true });
    });

    // Add tasks
    tasks.forEach(t => {
      const ref = doc(db, 'tasks', t.id);
      batch.set(ref, t, { merge: true });
    });

    await batch.commit();
    return true;
  }
};
