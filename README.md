# GitBundle 🎁

> A curated collection of Git-powered developer tools — from smart commit automation to AI-driven codebase analysis and cinematic year-in-review slideshows.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Overview

GitBundle brings together three standalone developer tools that each solve a different pain point in the GitHub workflow:

| Tool | What it does |
|------|-------------|
| [**Git-it-done**](#-git-it-done) | Smart CLI that auto-generates conventional commit messages and streamlines staging and pushing |
| [**GitExplorer**](#-gitexplorer) | AI-powered web app for deep repository analysis — file complexity, contributor stats, interactive chat |
| [**GitWrap**](#-gitwrap) | Spotify Wrapped-style animated slideshow of your GitHub year in review |

Each tool works independently. Use one, two, or all three.

---

## Tools at a Glance

| | Git-it-done | GitExplorer | GitWrap |
|---|---|---|---|
| **Type** | CLI | Web app | Web app |
| **Language** | TypeScript | TypeScript + React | TypeScript + React |
| **GitHub token** | Not required | Optional | Not required |
| **AI integration** | ❌ | ✅ OpenAI via Supabase | ✅ Google Gemini |
| **Offline capable** | ✅ | ❌ | ❌ |
| **Best for** | Daily commits | Code exploration | Year-end review |

---

## 📝 Git-it-done

A smart, interactive CLI that analyzes your staged changes and automatically generates meaningful conventional commit messages — so your Git history stays clean without the mental overhead.

### Features

- 🧠 **Smart commit message generation** — analyzes file types and content patterns
- 🎨 **Beautiful interactive CLI** — modern prompts with colors, spinners, and emojis via Clack.js
- 🔍 **Selective file staging** — choose exactly which files to stage
- ✏️ **Flexible messaging** — use generated, custom, or edited commit messages
- 🚀 **Auto-push** — optionally push to remote in the same flow
- 📊 **Visual status display** — color-coded file changes at a glance

### Prerequisites

- Node.js >= 16.0.0
- Git installed and configured
- An existing Git repository

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Installation

```bash
npm install -g git-it-done
```

### Quick Start

```bash
cd your-project
auto-commit
```

### Example Workflow

```
┌  Auto Commit Tool
│
◇  📁 Repository Status:
│  
│  Unstaged files:
│    ~ modified src/auth.ts
│    + added tests/auth.test.ts
│
◇  No files are staged. What would you like to do?
│  ● Stage all changes
│  ○ Select files to stage
│
◇  How would you like to create the commit message?
│  ● Use generated: "feat(src): add authentication functionality"
│  ○ Write custom message
│  ○ Edit generated message
│
◆  ✅ Changes committed successfully!
│  Last commit: abc1234 feat(src): add authentication functionality
│
◇  Push to remote repository? Yes
◆  🚀 Changes pushed successfully!
└  🎉 All done!
```

### Commit Message Generation Logic

The generator analyzes file types and change patterns to pick the right conventional commit prefix:

| Signal | Generated prefix |
|--------|-----------------|
| New files | `feat:` |
| Test files (`test/`, `spec/`) | `test:` |
| `.md` files | `docs:` |
| `.css` / `.scss` | `style:` |
| `.json` / `.yaml` | `config:` |
| `package.json` changes | `deps:` |
| Bug-fix patterns in content | `fix:` |
| Refactoring patterns | `refactor:` |

**Example outputs:**
```
feat(auth): add user authentication system
fix(api): resolve validation errors
docs: update API documentation
test(auth): add authentication tests
deps: update dependencies
```

### Scope & Limitations

**Git-it-done handles:**
- ✅ Commit message generation and staging
- ✅ File selection and commit execution
- ✅ Push to existing remotes

**Out of scope (use standard Git commands):**
- ❌ Repository initialization or first commits
- ❌ Pulling, rebasing, or merge conflicts
- ❌ Branch management or history rewriting

### Project Structure

```
git-it-done/
├── index.ts
└── utils/
    ├── checkGitStatus.ts
    ├── displayStatus.ts
    ├── fileStaging.ts
    ├── commitMessage.ts
    ├── performCommit.ts
    ├── pushToRemote.ts
    ├── gitCommand.ts
    ├── getFileChanges.ts
    ├── generateCommitMessage.ts
    ├── formatFileStatus.ts
    ├── process_interruption.ts
    └── types/
        └── types.ts
```

### Troubleshooting

| Error | Fix |
|-------|-----|
| "Not in a git repository" | Run `git init` or navigate to a repo |
| "Git user not configured" | Run `git config --global user.name/email` |
| "No remote configured" | Run `git remote add origin <url>` |
| "Failed to push" | Run `git push --set-upstream origin main` |

---

## 🔍 GitExplorer

An AI-powered GitHub repository analysis tool that transforms complex codebases into interactive insights — with file complexity heatmaps, contributor analytics, and a conversational AI assistant that answers questions about any repo.

### Features

- 🤖 **AI chat interface** — ask natural language questions about any repository
- 🗂️ **Interactive file explorer** — navigate codebases with hotspot detection
- 📊 **Repository analytics** — contributors, languages, commit patterns, PR ratios
- 🌡️ **Complexity analysis** — automatic low / medium / high file classification
- 🎯 **Contribution guidance** — AI suggestions for good first issues
- 📱 **Responsive design** — works on desktop and mobile

### Prerequisites

- Node.js 18+
- GitHub API token (optional — increases rate limits)
- Supabase account (required for AI chat)

### Installation

```bash
git clone <repository-url>
cd GitExplorer
npm install
```

Create a `.env` file:

```env
VITE_GITHUB_TOKEN=your_github_token_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

```bash
npm run dev
# Open http://localhost:8080
```

### Usage

1. Enter any GitHub repository URL: `https://github.com/owner/repository`
2. Click **Explore** to begin analysis
3. Navigate the three dashboard tabs:

| Tab | What you see |
|-----|-------------|
| **Insights** | Stars, forks, language breakdown, commit activity, PR/issue ratios |
| **Explorer** | File tree with complexity color-coding and hotspot detection |
| **Activities** | Recent commits and open issues |

4. Click the floating chat button to ask the AI assistant:

```
"What are the most complex files in this repository?"
"Show me good first issues for beginners"
"Explain the project structure"
"Who are the top contributors?"
"What languages are used in this project?"
```

### File Complexity Legend

| Color | Level | Criteria |
|-------|-------|----------|
| 🟢 Green | Low | JSON, Markdown, config files |
| 🟡 Yellow | Medium | Standard code files under 15KB |
| 🔴 Red | High | Code files over 15KB |

### Project Structure

```
GitExplorer/
├── src/
│   ├── components/
│   │   ├── charts/              # Recharts visualizations
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── ChatInterface.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FileExplorer.tsx
│   │   └── Hero.tsx
│   ├── hooks/
│   │   └── useGitHubData.ts     # GitHub API integration
│   ├── utils/
│   │   ├── buildFileTree.ts
│   │   ├── calculateComplexity.ts
│   │   └── types.ts
│   ├── services/
│   │   └── aiChatService.ts
│   └── pages/
├── supabase/
│   └── functions/chat/          # AI edge function (OpenAI)
└── package.json
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Data | GitHub REST API v3 |
| Backend | Supabase Edge Functions |
| AI | OpenAI GPT via Lovable AI Gateway |

### Scripts

```bash
npm run dev          # Development server on :8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run preview      # Preview production build
```

---

## 🎬 GitWrap

Your GitHub year in review — Spotify Wrapped style. GitWrap pulls your real GitHub activity data and presents it as a cinematic, animated slideshow with gradient blobs, smooth transitions, and shareable stats.

### Features

- 🎞️ **Cinematic slideshow** — 8 animated slides with Framer Motion transitions
- 📡 **Real GitHub data** — commits, PRs, issues, stars, repos, languages
- ⌨️ **Keyboard navigation** — arrow keys and spacebar
- 🌈 **Animated backgrounds** — dynamic gradient blobs with floating animations
- 🔓 **Zero setup** — no GitHub token required
- 📱 **Responsive** — desktop and mobile

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Installation

```bash
git clone <repository-url>
cd GitWrap
npm install
```

Create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
npm run dev
# Open http://localhost:3000
```

### The Slideshow

GitWrap generates 8 slides from your GitHub data:

| # | Slide | Content |
|---|-------|---------|
| 1 | **Intro** | Avatar, username, welcome |
| 2 | **Top Stats** | Commits, PRs, issues, total stars |
| 3 | **Top Repositories** | Most contributed and most starred |
| 4 | **Coding Habits** | Activity patterns and streaks |
| 5 | **Languages** | Language breakdown with visual percentages |
| 6 | **Fun Insights** | Late-night coding stats, personality type |
| 7 | **Collaboration** | Top collaborators, community engagement |
| 8 | **Outro** | Closing card |

### Usage

1. Open the app in your browser
2. Enter any GitHub username
3. Click **Generate Review**
4. Navigate slides with arrow keys, spacebar, or the on-screen buttons

### GitHub API Endpoints Used

```
GET /users/{username}           User profile
GET /users/{username}/repos     Repositories (up to 100)
GET /users/{username}/events    Activity events (up to 100)
```

No authentication required.

### Project Structure

```
GitWrap/
├── src/
│   ├── components/
│   │   └── Slides.tsx           # All slide components + animations
│   ├── lib/
│   │   └── github.ts            # API integration + stats processing
│   ├── App.tsx                  # State management + slideshow logic
│   ├── main.tsx
│   └── index.css                # Custom animations + gradient blobs
├── index.html
├── vite.config.ts
└── metadata.json
```

### Scripts

```bash
npm run dev        # Development server on :3000
npm run build      # Production build
npm run preview    # Preview production build
npm run clean      # Remove build artifacts
npm run lint       # TypeScript type checking
```

---

## Getting Started with GitBundle

### Clone everything

```bash
git clone <repository-url>
cd gitbundle
```

### Set up each tool

```bash
# Git-it-done (CLI)
npm install -g git-it-done

# GitExplorer (web)
cd gitexplorer && npm install

# GitWrap (web)
cd gitwrap && npm install
```

### Environment variables summary

| Tool | Variable | Required |
|------|----------|----------|
| GitExplorer | `VITE_GITHUB_TOKEN` | Optional |
| GitExplorer | `VITE_SUPABASE_URL` | Yes (AI chat) |
| GitExplorer | `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes (AI chat) |
| GitWrap | `GEMINI_API_KEY` | Yes |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit with conventional messages: `git commit -m 'feat: add amazing feature'`
5. Push and open a Pull Request

Each tool lives in its own directory and can be contributed to independently. Please follow the existing TypeScript patterns, maintain type safety, and test across both desktop and mobile where applicable.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for developers who live in their terminal and their browser tabs**