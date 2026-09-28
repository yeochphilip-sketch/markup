/**
* Robust JSON parsing for LLM output.
*
* Models (especially Groq Llama 3.3 70B with long outputs) frequently emit
* near-JSON that Node's `JSON.parse` rejects:
*
* 1. Markdown code fences around the object (```json ... ```)
* 2. Prose before/after the object, or trailing commas after the closing brace
* 3. **Literal control characters inside string values** — raw newlines/tabs
* instead of escaped `\n` / `\t`. This is the #1 failure mode: Node throws
* `Bad control character in string literal in JSON`.
*
* This helper tries several repair strategies in order and returns the first
* parseable result. Shared by the grade and generate-question routes so both
* benefit from the same hardening.
*/

/** Replace literal control characters inside JSON string literals with escapes. */
function escapeControlCharsInStrings(input: string): string {
  let out = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        out += ch;
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
        out += ch;
        continue;
      }
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        switch (ch) {
          case '\n': out += '\\n'; break;
          case '\r': out += '\\r'; break;
          case '\t': out += '\\t'; break;
          case '\b': out += '\\b'; break;
          case '\f': out += '\\f'; break;
          default: out += `\\u${code.toString(16).padStart(4, '0')}`;
        }
        continue;
      }
      out += ch;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    out += ch;
  }

  return out;
}

/** Strip ```json ... ``` fences (only when they wrap the whole output). */
function stripCodeFences(input: string): string {
  const trimmed = input.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  if (fenced) return fenced[1].trim();
  // Some models only open the fence, or only close it — drop leading/trailing
  // fence markers.
  return trimmed
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```\s*$/, '')
  .trim();
}

/** Extract the outermost {...} block (drops surrounding prose and trailing junk). */
function extractOutermostObject(input: string): string | null {
  const start = input.indexOf('{');
    const end = input.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return input.slice(start, end + 1);
}

/** Build the ordered list of candidate strings to attempt parsing. */
function buildCandidates(raw: string): string[] {
  const base = raw.trim();
  const candidates: string[] = [base];

  const fenced = stripCodeFences(base);
  if (fenced !== base) candidates.push(fenced);

  const object = extractOutermostObject(base);
  if (object) candidates.push(object);

  // Also try the fence/object variants with control characters escaped.
  candidates.push(escapeControlCharsInStrings(base));
  if (fenced !== base) candidates.push(escapeControlCharsInStrings(fenced));
  if (object) candidates.push(escapeControlCharsInStrings(object));

  // For clean input, several candidates are identical (e.g. the outermost
    // object of valid JSON IS the whole string) — dedupe to avoid wasted parses.
  return [...new Set(candidates)];
}

/**
* Parse AI model JSON output, applying repair strategies in order.
* Throws an Error describing the failure if every strategy fails.
*/
export function parseJsonWithRepair<T = unknown>(raw: string): T {
  const candidates = buildCandidates(raw);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Try the next repair strategy.
    }
  }

  const snippet = raw.trim().slice(0, 300);
  throw new Error(`Could not parse AI JSON response after ${candidates.length} repair strategies. ` +
    `Raw (first 300 chars): ${snippet}`,
  );
}
