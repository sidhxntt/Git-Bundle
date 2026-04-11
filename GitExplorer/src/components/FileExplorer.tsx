import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronDown, File, Folder, AlertCircle } from "lucide-react";
import { FileNode } from "@/utils/types";

interface FileTreeNodeProps {
  node: FileNode;
  depth?: number;
}

const FileTreeNode = ({ node, depth = 0 }: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(depth === 0);

  const getComplexityColor = (complexity?: "low" | "medium" | "high") => {
    switch (complexity) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      default:
        return "";
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-secondary/50 transition-colors ${
          node.hotspot ? "bg-primary/5 border-l-2 border-primary" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => node.type === "folder" && setIsOpen(!isOpen)}
      >
        {node.type === "folder" && (
          <span className="text-muted-foreground">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
        {node.type === "folder" ? (
          <Folder className="h-4 w-4 text-accent" />
        ) : (
          <File className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm truncate">{node.name}</span>
        <div className="ml-auto flex items-center gap-2">
          {node.complexity && (
            <span className={`text-xs px-2 py-0.5 rounded border ${getComplexityColor(node.complexity)}`}>
              {node.complexity.charAt(0).toUpperCase() + node.complexity.slice(1)}
            </span>
          )}
          {node.hotspot && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              Hot
            </span>
          )}
        </div>
      </div>
      {node.type === "folder" && isOpen && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child, i) => (
            <FileTreeNode key={`${child.path}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileExplorerProps {
  fileStructure: FileNode[];
  loading: boolean;
  error: string | null;
}

export const FileExplorer = ({ fileStructure, loading, error }: FileExplorerProps) => {
  return (
    <Card className="bg-gradient-card border-border shadow-card max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">File Explorer</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-green-500/50 bg-green-500/20" />
              <span className="text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-yellow-500/50 bg-yellow-500/20" />
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-red-500/50 bg-red-500/20" />
              <span className="text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading file structure...</div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load file structure: {error}</span>
          </div>
        )}
        
        {!loading && !error && fileStructure.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No files found in this repository
          </div>
        )}
        
        {!loading && !error && fileStructure.length > 0 && (
          <div>
            {fileStructure.map((node, i) => (
              <FileTreeNode key={`${node.path}-${i}`} node={node} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
