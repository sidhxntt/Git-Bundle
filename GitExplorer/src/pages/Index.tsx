import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [repositoryUrl, setRepositoryUrl] = useState<string>("");
  const [showDashboard, setShowDashboard] = useState(false);

  const handleExplore = (url: string) => {
    setRepositoryUrl(url);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {!showDashboard ? (
        <Hero onExplore={handleExplore} />
      ) : (
        <Dashboard repositoryUrl={repositoryUrl} onBack={() => setShowDashboard(false)} />
      )}
    </div>
  );
};

export default Index;
