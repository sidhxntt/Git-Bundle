import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { cn } from "@/lib/utils";

interface FloatingChatWidgetProps {
  fileStructure: any[];
  commits: any[];
  issues: any[];
  repoData: any;
}

export const FloatingChatWidget = ({ fileStructure, commits, issues, repoData }: FloatingChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all duration-300 z-50",
          "bg-primary hover:bg-primary/90 hover:scale-110",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Open AI Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Popup Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
          "w-[360px] md:w-[400px] max-h-[80vh] h-[600px]",
          "bg-card rounded-2xl shadow-2xl border border-border",
          "flex flex-col overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none",
          "origin-bottom-right"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") setIsOpen(false);
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 id="chat-title" className="font-semibold text-foreground">AI Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 hover:bg-muted"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatInterface
            fileStructure={fileStructure}
            commits={commits}
            issues={issues}
            repoData={repoData}
          />
        </div>
      </div>

      {/* Mobile Fullscreen Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">AI Assistant</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Chat Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatInterface
                fileStructure={fileStructure}
                commits={commits}
                issues={issues}
                repoData={repoData}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
