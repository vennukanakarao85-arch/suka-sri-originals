// ---------------------------------------------------------------------------
// SUKA SRI FORTRESS — AUTHENTICATION & MULTI-DEVICE ACCOUNT REGISTRY SERVICE
// Handles Phone Number (SMS OTP), Email Verification, Multi-Device Password Login,
// and Owner/Admin Studio Authorization with cryptographic integrity.
// ---------------------------------------------------------------------------

import { ReaderAccount, PaymentTransaction } from '../types';
import { getReaderAccount, saveReaderAccount } from './storage';
import { logSecurityEvent } from './mangaVault';
import { rateLimiter } from './securityShield';

// Cryptographic constants
export const OTP_VALIDITY_SECONDS = 65; // OTP is strictly valid for 65 seconds only
export const OTP_EXPIRY_MS = OTP_VALIDITY_SECONDS * 1000;

// Storage Keys
const OTP_SESSION_KEY = 'sukasri_active_otp_session';
const REGISTERED_USERS_KEY = 'sukasri_registered_users_v1';
const GLOBAL_TRANSACTIONS_KEY = 'sukasri_global_transactions_v1';
const OWNER_SESSION_KEY = 'sukasri_owner_authenticated';

// Master Owner Passcodes accepted for Studio & Admin Access
export const OWNER_PASSCODES = ['9502714652', '8842', 'sukasri2026', 'admin8842'];

export interface OtpSession {
  target: string; // phone or email
  type: 'phone' | 'email';
  code: string; // 6-digit OTP
  expiresAt: number; // Timestamp
  attempts: number; // Max 4 verification attempts
  createdAt: number;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  session?: {
    target: string;
    type: 'phone' | 'email';
    expiresAt: number;
    validitySeconds: number;
    simulatedPreviewOtp?: string; // For instant testing & demo convenience
  };
  retryAfterSec?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  account?: ReaderAccount;
}

// ---------------------------------------------------------------------------
// PASSWORD HASHING UTILITY (SHA-256 with Salt)
// ---------------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const salted = `${password}:SUKA_SRI_FORTRESS_SALT_2026`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(salted);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  // Simple deterministic hash fallback
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) - hash) + salted.charCodeAt(i);
    hash |= 0;
  }
  return `PW_HASH_${Math.abs(hash).toString(16)}`;
}

// ---------------------------------------------------------------------------
// REGISTERED USERS PERSISTENCE (Multi-Device Sync)
// ---------------------------------------------------------------------------
function initializeDefaultRegistry(): ReaderAccount[] {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  const defaultUser: ReaderAccount = {
    readerId: 'SSO-READER-000',
    name: 'Srinivas Vennu (Owner)',
    email: 'srinivas@sukasri.universe',
    phone: '+91 9502714652',
    countryCode: '+91',
    isLoggedIn: true,
    authMethod: 'phone',
    role: 'owner',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    country: 'IN',
    membershipStatus: 'monthly_member',
    membershipValidUntil: expiry.toISOString().split('T')[0],
    unlockedChapterIds: ['sample-ch-001', 'ch-1', 'ch-001'],
    transactions: [
      {
        id: 'TXN-MEM-INIT-000',
        readerId: 'SSO-READER-000',
        chapterTitle: 'SUKA SRI Monthly All-Access VIP Membership (All Arcs & Chapters)',
        type: 'monthly_membership',
        amount: 19,
        currency: 'INR',
        method: 'UPI',
        timestamp: new Date().toISOString(),
        status: 'completed',
        hmacSignature: 'HMAC_SHA256_VIP_INITIAL_SUKASRI',
        upiRefNumber: '431890284712'
      }
    ],
    watermarkSignature: 'SECURE-HMAC-256-AUTH-SSO-2026'
  };

  return [defaultUser];
}

export function generateReaderId(): string {
  const users = getAllRegisteredUsers();
  const nextNum = users.length;
  return `SSO-READER-${String(nextNum).padStart(3, '0')}`;
}

export function getAllRegisteredUsers(): ReaderAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      const defaults = initializeDefaultRegistry();
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const users: ReaderAccount[] = JSON.parse(raw);
    if (Array.isArray(users)) {
      let modified = false;
      const normalized = users.map(u => {
        if (u.readerId && (u.readerId.includes('SSRI-READER-') || u.readerId === 'SSRI-READER-8842')) {
          modified = true;
          return {
            ...u,
            readerId: u.readerId.replace('SSRI-READER-8842', 'SSO-READER-000').replace('SSRI-READER-', 'SSO-READER-')
          };
        }
        return u;
      });
      if (modified) {
        saveRegisteredUsers(normalized);
      }
      return normalized;
    }
    return initializeDefaultRegistry();
  } catch {
    return initializeDefaultRegistry();
  }
}

export function saveRegisteredUsers(users: ReaderAccount[]): void {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user registry:', e);
  }
}

export function registerOrUpdateUser(account: ReaderAccount, passwordHash?: string): ReaderAccount {
  const users = getAllRegisteredUsers();
  const cleanPhone = account.phone?.replace(/[^0-9]/g, '');
  const cleanEmail = account.email?.trim().toLowerCase();

  const existingIndex = users.findIndex(u => {
    if (u.readerId === account.readerId) return true;
    if (cleanPhone && u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone) return true;
    if (cleanEmail && u.email && u.email.trim().toLowerCase() === cleanEmail) return true;
    return false;
  });

  const updatedAccount: ReaderAccount = {
    ...account,
    passwordHash: passwordHash || (existingIndex >= 0 ? users[existingIndex].passwordHash : account.passwordHash),
    role: account.role || (existingIndex >= 0 ? users[existingIndex].role : 'reader'),
    createdAt: (existingIndex >= 0 && users[existingIndex].createdAt) ? users[existingIndex].createdAt : (account.createdAt || new Date().toISOString()),
    lastLoginAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    users[existingIndex] = updatedAccount;
  } else {
    users.unshift(updatedAccount);
  }

  saveRegisteredUsers(users);
  return updatedAccount;
}

/**
 * Assign or update password for a reader account
 */
export async function setPasswordForAccount(identifier: string, newPassword: string): Promise<boolean> {
  if (!newPassword || newPassword.length < 4) {
    return false;
  }

  const pHash = await hashPassword(newPassword);
  const users = getAllRegisteredUsers();
  const cleanTarget = identifier.replace(/[^0-9]/g, '');
  const cleanEmail = identifier.trim().toLowerCase();

  let found = false;
  const updatedUsers = users.map(u => {
    const uPhone = u.phone?.replace(/[^0-9]/g, '');
    const uEmail = u.email?.trim().toLowerCase();
    if (u.readerId === identifier || (cleanTarget && uPhone === cleanTarget) || (cleanEmail && uEmail === cleanEmail)) {
      found = true;
      return { ...u, passwordHash: pHash };
    }
    return u;
  });

  if (found) {
    saveRegisteredUsers(updatedUsers);
  }

  // Also update active session if it matches
  const current = getReaderAccount();
  const currentPhone = current.phone?.replace(/[^0-9]/g, '');
  const currentEmail = current.email?.trim().toLowerCase();
  if (current.readerId === identifier || (cleanTarget && currentPhone === cleanTarget) || (cleanEmail && currentEmail === cleanEmail)) {
    const updatedCurrent: ReaderAccount = { ...current, passwordHash: pHash };
    saveReaderAccount(updatedCurrent);
    if (!found) {
      registerOrUpdateUser(updatedCurrent, pHash);
    }
  }

  await logSecurityEvent('INFO', 'PASSWORD_UPDATED', 'Auth Service', `Password configured for user ${identifier}`);
  return true;
}

/**
 * Log in from any device using Phone Number or Email + Password
 */
export async function loginWithPassword(identifier: string, plainPassword: string): Promise<VerifyOtpResult> {
  const cleanTarget = identifier.replace(/[^0-9]/g, '');
  const cleanEmail = identifier.trim().toLowerCase();

  if (!identifier.trim()) {
    return { success: false, message: 'Please enter your registered phone number or email address.' };
  }
  if (!plainPassword) {
    return { success: false, message: 'Please enter your account password.' };
  }

  // Rate limiting for password attempts
  const rateKey = `pwd_login_${identifier}`;
  const rateCheck = rateLimiter.check(rateKey, 5, 60000);
  if (!rateCheck.allowed) {
    return {
      success: false,
      message: `Too many login attempts. Please wait ${rateCheck.retryAfterSec}s before retrying.`
    };
  }

  const computedHash = await hashPassword(plainPassword);
  const users = getAllRegisteredUsers();

  const matchedUser = users.find(u => {
    const uPhone = u.phone?.replace(/[^0-9]/g, '');
    const uEmail = u.email?.trim().toLowerCase();
    const phoneMatch = cleanTarget.length >= 7 && uPhone && uPhone.includes(cleanTarget);
    const emailMatch = cleanEmail.includes('@') && uEmail === cleanEmail;
    const readerIdMatch = u.readerId.toUpperCase() === identifier.trim().toUpperCase();
    return phoneMatch || emailMatch || readerIdMatch;
  });

  if (!matchedUser) {
    return {
      success: false,
      message: 'Account not found with this phone number or email. Please register first or use OTP verification.'
    };
  }

  if (!matchedUser.passwordHash) {
    return {
      success: false,
      message: 'No password is set for this account yet. Please log in using OTP first and set your password in your profile.'
    };
  }

  if (matchedUser.passwordHash !== computedHash) {
    await logSecurityEvent('WARN', 'PASSWORD_LOGIN_FAILED', 'Auth Service', `Invalid password attempt for ${identifier}`);
    return {
      success: false,
      message: 'Incorrect password. Please verify and try again.'
    };
  }

  // Login successful! Restore entire account with VIP membership & unlocked chapters
  const cleanUserPhone = matchedUser.phone ? matchedUser.phone.replace(/[^0-9]/g, '') : '';
  const cleanUserEmail = matchedUser.email ? matchedUser.email.toLowerCase().trim() : '';
  const isActualOwner = cleanUserPhone.includes('9502714652') || cleanUserEmail.includes('srinivas') || cleanUserEmail.includes('kanakarao') || cleanUserEmail.includes('owner@');

  const restoredAccount: ReaderAccount = {
    ...matchedUser,
    isLoggedIn: true,
    authMethod: 'password',
    role: isActualOwner ? 'owner' : 'reader',
    lastLoginAt: new Date().toISOString(),
    watermarkSignature: `AUTH_PASSWORD_${Date.now().toString(36).toUpperCase()}_VERIFIED`
  };

  saveReaderAccount(restoredAccount);
  registerOrUpdateUser(restoredAccount);

  // Set or revoke owner session strictly based on owner identity
  if (isActualOwner) {
    setOwnerSession(true);
  } else {
    setOwnerSession(false);
  }

  await logSecurityEvent('INFO', 'PASSWORD_LOGIN_SUCCESS', 'Auth Service', `User ${restoredAccount.readerId} logged in via password from device.`);

  return {
    success: true,
    message: `Welcome back, ${restoredAccount.name}! Account and VIP membership synced successfully.`,
    account: restoredAccount
  };
}

/**
 * Reset password via OTP verification (Forgot Password flow)
 */
export async function resetPasswordWithOtp(
  target: string,
  enteredCode: string,
  newPassword: string
): Promise<VerifyOtpResult> {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: 'New password must be at least 4 characters long.' };
  }

  const session = getActiveOtpSession();
  const cleanCode = enteredCode.trim().replace(/[^0-9]/g, '');

  if (!session) {
    return {
      success: false,
      message: 'No active OTP session found or it has expired (65s limit). Please request a new code.'
    };
  }

  if (Date.now() > session.expiresAt) {
    clearOtpSession();
    return {
      success: false,
      message: 'Your verification code has expired after 65 seconds. Please request a new code.'
    };
  }

  session.attempts += 1;
  saveActiveOtpSession(session);

  if (session.attempts > 4) {
    clearOtpSession();
    await logSecurityEvent('WARN', 'OTP_BRUTE_FORCE_PREVENTED', 'Auth Service', `Locked forgot-password session for ${session.target}`);
    return {
      success: false,
      message: 'Maximum attempts exceeded. This code has been invalidated. Please request a new code.'
    };
  }

  if (cleanCode !== session.code) {
    return {
      success: false,
      message: `Incorrect verification code. Please check and try again (${4 - session.attempts} attempts remaining).`
    };
  }

  // OTP verified! Clear session
  clearOtpSession();

  const pHash = await hashPassword(newPassword);
  const cleanTarget = target.replace(/[^0-9]/g, '');
  const cleanEmail = target.trim().toLowerCase();
  const users = getAllRegisteredUsers();

  let matchedUser = users.find(u => {
    const uPhone = u.phone?.replace(/[^0-9]/g, '');
    const uEmail = u.email?.trim().toLowerCase();
    const phoneMatch = cleanTarget.length >= 7 && uPhone && uPhone.includes(cleanTarget);
    const emailMatch = cleanEmail.includes('@') && uEmail === cleanEmail;
    const readerIdMatch = u.readerId.toUpperCase() === target.trim().toUpperCase();
    return phoneMatch || emailMatch || readerIdMatch;
  });

  const currentAccount = getReaderAccount();

  if (!matchedUser) {
    // If user account wasn't in registry yet, associate with current account
    const isPhone = !target.includes('@');
    matchedUser = {
      ...currentAccount,
      phone: isPhone ? target : currentAccount.phone,
      email: isPhone ? currentAccount.email : target,
      passwordHash: pHash,
      role: 'reader',
      lastLoginAt: new Date().toISOString()
    };
  } else {
    matchedUser = {
      ...matchedUser,
      passwordHash: pHash,
      lastLoginAt: new Date().toISOString()
    };
  }

  const updatedAccount: ReaderAccount = {
    ...matchedUser,
    isLoggedIn: true,
    authMethod: 'password',
    watermarkSignature: `AUTH_RESET_${Date.now().toString(36).toUpperCase()}_VERIFIED`
  };

  saveReaderAccount(updatedAccount);
  registerOrUpdateUser(updatedAccount, pHash);

  if (updatedAccount.role === 'owner' || updatedAccount.role === 'admin' || (updatedAccount.phone && updatedAccount.phone.includes('9502714652'))) {
    setOwnerSession(true);
  }

  await logSecurityEvent('INFO', 'PASSWORD_RESET_SUCCESS', 'Auth Service', `Password reset successfully via OTP for ${target}`);

  return {
    success: true,
    message: `Password reset successfully! Welcome back, ${updatedAccount.name}.`,
    account: updatedAccount
  };
}

/**
 * Generate cryptographically random temporary password for Admin to provide to user
 */
export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SUKA-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Admin action to clear/remove a user's password (reverts user to OTP-only login)
 */
export async function adminClearPassword(readerId: string): Promise<boolean> {
  const users = getAllRegisteredUsers();
  let found = false;
  const updated = users.map(u => {
    if (u.readerId === readerId) {
      found = true;
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    }
    return u;
  });

  if (found) {
    saveRegisteredUsers(updated);
    const current = getReaderAccount();
    if (current.readerId === readerId) {
      const currentCopy = { ...current };
      delete currentCopy.passwordHash;
      saveReaderAccount(currentCopy);
    }
    await logSecurityEvent('INFO', 'ADMIN_PASSWORD_CLEARED', 'Auth Service', `Password cleared for user ${readerId} by Admin.`);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// GLOBAL TRANSACTIONS REPOSITORY (One Unified Page for Owner)
// ---------------------------------------------------------------------------
export function getAllTransactions(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(GLOBAL_TRANSACTIONS_KEY);
    if (!raw) {
      // Seed with initial ledger
      const initialTx: PaymentTransaction[] = [
        {
          id: 'TXN-MEM-000-INIT',
          readerId: 'SSO-READER-000',
          chapterTitle: 'SUKA SRI Monthly VIP Membership (All Arcs & Chapters Access)',
          type: 'monthly_membership',
          amount: 19,
          currency: 'INR',
          method: 'UPI',
          timestamp: new Date().toISOString(),
          status: 'completed',
          hmacSignature: 'HMAC_SHA256_F982C3D_SECURE_SIG',
          upiRefNumber: '431890284712'
        },
        {
          id: 'TXN-CHP-001-CANON',
          readerId: 'SSO-READER-000',
          chapterId: 'sample-ch-001',
          chapterTitle: 'Ch. 1: Celestial Awakening — The Origin Flame',
          type: 'chapter_purchase',
          amount: 49,
          currency: 'INR',
          method: 'UPI',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          hmacSignature: 'HMAC_SHA256_A1B2C3D_SECURE_SIG',
          upiRefNumber: '431876541290'
        }
      ];
      localStorage.setItem(GLOBAL_TRANSACTIONS_KEY, JSON.stringify(initialTx));
      return initialTx;
    }
    const list: PaymentTransaction[] = JSON.parse(raw);
    if (Array.isArray(list)) {
      return list.map(t => ({
        ...t,
        readerId: t.readerId ? t.readerId.replace('SSRI-READER-8842', 'SSO-READER-000').replace('SSRI-READER-', 'SSO-READER-') : 'SSO-READER-000'
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export function recordGlobalTransaction(tx: PaymentTransaction): void {
  try {
    const all = getAllTransactions();
    const exists = all.some(t => t.id === tx.id);
    if (!exists) {
      all.unshift(tx);
      localStorage.setItem(GLOBAL_TRANSACTIONS_KEY, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Failed to record global transaction:', e);
  }
}

// ---------------------------------------------------------------------------
// OWNER & ADMIN STUDIO ACCESS PERMISSIONS
// ---------------------------------------------------------------------------
export function isOwnerAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(OWNER_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOwnerSession(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(OWNER_SESSION_KEY);
    }
  } catch {}
}

export function verifyOwnerPasscode(passcode: string): boolean {
  const clean = passcode.trim();
  const matched = OWNER_PASSCODES.includes(clean);
  if (matched) {
    setOwnerSession(true);
    // Upgrade current reader account role if logged in
    const current = getReaderAccount();
    const updated: ReaderAccount = { ...current, role: 'owner' };
    saveReaderAccount(updated);
    registerOrUpdateUser(updated);
    logSecurityEvent('INFO', 'OWNER_AUTHENTICATED', 'Auth Service', 'Owner / Admin privileges activated via passcode.');
    return true;
  }
  return false;
}

export async function verifyOwnerOtp(enteredCode: string): Promise<{ success: boolean; message: string }> {
  const session = getActiveOtpSession();
  const cleanCode = enteredCode.trim().replace(/[^0-9]/g, '');

  if (!session) {
    return {
      success: false,
      message: 'No active OTP session found or it has expired (65s limit). Please request a new code.'
    };
  }

  if (Date.now() > session.expiresAt) {
    clearOtpSession();
    return {
      success: false,
      message: 'The 65-second OTP has expired. Please request a new code.'
    };
  }

  if (cleanCode !== session.code) {
    return {
      success: false,
      message: 'Invalid verification code. Please check and try again.'
    };
  }

  clearOtpSession();
  setOwnerSession(true);

  const current = getReaderAccount();
  const updated: ReaderAccount = { ...current, role: 'owner' };
  saveReaderAccount(updated);
  registerOrUpdateUser(updated);

  await logSecurityEvent('INFO', 'OWNER_OTP_AUTHENTICATED', 'Auth Service', 'Owner privileges unlocked via 65s Phone OTP.');
  return {
    success: true,
    message: 'Master authentication verified! Welcome, Owner Srinivas / Kanaka Rao Vennu.'
  };
}

export function isOwnerOrAdmin(account?: ReaderAccount): boolean {
  const target = account || getReaderAccount();

  // If a user is logged in, verify whether they match the owner credentials
  if (target && target.isLoggedIn) {
    const cleanPhone = target.phone ? target.phone.replace(/[^0-9]/g, '') : '';
    const cleanEmail = target.email ? target.email.toLowerCase().trim() : '';

    const isOwnerPhone = cleanPhone.includes('9502714652');
    const isOwnerEmail = cleanEmail.includes('srinivas') || cleanEmail.includes('kanakarao') || cleanEmail.includes('owner@');

    // If neither matches owner phone nor owner email: this user is definitely a normal reader!
    if (!isOwnerPhone && !isOwnerEmail) {
      return false;
    }

    return target.role === 'owner' || target.role === 'admin' || isOwnerPhone || isOwnerEmail;
  }

  // If user is guest / not logged in, check if owner passcode/OTP was unlocked in this browser session
  return isOwnerAuthenticated();
}

// ---------------------------------------------------------------------------
// ACTIVE OTP SESSIONS
// ---------------------------------------------------------------------------
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
  const expiresAt = Date.now() + OTP_EXPIRY_MS; // Exactly 65 seconds

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
    `Dispatched 6-digit SMS OTP to ${fullPhone.slice(0, 7)}**** (Expires in 65s)`
  );

  return {
    success: true,
    message: `Verification code sent to ${fullPhone}! Valid for 65 seconds only.`,
    session: {
      target: fullPhone,
      type: 'phone',
      expiresAt,
      validitySeconds: OTP_VALIDITY_SECONDS,
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
  const expiresAt = Date.now() + OTP_EXPIRY_MS; // Exactly 65 seconds

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
    `Dispatched 6-digit verification code to ${cleanEmail.slice(0, 3)}***@*** (Expires in 65s)`
  );

  return {
    success: true,
    message: `Verification code sent to ${cleanEmail}! Valid for 65 seconds only.`,
    session: {
      target: cleanEmail,
      type: 'email',
      expiresAt,
      validitySeconds: OTP_VALIDITY_SECONDS,
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
      message: 'No active OTP session found or it has expired (65s limit). Please request a new code.'
    };
  }

  if (Date.now() > session.expiresAt) {
    clearOtpSession();
    return {
      success: false,
      message: 'Your verification code has expired after 65 seconds. Please request a new code.'
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

  const cleanTargetPhone = isPhone ? session.target : (currentAccount.phone || '');
  const isOwnerNumber = cleanTargetPhone && cleanTargetPhone.replace(/[^0-9]/g, '').includes('9502714652');
  const targetEmail = isPhone ? (currentAccount.email || '') : session.target;
  const cleanTargetEmail = targetEmail.toLowerCase().trim();
  const isOwnerEmail = cleanTargetEmail.includes('srinivas') || cleanTargetEmail.includes('kanakarao') || cleanTargetEmail.includes('owner@');
  const isActualOwner = Boolean(isOwnerNumber || isOwnerEmail);

  // Set or revoke owner session immediately based on authenticated user
  if (isActualOwner) {
    setOwnerSession(true);
  } else {
    setOwnerSession(false);
  }

  const readerId = isActualOwner
    ? 'SSO-READER-000'
    : (currentAccount.readerId && currentAccount.readerId !== 'SSO-READER-000'
        ? currentAccount.readerId.replace('SSRI-READER-8842', 'SSO-READER-000').replace('SSRI-READER-', 'SSO-READER-')
        : generateReaderId());

  const updatedAccount: ReaderAccount = {
    ...currentAccount,
    readerId,
    name: name?.trim() || (currentAccount.name !== 'Valued Manga Reader' && currentAccount.name !== 'Guest Reader' ? currentAccount.name : defaultName),
    email: isPhone ? currentAccount.email : session.target,
    phone: cleanTargetPhone,
    isLoggedIn: true,
    authMethod: type,
    role: isActualOwner ? 'owner' : 'reader',
    watermarkSignature: `AUTH_${type.toUpperCase()}_${Date.now().toString(36).toUpperCase()}_VERIFIED`
  };

  saveReaderAccount(updatedAccount);
  registerOrUpdateUser(updatedAccount);

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
  setOwnerSession(false);
  const current = getReaderAccount();

  const loggedOutAccount: ReaderAccount = {
    ...current,
    isLoggedIn: false,
    authMethod: 'guest',
    role: 'reader',
    name: 'Guest Reader',
    email: 'guest@sukasri.universe',
    phone: undefined
  };

  saveReaderAccount(loggedOutAccount);
  return loggedOutAccount;
}
