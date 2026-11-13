import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
  BookOpen,
  Calendar,
  CreditCard,
  Clock,
  Key,
  Layers,
  Smartphone,
  Laptop
} from 'lucide-react';
import { ReaderAccount, Chapter } from '../../types';
import {
  sendPhoneOtp,
  sendEmailOtp,
  verifyOtpAndLogin,
  logoutReaderAccount,
  loginWithPassword,
  setPasswordForAccount,
  resetPasswordWithOtp,
  isOwnerOrAdmin,
  OTP_VALIDITY_SECONDS
} from '../../services/authService';
import { sound } from '../../data/soundEffects';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  readerAccount: ReaderAccount;
  onAccountUpdated: (updated: ReaderAccount) => void;
  allChapters?: Chapter[];
  onOpenPricing?: () => void;
  onReadChapter?: (chapterId: string) => void;
  onOpenOwnerCommandCenter?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
];

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  readerAccount,
  onAccountUpdated,
  allChapters = [],
  onOpenPricing,
  onReadChapter,
  onOpenOwnerCommandCenter
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'password'>('phone');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  // Password Login State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isLoggingInWithPw, setIsLoggingInWithPw] = useState<boolean>(false);

  // Forgot Password via OTP State
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState<boolean>(false);
  const [forgotTarget, setForgotTarget] = useState<string>('');
  const [forgotCountryCode, setForgotCountryCode] = useState<string>('+91');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [isResettingPw, setIsResettingPw] = useState<boolean>(false);

  // Profile Password Setup State
  const [newPassword, setNewPassword] = useState<string>('');
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordSetupSuccess, setPasswordSetupSuccess] = useState<string | null>(null);

  // OTP Verification State
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(OTP_VALIDITY_SECONDS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Strict OTP Expiry Timer (Exactly 65 seconds)
  useEffect(() => {
    if (!otpSent || otpSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setOtpSecondsLeft((prev) => {
        if (prev <= 1) {
          setErrorMessage('Your OTP has expired (valid for 65 seconds only). Please request a new code.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpSecondsLeft]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setOtpSent(false);
      setOtpDigits(['', '', '', '', '', '']);
      setPreviewOtp(null);
      setOtpSecondsLeft(OTP_VALIDITY_SECONDS);
      setResendCooldown(0);
      setPasswordSetupSuccess(null);
      setNewPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isUserLoggedIn = !!readerAccount.isLoggedIn;
  const isMember = readerAccount.membershipStatus === 'monthly_member';
  const isOwner = isOwnerOrAdmin(readerAccount);

  // Handle Send OTP
  const handleSendOtp = async () => {
    sound.playClick();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSending(true);

    try {
      if (authMethod === 'phone') {
        const res = await sendPhoneOtp(phoneNumber, countryCode);
        if (res.success) {
          setOtpSent(true);
          setPreviewOtp(res.session?.simulatedPreviewOtp || null);
          setOtpSecondsLeft(OTP_VALIDITY_SECONDS);
          setResendCooldown(OTP_VALIDITY_SECONDS);
          setSuccessMessage(res.message);
          sound.playCelestialChime();
        } else {
          setErrorMessage(res.message);
        }
      } else if (authMethod === 'email') {
        const res = await sendEmailOtp(emailAddress);
        if (res.success) {
          setOtpSent(true);
          setPreviewOtp(res.session?.simulatedPreviewOtp || null);
          setOtpSecondsLeft(OTP_VALIDITY_SECONDS);
          setResendCooldown(OTP_VALIDITY_SECONDS);
          setSuccessMessage(res.message);
          sound.playCelestialChime();
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Multi-Device Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoggingInWithPw(true);

    try {
      const res = await loginWithPassword(loginIdentifier, loginPassword);
      if (res.success && res.account) {
        onAccountUpdated(res.account);
        setSuccessMessage(res.message);
        sound.playCelestialChime();
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Password login failed.');
    } finally {
      setIsLoggingInWithPw(false);
    }
  };

  // Handle Send OTP for Forgot Password
  const handleSendForgotOtp = async () => {
    sound.playClick();
    setErrorMessage(null);
    setSuccessMessage(null);

    const isEmail = forgotTarget.includes('@');
    const cleanPhone = forgotTarget.replace(/[^0-9]/g, '');

    if (!isEmail && cleanPhone.length < 7) {
      setErrorMessage('Please enter a valid phone number (min 7 digits) or email address.');
      return;
    }

    setIsSending(true);
    try {
      const res = isEmail
        ? await sendEmailOtp(forgotTarget)
        : await sendPhoneOtp(forgotTarget, forgotCountryCode);

      if (res.success) {
        setOtpSent(true);
        setPreviewOtp(res.session?.simulatedPreviewOtp || null);
        setOtpSecondsLeft(OTP_VALIDITY_SECONDS);
        setResendCooldown(OTP_VALIDITY_SECONDS);
        setSuccessMessage(res.message);
        sound.playCelestialChime();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Verify OTP and Reset Password
  const handleVerifyForgotOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your OTP.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setErrorMessage('Please enter a new password (min 4 characters).');
      return;
    }

    sound.playClick();
    setErrorMessage(null);
    setIsResettingPw(true);

    try {
      const isEmail = forgotTarget.includes('@');
      const cleanPhone = forgotTarget.replace(/[^0-9]/g, '');
      const fullTarget = isEmail ? forgotTarget.trim().toLowerCase() : `${forgotCountryCode} ${cleanPhone}`;

      const res = await resetPasswordWithOtp(fullTarget, code, forgotNewPassword);
      if (res.success && res.account) {
        onAccountUpdated(res.account);
        setSuccessMessage(res.message);
        sound.playCelestialChime();
        setIsForgotPasswordMode(false);
        setOtpSent(false);
        setForgotNewPassword('');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsResettingPw(false);
    }
  };

  // Handle Set Password for Current User (Multi-Device access)
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    sound.playClick();
    setIsSavingPassword(true);
    try {
      const ok = await setPasswordForAccount(readerAccount.readerId, newPassword);
      if (ok) {
        setPasswordSetupSuccess('Password saved! You can now log into this VIP account from any phone or PC.');
        sound.playCelestialChime();
        setNewPassword('');
        setTimeout(() => setPasswordSetupSuccess(null), 4000);
      } else {
        setErrorMessage('Failed to save password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to set password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle OTP digit changes with auto-advance
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (previewOtp && previewOtp.length === 6) {
      sound.playClick();
      setOtpDigits(previewOtp.split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your OTP.');
      return;
    }

    sound.playClick();
    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const target = authMethod === 'phone' ? `${countryCode} ${phoneNumber}` : emailAddress;
      const res = await verifyOtpAndLogin(target, code, authMethod as 'phone' | 'email', displayName);
      if (res.success && res.account) {
        onAccountUpdated(res.account);
        setSuccessMessage(`Verified Reader ID: ${res.account.readerId} — Starting with Chapter 1...`);
        sound.playCelestialChime();
        setOtpSent(false);
        setPreviewOtp(null);

        // Automatically open Chapter 1 (the starting chapter)
        const startingChapter = allChapters.find((c) => c.chapterNumber === 1) || allChapters[0];
        const chapterIdToOpen = startingChapter?.id || 'sample-ch-1';

        setTimeout(() => {
          onClose();
          if (onReadChapter) {
            onReadChapter(chapterIdToOpen);
          }
        }, 700);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sound.playClick();
    const guestAccount = logoutReaderAccount();
    onAccountUpdated(guestAccount);
    setSuccessMessage('You have logged out.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-void-900 border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-void-800 bg-void-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 via-violet-500/20 to-electric-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                {isUserLoggedIn ? 'Reader Profile & Multi-Device Sync' : 'Reader Portal Sign In'}
              </h3>
              <p className="text-[11px] text-slate-400">
                SUKA SRI ORIGINALS • Multiverse Reader Network
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Alert / Notifications */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW A: USER IS LOGGED IN */}
          {isUserLoggedIn ? (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-void-950 via-void-900 to-void-950 border border-gold-500/30 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 flex items-center justify-center font-display text-xl font-black text-void-950 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                      {readerAccount.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-lg font-bold text-white">
                          {readerAccount.name}
                        </h4>
                        {isMember && (
                          <span className="px-2 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-[10px] font-black text-gold-400 uppercase tracking-widest flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            VIP MEMBER
                          </span>
                        )}
                        {isOwner && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-black text-purple-300 uppercase tracking-widest">
                            OWNER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        {readerAccount.phone ? (
                          <>
                            <Phone className="w-3 h-3 text-electric-400" />
                            <span>{readerAccount.phone}</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3 h-3 text-electric-400" />
                            <span>{readerAccount.email}</span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        Verified Reader ID: <strong className="text-gold-400">{readerAccount.readerId}</strong>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <button
                          onClick={() => {
                            sound.playClick();
                            onClose();
                            if (onReadChapter) {
                              const startingChapter = allChapters.find((c) => c.chapterNumber === 1) || allChapters[0];
                              onReadChapter(startingChapter?.id || 'sample-ch-1');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-[10px] font-black uppercase tracking-wider hover:brightness-110 shadow-md cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Start with Chapter 1</span>
                        </button>

                        {isOwner && onOpenOwnerCommandCenter && (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onClose();
                              onOpenOwnerCommandCenter();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-200 font-display text-[10px] font-black uppercase tracking-wider hover:bg-purple-600/50 cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Owner Command Center</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out of this device"
                    className="p-2 rounded-xl bg-void-900 border border-void-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* MULTI-DEVICE PASSWORD CONFIGURATION CARD */}
              <div className="p-4 rounded-2xl bg-void-950 border border-electric-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-display text-xs font-bold text-white flex items-center gap-1.5">
                        Multi-Device Password Access
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          {readerAccount.passwordHash ? 'Configured' : 'Setup Required'}
                        </span>
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        Set a password to log into this VIP account on any phone, tablet, or laptop.
                      </p>
                    </div>
                  </div>
                </div>

                {passwordSetupSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {passwordSetupSuccess}
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="flex gap-2">
                  <input
                    type="password"
                    placeholder={readerAccount.passwordHash ? 'Update account password...' : 'Create account password (min 4 chars)...'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-void-900 border border-void-800 text-white text-xs outline-none focus:border-electric-400"
                  />
                  <button
                    type="submit"
                    disabled={isSavingPassword || !newPassword || newPassword.length < 4}
                    className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 disabled:opacity-50 text-void-950 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Save Password</span>
                  </button>
                </form>
              </div>

              {/* Membership Status & Unlocked Chapters Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-void-950 border border-void-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Membership</span>
                  <div className="font-display text-sm font-bold text-gold-400">
                    {isMember ? 'VIP Monthly All-Access' : 'Free Reader Account'}
                  </div>
                  {onOpenPricing && !isMember && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onClose();
                        onOpenPricing();
                      }}
                      className="mt-2 text-[11px] font-bold text-electric-400 hover:underline flex items-center gap-1"
                    >
                      <span>Upgrade to VIP (₹19/mo)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-void-950 border border-void-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Unlocked Chapters</span>
                  <div className="font-display text-xl font-bold text-electric-400">
                    {isMember ? 'All Released Chapters' : `${readerAccount.unlockedChapterIds.length} Chapters`}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {isMember ? 'Saga-wide instant pass' : 'Permanent individual licenses'}
                  </p>
                </div>
              </div>

              {/* Recent Unlocked Chapters list */}
              {allChapters.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Your Manga Library</span>
                    <span className="text-[10px] text-gold-400 font-mono">Canonical Chapters</span>
                  </h5>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {allChapters.slice(0, 5).map((ch) => (
                      <div
                        key={ch.id}
                        className="p-3 rounded-xl bg-void-950 border border-void-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">Ch. {ch.chapterNumber}: {ch.title}</div>
                          <div className="text-[10px] text-slate-400">{ch.arcTitle}</div>
                        </div>
                        {onReadChapter && (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onClose();
                              onReadChapter(ch.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gold-500/15 border border-gold-500/40 text-gold-300 font-bold hover:bg-gold-500 hover:text-void-950 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Read</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (

            /* VIEW B: USER IS NOT LOGGED IN (AUTH FORM) */
            <div className="space-y-5">
              
              {/* Method Switcher Tabs: Phone vs Email vs Password */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-void-950 border border-void-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMethod('phone');
                    setOtpSent(false);
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    authMethod === 'phone'
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMethod('email');
                    setOtpSent(false);
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    authMethod === 'email'
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMethod('password');
                    setOtpSent(false);
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    authMethod === 'password'
                      ? 'bg-gradient-to-r from-electric-500 to-cyan-500 text-void-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
              </div>

              {/* PASSWORD LOGIN & FORGOT PASSWORD VIEW */}
              {authMethod === 'password' ? (
                isForgotPasswordMode ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-void-900 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-white">Reset Password via 65s OTP</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setIsForgotPasswordMode(false);
                          setOtpSent(false);
                          setErrorMessage(null);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Back to Login
                      </button>
                    </div>

                    {!otpSent ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                            Your Registered Phone or Email <span className="text-gold-400">*</span>
                          </label>
                          <div className="flex gap-2">
                            {!forgotTarget.includes('@') && (
                              <div className="relative w-32 shrink-0">
                                <select
                                  value={forgotCountryCode}
                                  onChange={(e) => setForgotCountryCode(e.target.value)}
                                  className="w-full appearance-none px-3 py-2.5 rounded-xl bg-void-950 border border-void-800 text-white text-xs font-mono"
                                >
                                  {COUNTRY_CODES.map((c) => (
                                    <option key={c.code} value={c.code} className="bg-void-950 text-white">
                                      {c.flag} {c.code}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <input
                              type="text"
                              placeholder="Phone (e.g. 9502714652) or Email"
                              value={forgotTarget}
                              onChange={(e) => setForgotTarget(e.target.value)}
                              className="flex-1 px-4 py-2.5 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-purple-400"
                              required
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            A secure 6-digit reset code will be dispatched, valid strictly for 65 seconds.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isSending || !forgotTarget.trim()}
                          onClick={handleSendForgotOtp}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSending ? (
                            <>
                              <RotateCcw className="w-4 h-4 animate-spin" />
                              <span>Sending 65s OTP...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Send 6-Digit Reset Code (65s OTP)</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleVerifyForgotOtpAndReset} className="space-y-4">
                        {previewOtp && (
                          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs space-y-1">
                            <div className="flex items-center justify-between text-purple-300 font-bold">
                              <span>Reset OTP Gateway Notification:</span>
                              <span className="text-[10px] font-mono text-purple-400">
                                {otpSecondsLeft}s left
                              </span>
                            </div>
                            <div className="font-mono text-lg font-black text-gold-400">
                              {previewOtp}
                            </div>
                            <button
                              type="button"
                              onClick={handleAutoFillOtp}
                              className="text-[10px] text-electric-300 underline cursor-pointer"
                            >
                              ⚡ 1-Tap Auto-Fill this OTP
                            </button>
                          </div>
                        )}

                        <div className="text-center space-y-1">
                          <span className="text-xs text-slate-300">Enter the 6-digit code sent to:</span>
                          <div className="text-xs font-mono font-bold text-gold-400">{forgotTarget}</div>
                        </div>

                        {/* 6 Digit Input Boxes */}
                        <div className="flex items-center justify-center gap-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              maxLength={1}
                              value={digit}
                              disabled={otpSecondsLeft === 0}
                              onChange={(e) => handleDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(idx, e)}
                              className="w-10 h-12 rounded-xl bg-void-950 border border-void-800 text-center text-lg font-mono font-bold text-white focus:border-purple-400 outline-none"
                            />
                          ))}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                            Create New Password <span className="text-gold-400">*</span>
                          </label>
                          <input
                            type="password"
                            placeholder="Enter new password (min 4 characters)..."
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-void-950 border border-void-800 text-white text-xs outline-none focus:border-purple-400"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isResettingPw || otpDigits.join('').length !== 6 || !forgotNewPassword || forgotNewPassword.length < 4}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isResettingPw ? (
                            <>
                              <RotateCcw className="w-4 h-4 animate-spin" />
                              <span>Resetting Password & Syncing VIP...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Reset Password &amp; Log In</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div className="p-3 rounded-xl bg-electric-950/30 border border-electric-500/30 text-[11px] text-electric-300 flex items-center gap-2">
                      <Laptop className="w-4 h-4 shrink-0 text-electric-400" />
                      <span>Log in across any phone, laptop, or tablet without losing your VIP membership.</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Phone Number or Email Address <span className="text-gold-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9502714652 or reader@sukasri.universe"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-electric-400 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                          Account Password <span className="text-gold-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setIsForgotPasswordMode(true);
                            setForgotTarget(loginIdentifier || '');
                            setOtpSent(false);
                            setErrorMessage(null);
                          }}
                          className="text-[10px] text-electric-400 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter your account password..."
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-electric-400 transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingInWithPw || !loginIdentifier || !loginPassword}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-500 to-cyan-500 hover:brightness-110 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoggingInWithPw ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Authenticating Across Devices...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Log In with Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )
              ) : (

                /* OTP INPUT FIELDS (Phone or Email) */
                !otpSent ? (
                  <div className="space-y-4">
                    {/* Name (Optional) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Your Name / Reader Handle <span className="text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shin Takamori"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-gold-500/60 transition-colors"
                      />
                    </div>

                    {/* Phone Input with Country Code Dropdown */}
                    {authMethod === 'phone' ? (
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                          Mobile Phone Number <span className="text-gold-400">*</span>
                        </label>
                        <div className="flex gap-2">
                          {/* Country Code Select */}
                          <div className="relative w-36 shrink-0">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="w-full appearance-none px-3 py-3 rounded-xl bg-void-950 border border-void-800 text-white text-xs font-mono focus:outline-none focus:border-gold-500/60 transition-colors pr-7"
                            >
                              {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code} className="bg-void-950 text-white">
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                          </div>

                          {/* Phone input */}
                          <input
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            className="flex-1 px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-gold-500/60 transition-colors"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Email Input */
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                          Email Address <span className="text-gold-400">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="reader@universe.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-gold-500/60 transition-colors"
                        />
                      </div>
                    )}

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      disabled={isSending || (authMethod === 'phone' ? phoneNumber.length < 7 : !emailAddress.includes('@'))}
                      onClick={handleSendOtp}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:brightness-110 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSending ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Generating Secure Code (65s)...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Send 6-Digit Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (

                  /* OTP VERIFICATION STEP */
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    
                    {/* Simulated SMS / Email Banner Preview */}
                    {previewOtp && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-void-900 to-electric-950/60 border border-electric-400/40 shadow-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-electric-400 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4" />
                            <span>Simulated {authMethod === 'phone' ? 'SMS' : 'Email'} Gateway Notification</span>
                          </span>
                          <span className={`text-[10px] font-mono font-bold flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                            otpSecondsLeft === 0
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                              : otpSecondsLeft <= 20
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{otpSecondsLeft === 0 ? 'EXPIRED (00:00)' : `Valid for ${Math.floor(otpSecondsLeft / 60)}:${(otpSecondsLeft % 60).toString().padStart(2, '0')} (65s)`}</span>
                          </span>
                        </div>
                        <div className="text-xs text-slate-200">
                          SUKA SRI verification code:{' '}
                          <strong className="text-gold-400 font-mono text-base tracking-widest bg-void-950 px-2 py-0.5 rounded border border-gold-500/40">
                            {previewOtp}
                          </strong>
                        </div>
                        {otpSecondsLeft === 0 ? (
                          <div className="text-[11px] text-red-400 font-semibold bg-red-950/40 border border-red-500/30 px-2.5 py-1 rounded-lg">
                            ⚠️ This OTP has expired (65 seconds limit). Click "Resend Code" below to request a new code.
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAutoFillOtp}
                            className="text-[11px] font-bold text-electric-300 hover:text-white underline cursor-pointer"
                          >
                            ⚡ Click here to 1-Tap Auto-Fill this OTP
                          </button>
                        )}
                      </div>
                    )}

                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-300">
                        Enter the 6-digit code sent to:
                      </p>
                      <p className="text-xs font-mono font-bold text-gold-400">
                        {authMethod === 'phone' ? `${countryCode} ${phoneNumber}` : emailAddress}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        (OTP is valid strictly for 65 seconds only)
                      </p>
                    </div>

                    {/* 6 Digit Input Boxes */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          disabled={otpSecondsLeft === 0}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className={`w-11 h-14 sm:w-12 sm:h-14 rounded-xl bg-void-950 border text-center text-xl font-mono font-black transition-all ${
                            otpSecondsLeft === 0
                              ? 'border-red-900/50 text-slate-600 cursor-not-allowed opacity-60'
                              : 'border-void-800 focus:border-gold-500 text-white focus:outline-none focus:shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Resend Timer & Change Number */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setOtpSent(false);
                        }}
                        className="hover:text-slate-200 underline"
                      >
                        Change {authMethod === 'phone' ? 'Phone Number' : 'Email'}
                      </button>

                      {resendCooldown > 0 && otpSecondsLeft > 0 ? (
                        <span className="text-[11px] font-mono text-slate-500">
                          Resend code in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-gold-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Resend Code (65s OTP)</span>
                        </button>
                      )}
                    </div>

                    {/* Verify Button */}
                    <button
                      type="button"
                      disabled={isVerifying || otpDigits.join('').length !== 6 || otpSecondsLeft === 0}
                      onClick={handleVerifyOtp}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-500 via-cyan-500 to-teal-500 hover:brightness-110 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isVerifying ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Verifying Authentication Code...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Enter SUKA SRI</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              )}

              {/* Security Assurance Footer */}
              <div className="pt-4 border-t border-void-800 text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by SUKA SRI Fortress • Zero-Knowledge Multi-Device Authentication</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
