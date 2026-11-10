import React from 'react';
import { ReaderAccount, Chapter } from '../../types';
import { downloadWatermarkedChapter } from '../../services/storage';
import { sound } from '../../data/soundEffects';
import {
  X,
  User,
  ShieldCheck,
  Sparkles,
  Download,
  BookOpen,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode
} from 'lucide-react';

interface ReaderAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  readerAccount: ReaderAccount;
  allChapters: Chapter[];
  onOpenChapter: (chapterId: string) => void;
  onOpenMembershipCheckout: () => void;
}

export const ReaderAccountModal: React.FC<ReaderAccountModalProps> = ({
  isOpen,
  onClose,
  readerAccount,
  allChapters,
  onOpenChapter,
  onOpenMembershipCheckout,
}) => {
  if (!isOpen) return null;

  const isMember = readerAccount.membershipStatus === 'monthly_member';

  const unlockedChapters = allChapters.filter(
    (c) =>
      c.chapterNumber === 1 ||
      c.accessType === 'free' ||
      isMember ||
      readerAccount.unlockedChapterIds.includes(c.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-void-900 border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-void-800 bg-void-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-electric-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                Reader Account & Subscriptions
              </h3>
              <p className="text-[11px] text-slate-400">
                Official Reader ID: <strong className="text-gold-400 font-mono">{readerAccount.readerId}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-void-900 border border-void-800 text-slate-400 hover:text-white hover:border-gold-500/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Membership Status Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isMember
                ? 'bg-gradient-to-br from-violet-950/40 via-void-900 to-electric-950/40 border-electric-400/50 shadow-[0_0_25px_rgba(0,229,255,0.15)]'
                : 'bg-void-950 border-void-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-void-950 text-gold-400 border border-gold-500/30">
                  Current Status
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {isMember ? `Valid until ${readerAccount.membershipValidUntil || 'Next Month'}` : 'Standard Reader'}
                </span>
              </div>
              <h4 className="font-display text-xl font-black text-white">
                {isMember ? 'VIP Monthly All-Access Member' : 'Free Reader Account'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                {isMember
                  ? 'You have unrestricted access to read and download all 450 chapters across the entire SUKA SRI ORIGINALS universe.'
                  : 'Upgrade to the official ₹19 / $0.50 monthly membership to unlock all chapters.'}
              </p>
            </div>

            {!isMember && (
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenMembershipCheckout();
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-void-950 font-display text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Get VIP (₹19 / $0.50)
              </button>
            )}
          </div>

          {/* Security & Watermark Stamp Notice */}
          <div className="p-4 rounded-2xl bg-void-950 border border-void-800 text-xs text-slate-400 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white text-xs block">
                Military-Grade Intellectual Property Protection
              </span>
              <p className="text-[11px] leading-relaxed">
                All downloaded chapters carry your unique cryptographic watermark signature (<code className="text-gold-400 font-mono">{readerAccount.watermarkSignature}</code>). Transactions are cryptographically verified with zero payment card storage.
              </p>
            </div>
          </div>

          {/* Unlocked Chapters Library */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-void-800 pb-2">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Unlocked Chapters ({unlockedChapters.length})
              </h4>
              <span className="text-[11px] text-slate-400">Available for offline licensed download</span>
            </div>

            {unlockedChapters.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No paid chapters unlocked yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {unlockedChapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-void-950 border border-void-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gold-400">
                          Ch. {ch.chapterNumber}
                        </span>
                        <span className="font-semibold text-white truncate max-w-[220px]">
                          {ch.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{ch.arcTitle}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onClose();
                          onOpenChapter(ch.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-void-900 border border-void-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3 text-gold-400" /> Read
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          downloadWatermarkedChapter(ch, readerAccount);
                        }}
                        className="p-1.5 rounded-lg bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-void-950 transition-colors"
                        title="Download Licensed Edition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-void-800 pb-2">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Payment History ({readerAccount.transactions.length})
              </h4>
              <span className="text-[11px] font-mono text-emerald-400">OWASP Verified</span>
            </div>

            {readerAccount.transactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No payment transactions recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {readerAccount.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-void-950 border border-void-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{tx.chapterTitle}</span>
                      <strong className="text-gold-400 font-mono">
                        {tx.currency === 'INR' ? `₹${tx.amount}` : `$${tx.amount.toFixed(2)}`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Tx: {tx.id}</span>
                      <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[9px] text-emerald-400 font-mono truncate">
                      Sig: {tx.hmacSignature}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
