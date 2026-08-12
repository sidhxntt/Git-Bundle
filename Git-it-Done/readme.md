# 🚀 Git-it-done

A smart, interactive CLI tool that automatically generates meaningful commit messages and streamlines your Git workflow. Built with TypeScript and Clack.js for a beautiful command-line experience.

## ✨ Features

- 🧠 **Smart Commit Message Generation** - Analyzes your changes to create conventional commit messages
- 🎨 **Beautiful Interactive CLI** - Modern prompts with colors, spinners, and emojis
- 🔍 **File Selection** - Choose which files to stage and commit
- ✏️ **Flexible Messaging** - Use generated, custom, or edited commit messages
- 🚀 **Auto-Push** - Optionally push changes to remote repository
- 🛡️ **Comprehensive Error Handling** - Handles edge cases gracefully
- 📊 **Visual Status Display** - Color-coded file changes and status

## 🎯 Use Cases

**Perfect for:**
- ✅ Ongoing projects with existing Git repositories
- ✅ Quick commits with meaningful messages
- ✅ Streamlined development workflow
- ✅ Teams following conventional commit standards

**Not intended for:**
- ❌ Setting up new repositories (follow GitHub's setup instructions)
- ❌ Complex Git operations (pull, rebase, revert, merge conflicts)
- ❌ Repository initialization or first commits

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **Git** installed and configured
- **Existing Git repository** with proper setup

### Git Configuration Required

Ensure your Git user is configured:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🛠️ Installation


```bash

npm install -g git-it-done

```



## 🚦 Quick Start

1. **Navigate to your project directory** (must be a Git repository):
   ```bash
   cd your-project
   ```

2. **Run the auto-committer**:
   ```bash
   git-it-done
   ```

3. **Follow the interactive prompts**:
   - View repository status
   - Choose files to stage (if needed)
   - Select commit message option
   - Confirm and commit
   - Optionally push to remote

## 🎮 Usage Examples

### Basic Workflow

```bash
$ git-it-done

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
│  ○ Cancel
│
◇  How would you like to create the commit message?
│  ● Use generated: "feat(src): add authentication functionality"
│  ○ Write custom message
│  ○ Edit generated message
│
◇  Commit with message: "feat(src): add authentication functionality"?
│  Yes
│
◆  ✅ Changes committed successfully!
│  Last commit: abc1234 feat(src): add authentication functionality
│
◇  Push to remote repository?
│  Yes
│
◆  🚀 Changes pushed successfully!
│
└  🎉 All done!
```

### Generated Commit Message Examples

The tool analyzes your changes and generates conventional commit messages:

- `feat(auth): add user authentication system`
- `fix(api): resolve validation errors`
- `docs: update API documentation`
- `style(ui): improve button styling`
- `test(auth): add authentication tests`
- `build: update dependencies`
- `chore: update configuration`

## 🏗️ Project Structure

```
auto-committer/
├── index.ts                     # Main entry point
├── package.json                 # Dependencies and scripts
├── utils/
│   ├── checkGitStatus.ts        # Git validation
│   ├── displayStatus.ts         # Repository status display
│   ├── fileStaging.ts          # File staging logic
│   ├── commitMessage.ts        # Commit message handling
│   ├── performCommit.ts        # Commit execution
│   ├── pushToRemote.ts         # Push to remote logic
│   ├── gitCommand.ts           # Git command utilities
│   ├── getFileChanges.ts       # File change detection
│   ├── generateCommitMessage.ts # Smart message generation
│   ├── formatFileStatus.ts     # File status formatting
│   ├── process_interruption.ts # Process handling
│   └── types/
│       └── types.ts            # TypeScript definitions
```

## 🔧 Configuration

The tool works out of the box but respects your Git configuration:

- **Git user settings** - Uses your configured name and email
- **Remote repositories** - Detects and uses existing remotes
- **Branch settings** - Works with your current branch

## 🎨 Commit Message Generation

The smart commit message generator analyzes:

### File Types
- `.js`, `.ts` → JavaScript/TypeScript changes
- `.css`, `.scss` → Styling changes
- `.md` → Documentation changes
- `.json`, `.yaml` → Configuration changes
- `test/`, `spec/` → Test changes

### Change Patterns
- **New files** → `feat:` (feature)
- **Modified files** → `fix:` or `feat:` based on content
- **Deleted files** → `remove:`
- **Test files** → `test:`
- **Documentation** → `docs:`
- **Dependencies** → `deps:`

### Content Analysis
- Function/class additions → `feat:`
- Bug fixes → `fix:`
- Refactoring → `refactor:`
- Style changes → `style:`

## 🚨 Error Handling

The tool handles common scenarios gracefully:

### Repository Issues
- **Not in Git repo** → Clear error message
- **Git not installed** → Installation guidance
- **User not configured** → Configuration commands

### File Issues
- **No changes** → Friendly "nothing to commit" message
- **Staging failures** → Retry suggestions
- **Empty commits** → Prevention and guidance

### Remote Issues
- **No remote configured** → Skip push with notification
- **Push failures** → Helpful error messages and suggestions
- **Network issues** → Clear error reporting

## 🛡️ Limitations

This tool is designed for **ongoing projects** and has intentional limitations:

### What it DOES NOT handle:
- ❌ **Repository initialization** - Use `git init` and follow GitHub's setup guide
- ❌ **First commits** - Use standard Git commands for initial setup
- ❌ **Pulling changes** - Use `git pull` manually
- ❌ **Rebasing** - Use `git rebase` for complex history management
- ❌ **Reverting commits** - Use `git revert` for undoing changes
- ❌ **Merge conflicts** - Resolve manually with Git tools
- ❌ **Branch management** - Use Git commands for branch operations

### What it DOES handle:
- ✅ **Smart commit message generation**
- ✅ **File staging and selection**
- ✅ **Commit execution**
- ✅ **Push to existing remotes**
- ✅ **Error prevention and guidance**

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with conventional messages: `feat: add amazing feature`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone <your-fork-url>
cd Git-Bundle/Git-it-Done

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## 📊 Dependencies

- **[@clack/prompts](https://github.com/natemoo-re/clack)** - Beautiful CLI prompts
- **[chalk](https://github.com/chalk/chalk)** - Terminal colors and styling
- **TypeScript** - Type safety and modern JavaScript features

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**"Not in a git repository"**
```bash
# Make sure you're in a Git repository
git status
# If not initialized, use:
git init
```

**"Git user not configured"**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**"No remote repository configured"**
```bash
# Add a remote repository
git remote add origin <repository-url>
```

**"Failed to push"**
```bash
# Set upstream branch
git push --set-upstream origin main
```

### Getting Help

1. Check this README for common solutions
2. Ensure your Git repository is properly set up
3. Verify you have the required Node.js version
4. Check that Git is installed and in your PATH


## 🙏 Acknowledgments

- [Clack.js](https://github.com/natemoo-re/clack) for the beautiful CLI interface
- [Conventional Commits](https://www.conventionalcommits.org/) for the commit message standard
- The open-source community for inspiration and tools

---

**Made with ❤️ for developers who love clean commit histories**