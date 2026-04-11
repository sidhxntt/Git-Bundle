import { FileNode } from "@/hooks/useFileStructure";
import { Commit } from "@/hooks/useCommits";
import { Issue } from "@/hooks/useIssues";

interface ChatContext {
  fileStructure: FileNode[];
  commits: Commit[];
  issues: Issue[];
  repoData: any;
}

export const generateAIResponse = (message: string, context: ChatContext): string => {
  const lowerMessage = message.toLowerCase();

  // Complex files analysis
  if (lowerMessage.includes("complex") && lowerMessage.includes("file")) {
    const complexFiles = findComplexFiles(context.fileStructure);
    if (complexFiles.length === 0) {
      return "I analyzed the codebase and most files appear to have low to medium complexity. This suggests good code organization! 🎉";
    }
    
    const fileList = complexFiles.slice(0, 5).map(f => 
      `• **${f.path}** (${f.complexity} complexity${f.size ? `, ${Math.round(f.size / 1024)}KB` : ''})`
    ).join('\n');
    
    return `Based on the file structure analysis, here are the most complex files:\n\n${fileList}\n\nThese files might benefit from refactoring or have significant logic that requires careful attention when modifying.`;
  }

  // Good first issues
  if ((lowerMessage.includes("good first") || lowerMessage.includes("beginner")) && lowerMessage.includes("issue")) {
    const goodFirstIssues = context.issues.filter(issue => 
      issue.labels.some(label => 
        label.name.toLowerCase().includes("good first issue") ||
        label.name.toLowerCase().includes("beginner") ||
        label.name.toLowerCase().includes("easy")
      )
    );

    if (goodFirstIssues.length === 0) {
      return "I couldn't find issues specifically labeled as 'good first issue', but let me suggest some recently opened issues that might be approachable:\n\n" +
        context.issues.slice(0, 3).map(issue => 
          `🟢 **#${issue.number}** ${issue.title}\n   Opened by @${issue.user.login} • ${formatTimeAgo(issue.created_at)}`
        ).join('\n\n');
    }

    return "Here are some great issues for first-time contributors:\n\n" +
      goodFirstIssues.slice(0, 5).map(issue => 
        `🌱 **#${issue.number}** ${issue.title}\n   Opened by @${issue.user.login} • ${formatTimeAgo(issue.created_at)}\n   [View issue](${issue.html_url})`
      ).join('\n\n');
  }

  // Easiest issue
  if (lowerMessage.includes("easiest") || (lowerMessage.includes("easy") && lowerMessage.includes("issue"))) {
    const sortedIssues = [...context.issues].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (sortedIssues.length === 0) {
      return "Great news! There are no open issues at the moment. The project seems to be in good shape! ✨";
    }

    const easiest = sortedIssues[0];
    return `The most recently opened issue is:\n\n**#${easiest.number}** ${easiest.title}\n\nOpened by @${easiest.user.login} about ${formatTimeAgo(easiest.created_at)}.\n\n[View on GitHub](${easiest.html_url})`;
  }

  // How to contribute
  if (lowerMessage.includes("contribute") || lowerMessage.includes("contribution")) {
    const openIssuesCount = context.issues.length;
    const languages = context.repoData?.languages?.language_composition;
    const topLang = languages ? Object.keys(languages)[0] : "the primary language";

    return `Great that you want to contribute! Here's how you can get started:\n\n` +
      `🎯 **Current Status:**\n` +
      `• ${openIssuesCount} open issues waiting for attention\n` +
      `• Primary tech: ${topLang}\n\n` +
      `💡 **Suggested Starting Points:**\n` +
      `1. Check the open issues - I found ${openIssuesCount} opportunities\n` +
      `2. Look for documentation improvements\n` +
      `3. Review the recent commits to understand active areas\n\n` +
      `Want me to find good first issues for you? Just ask! 🚀`;
  }

  // Recent changes
  if (lowerMessage.includes("recent") || lowerMessage.includes("changed") || lowerMessage.includes("latest")) {
    const recentCommits = context.commits.slice(0, 5);
    
    if (recentCommits.length === 0) {
      return "I don't have access to recent commit data at the moment.";
    }

    return `Here are the most recent changes:\n\n` +
      recentCommits.map(commit => 
        `📝 **${commit.commit.message.split('\n')[0]}**\n   by ${commit.commit.author.name} • ${formatTimeAgo(commit.commit.author.date)}`
      ).join('\n\n');
  }

  // Most active contributor
  if (lowerMessage.includes("active contributor") || lowerMessage.includes("top contributor")) {
    const contributors = context.repoData?.contributors?.top_5_contributors;
    
    if (!contributors || contributors.length === 0) {
      return "I don't have contributor data available right now.";
    }

    const top = contributors[0];
    return `The most active contributor is **@${top.user}** with ${top.contribution_count} contributions! 🏆\n\n` +
      `Top 5 contributors:\n` +
      contributors.slice(0, 5).map((c: any, i: number) => 
        `${i + 1}. @${c.user} - ${c.contribution_count} contributions`
      ).join('\n');
  }

  // Language composition
  if (lowerMessage.includes("language") || lowerMessage.includes("tech stack")) {
    const languages = context.repoData?.languages?.language_composition;
    
    if (!languages) {
      return "I don't have language composition data available.";
    }

    const entries = Object.entries(languages) as [string, number][];
    const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
    
    if (total === 0) {
      return "No language data available for this repository.";
    }
    
    const langList = entries
      .map(([lang, bytes]) => {
        const percentage = ((bytes / total) * 100).toFixed(1);
        return `• **${lang}**: ${percentage}%`;
      })
      .join('\n');

    return `This repository's language composition:\n\n${langList}\n\nThe codebase is primarily written in ${entries[0][0]}.`;
  }

  // Understand codebase
  if (lowerMessage.includes("understand") || lowerMessage.includes("explain") || lowerMessage.includes("overview")) {
    const languages = context.repoData?.languages?.language_composition;
    const topLang = languages ? Object.keys(languages)[0] : "unknown";
    const fileCount = countFiles(context.fileStructure);
    const repoName = context.repoData?.repoOverview?.repo_name || "this repository";

    return `Let me help you understand **${repoName}**:\n\n` +
      `📊 **Overview:**\n` +
      `• Primary language: ${topLang}\n` +
      `• ${fileCount} files in the repository\n` +
      `• ${context.issues.length} open issues\n` +
      `• ${context.commits.length} recent commits tracked\n\n` +
      `💡 **Getting Oriented:**\n` +
      `• Check the file structure to see how code is organized\n` +
      `• Review recent commits to see what's being actively developed\n` +
      `• Look at open issues to understand current priorities\n\n` +
      `Ask me anything specific about files, issues, or recent activity! 🚀`;
  }

  // File-specific queries
  if (lowerMessage.includes("file:") || lowerMessage.includes("about ") && lowerMessage.includes(".")) {
    return "I can see the file structure, but I don't have access to individual file contents yet. I can tell you about file complexity and organization though!";
  }

  // Default helpful response
  return `I'm here to help you navigate this repository! I have access to:\n\n` +
    `📂 File structure and complexity analysis\n` +
    `🧑‍💻 Recent commits (${context.commits.length} tracked)\n` +
    `🐛 Open issues (${context.issues.length} found)\n` +
    `📊 Repository insights and metrics\n\n` +
    `Try asking me:\n` +
    `• "What are the most complex files?"\n` +
    `• "Show me good first issues"\n` +
    `• "How can I contribute?"\n` +
    `• "What's changed recently?"\n` +
    `• "Help me understand the codebase"`;
};

const findComplexFiles = (files: FileNode[]): FileNode[] => {
  const result: FileNode[] = [];
  
  const traverse = (nodes: FileNode[]) => {
    nodes.forEach(node => {
      if (node.type === "file" && node.complexity === "high") {
        result.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  
  traverse(files);
  return result.sort((a, b) => (b.size || 0) - (a.size || 0));
};

const countFiles = (files: FileNode[]): number => {
  let count = 0;
  
  const traverse = (nodes: FileNode[]) => {
    nodes.forEach(node => {
      if (node.type === "file") count++;
      if (node.children) traverse(node.children);
    });
  };
  
  traverse(files);
  return count;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};
