-- ─────────────────────────────────────────────────────────────────────────────
-- Dialogue Forge — Supabase schema
-- Run this in the Supabase SQL editor after creating your project.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Projects ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL DEFAULT 'Untitled Project',
  graph         JSONB       NOT NULL DEFAULT '{"nodes":[],"edges":[]}'
                              CONSTRAINT projects_graph_size_check
                              CHECK (octet_length(graph::text) <= 5 * 1024 * 1024),
  -- Kept in sync automatically so the dashboard can list projects (and show
  -- a node count) without ever pulling the full `graph` payload over the wire.
  node_count    INTEGER     GENERATED ALWAYS AS
                              (jsonb_array_length(COALESCE(graph->'nodes', '[]'::jsonb))) STORED,
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

-- ── v1.4.4 migration (run on existing databases) ──────────────────────────────
-- ALTER TABLE public.projects
--   ADD CONSTRAINT projects_graph_size_check
--   CHECK (octet_length(graph::text) <= 5 * 1024 * 1024);
-- ALTER TABLE public.projects
--   ADD COLUMN IF NOT EXISTS node_count INTEGER GENERATED ALWAYS AS
--     (jsonb_array_length(COALESCE(graph->'nodes', '[]'::jsonb))) STORED;

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

-- ── Analytics ────────────────────────────────────────────────────────────────
-- Usage analytics moved to Google Analytics 4 + Microsoft Clarity; the app no
-- longer writes to a Supabase table. The old `analytics_events` table is left
-- in place for existing deployments. To retire it once the historical rows are
-- no longer wanted:
--
--   DROP TABLE IF EXISTS public.analytics_events;

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

-- ── Free-plan cloud project limit (server-side backstop) ─────────────────────
-- The app only lets a signed-in free-plan user keep 5 'cloud' projects, but
-- that check previously lived only in the client. RLS enforces ownership, not
-- row count, so nothing stopped a direct API call (or a client bug/loop) from
-- writing unlimited rows. This trigger is the real enforcement; the client
-- check just avoids a round-trip in the common case.
--
-- It only does work when a row is *entering* cloud mode — a new cloud
-- project, or a local draft being promoted to cloud — so a project that is
-- already 'cloud' and stays 'cloud' (every normal autosave update) never
-- pays for the count query.

CREATE OR REPLACE FUNCTION public.enforce_cloud_project_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  project_count INTEGER;
  plan_limit CONSTANT INTEGER := 5;
BEGIN
  IF NEW.mode = 'cloud' AND (TG_OP = 'INSERT' OR OLD.mode IS DISTINCT FROM 'cloud') THEN
    SELECT count(*) INTO project_count
      FROM public.projects
      WHERE user_id = NEW.user_id AND mode = 'cloud';

    IF project_count >= plan_limit THEN
      RAISE EXCEPTION
        'Cloud project limit reached (%/%). Upgrade your plan to create more.',
        project_count, plan_limit;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER projects_enforce_cloud_limit
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cloud_project_limit();

-- ── v1.4.4 migration (run on existing databases) ──────────────────────────────
-- CREATE OR REPLACE FUNCTION public.enforce_cloud_project_limit()
-- RETURNS TRIGGER LANGUAGE plpgsql AS $$
-- DECLARE
--   project_count INTEGER;
--   plan_limit CONSTANT INTEGER := 5;
-- BEGIN
--   IF NEW.mode = 'cloud' AND (TG_OP = 'INSERT' OR OLD.mode IS DISTINCT FROM 'cloud') THEN
--     SELECT count(*) INTO project_count FROM public.projects
--       WHERE user_id = NEW.user_id AND mode = 'cloud';
--     IF project_count >= plan_limit THEN
--       RAISE EXCEPTION 'Cloud project limit reached (%/%). Upgrade your plan to create more.',
--         project_count, plan_limit;
--     END IF;
--   END IF;
--   RETURN NEW;
-- END;
-- $$;
-- DROP TRIGGER IF EXISTS projects_enforce_cloud_limit ON public.projects;
-- CREATE TRIGGER projects_enforce_cloud_limit
--   BEFORE INSERT OR UPDATE ON public.projects
--   FOR EACH ROW EXECUTE FUNCTION public.enforce_cloud_project_limit();

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS projects_user_id_idx
  ON public.projects (user_id, updated_at DESC);
