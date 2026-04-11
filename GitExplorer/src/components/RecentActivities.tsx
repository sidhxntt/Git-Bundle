import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GitCommit, AlertCircle, Loader2 } from "lucide-react";
import { useCommits, useIssues } from "@/hooks/useGitHubData";
import { formatDistanceToNow } from "date-fns";

interface RecentActivitiesProps {
  repositoryUrl: string;
}

export const RecentActivities = ({ repositoryUrl }: RecentActivitiesProps) => {
  const {
    commits,
    loading: commitsLoading,
    error: commitsError,
  } = useCommits(repositoryUrl);
  const {
    issues,
    loading: issuesLoading,
    error: issuesError,
  } = useIssues(repositoryUrl);

  return (
    <div className="w-full">
      <Tabs defaultValue="commits" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="commits" className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Recent Commits
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Open Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="mt-0">
          {commitsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : commitsError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">
                Error loading commits: {commitsError}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {commits.map((commit) => (
                <Card
                  key={commit.sha}
                  className="p-4 hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={commit.author?.avatar_url} />
                      <AvatarFallback>
                        {commit.commit.author.name
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {commit.author?.login || commit.commit.author.name}
                          </p>
                          <p className="text-sm text-foreground mt-1 break-words">
                            {commit.commit.message.split("\n")[0]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono">
                          {commit.sha.substring(0, 7)}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(
                            new Date(commit.commit.author.date),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-0">
          {issuesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : issuesError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">
                Error loading issues: {issuesError}
              </p>
            </Card>
          ) : issues.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No open issues found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <Card
                  key={issue.id}
                  className="p-4 hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer"
                  onClick={() => window.open(issue.html_url, "_blank")}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={issue.user.avatar_url} />
                      <AvatarFallback>
                        {issue.user.login.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              #{issue.number}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm text-foreground break-words">
                            {issue.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Opened by {issue.user.login}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(issue.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {issue.labels.slice(0, 3).map((label) => (
                            <Badge
                              key={label.name}
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: `#${label.color}`,
                                color: `#${label.color}`,
                              }}
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
