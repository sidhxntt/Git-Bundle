# GitWrap

A Spotify Wrapped-style cinematic slideshow for your GitHub statistics. Generate beautiful, animated presentations showcasing your coding year in review.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Features

- **Cinematic Slideshow**: Beautiful, animated slides with smooth transitions inspired by Spotify Wrapped
- **GitHub API Integration**: Fetches real data from GitHub's public API including commits, PRs, issues, and repositories
- **Interactive Navigation**: Navigate through slides using arrow keys or spacebar
- **Animated Backgrounds**: Dynamic gradient blobs with floating animations and noise overlay
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Real-time Statistics**: Analyzes coding habits, top repositories, language usage, and collaboration patterns
- **Zero Setup**: No GitHub tokens required - uses public API endpoints

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GitWrap
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
touch .env.local
```

4. Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Generating Your GitHub Wrapped

1. Open the application in your browser
2. Enter any GitHub username in the input field
3. Click "Generate Review" to fetch data and start the slideshow
4. Use arrow keys, spacebar, or click navigation buttons to move between slides

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for enhanced features | Yes |

### Slide Configuration

The slideshow includes 8 different slides:

- **Intro**: Welcome slide with user avatar and name
- **Top Stats**: Recent commits, PRs, issues, and total stars
- **Top Repositories**: Most contributed and most starred repos
- **Coding Habits**: Activity patterns and streak information
- **Languages**: Programming language breakdown with visual percentages
- **Fun Insights**: Late-night coding statistics and personality insights
- **Collaboration**: Top collaborators and community engagement
- **Outro**: Closing slide with call-to-action

## Project Structure

```
GitWrap/
├── src/
│   ├── components/
│   │   └── Slides.tsx          # All slide components with animations
│   ├── lib/
│   │   └── github.ts           # GitHub API integration and data processing
│   ├── App.tsx                 # Main application component with state management
│   ├── main.tsx               # React application entry point
│   └── index.css              # Global styles and animations
├── index.html                 # HTML template with font imports
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration with Tailwind and environment setup
├── tsconfig.json             # TypeScript configuration
└── metadata.json             # App metadata for AI Studio deployment
```

### Key Files

- **`src/lib/github.ts`**: Handles GitHub API requests, data aggregation, and statistics calculation
- **`src/components/Slides.tsx`**: Contains all slide components with Framer Motion animations
- **`src/App.tsx`**: Main application logic including slideshow navigation and state management
- **`src/index.css`**: Custom CSS animations for gradient backgrounds and floating blobs

## API Integration

The application uses GitHub's public API endpoints:

- `GET /users/{username}` - User profile information
- `GET /users/{username}/repos` - Repository data (up to 100 repos)
- `GET /users/{username}/events` - Recent activity events (up to 100 events)

No authentication required for public repositories and user data.

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Run TypeScript type checking |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

When contributing, please ensure:
- TypeScript compilation passes (`npm run lint`)
- Code follows the existing style patterns
- New features include appropriate animations and responsive design
