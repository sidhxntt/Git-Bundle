import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  GitBranch,
  AlertCircle,
  Star,
  GitFork,
  Eye,
  Users,
} from "lucide-react";

const KPI = ({ repoOverview, branches, pullRequests }) => {
  return (
    <>
      {/* Repository Overview - KPI Cards */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Repository Overview</CardTitle>
          <CardDescription>Core metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Star className="h-4 w-4" />
                <span>Stars</span>
              </div>
              <p className="text-2xl font-bold">
                {repoOverview.total_stars.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <GitFork className="h-4 w-4" />
                <span>Forks</span>
              </div>
              <p className="text-2xl font-bold">
                {repoOverview.total_forks.toLocaleString()}
              </p>
            </div>
            {/* <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Subscribers</span>
              </div>
              <p className="text-2xl font-bold">
                {repoOverview.total_subsribers?.toLocaleString() || 0}
              </p>
            </div> */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <GitBranch className="h-4 w-4" />
                <span>Branches</span>
              </div>
              <p className="text-2xl font-bold">
                {branches?.total_branches.toLocaleString() || 0}
              </p>
            </div>
             <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Eye className="h-4 w-4" />
                <span>Pull Requests</span>
              </div>
              <p className="text-2xl font-bold">
                {pullRequests.total_pr.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Open Issues</span>
              </div>
              <p className="text-2xl font-bold">
                {repoOverview?.total_open_issues.toLocaleString()}
              </p> 
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default KPI;
