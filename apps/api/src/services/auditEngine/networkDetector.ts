import type { NetworkCall } from "../../types/api.js";

// Known safe domains
const SAFE_DOMAINS = new Set([
  "localhost",
  "127.0.0.1",
  "api.openai.com",
  "api.anthropic.com",
  "api.github.com",
  "raw.githubusercontent.com",
  "registry.npmjs.org",
]);

// URL extraction pattern
const URL_PATTERN = /https?:\/\/[^\s"'<>)\]]+/gi;

// API endpoint patterns
const API_PATTERNS = [
  /fetch\s*\(\s*['"]([^'"]+)['"]/gi,
  /axios\.[a-z]+\s*\(\s*['"]([^'"]+)['"]/gi,
  /http\.request\s*\(\s*['"]([^'"]+)['"]/gi,
  /curl\s+(?:-[A-Za-z]+\s+)*['"]?([^\s'"]+)/gi,
  /wget\s+(?:-[A-Za-z]+\s+)*['"]?([^\s'"]+)/gi,
];

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return "";
  }
}

function isExternal(url: string): boolean {
  const domain = extractDomain(url);
  if (!domain) return false;
  return !SAFE_DOMAINS.has(domain);
}

function extractMethod(context: string): string | undefined {
  if (/POST/i.test(context)) return "POST";
  if (/PUT/i.test(context)) return "PUT";
  if (/DELETE/i.test(context)) return "DELETE";
  if (/PATCH/i.test(context)) return "PATCH";
  return "GET";
}

export function detectNetworkCalls(content: string): NetworkCall[] {
  const calls: NetworkCall[] = [];
  const seen = new Set<string>();
  
  // Extract raw URLs
  const urlMatches = content.match(URL_PATTERN) || [];
  for (const url of urlMatches) {
    if (!seen.has(url)) {
      seen.add(url);
      calls.push({
        url,
        external: isExternal(url),
      });
    }
  }
  
  // Extract from API patterns
  for (const pattern of API_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      const url = match[1];
      if (url && url.startsWith("http") && !seen.has(url)) {
        seen.add(url);
        
        // Get surrounding context for method detection
        const start = Math.max(0, match.index - 50);
        const end = Math.min(content.length, match.index + match[0].length + 50);
        const context = content.slice(start, end);
        
        calls.push({
          url,
          external: isExternal(url),
          method: extractMethod(context),
        });
      }
    }
  }
  
  return calls;
}
