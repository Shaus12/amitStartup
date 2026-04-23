import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

declare global {
  var __rateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__rateLimitBuckets ?? new Map<string, Bucket>();
globalThis.__rateLimitBuckets = buckets;

export function checkRateLimit(
  req: NextRequest,
  keyPrefix: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
  const key = `${keyPrefix}:${forwardedFor}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
