import { lookup as dnsLookup } from "dns";
import { lookup as lookupAsync } from "dns/promises";
import { isIP } from "net";
import { Agent, fetch as undiciFetch } from "undici";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "local",
  "host.docker.internal",
]);

const BLOCKED_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".home",
  ".lan",
];

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = parts;

  // RFC1918 + loopback + link-local + CGNAT + benchmarking + reserved/multicast
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;

  return false;
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();

  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // Unique local
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true; // Link-local fe80::/10
  }
  if (
    normalized.startsWith("fec") ||
    normalized.startsWith("fed") ||
    normalized.startsWith("fee") ||
    normalized.startsWith("fef")
  ) {
    return true; // Deprecated site-local fec0::/10
  }
  if (normalized.startsWith("ff")) return true; // Multicast
  if (normalized.startsWith("2001:db8:")) return true; // Documentation range

  // IPv4-mapped IPv6 (::ffff:a.b.c.d)
  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.slice(7);
    return isPrivateIpv4(mappedIpv4);
  }

  return false;
}

function isBlockedHostname(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return true;
  }

  return BLOCKED_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);

  if (family === 4) {
    return !isPrivateIpv4(address);
  }

  if (family === 6) {
    return !isPrivateIpv6(address);
  }

  return false;
}

const secureDispatcher = new Agent({
  connect: {
    lookup: (
      hostname: string,
      options: any,
      callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void
    ) => {
      const normalizedOptions =
        typeof options === "number" ? { family: options } : (options || {});

      dnsLookup(
        hostname,
        { ...normalizedOptions, all: false, verbatim: true },
        (err, address, family) => {
          if (err) {
            callback(err, address as any, family as any);
            return;
          }

          if (!isPublicIpAddress(address)) {
            callback(
              new Error("URL resolves to a private or local network address"),
              address,
              family
            );
            return;
          }

          callback(null, address, family);
        }
      );
    },
  },
});

export async function assertSafeOutboundUrl(rawUrl: string): Promise<URL> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are allowed");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("URL credentials are not allowed");
  }

  const hostname = normalizeHostname(parsedUrl.hostname);
  if (!hostname) {
    throw new Error("URL hostname is required");
  }

  if (isBlockedHostname(hostname)) {
    throw new Error("URL hostname is not allowed");
  }

  const ipFamily = isIP(hostname);
  if (ipFamily > 0) {
    if (!isPublicIpAddress(hostname)) {
      throw new Error("URL resolves to a private or local network address");
    }
    return parsedUrl;
  }

  const records = await lookupAsync(hostname, { all: true, verbatim: true });
  if (!records.length) {
    throw new Error("Unable to resolve URL hostname");
  }

  for (const record of records) {
    if (!isPublicIpAddress(record.address)) {
      throw new Error("URL resolves to a private or local network address");
    }
  }

  return parsedUrl;
}

export function getSecureFetchOptions(
  userAgent: string,
  signal?: AbortSignal
): RequestInit {
  return {
    headers: { "User-Agent": userAgent },
    redirect: "error",
    signal,
  };
}

interface TimedFetchOptions {
  userAgent: string;
  timeoutMs: number;
}

export async function fetchWithTimeout(
  url: string,
  options: TimedFetchOptions
): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = Math.max(1, options.timeoutMs);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await undiciFetch(url, {
      ...getSecureFetchOptions(options.userAgent, controller.signal),
      dispatcher: secureDispatcher,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function readResponseTextWithLimit(
  response: Response,
  maxBytes: number
): Promise<string> {
  const limit = Math.max(1, maxBytes);
  const stream = response.body as any;
  const reader = stream?.getReader?.();

  if (!reader) {
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > limit) {
      throw new Error("Skill content exceeds maximum size");
    }
    return text;
  }

  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > limit) {
      try {
        await reader.cancel();
      } catch {
        // noop
      }
      throw new Error("Skill content exceeds maximum size");
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return text;
}
