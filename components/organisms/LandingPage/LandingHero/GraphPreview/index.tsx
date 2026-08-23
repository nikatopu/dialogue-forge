import style from "./GraphPreview.module.scss";

/**
 * A still life of the editor: a start node, a character line, and a branch into
 * two player choices. Hand-drawn in SVG rather than screenshotted so it stays
 * sharp at any size, follows the active theme, and costs nothing to load.
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
          viewBox="0 0 520 300"
          className={style.svg}
          role="img"
          aria-label="A dialogue graph: a start node leading to a character line, which branches into two player choices."
        >
          <defs>
            <marker id="landing-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" />
            </marker>
          </defs>

          <g className={style.edges}>
            <path d="M124,60 C170,60 170,110 214,110" markerEnd="url(#landing-arrow)" />
            <path d="M272,140 C272,186 272,196 272,232" markerEnd="url(#landing-arrow)" />
            <path d="M330,252 C376,252 380,76 416,68" markerEnd="url(#landing-arrow)" />
            <path d="M330,252 C376,252 380,190 416,178" markerEnd="url(#landing-arrow)" />
          </g>

          <g className={style.nodeStart}>
            <rect x="24" y="40" width="100" height="40" rx="10" />
            <text x="74" y="65">Start</text>
          </g>

          <g className={style.nodeCharacter}>
            <rect x="214" y="82" width="116" height="58" rx="10" />
            <text x="272" y="104" className={style.nodeTitle}>Elara</text>
            <text x="272" y="124" className={style.nodeBody}>&ldquo;You came back.&rdquo;</text>
          </g>

          <g className={style.nodeAction}>
            <rect x="214" y="232" width="116" height="40" rx="10" />
            <text x="272" y="257">Branch</text>
          </g>

          <g className={style.nodeChoice}>
            <rect x="416" y="48" width="88" height="40" rx="10" />
            <text x="460" y="73">Agree</text>
          </g>

          <g className={style.nodeChoice}>
            <rect x="416" y="158" width="88" height="40" rx="10" />
            <text x="460" y="183">Refuse</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
