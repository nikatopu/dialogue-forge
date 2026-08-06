# Dialogue Forge — Component Architecture

This document describes the frontend component architecture established in **v1.4.2**. It is the
reference for where new UI should live and how it should be structured.

## Atomic Design layers

```
components/
  atoms/        # small, stateless, reusable presentation primitives
  organisms/    # feature-level, stateful components (own state, stores, logic)
```

There is intentionally **no global `molecules/` directory yet**. Molecules are only promoted to a
shared location when a reusable Atom-combination is genuinely used by two or more unrelated features.
Until then, reusable combinations stay colocated inside the Organism that owns them (see
_Private subcomponents_ below). This avoids premature generalization.

### Atoms (`components/atoms/*`)

Stateless, presentation-focused, no store access, no data fetching, reusable by ≥2 components.
Examples: `Button`, `Badge`, `Input`, `Card`, `ScrollArea`, `Separator`, `Tooltip`, `TypeBadge`,
`BottomSheet`.

- Target: **≤ ~100 lines** per `index.tsx`.
- Receive everything through props. No `use*Store()`, no `lib/` business logic.

### Organisms (`components/organisms/*`)

Feature-level components. May access Zustand stores, use feature hooks, own local state, coordinate
children, and hold business logic.

- Target: **≤ ~200 lines** per `index.tsx`. When larger, decompose into **private subcomponents**.
- The top-level `index.tsx` should read as a coordinator: wire state/stores and compose children.

## Required component structure

Every component is a directory:

```
ComponentName/
  index.tsx
  ComponentName.module.scss
```

Never `ComponentName.tsx` / `ComponentName.scss`, and never several unrelated components in one file.

## Private subcomponents (colocation)

When an Organism needs multiple private parts, colocate them **inside the Organism directory** rather
than promoting them to `atoms/`:

```
organisms/
  PreviewModal/
    index.tsx                 # coordinator
    PreviewModal.module.scss  # shell styles only
    previewHelpers.ts         # pure config/formatters
    usePreviewSession.ts      # feature hook (state + logic)
    PreviewHeader/
    EntrySelection/
    SetupPhase/
    StatePanel/
    DialogueView/
      index.tsx
      ChoiceList/             # nested private part
```

Rules:

- Private parts are **not** imported by unrelated features. An Organism must never import another
  Organism's private subcomponent.
- Only move a private part into a shared level once real reuse exists — then generalize its API and
  update all consumers.

### Shared styles within an Organism

When many sibling subcomponents share the same form primitives, a single colocated
`*.module.scss` (e.g. `NodeInspector/fields.module.scss`, `SettingsPanel/sections.module.scss`) is
imported by each subcomponent instead of duplicating the rules. This keeps styles DRY without leaking
them to a global stylesheet.

## Hook & utility extraction

- **Feature-specific hook** → colocate with the Organism (`useTopBarActions.ts`,
  `useDialogueAutocomplete.ts`, `useCanvasInteractions.ts`, `usePreviewSession.ts`).
- **Globally reusable hook** → `hooks/`.
- **Pure reusable logic** (interpolation, condition evaluation, variable usage, graph traversal,
  validation, migrations) → `lib/`. Components should not contain large pure algorithms, and the
  centralized systems from previous releases must not be duplicated.

## State ownership

State lives at the lowest reasonable shared owner:

```
Organism
  ├── owns state (local useState / feature hook)
  ├── passes values to private subcomponents
  ├── passes callbacks to Atoms
  └── coordinates feature behavior
```

Avoid duplicated/synchronized copies of state, excessive prop drilling, and giving Atoms direct store
access. Prefer focused Zustand selectors over passing whole stores; do not create new global stores by
default.

## SCSS Module conventions

- Every component uses CSS Modules: `import style from "./ComponentName.module.scss"`.
- No utility-heavy class strings in JSX (`className="pt-1 pb-1 ..."`); use semantic classes.
- Use `classnames` for multiple/conditional classes; a single class needs no helper.
- Standard wrappers: `.container` (outer) and `.content` (main inner area) when they genuinely exist —
  don't add empty wrappers to satisfy a convention. Descriptive names otherwise: `.header`, `.title`,
  `.actions`, `.list`, `.item`, …
- Keep selectors mostly flat; nest only for `&:hover`, `&.active`, media queries, etc.
- Keep responsive rules next to the selector they modify.
- Inline styles are only for genuinely dynamic values (runtime colors, coordinates, React Flow
  positioning). Static styling belongs in SCSS.

## Line-count targets (summary)

| Layer                 | `index.tsx` target |
| --------------------- | ------------------ |
| Atom                  | ≤ ~100 lines       |
| Molecule (when added) | ≤ ~150 lines       |
| Organism              | ≤ ~200 lines       |

Targets are architectural guidance, not a game to win: decompose along **responsibilities**, never by
slicing arbitrary chunks of JSX to hit a number.
