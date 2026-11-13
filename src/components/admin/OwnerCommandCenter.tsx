import React, { useState, useEffect } from 'react';
import { ReaderAccount, PaymentTransaction, PricingConfig } from '../../types';
import {
  getAllRegisteredUsers,
  getAllTransactions,
  isOwnerOrAdmin,
  verifyOwnerPasscode,
  setOwnerSession,
  setPasswordForAccount,
  saveRegisteredUsers
} from '../../services/authService';
import {
  getPricingConfig,
  updatePricingConfig,
  exchangePrices,
  resetPricingToDefaults,
  subscribeToPricing
} from '../../services/pricingService';
import { sound } from '../../data/soundEffects';
import {
  ShieldCheck,
  Users,
  CreditCard,
  DollarSign,
  ArrowLeftRight,
  Lock,
  Unlock,
  Download,
  Search,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  Key,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BookOpen,
  Calendar,
  Smartphone
} from 'lucide-react';

interface OwnerCommandCenterProps {
  onNavigateToStudio?: () => void;
  onNavigateToUniverse?: () => void;
  currentAccount?: ReaderAccount;
}

export const OwnerCommandCenter: React.FC<OwnerCommandCenterProps> = ({
  onNavigateToStudio,
  onNavigateToUniverse,
  currentAccount
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isOwnerOrAdmin(currentAccount));
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Live Data Repositories
  const [users, setUsers] = useState<ReaderAccount[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [pricing, setPricing] = useState<PricingConfig>(getPricingConfig());

  // Search & Filter
  const [userSearch, setUserSearch] = useState<string>('');
  const [txFilter, setTxFilter] = useState<'all' | 'monthly_membership' | 'chapter_purchase'>('all');
  const [pricingStatus, setPricingStatus] = useState<string | null>(null);

  // Manual pricing edit inputs
  const [chapterPriceInput, setChapterPriceInput] = useState<number>(pricing.singleChapterPriceInr);
  const [memberPriceInput, setMemberPriceInput] = useState<number>(pricing.monthlyMembershipPriceInr);

  // Quick Password modal for selected user
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<ReaderAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);

  // Refresh live data
  const loadData = () => {
    setUsers(getAllRegisteredUsers());
    setTransactions(getAllTransactions());
    const currentPrices = getPricingConfig();
    setPricing(currentPrices);
    setChapterPriceInput(currentPrices.singleChapterPriceInr);
    setMemberPriceInput(currentPrices.monthlyMembershipPriceInr);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const unsub = subscribeToPricing(cfg => {
      setPricing(cfg);
      setChapterPriceInput(cfg.singleChapterPriceInr);
      setMemberPriceInput(cfg.monthlyMembershipPriceInr);
    });
    return unsub;
  }, []);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (verifyOwnerPasscode(passcodeInput)) {
      setIsAuthenticated(true);
      setPasscodeError(null);
      sound.playCelestialChime();
      loadData();
    } else {
      setPasscodeError('Invalid Owner Passcode. Enter 9502714652 or 8842.');
    }
  };

  const handleLockDashboard = () => {
    sound.playClick();
    setOwnerSession(false);
    setIsAuthenticated(false);
    setPasscodeInput('');
  };

  const handleExchangePrices = () => {
    sound.playClick();
    const updated = exchangePrices();
    setPricingStatus(`Swapped! Single Chapter is now ₹${updated.singleChapterPriceInr}, VIP Monthly is ₹${updated.monthlyMembershipPriceInr}`);
    setTimeout(() => setPricingStatus(null), 4000);
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (chapterPriceInput <= 0 || memberPriceInput <= 0) {
      setPricingStatus('Prices must be greater than zero.');
      return;
    }
    const updated = updatePricingConfig({
      singleChapterPriceInr: Number(chapterPriceInput),
      monthlyMembershipPriceInr: Number(memberPriceInput),
      singleChapterPriceUsd: Number((chapterPriceInput / 50).toFixed(2)),
      monthlyMembershipPriceUsd: Number((memberPriceInput / 40).toFixed(2))
    });
    setPricingStatus(`Pricing updated! Chapter: ₹${updated.singleChapterPriceInr}, VIP Monthly: ₹${updated.monthlyMembershipPriceInr}`);
    setTimeout(() => setPricingStatus(null), 4000);
  };

  const handleResetDefaults = () => {
    sound.playClick();
    const defaults = resetPricingToDefaults();
    setPricingStatus(`Reset to defaults: Chapter ₹${defaults.singleChapterPriceInr}, VIP Monthly ₹${defaults.monthlyMembershipPriceInr}`);
    setTimeout(() => setPricingStatus(null), 4000);
  };

  const handleSetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPasswordInput) return;
    sound.playClick();
    await setPasswordForAccount(selectedUserForPassword.readerId, newPasswordInput);
    setPasswordSuccessMsg(`Password successfully updated for ${selectedUserForPassword.name}!`);
    setTimeout(() => {
      setPasswordSuccessMsg(null);
      setSelectedUserForPassword(null);
      setNewPasswordInput('');
      loadData();
    }, 1500);
  };

  const handleToggleVipForUser = (user: ReaderAccount) => {
    sound.playClick();
    const isVip = user.membershipStatus === 'monthly_member';
    const allUsers = getAllRegisteredUsers();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const updated = allUsers.map(u => {
      if (u.readerId === user.readerId) {
        return {
          ...u,
          membershipStatus: (isVip ? 'free' : 'monthly_member') as 'free' | 'monthly_member',
          membershipValidUntil: isVip ? undefined : expiry.toISOString().split('T')[0]
        };
      }
      return u;
    });

    saveRegisteredUsers(updated);
    setUsers(updated);
  };

  const handleExportCsv = () => {
    sound.playClick();
    const headers = ['Transaction ID', 'Reader ID', 'Type', 'Amount (INR)', 'Currency', 'Method', 'UPI UTR Ref', 'Timestamp', 'Status', 'HMAC Receipt'];
    const rows = transactions.map(t => [
      t.id,
      t.readerId,
      t.type,
      t.amount,
      t.currency,
      t.method,
      t.upiRefNumber || 'N/A',
      t.timestamp,
      t.status,
      t.hmacSignature
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SUKASRI_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const totalGrossRevenueInr = transactions
    .filter(t => t.currency === 'INR' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVipSubscribers = users.filter(u => u.membershipStatus === 'monthly_member').length;
  const totalChapterPurchases = transactions.filter(t => t.type === 'chapter_purchase').length;

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      u.readerId.toLowerCase().includes(q)
    );
  });

  const filteredTransactions = transactions.filter(t => {
    if (txFilter === 'all') return true;
    return t.type === txFilter;
  });

  // ---------------------------------------------------------------------------
  // AUTHENTICATION GUARD MODAL
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-void-900 border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.2)] text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-xs font-bold uppercase tracking-wider">
              Owner Security Fortress
            </span>
            <h2 className="font-display text-2xl font-black text-white mt-3">
              Owner Command Center
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Strictly restricted to <strong>Srinivas Vennu</strong> &amp; <strong>Kanaka Rao Vennu</strong>. Please enter the master passcode to inspect live transactions and user logins.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcodeInput}
                onChange={e => setPasscodeInput(e.target.value)}
                placeholder="Enter Master Passcode (e.g. 9502714652)"
                className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 focus:border-gold-400 text-white placeholder-slate-500 text-center font-mono tracking-widest text-lg outline-none transition-all"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-rose-400 font-medium mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {passcodeError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-void-950 font-bold text-sm tracking-wide shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              Unlock Owner Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-void-800 text-xs text-slate-500">
            Official Owner UPI ID: <code className="text-gold-400">9502714652@axl</code>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN DASHBOARD (ONE UNIFIED PAGE FOR OWNER)
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-void-950 via-void-900 to-void-950 border border-gold-500/40 shadow-[0_0_40px_rgba(255,215,0,0.15)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner &amp; Admin Command Center
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Payee: KANAKA RAO VENNU (9502714652@axl)
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
            SUKA SRI ORIGINALS — Unified Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-device user registry, payments ledger, and dynamic pricing control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToStudio && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToStudio();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Layers className="w-4 h-4" />
              Creator Studio
            </button>
          )}

          {onNavigateToUniverse && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToUniverse();
              }}
              className="px-4 py-2 rounded-xl bg-void-800 hover:bg-void-700 border border-void-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Reader Portal
            </button>
          )}

          <button
            onClick={handleLockDashboard}
            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Lock className="w-4 h-4" />
            Lock Admin
          </button>
        </div>
      </div>

      {/* METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-void-950 border border-gold-500/30 shadow-[0_0_20px_rgba(255,215,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Gross Revenue (UPI/INR)
            </span>
            <div className="font-display text-2xl sm:text-3xl font-black text-gold-400">
              ₹{totalGrossRevenueInr}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> All verified transactions
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* VIP Monthly Subscribers */}
        <div className="p-5 rounded-2xl bg-void-950 border border-electric-400/30 shadow-[0_0_20px_rgba(0,229,255,0.08)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active VIP Members
            </span>
            <div className="font-display text-2xl sm:text-3xl font-black text-electric-300">
              {totalVipSubscribers}
            </div>
            <span className="text-[10px] text-electric-400 font-medium flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> Multi-device authorized
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Single Chapter Purchases */}
        <div className="p-5 rounded-2xl bg-void-950 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.08)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Chapter Purchases
            </span>
            <div className="font-display text-2xl sm:text-3xl font-black text-purple-300">
              {totalChapterPurchases}
            </div>
            <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1 mt-1">
              <BookOpen className="w-3 h-3" /> Single chapter unlocks
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Total Registered Users */}
        <div className="p-5 rounded-2xl bg-void-950 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Registered Accounts
            </span>
            <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400">
              {users.length}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <Users className="w-3 h-3" /> Phone, Email &amp; Password
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* PRICING CONTROL PANEL (EDIT & 1-TAP EXCHANGE) */}
      <div className="p-6 rounded-3xl bg-void-950 border border-gold-500/40 shadow-[0_0_30px_rgba(255,215,0,0.1)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-void-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
              <h2 className="font-display text-lg font-bold text-white">
                Live Pricing Controls &amp; Exchange Feature
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Change the 2 prices or exchange them with 1 tap. Updates instantly reflect across all checkout modals &amp; QR codes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExchangePrices}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-900/30"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Exchange 2 Prices (₹{pricing.singleChapterPriceInr} ⇄ ₹{pricing.monthlyMembershipPriceInr})
            </button>
            <button
              onClick={handleResetDefaults}
              className="p-2 rounded-xl bg-void-900 border border-void-800 hover:border-gold-500/40 text-slate-400 hover:text-white transition-all text-xs"
              title="Reset to Default (₹49 Single / ₹19 VIP)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {pricingStatus && (
          <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/40 text-gold-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" /> {pricingStatus}
          </div>
        )}

        {/* Price Adjustment Form */}
        <form onSubmit={handleSavePrices} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Single Chapter Price */}
          <div className="p-4 rounded-2xl bg-void-900 border border-void-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Single Chapter Price:</span>
              <span className="text-[10px] font-mono text-gold-400 font-bold">1 Chapter Only</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gold-400">₹</span>
              <input
                type="number"
                min="1"
                value={chapterPriceInput}
                onChange={e => setChapterPriceInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-void-950 border border-void-800 text-white font-mono font-bold text-lg focus:border-gold-400 outline-none"
              />
            </div>
            <div className="text-[10px] text-slate-400">
              USD Equivalent: ~${(chapterPriceInput / 50).toFixed(2)} USD
            </div>
          </div>

          {/* Monthly VIP Membership Price */}
          <div className="p-4 rounded-2xl bg-void-900 border border-void-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Monthly VIP Membership:</span>
              <span className="text-[10px] font-mono text-electric-400 font-bold">All Released Chapters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-electric-400">₹</span>
              <input
                type="number"
                min="1"
                value={memberPriceInput}
                onChange={e => setMemberPriceInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-void-950 border border-void-800 text-white font-mono font-bold text-lg focus:border-electric-400 outline-none"
              />
            </div>
            <div className="text-[10px] text-slate-400">
              USD Equivalent: ~${(memberPriceInput / 40).toFixed(2)} USD / month
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-void-950 font-bold text-sm shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply New Prices
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 1: REGISTERED USERS & LOGINS TABLE */}
      <div className="p-6 rounded-3xl bg-void-950 border border-void-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-400" />
              User Logins &amp; Multi-Device Accounts ({users.length})
            </h2>
            <p className="text-xs text-slate-400">
              Readers with verified Phone, Email, or Password access. VIP accounts sync across all devices.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search user, phone, email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-void-900 border border-void-800 focus:border-gold-500/50 text-white text-xs placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-2xl border border-void-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-void-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-void-800">
              <tr>
                <th className="py-3 px-4">Reader ID</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Phone / Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Membership</th>
                <th className="py-3 px-4">Multi-Device PW</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-void-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No registered accounts matching "{userSearch}".
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isVip = user.membershipStatus === 'monthly_member';
                  const isOwner = user.role === 'owner' || user.phone?.includes('9502714652');
                  const hasPw = Boolean(user.passwordHash);

                  return (
                    <tr key={user.readerId} className="hover:bg-void-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gold-400">
                        {user.readerId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {user.phone ? (
                          <div className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span>{user.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 font-mono font-bold text-[10px] uppercase">
                            Owner
                          </span>
                        ) : user.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px] uppercase">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-void-800 text-slate-400 font-mono text-[10px]">
                            Reader
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isVip ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-300 font-bold text-[11px] flex items-center gap-1 w-max border border-electric-500/40">
                            <Sparkles className="w-3 h-3 text-electric-400" />
                            VIP Member
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-void-800 text-slate-400 text-[11px] w-max block">
                            Free Tier
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {hasPw ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium text-[10px] flex items-center gap-1 w-max border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Configured
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium text-[10px] w-max block">
                            OTP Only
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            sound.playClick();
                            setSelectedUserForPassword(user);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-void-850 hover:bg-void-800 border border-void-700 text-slate-300 text-[11px] font-medium transition-colors"
                          title="Set Password for Multi-Device Login"
                        >
                          <Key className="w-3 h-3 inline mr-1" />
                          Set PW
                        </button>
                        <button
                          onClick={() => handleToggleVipForUser(user)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                            isVip
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                              : 'bg-electric-500/10 border-electric-500/30 text-electric-300 hover:bg-electric-500/20'
                          }`}
                        >
                          {isVip ? 'Revoke VIP' : 'Grant VIP'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: GLOBAL TRANSACTIONS LEDGER */}
      <div className="p-6 rounded-3xl bg-void-950 border border-void-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-400" />
              Live Transactions Ledger ({transactions.length})
            </h2>
            <p className="text-xs text-slate-400">
              Verified UPI payments, 12-digit UTR numbers, amounts, and HMAC cryptographic receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-void-900 p-1 rounded-xl border border-void-800 text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  setTxFilter('all');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  txFilter === 'all' ? 'bg-gold-500 text-void-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setTxFilter('monthly_membership');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  txFilter === 'monthly_membership' ? 'bg-electric-400 text-void-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                VIP (₹{pricing.monthlyMembershipPriceInr})
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setTxFilter('chapter_purchase');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  txFilter === 'chapter_purchase' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chapters (₹{pricing.singleChapterPriceInr})
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-xl bg-void-900 border border-void-800 hover:border-gold-500/40 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-gold-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-2xl border border-void-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-void-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-void-800">
              <tr>
                <th className="py-3 px-4">TXN ID</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">UPI UTR Ref</th>
                <th className="py-3 px-4">Reader ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">HMAC Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-void-800/60 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions found in this filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isMem = tx.type === 'monthly_membership';

                  return (
                    <tr key={tx.id} className="hover:bg-void-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        {tx.id}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(tx.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        {isMem ? (
                          <span className="px-2 py-0.5 rounded bg-electric-500/15 border border-electric-500/30 text-electric-300 font-bold text-[10px] uppercase">
                            VIP Monthly
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[10px] uppercase">
                            Single Chapter
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-display font-bold text-white text-sm">
                        {tx.currency === 'INR' ? `₹${tx.amount}` : `$${tx.amount}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gold-400">
                        {tx.upiRefNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {tx.readerId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1 w-max">
                          <Check className="w-2.5 h-2.5" />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[140px]" title={tx.hmacSignature}>
                        {tx.hmacSignature.slice(0, 16)}...
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK PASSWORD MODAL */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-void-900 border border-gold-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-void-800 pb-3">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-gold-400" />
                Set Password for Multi-Device Sync
              </h3>
              <button
                onClick={() => setSelectedUserForPassword(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              User: <strong>{selectedUserForPassword.name}</strong> ({selectedUserForPassword.readerId})
              <br />
              Setting a password lets this user log in from any phone, laptop, or tablet without losing their VIP membership.
            </p>

            {passwordSuccessMsg ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                {passwordSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSetUserPassword} className="space-y-3">
                <input
                  type="password"
                  placeholder="Enter new password (min 4 characters)"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-void-950 border border-void-800 text-white text-xs outline-none focus:border-gold-400"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newPasswordInput || newPasswordInput.length < 4}
                  className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-void-950 font-bold text-xs transition-all"
                >
                  Save &amp; Enable Multi-Device Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
