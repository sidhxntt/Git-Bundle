# GitExplorer

An AI-powered GitHub repository analysis tool that transforms complex codebases into interactive insights with intelligent exploration, visualization, and automated contribution guidance.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## Features

- **AI-Powered Chat Interface** - Ask intelligent questions about any GitHub repository
- **Interactive File Explorer** - Navigate codebases with hotspot detection and complexity analysis
- **Repository Analytics** - Comprehensive metrics including contributor distribution, language composition, and activity patterns
- **Real-time Insights** - Live data visualization with interactive charts and graphs
- **Code Complexity Analysis** - Automatic detection of low, medium, and high complexity files
- **Smart Contribution Guidance** - AI suggestions for good first issues and contribution opportunities
- **Responsive Design** - Optimized for desktop and mobile devices
- **GitHub Integration** - Direct repository analysis using GitHub API

## Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub API token (optional, for higher rate limits)
- Supabase account (for AI chat functionality)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GitExplorer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env` file:
```bash
VITE_GITHUB_TOKEN=your_github_token_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:8080`

## Configuration

### Environment Variables

- `VITE_GITHUB_TOKEN` - GitHub personal access token for API requests (optional but recommended)
- `VITE_SUPABASE_URL` - Supabase project URL for AI chat functionality  
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key

### Supabase Setup

The application requires a Supabase edge function for AI chat. The function is located at `supabase/functions/chat/index.ts` and requires:

- `LOVABLE_API_KEY` environment variable set in Supabase

## Usage

### Basic Repository Analysis

1. Enter a GitHub repository URL in the format: `https://github.com/owner/repository`
2. Click "Explore" to begin analysis
3. Navigate through three main sections:
   - **Insights** - Repository statistics and visualizations
   - **Explorer** - Interactive file tree with complexity indicators
   - **Activities** - Recent commits and open issues

### AI Chat Interface

Click the floating chat button to interact with the AI assistant:

```typescript
// Example questions you can ask:
"What are the most complex files in this repository?"
"Show me good first issues for beginners"
"Explain the project structure"
"Who are the top contributors?"
"What languages are used in this project?"
```

### File Complexity Analysis

Files are automatically categorized by complexity:
- **Green (Low)** - Simple files like JSON, Markdown, configuration files
- **Yellow (Medium)** - Standard code files under 15KB
- **Red (High)** - Large or complex code files over 15KB

### Repository Metrics

The dashboard provides comprehensive analytics:
- Stars, forks, and issue counts
- Contributor distribution and activity
- Language composition breakdown
- Commit patterns and volatility
- Pull request to issue ratios

## Project Structure

```
GitExplorer/
├── src/
│   ├── components/           # React components
│   │   ├── charts/          # Data visualization components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── ChatInterface.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FileExplorer.tsx
│   │   └── Hero.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useGitHubData.ts # GitHub API integration
│   ├── utils/               # Utility functions
│   │   ├── buildFileTree.ts # File structure processing
│   │   ├── calculateComplexity.ts
│   │   └── types.ts         # TypeScript type definitions
│   ├── services/            # External service integrations
│   │   └── aiChatService.ts
│   └── pages/               # Route components
├── supabase/
│   └── functions/chat/      # AI chat edge function
├── public/                  # Static assets
└── package.json
```

### Key Files

- `src/hooks/useGitHubData.ts` - Main GitHub API integration with data fetching logic
- `src/components/Dashboard.tsx` - Primary application interface with tabbed navigation
- `src/components/charts/` - Interactive data visualizations using Recharts
- `src/utils/buildFileTree.ts` - Processes GitHub tree API response into navigable structure
- `supabase/functions/chat/index.ts` - AI chat backend using OpenAI integration

## API Reference

### GitHub Data Hook

```typescript
const { data, loading, error } = useGitHubRepository(repositoryUrl);

// Returns GitHubRepositoryData with:
interface GitHubRepositoryData {
  repoOverview: RepoOverview;
  contributors: ContributorsData | null;
  pullRequests: PullRequestsData;
  commits: CommitsData | null;
  languages: LanguagesData | null;
  branches: BranchesData;
  issues: Issue[];
  recentCommits: Commit[];
  fileStructure: FileNode[];
}
```

### File Structure Processing

```typescript
// File tree node structure
interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  hotspot?: boolean;
  complexity?: "low" | "medium" | "high";
  size?: number;
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **API**: GitHub REST API v3
- **Backend**: Supabase Edge Functions
- **AI**: OpenAI GPT integration via Lovable AI Gateway

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and ensure they follow the existing code style
4. Test your changes thoroughly
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices and maintain type safety
- Use the existing component structure and naming conventions
- Ensure responsive design compatibility
- Add proper error handling for API calls
- Update documentation for any new features
