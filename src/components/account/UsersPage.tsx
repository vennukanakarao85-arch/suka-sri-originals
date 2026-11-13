import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  BookOpen,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  LogOut,
  ChevronDown,
  Layers,
  Crown,
  Calendar,
  Lock,
  CreditCard,
  Clock,
  Key,
  Smartphone,
  Laptop,
  Edit3
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
  loginAsOwnerDirect,
  OTP_VALIDITY_SECONDS
} from '../../services/authService';
import { sound } from '../../data/soundEffects';

interface UsersPageProps {
  readerAccount: ReaderAccount;
  onAccountUpdated: (updated: ReaderAccount) => void;
  allChapters: Chapter[];
  onReadChapter: (chapterId: string) => void;
  onOpenPricing: () => void;
  onOpenOwnerCommandCenter?: () => void;
  onOpenStudio?: () => void;
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

export const UsersPage: React.FC<UsersPageProps> = ({
  readerAccount,
  onAccountUpdated,
  allChapters,
  onReadChapter,
  onOpenPricing,
  onOpenOwnerCommandCenter,
  onOpenStudio
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'password' | 'owner'>('phone');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  // Owner Direct Login State
  const [ownerPasscodeInput, setOwnerPasscodeInput] = useState<string>('');
  const [isLoggingInAsOwner, setIsLoggingInAsOwner] = useState<boolean>(false);

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

  // OTP State
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

  const isUserLoggedIn = !!readerAccount.isLoggedIn;
  const isMember = readerAccount.membershipStatus === 'monthly_member';
  const isOwner = isOwnerOrAdmin(readerAccount);

  const unlockedChapters = allChapters.filter(
    (c) =>
      c.chapterNumber === 1 ||
      c.accessType === 'free' ||
      isMember ||
      readerAccount.unlockedChapterIds.includes(c.id)
  );

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
      setErrorMessage(err.message || 'Failed to send verification code.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Master Owner Direct Login (Phone & Laptop)
  const handleOwnerDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPasscodeInput.trim()) {
      setErrorMessage('Please enter your Master Owner Passcode.');
      return;
    }
    sound.playClick();
    setErrorMessage(null);
    setIsLoggingInAsOwner(true);
    try {
      const res = await loginAsOwnerDirect(ownerPasscodeInput);
      if (res.success && res.account) {
        onAccountUpdated(res.account);
        sound.playCelestialChime();
        setSuccessMessage('Welcome Srinivas Vennu! Master Owner privileges activated.');
        setOwnerPasscodeInput('');
        if (onOpenStudio) {
          setTimeout(() => {
            onOpenStudio();
          }, 800);
        }
      } else {
        setErrorMessage(res.message || 'Invalid Master Owner Passcode.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Owner authentication failed.');
    } finally {
      setIsLoggingInAsOwner(false);
    }
  };

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
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsResettingPw(false);
    }
  };

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
        setPasswordSetupSuccess('Password saved! You can now log into this VIP account on any device.');
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

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the code.');
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
          onReadChapter(chapterIdToOpen);
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

  const handleLogout = () => {
    sound.playClick();
    const guest = logoutReaderAccount();
    onAccountUpdated(guest);
    setSuccessMessage('Logged out from this device.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner / Hero */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-void-950 via-void-900 to-void-950 border border-gold-500/30 overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.15)]">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Reader Network • Multi-Device Sync
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-black text-white">
            SUKA SRI Reader Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Sign in with phone OTP, email, or your account password. Access your VIP membership and unlocked chapters across any phone, laptop, or tablet.
          </p>
        </div>

        {/* Decorative corner glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-electric-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main View: Logged In vs Logged Out */}
      {isUserLoggedIn ? (
        <div className="space-y-8">
          {/* Active Profile Card */}
          <div className="p-6 rounded-3xl bg-void-950 border border-gold-500/30 shadow-[0_0_30px_rgba(255,215,0,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 flex items-center justify-center font-display text-2xl sm:text-3xl font-black text-void-950 shadow-[0_0_30px_rgba(255,215,0,0.35)] shrink-0">
                {readerAccount.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                    {readerAccount.name}
                  </h2>
                  {isMember && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-[10px] font-black text-gold-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      VIP MEMBER (₹19/mo)
                    </span>
                  )}
                  {isOwner && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-black text-purple-300 uppercase tracking-widest">
                      OWNER / ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  {readerAccount.phone ? (
                    <>
                      <Phone className="w-3.5 h-3.5 text-electric-400" />
                      <span>{readerAccount.phone}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 text-electric-400" />
                      <span>{readerAccount.email}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Verified Reader ID: <strong className="text-gold-400">{readerAccount.readerId}</strong>
                </p>
                <button
                  onClick={() => {
                    sound.playClick();
                    const startingChapter = allChapters.find((c) => c.chapterNumber === 1) || allChapters[0];
                    onReadChapter(startingChapter?.id || 'sample-ch-1');
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-[11px] font-black uppercase tracking-wider hover:brightness-110 shadow-md cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Start with Chapter 1</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isOwner && onOpenStudio && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenStudio();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:brightness-110 text-void-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Creator Studio &amp; Publish</span>
                </button>
              )}

              {isOwner && onOpenOwnerCommandCenter && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenOwnerCommandCenter();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-purple-300" />
                  <span>Owner Command Center</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-void-900 border border-void-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* MULTI-DEVICE PASSWORD ACCESS CARD */}
          <div className="p-6 rounded-3xl bg-void-950 border border-electric-400/30 shadow-[0_0_30px_rgba(0,229,255,0.08)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                    Multi-Device Password Access
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      {readerAccount.passwordHash ? 'Password Active' : 'Setup Required'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Use your phone number/email and password to log in on any device without losing your VIP membership.
                  </p>
                </div>
              </div>
            </div>

            {passwordSetupSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {passwordSetupSuccess}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder={readerAccount.passwordHash ? 'Change account password (min 4 characters)...' : 'Set account password (min 4 characters)...'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white text-xs outline-none focus:border-electric-400 transition-colors"
              />
              <button
                type="submit"
                disabled={isSavingPassword || !newPassword || newPassword.length < 4}
                className="px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 disabled:opacity-50 text-void-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <KeyRound className="w-4 h-4" />
                <span>Save Password for Multi-Device</span>
              </button>
            </form>
          </div>

          {/* Membership Tier & Unlocked Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-void-950 border border-void-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Subscription Status
              </span>
              <div className="font-display text-xl font-black text-gold-400">
                {isMember ? 'VIP Monthly Pass' : 'Free Reader Tier'}
              </div>
              <p className="text-xs text-slate-400">
                {isMember
                  ? `Valid until ${readerAccount.membershipValidUntil || 'Next month'}`
                  : 'Upgrade to read all released chapters.'}
              </p>
              {!isMember && (
                <button
                  onClick={onOpenPricing}
                  className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get VIP Pass (₹19/mo)</span>
                </button>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-void-950 border border-void-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Unlocked Manga Chapters
              </span>
              <div className="font-display text-2xl font-black text-electric-400">
                {isMember ? 'All Released Chapters' : `${unlockedChapters.length} Chapters`}
              </div>
              <p className="text-xs text-slate-400">
                {isMember
                  ? 'All chapters unlocked for reading & licensed downloads.'
                  : 'Free samples & individually purchased chapters.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-void-950 border border-void-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Fortress Watermark Signature
              </span>
              <div className="font-mono text-xs font-bold text-emerald-400 truncate">
                {readerAccount.watermarkSignature}
              </div>
              <p className="text-xs text-slate-400">
                Cryptographically bound to your reader identity.
              </p>
            </div>
          </div>

          {/* Reader Library (Unlocked Chapters) */}
          <div className="p-6 rounded-3xl bg-void-950 border border-void-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gold-400" />
                  <span>Your Unlocked Manga Library</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isMember ? 'Full saga access unlocked via VIP monthly membership.' : 'Chapters you have unlocked for reading.'}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {unlockedChapters.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unlockedChapters.map((ch) => (
                <div
                  key={ch.id}
                  className="p-4 rounded-2xl bg-void-900 border border-void-800 hover:border-gold-500/40 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] text-gold-400 font-mono font-bold block">
                      Chapter {ch.chapterNumber}
                    </span>
                    <h4 className="font-bold text-white text-xs truncate group-hover:text-gold-300 transition-colors">
                      {ch.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {ch.arcTitle}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onReadChapter(ch.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gold-500/15 border border-gold-500/30 text-gold-300 font-bold text-xs hover:bg-gold-500 hover:text-void-950 transition-all shrink-0 flex items-center gap-1"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (

        /* LOGGED OUT VIEW: SIGN IN / OTP / PASSWORD */
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-void-950 border border-gold-500/40 shadow-[0_0_40px_rgba(255,215,0,0.15)] space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Reader Access &amp; Multi-Device Login
            </h2>
            <p className="text-xs text-slate-400">
              Verify your mobile number, email, or enter your account password to access your VIP subscription.
            </p>
          </div>

          {/* TABS: Mobile OTP vs Email OTP vs Password vs Owner Direct */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-void-900 border border-void-800">
            <button
              onClick={() => {
                sound.playClick();
                setAuthMethod('phone');
                setOtpSent(false);
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'phone'
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAuthMethod('email');
                setOtpSent(false);
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAuthMethod('password');
                setOtpSent(false);
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-gradient-to-r from-electric-500 to-cyan-500 text-void-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAuthMethod('owner');
                setOtpSent(false);
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'owner'
                  ? 'bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-void-950 font-black shadow-md'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>👑 Owner</span>
            </button>
          </div>

          {/* OWNER DIRECT MASTER KEY LOGIN FORM */}
          {authMethod === 'owner' ? (
            <form onSubmit={handleOwnerDirectLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-gold-500/10 to-amber-600/15 border border-gold-500/40 text-xs text-gold-300 space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-white text-sm">
                  <Crown className="w-4 h-4 text-gold-400" />
                  <span>Owner &amp; Author Direct Authentication</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Log in as author <strong className="text-gold-300">Srinivas Vennu</strong> directly on phone or laptop to access Creator Studio, publish chapter updates, and manage the universe.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Author / Payee Profile
                </label>
                <div className="p-3.5 rounded-xl bg-void-900 border border-void-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold font-mono">
                      SV
                    </div>
                    <div>
                      <div className="text-white font-bold">Srinivas Vennu / Kanaka Rao</div>
                      <div className="text-[11px] text-slate-400 font-mono">+91 9502714652 • srinivas@sukasri.universe</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 font-bold uppercase font-mono">
                    SSO-READER-000
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Master Owner Passcode <span className="text-gold-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter master passcode (e.g. 9502714652 or SUKASRI2026)..."
                  value={ownerPasscodeInput}
                  onChange={(e) => setOwnerPasscodeInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-gold-400 transition-colors tracking-wider font-mono text-center"
                  autoFocus
                  required
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-slate-400">
                  <span>Quick Fill:</span>
                  <button
                    type="button"
                    onClick={() => setOwnerPasscodeInput('9502714652')}
                    className="px-2 py-0.5 rounded bg-void-800 hover:bg-gold-500/20 text-gold-400 font-mono cursor-pointer transition-colors"
                  >
                    9502714652
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnerPasscodeInput('SUKASRI2026')}
                    className="px-2 py-0.5 rounded bg-void-800 hover:bg-gold-500/20 text-gold-400 font-mono cursor-pointer transition-colors"
                  >
                    SUKASRI2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnerPasscodeInput('8842')}
                    className="px-2 py-0.5 rounded bg-void-800 hover:bg-gold-500/20 text-gold-400 font-mono cursor-pointer transition-colors"
                  >
                    8842
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingInAsOwner || !ownerPasscodeInput.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-gold-500 hover:brightness-110 text-void-950 font-display font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingInAsOwner ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Verifying Master Privileges...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Unlock Creator Studio &amp; Admin (Phone &amp; Laptop)</span>
                  </>
                )}
              </button>
            </form>
          ) : authMethod === 'password' ? (
            isForgotPasswordMode ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-void-900 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Reset Account Password</h4>
                      <p className="text-[10px] text-slate-400">Recover your VIP account via secure 65s OTP verification</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsForgotPasswordMode(false);
                      setOtpSent(false);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>

                {!otpSent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Your Registered Phone or Email <span className="text-gold-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        {!forgotTarget.includes('@') && (
                          <div className="relative w-36 shrink-0">
                            <select
                              value={forgotCountryCode}
                              onChange={(e) => setForgotCountryCode(e.target.value)}
                              className="w-full appearance-none px-3 py-3 rounded-xl bg-void-900 border border-void-800 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                            >
                              {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code} className="bg-void-950 text-white">
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Phone (e.g. 9502714652) or Email"
                          value={forgotTarget}
                          onChange={(e) => setForgotTarget(e.target.value)}
                          className="flex-1 px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-purple-400 transition-colors"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        A secure 6-digit verification code will be dispatched, valid strictly for 65 seconds.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSending || !forgotTarget.trim()}
                      onClick={handleSendForgotOtp}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-void-900 to-purple-950/60 border border-purple-400/40 shadow-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-300 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4" />
                            <span>Reset OTP Gateway Notification:</span>
                          </span>
                          <span className={`text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                            otpSecondsLeft === 0
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{otpSecondsLeft}s left (65s OTP)</span>
                          </span>
                        </div>
                        <div className="font-mono text-xl font-black text-gold-400">
                          {previewOtp}
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoFillOtp}
                          className="text-[11px] font-bold text-electric-300 underline cursor-pointer"
                        >
                          ⚡ 1-Tap Auto-Fill this OTP
                        </button>
                      </div>
                    )}

                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-300">Enter the 6-digit code sent to:</p>
                      <p className="text-sm font-mono font-bold text-gold-400">{forgotTarget}</p>
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
                          className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-void-900 border border-void-800 text-center text-2xl font-mono font-black text-white focus:border-purple-400 outline-none"
                        />
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Create New Password <span className="text-gold-400">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password (min 4 characters)..."
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white text-xs outline-none focus:border-purple-400"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isResettingPw || otpDigits.join('').length !== 6 || !forgotNewPassword || forgotNewPassword.length < 4}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
                  <span>Log in across any phone, laptop, or tablet with the password you configured.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Phone Number, Email, or Reader ID <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9502714652 or reader@sukasri.universe"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-electric-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Account Password <span className="text-gold-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsForgotPasswordMode(true);
                        setOtpSent(false);
                        setErrorMessage(null);
                        setForgotTarget(loginIdentifier);
                      }}
                      className="text-xs text-electric-400 hover:text-white underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your account password..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-electric-400 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingInWithPw || !loginIdentifier || !loginPassword}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-500 to-cyan-500 hover:brightness-110 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingInWithPw ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials Across Devices...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Log In with Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsForgotPasswordMode(true);
                      setOtpSent(false);
                      setErrorMessage(null);
                      setForgotTarget(loginIdentifier);
                    }}
                    className="text-xs text-slate-400 hover:text-electric-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    <span>Forgot your password? <strong>Reset with 65s OTP</strong></span>
                  </button>
                </div>
              </form>
            )
          ) : (

            /* OTP FORM */
            !otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Name / Reader Handle <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shin Takamori"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-gold-500/60 transition-colors"
                  />
                </div>

                {authMethod === 'phone' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Phone Number <span className="text-gold-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-36 shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full appearance-none px-3 py-3 rounded-xl bg-void-900 border border-void-800 text-white text-xs font-mono focus:outline-none focus:border-gold-500/60 transition-colors pr-7"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-void-950 text-white">
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <input
                        type="tel"
                        placeholder="95027 14652"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-gold-500/60 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address <span className="text-gold-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="reader@sukasri.universe"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-void-900 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-gold-500/60 transition-colors"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={isSending || (authMethod === 'phone' ? !phoneNumber.trim() : !emailAddress.trim())}
                  onClick={handleSendOtp}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:brightness-110 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Sending Code (65s OTP)...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code (OTP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              
              /* OTP VERIFICATION STEP */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {previewOtp && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-void-900 to-electric-950/60 border border-electric-400/40 shadow-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-electric-400 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4" />
                        <span>Simulated Gateway Notification</span>
                      </span>
                      <span className={`text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                        otpSecondsLeft === 0
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : otpSecondsLeft <= 20
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{otpSecondsLeft === 0 ? 'EXPIRED (00:00)' : `Valid for ${Math.floor(otpSecondsLeft / 60)}:${(otpSecondsLeft % 60).toString().padStart(2, '0')} (65s)`}</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-200">
                      Your verification code is:{' '}
                      <strong className="text-gold-400 font-mono text-lg tracking-widest bg-void-950 px-2.5 py-0.5 rounded border border-gold-500/40">
                        {previewOtp}
                      </strong>
                    </div>
                    {otpSecondsLeft === 0 ? (
                      <div className="text-xs text-red-400 font-semibold bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-lg">
                        ⚠️ This OTP has expired (65 seconds limit). Click "Resend Code" below to receive a new code.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="text-[11px] font-bold text-electric-300 hover:text-white underline cursor-pointer"
                      >
                        ⚡ Click to 1-Tap Auto-Fill this OTP
                      </button>
                    )}
                  </div>
                )}

                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-300">Enter the 6-digit code sent to:</p>
                  <p className="text-sm font-mono font-bold text-gold-400">
                    {authMethod === 'phone' ? `${countryCode} ${phoneNumber}` : emailAddress}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    (OTP is strictly valid for 65 seconds only)
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
                      className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-void-900 border text-center text-2xl font-mono font-black transition-all ${
                        otpSecondsLeft === 0
                          ? 'border-red-900/50 text-slate-600 cursor-not-allowed opacity-60'
                          : 'border-void-800 focus:border-gold-500 text-white focus:outline-none focus:shadow-[0_0_20px_rgba(255,215,0,0.35)]'
                      }`}
                    />
                  ))}
                </div>

                {/* Resend and Change Number */}
                <div className="flex items-center justify-between text-xs text-slate-400">
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
                    <span className="text-xs font-mono text-slate-500">
                      Resend in {resendCooldown}s
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

                {/* Submit Verification Button */}
                <button
                  type="button"
                  disabled={isVerifying || otpDigits.join('').length !== 6 || otpSecondsLeft === 0}
                  onClick={handleVerifyOtp}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-500 via-cyan-500 to-teal-500 hover:brightness-110 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Code &amp; Start Reading</span>
                    </>
                  )}
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
