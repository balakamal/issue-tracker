import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  FolderKanban,
  Zap
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function AnalyticsDashboard() {
  const { visibleTasks, projects, metrics } = useTasks();
  const { users } = useAuth();

  // Compute breakdown by priority
  const priorities = ['critical', 'high', 'medium', 'low'];
  const priorityCounts = priorities.reduce((acc, p) => {
    acc[p] = visibleTasks.filter(t => t.priority === p).length;
    return acc;
  }, {});

  // Compute breakdown by project
  const projectStats = projects.map(proj => {
    const projTasks = visibleTasks.filter(t => t.projectId === proj.id);
    const resolved = projTasks.filter(t => t.status === 'done').length;
    const rate = projTasks.length > 0 ? Math.round((resolved / projTasks.length) * 100) : 100;
    return {
      ...proj,
      total: projTasks.length,
      resolved,
      rate
    };
  });

  // Compute contributor stats
  const userStats = users.map(user => {
    const assigned = visibleTasks.filter(t => t.assigneeId === user.id);
    const resolved = assigned.filter(t => t.status === 'done').length;
    const ideated = visibleTasks.filter(t => t.createdBy === user.id).length;
    return {
      ...user,
      assignedCount: assigned.length,
      resolvedCount: resolved,
      ideatedCount: ideated
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top KPI Cards */}
      <div className="metrics-row">
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Resolution Rate</span>
            <span className="kpi-value" style={{ color: 'var(--status-done)' }}>{metrics.resolutionRate}%</span>
            <span className="kpi-subtext">{metrics.doneLoopholes + metrics.doneEnhancements} of {metrics.total} items resolved</span>
          </div>
          <div className="kpi-icon-bubble" style={{ backgroundColor: 'var(--status-done-bg)', color: 'var(--status-done)' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Active Loopholes</span>
            <span className="kpi-value" style={{ color: 'var(--type-loophole)' }}>
              {metrics.loopholesCount - metrics.doneLoopholes}
            </span>
            <span className="kpi-subtext">{metrics.doneLoopholes} loopholes verified &amp; closed</span>
          </div>
          <div className="kpi-icon-bubble" style={{ backgroundColor: 'var(--type-loophole-bg)', color: 'var(--type-loophole)' }}>
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Enhancements Deployed</span>
            <span className="kpi-value" style={{ color: 'var(--type-enhancement)' }}>
              {metrics.doneEnhancements}
            </span>
            <span className="kpi-subtext">{metrics.enhancementsCount} total enhancements ideated</span>
          </div>
          <div className="kpi-icon-bubble" style={{ backgroundColor: 'var(--type-enhancement-bg)', color: 'var(--type-enhancement)' }}>
            <Sparkles size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">P0 Critical Alerts</span>
            <span className="kpi-value" style={{ color: metrics.criticalOpen > 0 ? 'var(--priority-critical)' : 'var(--text-muted)' }}>
              {metrics.criticalOpen}
            </span>
            <span className="kpi-subtext">Requires immediate team review</span>
          </div>
          <div className="kpi-icon-bubble" style={{ backgroundColor: 'var(--priority-critical-bg)', color: 'var(--priority-critical)' }}>
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Analytics Main Panels Grid */}
      <div className="analytics-grid">
        {/* Left Column: Stage Workflow & Project Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stage Progression Funnel */}
          <div className="analytics-panel">
            <h3 className="panel-title">
              <Zap size={17} color="var(--primary)" />
              Lifecycle Pipeline Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STAGES.map(stage => {
                const count = visibleTasks.filter(t => t.status === stage.id).length;
                const percent = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: stage.color }} />
                        {stage.label}
                      </span>
                      <span>{count} items ({percent}%)</span>
                    </div>
                    <div className="checklist-progress-bar-track" style={{ height: 8 }}>
                      <div 
                        className="checklist-progress-bar-fill" 
                        style={{ width: `${percent}%`, backgroundColor: stage.color, backgroundImage: 'none' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Health Table */}
          <div className="analytics-panel">
            <h3 className="panel-title">
              <FolderKanban size={17} color="var(--primary)" />
              Project Health &amp; Classified Progress
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projectStats.map(proj => (
                <div 
                  key={proj.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: proj.color }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {proj.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {proj.total} items recorded • {proj.resolved} completed
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{proj.rate}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>health</div>
                    </div>
                    <div className="checklist-progress-bar-track" style={{ width: 60, height: 6 }}>
                      <div 
                        className="checklist-progress-bar-fill" 
                        style={{ width: `${proj.rate}%`, backgroundColor: proj.color, backgroundImage: 'none' }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Severity Breakdown & Contributor Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Priority Severity Breakdown */}
          <div className="analytics-panel">
            <h3 className="panel-title">
              <AlertCircle size={17} color="var(--primary)" />
              Severity Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {priorities.map(p => {
                const count = priorityCounts[p] || 0;
                const percent = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize', fontSize: 13, fontWeight: 600, color: `var(--priority-${p})` }}>
                      {p}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Contributor Leaderboard */}
          <div className="analytics-panel">
            <h3 className="panel-title">
              <Users size={17} color="var(--primary)" />
              Team Velocity &amp; Contributions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {userStats.map(u => (
                <div 
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 8,
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <Avatar user={u} size={28} showTooltip={false} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        {u.email || `@${u.username || 'member'}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className="impact-badge" title="Loopholes/Enhancements ideated">
                      {u.ideatedCount} ideated
                    </span>
                    <span className="impact-badge" style={{ backgroundColor: 'var(--status-done-bg)', color: 'var(--status-done)' }} title="Completed & Verified items">
                      {u.resolvedCount} closed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
