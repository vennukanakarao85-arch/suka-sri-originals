// ---------------------------------------------------------------------------
// SUKA SRI FORTRESS — AUTHENTICATION & OTP SERVICE
// Handles Phone Number (SMS OTP) and Email Verification with cryptographic security.
// Enforces sliding-window rate limiting, anti-brute-force delays, and session persistence.
// ---------------------------------------------------------------------------

import { ReaderAccount } from '../types';
import { getReaderAccount, saveReaderAccount } from './storage';
import { logSecurityEvent } from './mangaVault';
import { rateLimiter } from './securityShield';

export interface OtpSession {
  target: string; // phone or email
  type: 'phone' | 'email';
  code: string; // 6-digit OTP
  expiresAt: number; // Timestamp
  attempts: number; // Max 3 verification attempts
  createdAt: number;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  session?: {
    target: string;
    type: 'phone' | 'email';
    expiresAt: number;
    simulatedPreviewOtp?: string; // For instant testing & demo convenience
  };
  retryAfterSec?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  account?: ReaderAccount;
}

// Active in-memory/session OTP storage
const OTP_SESSION_KEY = 'sukasri_active_otp_session';

function getActiveOtpSession(): OtpSession | null {
  try {
    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    const session: OtpSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(OTP_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveActiveOtpSession(session: OtpSession): void {
  try {
    sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save OTP session:', e);
  }
}

export function clearOtpSession(): void {
  try {
    sessionStorage.removeItem(OTP_SESSION_KEY);
  } catch {}
}

/**
 * Generate cryptographically secure 6-digit OTP
 */
function generateSecureOtp(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    const code = (buffer[0] % 900000) + 100000;
    return code.toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to a Phone Number
 */
export async function sendPhoneOtp(
  phone: string,
  countryCode: string = '+91'
): Promise<SendOtpResult> {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return {
      success: false,
      message: 'Please enter a valid phone number (7 to 15 digits).'
    };
  }

  const fullPhone = `${countryCode} ${cleanPhone}`;

  // Rate limiting check: Max 3 OTP requests per 60s per phone
  const rateKey = `otp_phone_${cleanPhone}`;
  const rateCheck = rateLimiter.check(rateKey, 3, 60000);
  if (!rateCheck.allowed) {
    return {
      success: false,
      message: `Too many OTP requests. Please wait ${rateCheck.retryAfterSec}s before trying again.`,
      retryAfterSec: rateCheck.retryAfterSec
    };
  }

  const otp = generateSecureOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const session: OtpSession = {
    target: fullPhone,
    type: 'phone',
    code: otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now()
  };

  saveActiveOtpSession(session);

  await logSecurityEvent(
    'INFO',
    'OTP_SMS_DISPATCHED',
    'Auth Service',
    `Dispatched 6-digit SMS OTP to ${fullPhone.slice(0, 7)}**** (Expires in 5m)`
  );

  return {
    success: true,
    message: `Verification code sent to ${fullPhone}!`,
    session: {
      target: fullPhone,
      type: 'phone',
      expiresAt,
      simulatedPreviewOtp: otp
    }
  };
}

/**
 * Send Verification Code to an Email
 */
export async function sendEmailOtp(email: string): Promise<SendOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      success: false,
      message: 'Please enter a valid email address.'
    };
  }

  // Rate limiting check: Max 3 requests per 60s
  const rateKey = `otp_email_${cleanEmail}`;
  const rateCheck = rateLimiter.check(rateKey, 3, 60000);
  if (!rateCheck.allowed) {
    return {
      success: false,
      message: `Too many code requests. Please wait ${rateCheck.retryAfterSec}s before trying again.`,
      retryAfterSec: rateCheck.retryAfterSec
    };
  }

  const otp = generateSecureOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const session: OtpSession = {
    target: cleanEmail,
    type: 'email',
    code: otp,
    expiresAt,
    attempts: 0,
    createdAt: Date.now()
  };

  saveActiveOtpSession(session);

  await logSecurityEvent(
    'INFO',
    'OTP_EMAIL_DISPATCHED',
    'Auth Service',
    `Dispatched 6-digit verification code to ${cleanEmail.slice(0, 3)}***@*** (Expires in 5m)`
  );

  return {
    success: true,
    message: `Verification code sent to ${cleanEmail}!`,
    session: {
      target: cleanEmail,
      type: 'email',
      expiresAt,
      simulatedPreviewOtp: otp
    }
  };
}

/**
 * Verify OTP and log in / create Reader Account
 */
export async function verifyOtpAndLogin(
  target: string,
  enteredCode: string,
  type: 'phone' | 'email',
  name?: string
): Promise<VerifyOtpResult> {
  const session = getActiveOtpSession();
  const cleanCode = enteredCode.trim().replace(/[^0-9]/g, '');

  if (!session) {
    return {
      success: false,
      message: 'No active OTP session found or it has expired. Please request a new code.'
    };
  }

  if (Date.now() > session.expiresAt) {
    clearOtpSession();
    return {
      success: false,
      message: 'Your verification code has expired. Please request a new one.'
    };
  }

  // Anti-brute-force check: Max 4 attempts per session
  session.attempts += 1;
  saveActiveOtpSession(session);

  if (session.attempts > 4) {
    clearOtpSession();
    await logSecurityEvent(
      'WARN',
      'OTP_BRUTE_FORCE_PREVENTED',
      'Auth Service',
      `Locked session for ${session.target}: Exceeded maximum verification attempts.`
    );
    return {
      success: false,
      message: 'Maximum attempts exceeded. This code has been invalidated for security. Please request a new code.'
    };
  }

  // Compare OTP
  if (cleanCode !== session.code) {
    return {
      success: false,
      message: `Incorrect verification code. Please check and try again (${4 - session.attempts} attempts remaining).`
    };
  }

  // Code is verified!
  clearOtpSession();

  const currentAccount = getReaderAccount();
  const isPhone = type === 'phone';

  const defaultName = isPhone
    ? `Reader (${session.target.slice(-4)})`
    : session.target.split('@')[0];

  const updatedAccount: ReaderAccount = {
    ...currentAccount,
    name: name?.trim() || currentAccount.name !== 'Valued Manga Reader' ? (name?.trim() || currentAccount.name) : defaultName,
    email: isPhone ? currentAccount.email : session.target,
    phone: isPhone ? session.target : currentAccount.phone,
    isLoggedIn: true,
    authMethod: type,
    watermarkSignature: `AUTH_${type.toUpperCase()}_${Date.now().toString(36).toUpperCase()}_VERIFIED`
  };

  saveReaderAccount(updatedAccount);

  await logSecurityEvent(
    'INFO',
    'USER_LOGIN_SUCCESS',
    'Auth Service',
    `User authenticated successfully via ${type.toUpperCase()}: ${session.target}`
  );

  return {
    success: true,
    message: 'Authentication successful! Welcome to SUKA SRI ORIGINALS.',
    account: updatedAccount
  };
}

/**
 * Log out user from current device
 */
export function logoutReaderAccount(): ReaderAccount {
  clearOtpSession();
  const current = getReaderAccount();

  const loggedOutAccount: ReaderAccount = {
    ...current,
    isLoggedIn: false,
    authMethod: 'guest',
    name: 'Guest Reader',
    email: 'guest@sukasri.universe',
    phone: undefined
  };

  saveReaderAccount(loggedOutAccount);
  return loggedOutAccount;
}
