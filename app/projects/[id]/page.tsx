"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { EditorLayout } from "@/components/organisms/EditorLayout";
import { projectService } from "@/lib/services/projectService";
import { analyticsService } from "@/lib/analytics/analyticsService";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useProjectStore } from "@/store/useProjectStore";
import style from "./ProjectEditorPage.module.scss";

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
        if (!project) { setStatus("error"); return; }
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

    return () => {
      setCurrentProjectId(null);
      analyticsService.setProject(null);
    };
  }, [id, loadGraph, setProjectName, setCurrentProjectId]);

  if (status === "loading") {
    return (
      <div className={style.loadingScreen}>
        <div className={style.loadingInner}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
          <p className={style.loadingText}>Loading project…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={style.errorScreen}>
        <div className={style.errorInner}>
          <AlertTriangle size={32} style={{ color: "oklch(0.72 0.18 85 / 60%)" }} />
          <div>
            <p className={style.errorTitle}>Project not found</p>
            <p className={style.errorDesc}>
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
