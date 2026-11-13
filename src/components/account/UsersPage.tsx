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
  Clock
} from 'lucide-react';
import { ReaderAccount, Chapter } from '../../types';
import { sendPhoneOtp, sendEmailOtp, verifyOtpAndLogin, logoutReaderAccount, OTP_VALIDITY_SECONDS } from '../../services/authService';
import { sound } from '../../data/soundEffects';

interface UsersPageProps {
  readerAccount: ReaderAccount;
  onAccountUpdated: (updated: ReaderAccount) => void;
  allChapters: Chapter[];
  onReadChapter: (chapterId: string) => void;
  onOpenPricing: () => void;
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
  onOpenPricing
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

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
      } else {
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
      const digits = previewOtp.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    sound.playClick();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    const target = authMethod === 'phone' ? `${countryCode} ${phoneNumber}` : emailAddress;

    try {
      const res = await verifyOtpAndLogin(target, code, authMethod, displayName);
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
    setSuccessMessage('You have logged out.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SUKA SRI ORIGINALS Reader Identity</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-wide uppercase">
          {isUserLoggedIn ? 'Reader Dashboard' : 'Users & Reader Portal'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {isUserLoggedIn
            ? 'Manage your subscriptions, unlocked canonical chapters, and personalized reader security credentials.'
            : 'Sign in with your Email or Mobile Phone Number via secure OTP to access your personal manga vault.'}
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      {!isUserLoggedIn ? (
        
        /* LOGIN / SIGN IN FORM */
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-void-900 border border-gold-500/30 shadow-[0_0_60px_rgba(255,215,0,0.15)] space-y-6">
          
          {/* Method Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-void-950 border border-void-800">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAuthMethod('phone');
                setOtpSent(false);
                setErrorMessage(null);
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                authMethod === 'phone'
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Mobile Phone OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAuthMethod('email');
                setOtpSent(false);
                setErrorMessage(null);
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                authMethod === 'email'
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email Address OTP</span>
            </button>
          </div>

          {!otpSent ? (
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
                  className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-gold-500/60 transition-colors"
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
                        className="w-full appearance-none px-3 py-3 rounded-xl bg-void-950 border border-void-800 text-white text-xs font-mono focus:outline-none focus:border-gold-500/60 transition-colors pr-7"
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
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-gold-500/60 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    A secure 6-digit one-time password will be dispatched to your phone number.
                  </p>
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
                    className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-gold-500/60 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    We will send a 6-digit verification code to this email address.
                  </p>
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
                    <span>Sending Code...</span>
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
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-void-950 border text-center text-2xl font-mono font-black transition-all ${
                      otpSecondsLeft === 0
                        ? 'border-red-900/50 text-slate-600 cursor-not-allowed opacity-60'
                        : 'border-void-800 focus:border-gold-500 text-white focus:outline-none focus:shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                    }`}
                  />
                ))}
              </div>

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

              <button
                type="button"
                disabled={isVerifying || otpDigits.join('').length !== 6 || otpSecondsLeft === 0}
                onClick={handleVerifyOtp}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-500 via-cyan-500 to-teal-500 hover:brightness-110 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter SUKA SRI</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-void-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected by SUKA SRI Zero-Trust Cryptographic Engine</span>
          </div>
        </div>

      ) : (

        /* LOGGED IN DASHBOARD */
        <div className="space-y-8">
          
          {/* Top User Profile Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-void-950 via-void-900 to-void-950 border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_0_40px_rgba(255,215,0,0.1)]">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 flex items-center justify-center font-display text-3xl font-black text-void-950 shadow-[0_0_30px_rgba(255,215,0,0.35)] shrink-0">
                {readerAccount.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-2xl font-black text-white">
                    {readerAccount.name}
                  </h2>
                  {isMember ? (
                    <span className="px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/50 text-gold-400 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3 h-3 text-gold-400" />
                      VIP PASS
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-void-950 border border-void-800 text-slate-400 text-[10px] uppercase font-bold">
                      Standard Reader
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                  {readerAccount.phone && (
                    <span className="flex items-center gap-1 text-slate-300 font-mono">
                      <Phone className="w-3.5 h-3.5 text-electric-400" />
                      {readerAccount.phone}
                    </span>
                  )}
                  {readerAccount.email && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-electric-400" />
                      {readerAccount.email}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Verified Reader ID: <strong className="text-gold-400">{readerAccount.readerId}</strong>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      const startingChapter = allChapters.find((c) => c.chapterNumber === 1) || allChapters[0];
                      onReadChapter(startingChapter?.id || 'sample-ch-1');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-[10px] font-black uppercase tracking-wider hover:brightness-110 shadow-sm cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Start with Chapter 1</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isMember && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenPricing();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get VIP Pass (₹19/mo)</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-void-900 border border-void-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-void-900 border border-void-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Access Privileges</span>
              <div className="font-display text-xl font-black text-gold-400">
                {isMember ? 'All 450 Chapters' : `${unlockedChapters.length} Chapters`}
              </div>
              <p className="text-[11px] text-slate-500">
                {isMember ? 'VIP pass grants full 3-part access' : 'Individual chapter licenses'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-void-900 border border-void-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payment Security</span>
              <div className="font-display text-xl font-black text-electric-400 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>HMAC Verified</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Transactions signed with SHA-256
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-void-900 border border-void-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saga Progress</span>
              <div className="font-display text-xl font-black text-violet-400">
                28 Canonical Arcs
              </div>
              <p className="text-[11px] text-slate-500">
                Part 1 • Part 2 • Part 3 Complete
              </p>
            </div>
          </div>

          {/* Unlocked Reading Library */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-void-800 pb-3">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gold-400" />
                <span>Your Unlocked Manga Reading Vault</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {unlockedChapters.length} Chapters Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedChapters.slice(0, 9).map((ch) => (
                <div
                  key={ch.id}
                  className="p-4 rounded-2xl bg-void-900 border border-void-800 hover:border-gold-500/40 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Chapter {String(ch.chapterNumber).padStart(3, '0')}</span>
                      <span className="text-emerald-400 font-bold">UNLOCKED</span>
                    </div>
                    <h4 className="font-display text-sm font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-1">
                      {ch.title}
                    </h4>
                    <p className="text-xs text-slate-400">{ch.arcTitle}</p>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onReadChapter(ch.id);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-void-950 font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Chapter</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
