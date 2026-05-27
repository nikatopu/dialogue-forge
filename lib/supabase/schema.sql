-- ─────────────────────────────────────────────────────────────────────────────
-- Dialogue Forge — Supabase schema
-- Run this in the Supabase SQL editor after creating your project.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Projects ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL DEFAULT 'Untitled Project',
  graph         JSONB       NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
  preview_image TEXT,
  mode          TEXT        NOT NULL DEFAULT 'cloud'
                              CHECK (mode IN ('local', 'cloud')),
  is_template   BOOLEAN     NOT NULL DEFAULT false,
  theme         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── v1.3.1 migration (run on existing databases) ──────────────────────────────
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS theme TEXT;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can only read their own projects
CREATE POLICY "select_own_projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert projects for themselves
CREATE POLICY "insert_own_projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "update_own_projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "delete_own_projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ── Analytics events ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  event      TEXT        NOT NULL,
  metadata   JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events (anonymous events have null user_id)
CREATE POLICY "insert_own_events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can read their own events
CREATE POLICY "select_own_events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS projects_user_id_idx
  ON public.projects (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx
  ON public.analytics_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_event_idx
  ON public.analytics_events (event, created_at DESC);
