# Issue Tracker 🛡️

> **Enterprise Enhancements & Loopholes Management Platform**  
> Inspired by the minimal, ultra-modern aesthetics of [Corbel](https://demo.codeandchill.store/corbel).  
> Built for fast-moving engineering teams to discover, debate, prioritize, and track loopholes, architectural debt, and high-impact enhancements from ideation to verified completion.

---

## 📸 Overview & Design Philosophy

Issue Tracker delivers an editorial-grade, obsidian dark and crisp light user interface crafted with:
- **Typography**: Google Fonts **Urbanist** (`400..800`) paired with **JetBrains Mono** for tabular numbers and codes.
- **Ambient Canvas**: Full-viewport dynamic ambient glow (`.mesh`) providing luxury studio depth without GPU layer seams.
- **Corbel Pill Navigation & Floating Dock**: Left-mounted vertical pill dock (`.dock`) with instant ⌘K search, theme toggle, and settings.
- **Mobile-First Responsive Layout**: Compact 2-row mobile topbar with zero wasted vertical space and seamless touch controls.

---

## ✨ Features & Capabilities

### 1. 📋 Dual Workflow: Kanban Board & List View
- **Interactive Kanban Board**: 5 lifecycle stages:
  1. **Ideation & Discovery** (`#0994DC`)
  2. **In Discussion** (`#F59E0B`)
  3. **Planned & Scoped** (`#3B82F6`)
  4. **In Implementation** (`#0077E6`)
  5. **Completed & Verified** (`#10B981`) with celebratory confetti milestone animation!
- **High-Usability List View**:
  - Vertically stacked collapsible stage accordions for effortless mobile and touch browsing.
  - **Tap-to-Move Stage Selector**: Change stages directly with a clean popover menu without frustrating mobile drag-and-drop.
  - Subtask checklist progress metrics and direct assignees.

### 2. 💡 Ideation Hub & Discovery Grid
- Dedicated space for proposing architectural improvements and reporting subtle system loopholes.
- Problem statements, proposed architectural concepts, and impact vs. feasibility ratings (Low, Medium, High).
- Upvoting and threaded team reactions (`👍`, `🔥`, `💡`, `⚠️`, `🚀`).

### 3. 📊 Dense Data Table View
- Sortable spreadsheet-style view with filtering by Type (**Loophole** vs **Enhancement**), Priority (**Critical**, **High**, **Medium**, **Low**), and Project.
- Instant search across titles, IDs, problem statements, and solutions.

### 4. 📈 Metrics & Health Dashboard
- Real-time KPI summary stat tiles (Total Backlog, Active Loopholes, Completed Milestones, Velocity).
- Breakdown visualizer showing completion progress and priority distributions.

### 5. 🔍 Corbel ⌘K Command Finder
- Instant keyboard navigation dialog (`⌘K` or `Ctrl+K`).
- Search tasks, project tags, and views with keyboard navigation (`↑`, `↓`, `Enter`, `ESC`).

### 6. ☁️ Real-Time Firebase Sync & Offline Local Cache
- **Dual-Mode Persistence**:
  - Connect your Firebase Cloud Firestore project in seconds via the UI.
  - Automatic fallback to high-speed local browser cache with zero server setup required.
  - 1-Click JSON workspace backup export and restore.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/balakamal/issue-tracker.git
cd issue-tracker

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will launch at `http://localhost:3000`.

---

## 🛠️ Build & Deployment

### Production Bundle
```bash
npm run build
```
The optimized static bundle will be built into the `dist/` folder.

### GitHub Pages Deployment
This repository is configured with automated GitHub Actions in `.github/workflows/deploy.yml`:
1. Push to the `main` branch.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The workflow will automatically build and publish your tracker.

---

## 🎨 Color Palette & Design Tokens

| Token | Dark Mode (Obsidian) | Light Mode (Warm Minimal) | Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#0c1216` | `#efefed` | Viewport Canvas |
| `--surface` | `#172129` | `#fcfcfb` | Cards & Section Containers |
| `--dock` | `rgba(23, 33, 41, 0.92)` | `rgba(255, 255, 255, 0.88)` | Floating Navigation Dock |
| `--primary` | `#79b6e3` | `#121212` | Active Pill & Primary Buttons |
| `--coral` | `#f2937c` | `#b1412a` | Loopholes & Critical Severity |
| `--mint` | `#6fd3b0` | `#22735c` | Enhancements & Completed State |
| `--lemon` | `#e8bd62` | `#85580a` | In Discussion & High Priority |

---

## 📄 License
MIT License. Built for modern product teams.
