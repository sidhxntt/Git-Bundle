import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, FolderTree, Activity } from "lucide-react";
import { FileExplorer } from "@/components/FileExplorer";
import { RepositoryStats } from "@/components/RepositoryStats";
import { RecentActivities } from "@/components/RecentActivities";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { 
  useFileStructure, 
  useCommits, 
  useIssues, 
  useGitHubRepository 
} from "@/hooks/useGitHubData";
import { Link } from "react-router-dom";

interface DashboardProps {
  repositoryUrl: string;
  onBack: () => void;
}

export const Dashboard = ({ repositoryUrl, onBack }: DashboardProps) => {
  const repoName = repositoryUrl.split("/").slice(-2).join("/");
  const { fileStructure, loading, error } = useFileStructure(repositoryUrl);
  const { commits } = useCommits(repositoryUrl);
  const { issues } = useIssues(repositoryUrl);
  const repoData = useGitHubRepository(repositoryUrl);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{repoName}</h1>
                <p className="text-sm text-muted-foreground">Repository Dashboard</p>
              </div>
            </div>
            <Link to={repositoryUrl} target="_blank" rel="noopener noreferrer">
             <Button className="bg-primary hover:bg-primary/90">
              Go to Repository
            </Button>
            </Link>
          
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              <span className="hidden sm:inline">Explorer</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-0">
            <RepositoryStats repositoryUrl={repositoryUrl} />
          </TabsContent>

          <TabsContent value="explorer" className="mt-0">
            <FileExplorer fileStructure={fileStructure} loading={loading} error={error} />
          </TabsContent>

          <TabsContent value="activities" className="mt-0">
            <RecentActivities repositoryUrl={repositoryUrl} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChatWidget 
        fileStructure={fileStructure}
        commits={commits}
        issues={issues}
        repoData={repoData}
      />
    </div>
  );
};
