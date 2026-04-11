import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Code2,
  GitBranch,
  Sparkles,
  ArrowRight,
  Star,
  GitFork,
} from "lucide-react";

interface HeroProps {
  onExplore: (url: string) => void;
}

export const Hero = ({ onExplore }: HeroProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onExplore(url);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-8 lg:px-12 py-16 md:py-24 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-pulse">
        <Code2 className="h-12 w-12 text-primary/20" />
      </div>
      <div className="absolute bottom-32 right-20 animate-pulse delay-300">
        <GitBranch className="h-16 w-16 text-accent/20" />
      </div>
      <div className="absolute top-40 right-32 animate-pulse delay-700">
        <Sparkles className="h-10 w-10 text-primary/20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-2 sm:px-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Code Exploration
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Explore Any
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              GitHub Repository
            </span>
            with Intelligence
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform complex codebases into interactive insights. Get
            AI-powered answers, identify hotspots, and make your first
            contribution faster than ever.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl w-full mx-auto px-1"
        >
          <Input
            type="url"
            placeholder="https://github.com/owner/repository"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-14 text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors flex-1"
            required
          />
          <Button
            type="submit"
            size="lg"
            className="h-14 px-8 bg-primary hover:bg-primary/90 shadow-glow transition-all duration-300 hover:scale-105"
          >
            Explore
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        <div className="flex flex-wrap justify-center gap-8 pt-8">
          {[
            {
              icon: Code2,
              label: "AI Chat",
              desc: "Ask Anything about the repository",
            },
            {
              icon: GitBranch,
              label: "File Explorer",
              desc: "Identify hotspots & code complexities instantly",
            },
            {
              icon: Sparkles,
              label: "Smart Analysis",
              desc: "Get deep insights about the repository",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors"
            >
              <feature.icon className="h-5 w-5 text-accent" />
              <div className="text-left">
                <div className="font-semibold text-sm">{feature.label}</div>
                <div className="text-xs text-muted-foreground">
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Repositories Section */}
        <div className="pt-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Explore Popular Repositories</h2>
            <p className="text-muted-foreground">
              Try it out with these well-known open-source projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-2 sm:px-4">
            {[
              {
                name: "facebook/react",
                description:
                  "A JavaScript library for building user interfaces",
                stars: "230k",
                forks: "47k",
                language: "JavaScript",
              },
              {
                name: "tailwindlabs/tailwindcss",
                description: "A utility-first CSS framework",
                stars: "84k",
                forks: "4.2k",
                language: "TypeScript",
              },
              {
                name: "nodejs/node",
                description: "Node.js JavaScript runtime",
                stars: "108k",
                forks: "29.8k",
                language: "JavaScript",
              },
            ].map((repo, i) => (
              <Card
                key={i}
                className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-105 group"
                onClick={() => onExplore(`https://github.com/${repo.name}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {repo.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {repo.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{repo.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        <span>{repo.forks}</span>
                      </div>
                    </div>
                    <span className="text-accent text-xs font-medium">
                      {repo.language}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
