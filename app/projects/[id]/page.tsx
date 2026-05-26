"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { projectService } from "@/lib/services/projectService";
import { analyticsService } from "@/lib/analytics/analyticsService";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useProjectStore } from "@/store/useProjectStore";

export default function ProjectEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const { loadGraph } = useGraphStore();
  const { setProjectName, setCurrentProjectId } = useEditorStore();
  const { user } = useProjectStore();

  useEffect(() => {
    if (!id) return;

    async function load() {
      setStatus("loading");
      try {
        const project = await projectService.get(id);
        if (!project) {
          setStatus("error");
          return;
        }

        // Load graph data into the existing stores — editor renders as normal
        loadGraph(project.graph.nodes, project.graph.edges);
        setProjectName(project.name);
        setCurrentProjectId(project.id);
        analyticsService.setProject(project.id);
        analyticsService.track("project_opened");

        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    load();

    // Cleanup: clear project ID when leaving
    return () => {
      setCurrentProjectId(null);
      analyticsService.setProject(null);
    };
  }, [id, loadGraph, setProjectName, setCurrentProjectId]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading project…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <AlertTriangle className="w-8 h-8 text-amber-400/60" />
          <div>
            <p className="text-sm font-semibold mb-1">Project not found</p>
            <p className="text-xs text-muted-foreground">
              {user
                ? "This project doesn't exist or you don't have access to it."
                : "Sign in to access cloud projects."}
            </p>
          </div>
          <Button size="sm" onClick={() => router.push("/projects")}>
            Back to projects
          </Button>
        </div>
      </div>
    );
  }

  return <EditorLayout />;
}
