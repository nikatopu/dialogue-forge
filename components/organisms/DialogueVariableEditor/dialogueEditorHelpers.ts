/** Detect an unclosed `{` before the cursor that's starting a variable reference. */
export function getAutocompletePrefix(text: string, cursorPos: number): string | null {
  const before = text.slice(0, cursorPos);
  const match = before.match(/\{([a-zA-Z_][a-zA-Z0-9_.]*)$/);
  if (match) return match[1]; // partial name typed so far
  if (before.endsWith("{")) return ""; // just opened brace
  return null;
}
