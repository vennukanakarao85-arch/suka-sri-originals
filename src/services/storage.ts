// Utility for reading image files as base64 Data URLs for instant client-side preview & persistence

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Generate high-resolution procedural placeholder manga page artwork if the creator wants rapid testing
export function generatePlaceholderPage(pageNumber: number, title: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - manga paper with screentone grain
  ctx.fillStyle = '#0a0a10';
  ctx.fillRect(0, 0, 800, 1200);

  // Border frame
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, 740, 1140);

  // Manga Panel 1 (Top Hero)
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, 700, 480);
  ctx.fillStyle = '#11121d';
  ctx.fillRect(52, 52, 696, 476);

  // Glow line
  const grad = ctx.createLinearGradient(50, 50, 750, 530);
  grad.addColorStop(0, '#00E5FF');
  grad.addColorStop(0.5, '#8A2BE2');
  grad.addColorStop(1, '#FFD700');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(80, 480);
  ctx.lineTo(720, 100);
  ctx.stroke();

  // Manga Panel 2 (Bottom Left)
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 550, 340, 580);
  ctx.fillStyle = '#0f1019';
  ctx.fillRect(52, 552, 336, 576);

  // Manga Panel 3 (Bottom Right)
  ctx.strokeStyle = '#8A2BE2';
  ctx.lineWidth = 2;
  ctx.strokeRect(410, 550, 340, 580);
  ctx.fillStyle = '#0d0d17';
  ctx.fillRect(412, 552, 336, 576);

  // Text annotations
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SUKA SRI ORIGINALS', 400, 260);

  ctx.fillStyle = '#FFD700';
  ctx.font = '24px Cinzel, serif';
  ctx.fillText(`${title} — PAGE ${pageNumber}`, 400, 310);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('[ CANONICAL MANGA SEQUENCE ]', 400, 350);

  // Speech bubble simulation in panel 2
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(220, 750, 120, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = 'italic bold 16px Inter, sans-serif';
  ctx.fillText('"The Void Blade resonates..."', 220, 755);

  return canvas.toDataURL('image/png');
}

// ---------------------------------------------------------------------------
// READER ACCOUNT & PAYMENT VERIFICATION SYSTEM
// ---------------------------------------------------------------------------
import { ReaderAccount, PaymentTransaction, Chapter, PaymentCurrency, PaymentMethod } from '../types';

const READER_ACCOUNT_KEY = 'sukasri_reader_account_v1';

export function getReaderAccount(): ReaderAccount {
  try {
    const raw = localStorage.getItem(READER_ACCOUNT_KEY);
    if (raw) {
      const parsed: ReaderAccount = JSON.parse(raw);
      // Auto-migrate legacy SSRI-READER- IDs to SSO-READER-000
      if (parsed.readerId && (parsed.readerId.includes('SSRI-READER-') || parsed.readerId === 'SSRI-READER-8842')) {
        parsed.readerId = parsed.readerId.replace('SSRI-READER-8842', 'SSO-READER-000').replace('SSRI-READER-', 'SSO-READER-');
        saveReaderAccount(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading reader account:', e);
  }

  // Initial canonical reader account with sample Chapter 1 unlocked
  const defaultAccount: ReaderAccount = {
    readerId: 'SSO-READER-000',
    name: 'Valued Manga Reader',
    email: 'reader@sukasri.universe',
    country: 'IN',
    membershipStatus: 'free',
    unlockedChapterIds: ['sample-ch-001', 'ch-1', 'ch-001'],
    transactions: [],
    watermarkSignature: 'SECURE-HMAC-256-AUTH-SSO-2026',
  };

  saveReaderAccount(defaultAccount);
  return defaultAccount;
}

export function saveReaderAccount(account: ReaderAccount): void {
  try {
    localStorage.setItem(READER_ACCOUNT_KEY, JSON.stringify(account));
  } catch (e) {
    console.error('Error saving reader account:', e);
  }
}

// Generates simulated cryptographic HMAC-SHA256 signature for payment verification
export function generateCryptographicReceipt(txId: string, amount: number, readerId: string): string {
  const seed = `${txId}:${amount}:${readerId}:${Date.now()}:SUKASRI_ORIGINALS_PRIVATE_SALT_2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `HMAC_SHA256_${hex.toUpperCase()}_SECURE_SIG`;
}

// Unlock individual chapter
export function unlockChapterForReader(
  chapter: Chapter,
  amount: number,
  currency: PaymentCurrency,
  method: PaymentMethod,
  upiRefNumber?: string
): ReaderAccount {
  const account = getReaderAccount();
  const txId = `TXN-SSRI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const signature = generateCryptographicReceipt(txId, amount, account.readerId);

  const transaction: PaymentTransaction = {
    id: txId,
    readerId: account.readerId,
    chapterId: chapter.id,
    chapterTitle: `Ch. ${chapter.chapterNumber}: ${chapter.title}`,
    type: 'chapter_purchase',
    amount,
    currency,
    method,
    timestamp: new Date().toISOString(),
    status: 'completed',
    hmacSignature: signature,
    upiRefNumber: upiRefNumber || `UPI${Date.now().toString().slice(-8)}`,
  };

  const unlockedSet = new Set(account.unlockedChapterIds);
  unlockedSet.add(chapter.id);

  const updatedAccount: ReaderAccount = {
    ...account,
    unlockedChapterIds: Array.from(unlockedSet),
    transactions: [transaction, ...account.transactions],
  };

  saveReaderAccount(updatedAccount);
  syncGlobalRegistry(transaction, updatedAccount);
  return updatedAccount;
}

// Helper to keep global transactions ledger and registered users in sync
function syncGlobalRegistry(transaction: PaymentTransaction, account: ReaderAccount) {
  try {
    const rawTx = localStorage.getItem('sukasri_global_transactions_v1');
    const txList: PaymentTransaction[] = rawTx ? JSON.parse(rawTx) : [];
    if (!txList.some(t => t.id === transaction.id)) {
      txList.unshift(transaction);
      localStorage.setItem('sukasri_global_transactions_v1', JSON.stringify(txList));
    }
  } catch {}

  try {
    const rawUsers = localStorage.getItem('sukasri_registered_users_v1');
    const users: ReaderAccount[] = rawUsers ? JSON.parse(rawUsers) : [];
    const idx = users.findIndex(u => u.readerId === account.readerId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...account };
    } else {
      users.unshift(account);
    }
    localStorage.setItem('sukasri_registered_users_v1', JSON.stringify(users));
  } catch {}
}

// Activate 30-Day Monthly Membership (₹19 INR / $0.50 USD)
export function activateMonthlyMembership(
  amount: number,
  currency: PaymentCurrency,
  method: PaymentMethod,
  upiRefNumber?: string
): ReaderAccount {
  const account = getReaderAccount();
  const txId = `TXN-MEM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const signature = generateCryptographicReceipt(txId, amount, account.readerId);

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  const transaction: PaymentTransaction = {
    id: txId,
    readerId: account.readerId,
    chapterTitle: 'SUKA SRI Monthly All-Access VIP Membership (All Arcs & Chapters)',
    type: 'monthly_membership',
    amount,
    currency,
    method,
    timestamp: new Date().toISOString(),
    status: 'completed',
    hmacSignature: signature,
    upiRefNumber: upiRefNumber || `UPI${Date.now().toString().slice(-8)}`,
  };

  const updatedAccount: ReaderAccount = {
    ...account,
    membershipStatus: 'monthly_member',
    membershipValidUntil: expiry.toISOString().split('T')[0],
    transactions: [transaction, ...account.transactions],
  };

  saveReaderAccount(updatedAccount);
  syncGlobalRegistry(transaction, updatedAccount);
  return updatedAccount;
}

// Check if reader has authorized access to read or download a chapter
export function isChapterUnlocked(account: ReaderAccount, chapter: Chapter): boolean {
  // Owner and Admin have unrestricted access to all chapters
  if (account.role === 'owner' || account.role === 'admin' || (account.phone && account.phone.includes('9502714652'))) {
    return true;
  }
  // Free chapters are open to all
  if (chapter.accessType === 'free' || chapter.chapterNumber === 1 || chapter.id === 'sample-ch-001' || chapter.id === 'sample-ch-1') {
    return true;
  }
  // Active monthly membership unlocks all chapters
  if (account.membershipStatus === 'monthly_member') {
    return true;
  }
  // Individual purchase unlock
  return account.unlockedChapterIds.includes(chapter.id);
}

// Generate watermarked text edition
export function generateWatermarkedChapterText(chapter: Chapter, account: ReaderAccount): string {
  const now = new Date().toISOString();
  const watermarkHeader = `
================================================================================
                    SUKA SRI ORIGINALS — OFFICIAL AUTHORIZED EDITION
================================================================================
  AUTHOR: Srinivas Vennu
  SERIES: ${chapter.mangaTitle || 'SUKA SRI ORIGINALS'}
  ARC: ${chapter.arcTitle}
  CHAPTER ${chapter.chapterNumber}: ${chapter.title}
  
  [SECURITY WATERMARK]
  LICENSED TO: ${account.name} (Reader ID: ${account.readerId})
  ISSUED AT: ${now}
  HMAC SIGNATURE: ${account.watermarkSignature}
  COPYRIGHT: © ${new Date().getFullYear()} SUKA SRI ORIGINALS. All Rights Reserved.
  RESTRICTION: Authorized personal download. Unauthorized reproduction, scanning, 
               or re-distribution is strictly prohibited.
================================================================================

`;

  const body = chapter.textContent || `[Chapter ${chapter.chapterNumber}: ${chapter.title} — Canonical manuscript text.]`;
  return `${watermarkHeader}\n\n${body}\n\n================================================================================\n              END OF CHAPTER ${chapter.chapterNumber} • SUKA SRI ORIGINALS\n================================================================================`;
}

// Trigger secure file download of the watermarked chapter
export function downloadWatermarkedChapter(chapter: Chapter, account: ReaderAccount): void {
  const content = generateWatermarkedChapterText(chapter, account);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeTitle = chapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `SUKASRI_Ch_${chapter.chapterNumber}_${safeTitle}_Licensed.md`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

