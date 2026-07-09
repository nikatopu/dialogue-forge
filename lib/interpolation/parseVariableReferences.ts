export interface VariableToken {
  raw: string;    // e.g. "{playerName}" or "{player.level}"
  path: string[]; // e.g. ["playerName"] or ["player", "level"]
  start: number;
  end: number;
}

const TOKEN_PATTERN = /\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g;

export function parseVariableReferences(text: string): VariableToken[] {
  const tokens: VariableToken[] = [];
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    tokens.push({
      raw: match[0],
      path: match[1].split("."),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tokens;
}
