import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

function getRedisForRateLimit(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("Missing Upstash Redis env vars for rate limiting — see .env.example.");
  }
  return new Redis({ url, token });
}

let loginLimiter: Ratelimit | null = null;
let mutationLimiter: Ratelimit | null = null;

/** 5 attempts per 5 minutes per IP — brute-force protection on the login endpoint. */
export function getLoginRateLimit(): Ratelimit {
  if (!loginLimiter) {
    loginLimiter = new Ratelimit({
      redis: getRedisForRateLimit(),
      limiter: Ratelimit.slidingWindow(5, "5 m"),
      prefix: "ratelimit:login",
    });
  }
  return loginLimiter;
}

/**
 * 30 mutating menu requests per minute per IP — generous for real admin use,
 * but blunts scripted abuse even from someone with a valid session.
 */
export function getMutationRateLimit(): Ratelimit {
  if (!mutationLimiter) {
    mutationLimiter = new Ratelimit({
      redis: getRedisForRateLimit(),
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "ratelimit:mutation",
    });
  }
  return mutationLimiter;
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
