// ---------------------------------------------------------------------------
// SUKA SRI FORTRESS — ATTACK DEFENSE & CLIENT WAF
// Input sanitization against XSS and SQL injection, sliding-window rate limiting,
// and anti-scraping deterrence.
// ---------------------------------------------------------------------------

import { logSecurityEvent } from './mangaVault';

// --- Injection Detection Patterns ---

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /data:text\/html/gi
];

const SQLI_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
  /('|\")\s*(OR|AND)\s*('|\")?\d+('|\")?\s*=\s*('|\")?\d+/gi,
  /--\s*$/gm,
  /\/\*.*?\*\//g,
  /;\s*(DROP|DELETE|TRUNCATE)/gi
];

// --- Input Sanitization & WAF Filter ---

export function detectInjectionAttack(input: string): { isMalicious: boolean; reason?: string } {
  if (!input || typeof input !== 'string') return { isMalicious: false };

  // Check XSS
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isMalicious: true,
        reason: 'Cross-Site Scripting (XSS) payload detected in input parameter.'
      };
    }
  }

  // Check SQL injection
  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isMalicious: true,
        reason: 'SQL Injection signature detected in query parameter.'
      };
    }
  }

  return { isMalicious: false };
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const attackCheck = detectInjectionAttack(input);
  if (attackCheck.isMalicious) {
    logSecurityEvent(
      'WARN',
      'WAF_INJECTION_PAYLOAD_NEUTRALIZED',
      'Attack Defense WAF',
      `Sanitized malicious payload: ${attackCheck.reason}`
    );
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// --- Sliding-Window Rate Limiter ---

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  /**
   * Evaluates if an action is permitted within a rolling time window.
   */
  public check(
    actionKey: string,
    maxRequests: number = 5,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; retryAfterSec?: number } {
    const now = Date.now();
    const record = this.records.get(actionKey) || { timestamps: [] };

    // Prune entries outside the current window
    const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (activeTimestamps.length >= maxRequests) {
      const oldestActive = activeTimestamps[0];
      const retryAfterSec = Math.ceil((oldestActive + windowMs - now) / 1000);

      logSecurityEvent(
        'WARN',
        'RATE_LIMIT_EXCEEDED',
        'Attack Defense - Rate Limiter',
        `Throttled action [${actionKey}]. Exceeded ${maxRequests} req / ${windowMs / 1000}s limit. Retry after ${retryAfterSec}s.`
      );

      return {
        allowed: false,
        remaining: 0,
        retryAfterSec
      };
    }

    // Allow and record timestamp
    activeTimestamps.push(now);
    this.records.set(actionKey, { timestamps: activeTimestamps });

    return {
      allowed: true,
      remaining: maxRequests - activeTimestamps.length
    };
  }

  public reset(actionKey?: string) {
    if (actionKey) {
      this.records.delete(actionKey);
    } else {
      this.records.clear();
    }
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();
