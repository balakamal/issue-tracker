import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebase';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const STAGES = [
  { id: 'ideation', label: 'Ideation & Discovery', color: '#0994DC' },
  { id: 'discussion', label: 'In Discussion', color: '#F59E0B' },
  { id: 'planned', label: 'Planned & Scoped', color: '#3B82F6' },
  { id: 'in_progress', label: 'In Implementation', color: '#0077E6' },
  { id: 'done', label: 'Completed & Verified', color: '#10B981' }
];

export function TaskProvider({ children }) {
  const { currentUser, users } = useAuth();
  
  // Theme state
  const [theme, setThemeState] = useState(() => storageService.getTheme());

  useEffect(() => {
    storageService.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Persistent data state
  const [tasks, setTasks] = useState(() => storageService.getTasks());
  const [projects, setProjects] = useState(() => storageService.getProjects());

  // Firebase connection and synchronization state
  const [firebaseConfig, setFirebaseConfig] = useState(() => firebaseService.getConfig());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState('Local Cache Active');

  const tasksUnsubRef = useRef(null);
  const projectsUnsubRef = useRef(null);

  // Initialize Firebase Real-Time Synchronization
  useEffect(() => {
    const config = firebaseService.getConfig();
    if (config && config.apiKey && config.projectId) {
      try {
        setIsSyncing(true);
        setSyncStatusMessage('Connecting to Cloud Firestore...');

        // Subscribe to tasks: Firebase is ALWAYS the single source of truth
        tasksUnsubRef.current = firebaseService.subscribeToTasks((remoteTasks) => {
          const liveTasks = remoteTasks || [];
          setTasks(liveTasks);
          storageService.saveTasks(liveTasks);
          setIsFirebaseConnected(true);
          setIsSyncing(false);
          setSyncStatusMessage('Cloud Realtime Sync Active (Firebase Source of Truth)');
        }, (err) => {
          console.warn('Firebase tasks sync error:', err);
          setIsFirebaseConnected(false);
          setIsSyncing(false);
          setSyncStatusMessage('Cloud sync error (fallback to local)');
        });

        // Subscribe to projects: Firebase is the source of truth
        projectsUnsubRef.current = firebaseService.subscribeToProjects((remoteProjects) => {
          if (remoteProjects && remoteProjects.length > 0) {
            setProjects(remoteProjects);
            storageService.saveProjects(remoteProjects);
          }
        }, (err) => {
          console.warn('Firebase projects sync error:', err);
        });

      } catch (e) {
        console.error('Error starting Firebase listeners', e);
        setIsFirebaseConnected(false);
        setIsSyncing(false);
      }
    } else {
      setIsFirebaseConnected(false);
      setSyncStatusMessage('Local Storage Active (Connect Firebase for Shared Backend)');
    }

    return () => {
      if (tasksUnsubRef.current) tasksUnsubRef.current();
      if (projectsUnsubRef.current) projectsUnsubRef.current();
    };
  }, [firebaseConfig]);

  // Fallback local persistence
  useEffect(() => {
    if (!isFirebaseConnected) {
      storageService.saveTasks(tasks);
    }
  }, [tasks, isFirebaseConnected]);

  useEffect(() => {
    if (!isFirebaseConnected) {
      storageService.saveProjects(projects);
    }
  }, [projects, isFirebaseConnected]);

  // Connect Firebase from UI
  const connectFirebase = async (config) => {
    setIsSyncing(true);
    setSyncStatusMessage('Testing connection to Firebase...');
    const result = await firebaseService.testConnection(config);
    if (result.success) {
      firebaseService.saveConfig(config);
      setFirebaseConfig(config);
      setIsFirebaseConnected(true);
      setIsSyncing(false);
      setSyncStatusMessage('Cloud Realtime Sync Active');
      return { success: true };
    } else {
      setIsSyncing(false);
      setSyncStatusMessage(`Failed to connect: ${result.error}`);
      return { success: false, error: result.error };
    }
  };

  // Disconnect Firebase
  const disconnectFirebase = () => {
    if (tasksUnsubRef.current) tasksUnsubRef.current();
    if (projectsUnsubRef.current) projectsUnsubRef.current();
    firebaseService.clearConfig();
    setFirebaseConfig(null);
    setIsFirebaseConnected(false);
    setSyncStatusMessage('Local Storage Active (Firebase Disconnected)');
  };

  // Seed local workspace to Cloud Firestore
  const seedToFirebase = async () => {
    try {
      setIsSyncing(true);
      setSyncStatusMessage('Uploading workspace data to Cloud Firestore...');
      await firebaseService.seedWorkspaceToFirestore(users, projects, tasks);
      setIsSyncing(false);
      setSyncStatusMessage('Cloud Realtime Sync Active (Data Seeded)');
      return { success: true };
    } catch (err) {
      setIsSyncing(false);
      setSyncStatusMessage(`Seed failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  // Views & Filters
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' | 'ideation' | 'table' | 'analytics'
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'loophole' | 'enhancement'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'critical' | 'high' | 'medium' | 'low'
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar Collapse (Desktop) & Mobile Off-canvas Drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => storageService.getSidebarCollapsed());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeMobileStage, setActiveMobileStage] = useState('ideation');

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      storageService.setSidebarCollapsed(next);
      return next;
    });
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const openMobileSidebar = () => setIsMobileSidebarOpen(true);

  // Auto-close mobile drawer when switching views or projects
  const handleSelectView = (viewId) => {
    setActiveView(viewId);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setIsMobileSidebarOpen(false);
  };
  
  // Active modals and selected task detail drawer
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStage, setCreateInitialStage] = useState('ideation');
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

  // Privacy Rule Engine:
  // An item is visible if:
  // 1. isPrivate is false (it is project-classified and team visible)
  // 2. OR isPrivate is true AND task.createdBy === currentUser.id
  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      // Privacy check
      if (task.isPrivate && task.createdBy !== currentUser?.id) {
        return false;
      }

      // Project filter
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && task.type !== filterType) {
        return false;
      }

      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesProblem = task.problemStatement?.toLowerCase().includes(q);
        const matchesSolution = task.proposedSolution?.toLowerCase().includes(q);
        const matchesId = task.id.toLowerCase().includes(q);
        return matchesTitle || matchesProblem || matchesSolution || matchesId;
      }

      return true;
    });
  }, [tasks, currentUser, selectedProjectId, filterType, filterPriority, searchQuery]);

  // Task Operations
  const addTask = async (taskData) => {
    const project = projects.find(p => p.id === taskData.projectId) || projects[0];
    const newId = `TASK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask = {
      id: newId,
      title: taskData.title,
      type: taskData.type || 'loophole',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'ideation',
      projectId: project.id,
      isPrivate: Boolean(taskData.isPrivate),
      createdBy: currentUser.id,
      assigneeId: taskData.assigneeId || null,
      createdAt: new Date().toISOString(),
      targetDate: taskData.targetDate || '',
      problemStatement: taskData.problemStatement || '',
      proposedSolution: taskData.proposedSolution || '',
      impactFeasibility: taskData.impactFeasibility || { impact: 'Medium', feasibility: 'Medium' },
      checklist: taskData.checklist || [],
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);

    if (isFirebaseConnected) {
      try {
        await firebaseService.saveTask(newTask);
      } catch (err) {
        console.error('Failed to sync new task to Firebase:', err);
      }
    }

    return newTask;
  };

  const updateTask = async (taskId, updates) => {
    let updatedEntity = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedEntity = { ...t, ...updates };
        return updatedEntity;
      }
      return t;
    }));

    if (isFirebaseConnected && updatedEntity) {
      try {
        await firebaseService.saveTask(updatedEntity);
      } catch (err) {
        console.error('Failed to sync updated task to Firebase:', err);
      }
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }

    if (isFirebaseConnected) {
      try {
        await firebaseService.deleteTask(taskId);
      } catch (err) {
        console.error('Failed to delete task from Firebase:', err);
      }
    }
  };

  const moveTaskStage = async (taskId, newStatus) => {
    let updatedEntity = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (newStatus === 'done' && t.status !== 'done') {
          // Celebrate milestone completion
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
        updatedEntity = { ...t, status: newStatus };
        return updatedEntity;
      }
      return t;
    }));

    if (isFirebaseConnected && updatedEntity) {
      try {
        await firebaseService.saveTask(updatedEntity);
      } catch (err) {
        console.error('Failed to sync stage move to Firebase:', err);
      }
    }
  };

  // Checklist operations
  const toggleSubtask = async (taskId, subtaskId) => {
    let updatedEntity = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedChecklist = t.checklist.map(item => {
          if (item.id === subtaskId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });

        // Check if all subtasks are now completed and was in progress
        const allDone = updatedChecklist.length > 0 && updatedChecklist.every(i => i.completed);
        if (allDone && t.status === 'in_progress') {
          confetti({
            particleCount: 50,
            spread: 45,
            origin: { y: 0.7 }
          });
        }

        updatedEntity = { ...t, checklist: updatedChecklist };
        return updatedEntity;
      }
      return t;
    }));

    if (isFirebaseConnected && updatedEntity) {
      try {
        await firebaseService.saveTask(updatedEntity);
      } catch (err) {
        console.error('Failed to sync subtask toggle to Firebase:', err);
      }
    }
  };

  const addSubtask = async (taskId, text) => {
    if (!text.trim()) return;
    const newItem = {
      id: `c-${Date.now()}`,
      text: text.trim(),
      completed: false
    };
    let updatedEntity = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedEntity = { ...t, checklist: [...(t.checklist || []), newItem] };
        return updatedEntity;
      }
      return t;
    }));

    if (isFirebaseConnected && updatedEntity) {
      try {
        await firebaseService.saveTask(updatedEntity);
      } catch (err) {
        console.error('Failed to sync added subtask to Firebase:', err);
      }
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    let updatedEntity = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedEntity = { ...t, checklist: t.checklist.filter(i => i.id !== subtaskId) };
        return updatedEntity;
      }
      return t;
    }));

    if (isFirebaseConnected && updatedEntity) {
      try {
        await firebaseService.saveTask(updatedEntity);
      } catch (err) {
        console.error('Failed to sync deleted subtask to Firebase:', err);
      }
    }
  };

  // Comments & Discussions
  const addComment = async (taskId, commentText) => {
    if (!commentText.trim()) return;
    const newComment = {
      id: `comm-${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      text: commentText.trim(),
      reactions: {}
    };

    let updatedEntity = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedEntity = { ...t, comments: [...(t.comments || []), newComment] };
        return updatedEntity;
      }
      return t;
    }));

    if (isFirebaseConnected && updatedEntity) {
      try {
        await firebaseService.saveTask(updatedEntity);
      } catch (err) {
        console.error('Failed to sync comment to Firebase:', err);
      }
    }
  };

  const toggleReaction = async (taskId, commentId, emoji) => {
    let updatedEntity = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedComments = (t.comments || []).map(c => {
          if (c.id === commentId) {
            const currentCount = c.reactions?.[emoji] || 0;
            return {
              ...c,
              reactions: {
                ...(c.reactions || {}),
                [emoji]: currentCount > 0 ? currentCount + 1 : 1
              }
            };
          }
          return c;
        });
        updatedEntity = { ...t, comments: updatedComments };
        return updatedEntity;
      }
      return t;
    }));

    if (isFirebaseConnected && updatedEntity) {
      try {
        await firebaseService.saveTask(updatedEntity);
      } catch (err) {
        console.error('Failed to sync reaction to Firebase:', err);
      }
    }
  };

  // Project management
  const addProject = async ({ name, key, description, color }) => {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      key: key ? key.trim().toUpperCase() : name.slice(0, 4).toUpperCase(),
      description: description ? description.trim() : '',
      color: color || '#0077E6'
    };
    setProjects(prev => [...prev, newProj]);

    if (isFirebaseConnected) {
      try {
        await firebaseService.saveProject(newProj);
      } catch (err) {
        console.error('Failed to sync project to Firebase:', err);
      }
    }

    return newProj;
  };

  const updateProject = async (projectId, updates) => {
    let updatedProj = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        updatedProj = { ...p, ...updates };
        return updatedProj;
      }
      return p;
    }));

    if (isFirebaseConnected && updatedProj) {
      try {
        await firebaseService.saveProject(updatedProj);
      } catch (err) {
        console.error('Failed to update project in Firebase:', err);
      }
    }
  };

  const deleteProject = async (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId('all');
    }

    if (isFirebaseConnected) {
      try {
        await firebaseService.deleteProject(projectId);
      } catch (err) {
        console.error('Failed to delete project from Firebase:', err);
      }
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalVisible = visibleTasks.length;
    const loopholes = visibleTasks.filter(t => t.type === 'loophole');
    const enhancements = visibleTasks.filter(t => t.type === 'enhancement');
    const doneLoopholes = loopholes.filter(t => t.status === 'done').length;
    const doneEnhancements = enhancements.filter(t => t.status === 'done').length;
    const criticalOpen = visibleTasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;

    const resolutionRate = totalVisible > 0 
      ? Math.round(((doneLoopholes + doneEnhancements) / totalVisible) * 100)
      : 100;

    return {
      total: totalVisible,
      loopholesCount: loopholes.length,
      enhancementsCount: enhancements.length,
      doneLoopholes,
      doneEnhancements,
      criticalOpen,
      resolutionRate
    };
  }, [visibleTasks]);

  // Selected task entity
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  return (
    <TaskContext.Provider value={{
      tasks,
      visibleTasks,
      projects,
      filterType,
      setFilterType,
      filterPriority,
      setFilterPriority,
      searchQuery,
      setSearchQuery,
      activeView,
      setActiveView: handleSelectView,
      selectedProjectId,
      setSelectedProjectId: handleSelectProject,
      isSidebarCollapsed,
      toggleSidebarCollapse,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      closeMobileSidebar,
      openMobileSidebar,
      activeMobileStage,
      setActiveMobileStage,
      selectedTaskId,
      setSelectedTaskId,
      selectedTask,
      isCreateModalOpen,
      setIsCreateModalOpen,
      createInitialStage,
      setCreateInitialStage,
      isProjectManagerOpen,
      setIsProjectManagerOpen,
      theme,
      toggleTheme,
      metrics,
      addTask,
      updateTask,
      deleteTask,
      moveTaskStage,
      toggleSubtask,
      addSubtask,
      deleteSubtask,
      addComment,
      toggleReaction,
      addProject,
      updateProject,
      deleteProject,
      // Firebase specific states & handlers
      isFirebaseConnected,
      isSyncing,
      syncStatusMessage,
      connectFirebase,
      disconnectFirebase,
      seedToFirebase,
      resetData: () => {
        storageService.resetToDefaults();
        setTasks(storageService.getTasks());
        setProjects(storageService.getProjects());
      }
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
