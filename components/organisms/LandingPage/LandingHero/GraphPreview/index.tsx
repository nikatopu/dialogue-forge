import style from "./GraphPreview.module.scss";

/**
 * A still life of the editor: a start node leading into a character line,
 * which branches into two player choices, both of which export the same
 * `dialogue.json` — the graph-to-export loop this page is selling, drawn
 * rather than screenshotted so it stays sharp at any size, follows the
 * active theme, and costs nothing to load.
 *
 * The node styling mirrors the real canvas rather than inventing its own
 * language: a neutral card body, a small tinted icon chip carrying the type
 * color (teal for Start, orange for Branch), an uppercase type label, and a
 * portrait circle for Character — the same parts the actual node components
 * are built from. The export card is the one thing with no canvas
 * equivalent — it's the destination the graph is for, not a node in it —
 * so it gets its own accent (primary) rather than borrowing a node type's.
 */
export function GraphPreview() {
  return (
    <div className={style.frame}>
      <div className={style.chrome}>
        <span className={style.dot} />
        <span className={style.dot} />
        <span className={style.dot} />
        <span className={style.chromeLabel}>Visual Novel Example</span>
      </div>

      <div className={style.canvas}>
        <svg
          viewBox="0 0 670 300"
          className={style.svg}
          role="img"
          aria-label="A dialogue graph: a start node leading to a character line, which branches into two player choices, Agree and Refuse, both exporting to dialogue.json for Unity, Godot, Unreal, or any custom runtime."
        >
          <defs>
            <marker
              id="landing-arrow"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" />
            </marker>
          </defs>

          <g className={style.edges}>
            <path
              d="M132,66 C170,66 170,97 208,97"
              markerEnd="url(#landing-arrow)"
            />
            <path
              d="M274,166 C274,176 274,180 274,190"
              markerEnd="url(#landing-arrow)"
            />
            <path
              d="M340,219 C380,219 380,73 414,73"
              markerEnd="url(#landing-arrow)"
            />
            <path
              d="M340,219 C380,219 380,199 414,199"
              markerEnd="url(#landing-arrow)"
            />
            <path
              d="M504,73 C518,73 518,150 534,150"
              markerEnd="url(#landing-arrow)"
            />
            <path
              d="M504,199 C518,199 518,150 534,150"
              markerEnd="url(#landing-arrow)"
            />
          </g>

          {/* Start */}
          <g className={style.nodeStart}>
            <rect x="20" y="40" width="112" height="52" rx="10" />
            <rect
              className={style.chip}
              x="32"
              y="52"
              width="16"
              height="16"
              rx="4"
            />
            <path className={style.startGlyph} d="M37,55 L37,65 L45,60 Z" />
            <text className={style.kicker} x="56" y="63">
              START
            </text>
            <text className={style.nodeTitle} x="76" y="82" textAnchor="middle">
              Start
            </text>
          </g>

          {/* Character */}
          <g className={style.nodeCharacter}>
            <rect x="208" y="78" width="132" height="88" rx="10" />
            <circle className={style.portrait} cx="226" cy="97" r="9" />
            <text className={style.kicker} x="244" y="94">
              CHARACTER
            </text>
            <text className={style.nodeTitle} x="244" y="112">
              Elara
            </text>
            <line
              className={style.divider}
              x1="220"
              y1="128"
              x2="328"
              y2="128"
            />
            <text className={style.nodeBody} x="226" y="148">
              &ldquo;You came back.&rdquo;
            </text>
          </g>

          {/* Branch */}
          <g className={style.nodeAction}>
            <rect x="208" y="190" width="132" height="58" rx="10" />
            <rect
              className={style.chip}
              x="220"
              y="202"
              width="16"
              height="16"
              rx="4"
            />
            <path
              className={style.branchGlyph}
              d="M228,214 L228,209 M228,209 L223,203 M228,209 L233,203"
            />
            <text className={style.kicker} x="244" y="213">
              BRANCH
            </text>
            <text className={style.nodeTitle} x="244" y="230">
              Branch
            </text>
          </g>

          {/* Choices — rendered as pills, the same shape the editor uses for edge option labels */}
          <g className={style.nodeChoice}>
            <rect x="414" y="56" width="90" height="34" rx="17" />
            <text x="459" y="77" textAnchor="middle">
              Agree
            </text>
          </g>

          <g className={style.nodeChoice}>
            <rect x="414" y="182" width="90" height="34" rx="17" />
            <text x="459" y="203" textAnchor="middle">
              Refuse
            </text>
          </g>

          {/* Export — the destination, not a graph node, so it gets its own accent */}
          <g className={style.nodeExport}>
            <rect x="534" y="88" width="116" height="124" rx="10" />
            <rect
              className={style.chip}
              x="546"
              y="100"
              width="16"
              height="16"
              rx="4"
            />
            <path
              className={style.exportGlyph}
              d="M551,102 L549,102 L549,106 L547,108 L549,110 L549,114 L551,114 M557,102 L559,102 L559,106 L561,108 L559,110 L559,114 L557,114"
            />
            <text className={style.kicker} x="570" y="111">
              EXPORT
            </text>
            <text className={style.nodeTitle} x="546" y="131">
              dialogue.json
            </text>
            <line
              className={style.divider}
              x1="546"
              y1="139"
              x2="638"
              y2="139"
            />
            <text className={style.exportCaption} x="546" y="151">
              Unity
            </text>
            <text className={style.exportCaption} x="546" y="163">
              Godot
            </text>
            <text className={style.exportCaption} x="546" y="175">
              Unreal
            </text>
            <text className={style.exportCaption} x="546" y="187">
              Any other runtime
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
