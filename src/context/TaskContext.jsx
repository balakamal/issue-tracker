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

  const toggleTheme = (eventOrElement) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Fallback if View Transitions API is not supported or user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof document === 'undefined' || !document.startViewTransition || prefersReducedMotion) {
      setThemeState(nextTheme);
      return;
    }

    // Determine circular ripple origin point (x, y)
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (eventOrElement) {
      const el = eventOrElement.currentTarget || eventOrElement.target || eventOrElement;
      if (el && typeof el.getBoundingClientRect === 'function') {
        const rect = el.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (typeof eventOrElement.clientX === 'number') {
        x = eventOrElement.clientX;
        y = eventOrElement.clientY;
      }
    } else {
      const themeBtn = document.querySelector('#theme-btn');
      if (themeBtn) {
        const rect = themeBtn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    // Calculate maximum distance to the furthest screen corner
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setThemeState(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 620,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
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

  // Views & Mode
  const [activeView, setActiveView] = useState('tickets'); // 'tickets' | 'analytics' | 'users'
  const [ticketsViewMode, setTicketsViewModeState] = useState(() => {
    try {
      return localStorage.getItem('vantage_loop_tickets_view_mode_v1') || 'table';
    } catch {
      return 'table';
    }
  });

  const setTicketsViewMode = (mode) => {
    setTicketsViewModeState(mode);
    try {
      localStorage.setItem('vantage_loop_tickets_view_mode_v1', mode);
    } catch (e) {
      // ignore
    }
  };

  // Global & Jira / Azure DevOps style filters
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'loophole' | 'enhancement'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'critical' | 'high' | 'medium' | 'low'
  const [filterAssignee, setFilterAssignee] = useState('all'); // 'all' | 'me' | 'unassigned' | userId
  const [filterStage, setFilterStage] = useState('all'); // 'all' | stageId
  const [searchQuery, setSearchQuery] = useState('');
  
  // Multi-select Jira & Azure DevOps filters
  const [selectedTypes, setSelectedTypes] = useState([]); // string[]
  const [selectedPriorities, setSelectedPriorities] = useState([]); // string[]
  const [selectedStages, setSelectedStages] = useState([]); // string[]
  const [selectedAssignees, setSelectedAssignees] = useState([]); // string[]
  
  const toggleTypeFilter = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };
  const togglePriorityFilter = (priority) => {
    setSelectedPriorities(prev => prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]);
  };
  const toggleStageFilter = (stageId) => {
    setSelectedStages(prev => prev.includes(stageId) ? prev.filter(s => s !== stageId) : [...prev, stageId]);
  };
  const toggleAssigneeFilter = (assigneeId) => {
    setSelectedAssignees(prev => prev.includes(assigneeId) ? prev.filter(a => a !== assigneeId) : [...prev, assigneeId]);
  };

  const [quickFilters, setQuickFilters] = useState({
    assignedToMe: false,
    createdByMe: false,
    onlyLoopholes: false,
    onlyEnhancements: false,
    criticalOnly: false
  });

  const toggleQuickFilter = (key) => {
    setQuickFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedPriorities([]);
    setSelectedStages([]);
    setSelectedAssignees([]);
    setFilterType('all');
    setFilterPriority('all');
    setFilterAssignee('all');
    setFilterStage('all');
    setSearchQuery('');
    setQuickFilters({
      assignedToMe: false,
      createdByMe: false,
      onlyLoopholes: false,
      onlyEnhancements: false,
      criticalOnly: false
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += selectedTypes.length;
    count += selectedPriorities.length;
    count += selectedStages.length;
    count += selectedAssignees.length;
    if (filterType !== 'all' && selectedTypes.length === 0) count++;
    if (filterPriority !== 'all' && selectedPriorities.length === 0) count++;
    if (filterAssignee !== 'all' && selectedAssignees.length === 0) count++;
    if (filterStage !== 'all' && selectedStages.length === 0) count++;
    if (searchQuery.trim()) count++;
    if (quickFilters.assignedToMe) count++;
    if (quickFilters.createdByMe) count++;
    if (quickFilters.onlyLoopholes) count++;
    if (quickFilters.onlyEnhancements) count++;
    if (quickFilters.criticalOnly) count++;
    return count;
  }, [selectedTypes, selectedPriorities, selectedStages, selectedAssignees, filterType, filterPriority, filterAssignee, filterStage, searchQuery, quickFilters]);

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
    // Normalize legacy kanban, list, or ideation view IDs to tickets
    const normalized = (viewId === 'kanban' || viewId === 'list' || viewId === 'ideation') ? 'tickets' : viewId;
    setActiveView(normalized);
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
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Filter projects by user role and project membership
  // Admin sees all projects; others only see projects they created or were added to
  const accessibleProjects = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') return projects;
    return projects.filter(p => {
      if (p.createdBy === currentUser.id) return true;
      if (Array.isArray(p.memberIds) && p.memberIds.includes(currentUser.id)) return true;
      return false;
    });
  }, [projects, currentUser]);

  // Privacy & Access Rule Engine + Jira / Azure DevOps Filters:
  // 1. Private tasks are strictly visible ONLY to the author
  // 2. Public tasks:
  //    - Admin can view all
  //    - Others can only view if they are a member of the task's project, or task author/assignee
  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Private check
      if (task.isPrivate && task.createdBy !== currentUser?.id) {
        return false;
      }

      // 2. Project accessibility check:
      // Non-admins cannot see tasks belonging to projects they aren't members of
      if (currentUser?.role !== 'Admin') {
        const isProjectAccessible = accessibleProjects.some(p => p.id === task.projectId);
        const isAuthorOrAssignee = task.createdBy === currentUser?.id || task.assigneeId === currentUser?.id;
        if (!isProjectAccessible && !isAuthorOrAssignee) {
          return false;
        }
      }

      // 3. Project filter
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
        return false;
      }

      // 4. Type filter (multi-select + legacy)
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(task.type)) return false;
      } else if (filterType !== 'all' && task.type !== filterType) {
        return false;
      }

      // 5. Priority filter (multi-select + legacy)
      if (selectedPriorities.length > 0) {
        if (!selectedPriorities.includes(task.priority)) return false;
      } else if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }

      // 6. Assignee filter (multi-select + legacy)
      if (selectedAssignees.length > 0) {
        const matchesAssignee = selectedAssignees.some(val => {
          if (val === 'me') return task.assigneeId === currentUser?.id;
          if (val === 'unassigned') return !task.assigneeId;
          return task.assigneeId === val;
        });
        if (!matchesAssignee) return false;
      } else if (filterAssignee !== 'all') {
        if (filterAssignee === 'me') {
          if (task.assigneeId !== currentUser?.id) return false;
        } else if (filterAssignee === 'unassigned') {
          if (task.assigneeId) return false;
        } else if (task.assigneeId !== filterAssignee) {
          return false;
        }
      }

      // 7. Stage / State filter (multi-select + legacy)
      if (selectedStages.length > 0) {
        if (!selectedStages.includes(task.status)) return false;
      } else if (filterStage !== 'all' && task.status !== filterStage) {
        return false;
      }

      // 8. Quick filter pills
      if (quickFilters.assignedToMe && task.assigneeId !== currentUser?.id) {
        return false;
      }
      if (quickFilters.createdByMe && task.createdBy !== currentUser?.id) {
        return false;
      }
      if (quickFilters.onlyLoopholes && task.type !== 'loophole') {
        return false;
      }
      if (quickFilters.onlyEnhancements && task.type !== 'enhancement') {
        return false;
      }
      if (quickFilters.criticalOnly && task.priority !== 'critical') {
        return false;
      }

      // 9. Search query filter
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
  }, [
    tasks, 
    accessibleProjects, 
    currentUser, 
    selectedProjectId, 
    selectedTypes,
    selectedPriorities,
    selectedStages,
    selectedAssignees,
    filterType, 
    filterPriority, 
    filterAssignee, 
    filterStage, 
    quickFilters, 
    searchQuery
  ]);

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
  const addProject = async ({ name, key, description, color, memberIds = [] }) => {
    const initialMembers = Array.from(new Set([
      ...(memberIds || []),
      currentUser?.id
    ])).filter(Boolean);

    const newProj = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      key: key ? key.trim().toUpperCase() : name.slice(0, 4).toUpperCase(),
      description: description ? description.trim() : '',
      color: color || '#0077E6',
      createdBy: currentUser?.id,
      memberIds: initialMembers
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

  const updateProjectMembers = async (projectId, memberIds) => {
    let updatedProj = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        updatedProj = { ...p, memberIds };
        return updatedProj;
      }
      return p;
    }));

    if (isFirebaseConnected && updatedProj) {
      try {
        await firebaseService.updateProjectMembers(projectId, memberIds);
      } catch (err) {
        console.error('Failed to sync project members to Firebase:', err);
      }
    }
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
      projects: accessibleProjects,
      allProjects: projects,
      filterType,
      setFilterType,
      filterPriority,
      setFilterPriority,
      filterAssignee,
      setFilterAssignee,
      filterStage,
      setFilterStage,
      selectedTypes,
      setSelectedTypes,
      toggleTypeFilter,
      selectedPriorities,
      setSelectedPriorities,
      togglePriorityFilter,
      selectedStages,
      setSelectedStages,
      toggleStageFilter,
      selectedAssignees,
      setSelectedAssignees,
      toggleAssigneeFilter,
      quickFilters,
      setQuickFilters,
      toggleQuickFilter,
      resetFilters,
      activeFiltersCount,
      searchQuery,
      setSearchQuery,
      activeView,
      setActiveView: handleSelectView,
      ticketsViewMode,
      setTicketsViewMode,
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
      isUserManagementOpen,
      setIsUserManagementOpen,
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
      updateProjectMembers,
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
