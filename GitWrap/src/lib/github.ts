export async function fetchGitHubData(username: string) {
  const headers = { Accept: 'application/vnd.github.v3+json' };

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers }),
      fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers })
    ]);

    if (!userRes.ok) throw new Error('User not found or rate limit exceeded');

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];
    const events = eventsRes.ok ? await eventsRes.json() : [];

    // Aggregate Stats
    let commits = 0;
    let prs = 0;
    let issues = 0;
    let lateNightCommits = 0;
    const repoEventCounts: Record<string, number> = {};
    const collaborators = new Map<string, number>();

    events.forEach((event: any) => {
      const repoName = event.repo.name;
      repoEventCounts[repoName] = (repoEventCounts[repoName] || 0) + 1;

      const date = new Date(event.created_at);
      const hour = date.getHours();

      if (event.type === 'PushEvent') {
        const pushCommits = event.payload.commits?.length || 0;
        commits += pushCommits;
        if (hour >= 0 && hour <= 5) lateNightCommits += pushCommits;
      } else if (event.type === 'PullRequestEvent') {
        prs++;
      } else if (event.type === 'IssuesEvent') {
        issues++;
      } else if (event.type === 'PullRequestReviewEvent' || event.type === 'IssueCommentEvent') {
        const owner = repoName.split('/')[0];
        if (owner !== user.login) {
          collaborators.set(owner, (collaborators.get(owner) || 0) + 1);
        }
      }
    });

    const stars = repos.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);

    const mostStarred = repos.sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)[0]?.name || 'No repos yet';
    
    const mostContributedEntry = Object.entries(repoEventCounts).sort((a, b) => b[1] - a[1])[0];
    const mostContributed = mostContributedEntry ? mostContributedEntry[0] : 'No recent activity';
    const mostContributedCount = mostContributedEntry ? mostContributedEntry[1] : 0;

    // Languages
    const langCounts: Record<string, number> = {};
    let totalLangs = 0;
    repos.forEach((repo: any) => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        totalLangs++;
      }
    });

    const colors = ['bg-blue-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-400'];
    const languages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], i) => ({
        name,
        percent: Math.round((count / totalLangs) * 100),
        color: colors[i % colors.length]
      }));

    const topCollaboratorEntry = Array.from(collaborators.entries()).sort((a, b) => b[1] - a[1])[0];
    const topCollaborator = topCollaboratorEntry ? topCollaboratorEntry[0] : 'The Open Source Community';

    return {
      user: { name: user.name || user.login, login: user.login, avatar_url: user.avatar_url },
      stats: { commits, prs, issues, stars },
      repos: { mostStarred, mostContributed, mostContributedCount },
      habits: { activeTime: lateNightCommits > 5 ? '2:00 AM' : '2:00 PM', isNightOwl: lateNightCommits > 5, streak: Math.min(events.length, 14) },
      languages: languages.length > 0 ? languages : [{ name: 'Markdown', percent: 100, color: 'bg-gray-400' }],
      insights: { lateNightCommits },
      collab: { topCollaborator }
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
}
