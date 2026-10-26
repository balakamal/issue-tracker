import { useEffect } from 'react';

/**
 * Dynamically updates in-browser document title and Open Graph (OG) / Twitter meta tags
 * whenever a task is inspected or navigated to.
 */
export function useTaskMetaTags(task) {
  useEffect(() => {
    if (!task) {
      document.title = 'Issue Tracker';
      return;
    }

    const defaultTitle = document.title;
    const taskTitle = `[${task.id}] ${task.title || 'Work Item'} | Issue Tracker`;
    document.title = taskTitle;

    // Helper to update or create a meta tag
    const updateMetaTag = (selector, attributeName, attributeValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const typeLabel = task.type === 'loophole' ? 'Loophole' : 'Enhancement';
    const priorityLabel = (task.priority || 'medium').toUpperCase();
    const stageLabel = (task.status || 'ideation').replace('_', ' ').toUpperCase();
    
    const summarySnippet = task.problemStatement 
      ? task.problemStatement.slice(0, 160) + (task.problemStatement.length > 160 ? '...' : '')
      : 'Collaborative work item and sprint backlog specifications on Issue Tracker.';

    const ogDescription = `${typeLabel} • ${priorityLabel} Priority • Stage: ${stageLabel}. ${summarySnippet}`;
    const taskUrl = typeof window !== 'undefined' ? `${window.location.origin}/task/${task.id}` : '';
    const ogImageUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/og/${task.id}` : '';

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', `[${task.id}] ${task.title} • Issue Tracker`);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', taskUrl);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', 'article');
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImageUrl);

    // Update Twitter card tags
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', `[${task.id}] ${task.title} • Issue Tracker`);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', ogDescription);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImageUrl);

    return () => {
      document.title = 'Issue Tracker';
      updateMetaTag('meta[property="og:title"]', 'property', 'og:title', 'Issue Tracker — Engineering Workspace');
      updateMetaTag('meta[property="og:description"]', 'property', 'og:description', 'Collaborative engineering dashboard to track issues, enhancements, and tasks.');
      updateMetaTag('meta[property="og:image"]', 'property', 'og:image', '/favicon.svg');
      updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', 'Issue Tracker — Engineering Workspace');
      updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', 'Collaborative engineering dashboard to track issues, enhancements, and tasks.');
      updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', '/favicon.svg');
    };
  }, [task]);
}

export default useTaskMetaTags;
