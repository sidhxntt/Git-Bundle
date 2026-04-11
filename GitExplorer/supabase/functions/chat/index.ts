import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, fileStructure, commits, issues, repoData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build rich context for the AI
    const fileCount = countFiles(fileStructure || []);
    const languages = repoData?.languages?.language_composition;
    const topLang = languages ? Object.keys(languages)[0] : "unknown";
    const repoName = repoData?.repoOverview?.repo_name || "this repository";
    const contributors = repoData?.contributors?.top_5_contributors || [];
    
    // Extract file details for context
    const complexFiles = findComplexFiles(fileStructure || []);
    const fileStructureSummary = complexFiles.slice(0, 10).map(f => 
      `${f.path} (${f.complexity || 'unknown'} complexity, ${f.size ? Math.round(f.size / 1024) + 'KB' : 'size unknown'})`
    ).join('\n');

    // Recent commits summary
    const recentCommitsSummary = (commits || []).slice(0, 10).map((c: any) => 
      `${c.commit.author.name}: ${c.commit.message.split('\n')[0]} (${c.commit.author.date})`
    ).join('\n');

    // Issues summary
    const issuesSummary = (issues || []).slice(0, 10).map((issue: any) => 
      `#${issue.number}: ${issue.title} by @${issue.user.login} - ${issue.labels.map((l: any) => l.name).join(', ')}`
    ).join('\n');

    const systemPrompt = `You're a friendly, helpful AI assistant for ${repoName}! 😊

REPOSITORY OVERVIEW:
• Primary language: ${topLang}
• Total files: ${fileCount}
• Open issues: ${issues?.length || 0}
• Recent commits tracked: ${commits?.length || 0}
• Top contributors: ${contributors.map((c: any) => `@${c.user} (${c.contribution_count})`).join(', ')}

COMPLEX FILES I CAN SEE:
${fileStructureSummary || 'No complex files detected'}

RECENT COMMITS:
${recentCommitsSummary || 'No recent commits available'}

OPEN ISSUES:
${issuesSummary || 'No open issues'}

FULL DATA AVAILABLE:
I have complete access to:
• File structure with complexity metrics for all ${fileCount} files
• All ${commits?.length || 0} recent commits with full details
• All ${issues?.length || 0} issues with labels and metadata
• Repository insights including language composition, contribution stats, and more

RESPONSE STYLE:
• Be warm and encouraging! Use emojis when appropriate
• Be BRIEF - 2-4 sentences unless user asks for more details
• Use bullet points (•) for lists
• Use **bold** for file names and key terms
• Use \`code\` for technical terms
• Reference specific files, issues (#123), commits when relevant
• Format code with proper syntax highlighting
• Make responses scannable and actionable

Example: "Hey! 👋 The most complex file is **src/hooks/useAuth.ts**:
• ~420 LOC with high cyclomatic complexity
• Handles token refresh + API calls
• Consider splitting into smaller helpers for better maintainability"`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function countFiles(files: any[]): number {
  let count = 0;
  const traverse = (nodes: any[]) => {
    nodes.forEach((node: any) => {
      if (node.type === "file") count++;
      if (node.children) traverse(node.children);
    });
  };
  traverse(files);
  return count;
}

function findComplexFiles(files: any[]): any[] {
  const result: any[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach((node: any) => {
      if (node.type === "file") {
        result.push({
          path: node.path,
          complexity: node.complexity,
          size: node.size
        });
      }
      if (node.children) traverse(node.children);
    });
  };
  traverse(files);
  return result.sort((a, b) => {
    const complexityOrder: any = { high: 3, medium: 2, low: 1, unknown: 0 };
    return (complexityOrder[b.complexity] || 0) - (complexityOrder[a.complexity] || 0) || (b.size || 0) - (a.size || 0);
  });
}
