import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  it("allows first request", () => {
    const result = checkRateLimit("user1", {
      windowMs: 60_000,
      maxRequests: 5,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks multiple requests", () => {
    checkRateLimit("user2", { windowMs: 60_000, maxRequests: 5 });
    checkRateLimit("user2", { windowMs: 60_000, maxRequests: 5 });
    const result = checkRateLimit("user2", { windowMs: 60_000, maxRequests: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks when limit exceeded", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user3", { windowMs: 60_000, maxRequests: 3 });
    }
    const result = checkRateLimit("user3", { windowMs: 60_000, maxRequests: 3 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user4", { windowMs: 60_000, maxRequests: 3 });
    }
    vi.setSystemTime(new Date("2024-01-01T00:01:01Z"));
    const result = checkRateLimit("user4", { windowMs: 60_000, maxRequests: 3 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("isolates different keys", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user5", { windowMs: 60_000, maxRequests: 3 });
    }
    const result = checkRateLimit("user6", { windowMs: 60_000, maxRequests: 3 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("returns correct resetAt", () => {
    const result = checkRateLimit("user7", { windowMs: 60_000, maxRequests: 5 });
    expect(result.resetAt).toBe(Date.now() + 60_000);
  });
});
