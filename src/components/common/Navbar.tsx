import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  Film,
  Compass,
  Edit3,
  Volume2,
  VolumeX,
  Menu,
  X,
  Play,
  User,
  Feather,
  ShieldCheck,
  Eye,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Sliders,
  Layers,
  Key,
  Lock,
  Unlock,
  Users,
  Crown
} from 'lucide-react';
import { sound } from '../../data/soundEffects';
import { Logo3D } from './Logo3D';
import { ReaderAccount } from '../../types';
import {
  isOwnerOrAdmin,
  verifyOwnerPasscode,
  setOwnerSession,
  loginAsOwnerDirect,
  logoutReaderAccount
} from '../../services/authService';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  officialLogoUrl: string | null;
  onReplayIntro: () => void;
  viewMode?: 'reader' | 'creator';
  onToggleViewMode?: () => void;
  onOpenAccount: () => void;
  onOpenPricing: () => void;
  onOpenAboutAuthor: () => void;
  onOpenFortressSecurity: () => void;
  readerAccount?: ReaderAccount;
  onAccountUpdated?: (updated: ReaderAccount) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  officialLogoUrl,
  onReplayIntro,
  viewMode = 'reader',
  onToggleViewMode,
  onOpenAccount,
  onOpenPricing,
  onOpenAboutAuthor,
  onOpenFortressSecurity,
  readerAccount,
  onAccountUpdated,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(sound.getMuted());
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simplified Menu Option Dropdowns (Universe & Worlds, Manga & Characters)
  const [universeDropdownOpen, setUniverseDropdownOpen] = useState(false);
  const [mangaDropdownOpen, setMangaDropdownOpen] = useState(false);
  const universeDropdownRef = useRef<HTMLDivElement>(null);
  const mangaDropdownRef = useRef<HTMLDivElement>(null);

  // Rotating Quotation Animation for Account User ID and Name
  const [accountFlipMode, setAccountFlipMode] = useState<'name' | 'id'>('name');

  useEffect(() => {
    const timer = setInterval(() => {
      setAccountFlipMode((prev) => (prev === 'name' ? 'id' : 'name'));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (universeDropdownRef.current && !universeDropdownRef.current.contains(event.target as Node)) {
        setUniverseDropdownOpen(false);
      }
      if (mangaDropdownRef.current && !mangaDropdownRef.current.contains(event.target as Node)) {
        setMangaDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreDropdownOpen(false);
        setMobileMenuOpen(false);
        setUniverseDropdownOpen(false);
        setMangaDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    sound.setMuted(next);
    sound.playClick();
  };

  const toggleAmbient = () => {
    const active = sound.toggleAmbientMusic();
    setIsAmbientOn(active);
    sound.playClick();
  };

  // Owner Authentication State & Passcode Modal
  const [ownerPasscodeModalOpen, setOwnerPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const isOwner = isOwnerOrAdmin(readerAccount);

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    highlight?: boolean;
  }

  // Concise center navigation tabs: Normal readers only see Universe, Manga, Characters, Worlds, Users
  const publicNavItems: NavItem[] = [
    { id: 'home', label: 'Universe', icon: Sparkles },
    { id: 'manga', label: 'Manga', icon: BookOpen },
    { id: 'characters', label: 'Characters', icon: Sparkles },
    { id: 'lore', label: 'Worlds', icon: Compass },
    { id: 'users', label: 'Users', icon: User },
  ];

  // Studio and Owner Command Center are strictly accessible only to Owner/Admin
  const navItems: NavItem[] = isOwner
    ? [
        ...publicNavItems,
        { id: 'studio', label: 'Studio', icon: Edit3, highlight: true },
        { id: 'owner', label: 'Admin', icon: Layers, highlight: true },
      ]
    : publicNavItems;

  const handleNavClick = (id: string) => {
    sound.playClick();
    onSelectTab(id);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  const handleUnlockOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const res = await loginAsOwnerDirect(passcodeInput);
    if (res.success && res.account) {
      if (onAccountUpdated) {
        onAccountUpdated(res.account);
      }
      setOwnerPasscodeModalOpen(false);
      setPasscodeInput('');
      setPasscodeError(null);
      sound.playCelestialChime();
      onSelectTab('studio');
    } else {
      setPasscodeError(res.message || 'Invalid Owner Passcode. Enter 9502714652 or SUKASRI2026.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-void-950/90 border-b border-void-800/80 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none shrink-0"
        >
          <Logo3D size="sm" />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-display font-black text-base sm:text-xl tracking-wider text-slate-100 group-hover:text-gold-400 transition-colors">
                SUKA SRI
              </span>
              <span className="font-display text-[10px] sm:text-xs font-bold tracking-widest text-electric-400">
                ORIGINALS
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-gold-400/90 uppercase whitespace-nowrap">
              Multiverse • Manga • Anime
            </span>
          </div>
        </div>

        {/* Desktop Center Navigation - Simplified Menu Bar */}
        <nav className="hidden lg:flex items-center bg-void-900/80 border border-void-800/90 rounded-full p-1 shadow-inner backdrop-blur-md">
          
          {/* 1. UNIVERSE (with Worlds in Option Dropdown) */}
          <div
            className="relative"
            ref={universeDropdownRef}
            onMouseEnter={() => setUniverseDropdownOpen(true)}
            onMouseLeave={() => setUniverseDropdownOpen(false)}
          >
            <div className="flex items-center">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'home' || activeTab === 'lore'
                    ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-void-800/60'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'home' || activeTab === 'lore' ? 'text-gold-400' : ''}`} />
                <span>Universe</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${universeDropdownOpen ? 'rotate-180 text-gold-400' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Universe & Worlds Option Menu */}
            {universeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-void-950/95 border border-void-700/80 p-2 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => {
                    handleNavClick('home');
                    setUniverseDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold'
                      : 'text-slate-300 hover:bg-void-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>Cosmic Universe</span>
                  </div>
                  {activeTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                </button>

                <button
                  onClick={() => {
                    handleNavClick('lore');
                    setUniverseDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                    activeTab === 'lore'
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold'
                      : 'text-slate-300 hover:bg-void-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Galactic Worlds</span>
                  </div>
                  {activeTab === 'lore' && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                </button>
              </div>
            )}
          </div>

          {/* 2. MANGA (with Characters in One Bar Option) */}
          <div
            className="relative"
            ref={mangaDropdownRef}
            onMouseEnter={() => setMangaDropdownOpen(true)}
            onMouseLeave={() => setMangaDropdownOpen(false)}
          >
            <div className="flex items-center">
              <button
                onClick={() => handleNavClick('manga')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'manga' || activeTab === 'characters'
                    ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-void-800/60'
                }`}
              >
                <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'manga' || activeTab === 'characters' ? 'text-gold-400' : ''}`} />
                <span>Manga</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${mangaDropdownOpen ? 'rotate-180 text-gold-400' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Manga & Characters Option Menu */}
            {mangaDropdownOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-void-950/95 border border-void-700/80 p-2 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => {
                    handleNavClick('manga');
                    setMangaDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'manga'
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold'
                      : 'text-slate-300 hover:bg-void-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-gold-400" />
                    <span>Manga Chapters</span>
                  </div>
                  {activeTab === 'manga' && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                </button>

                <button
                  onClick={() => {
                    handleNavClick('characters');
                    setMangaDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                    activeTab === 'characters'
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold'
                      : 'text-slate-300 hover:bg-void-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Characters (93)</span>
                  </div>
                  {activeTab === 'characters' && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                </button>
              </div>
            )}
          </div>

          {/* 3. USERS */}
          <button
            onClick={() => handleNavClick('users')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                : 'text-slate-300 hover:text-white hover:bg-void-800/60'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${activeTab === 'users' ? 'text-gold-400' : ''}`} />
            <span>Users</span>
          </button>

          {/* 4. STUDIO (Owner Only) */}
          {isOwner && (
            <button
              onClick={() => handleNavClick('studio')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                  : 'text-electric-400 hover:text-white hover:bg-electric-500/10'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-electric-400" />
              <span>Studio</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">Owner</span>
            </button>
          )}

          {/* 5. ADMIN (Owner Only) */}
          {isOwner && (
            <button
              onClick={() => handleNavClick('owner')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'owner'
                  ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                  : 'text-purple-400 hover:text-white hover:bg-purple-500/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right Streamlined Action Hub */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
          
          {/* VIP Pass Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenPricing();
            }}
            title="VIP Membership: Unlock all chapters for ₹19/mo ($0.50)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-gold-500/15 to-amber-500/20 text-gold-300 border border-gold-500/40 hover:border-gold-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.25)] transition-all group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400 group-hover:rotate-12 transition-transform" />
            <span className="font-display font-semibold">VIP ₹19</span>
          </button>

          {/* Compact Combined Audio Pill */}
          <div className="flex items-center bg-void-900/90 border border-void-800 rounded-full p-0.5 shadow-sm">
            {/* Ambient BGM */}
            <button
              onClick={toggleAmbient}
              title={isAmbientOn ? 'Stop Ambient Atmosphere' : 'Play Ambient Music'}
              className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 transition-all cursor-pointer ${
                isAmbientOn
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50 shadow-[0_0_10px_rgba(138,43,226,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAmbientOn ? 'bg-violet-400 animate-ping' : 'bg-slate-500'}`} />
              <span>BGM</span>
            </button>
            {/* Sound Mute */}
            <button
              onClick={toggleMute}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-electric-400" />}
            </button>
          </div>

          {/* Reader Account / Sign In Pill with Rotating Quotation Animation */}
          {readerAccount?.isLoggedIn ? (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAccount();
              }}
              title={`Logged in as ${readerAccount.name || 'Reader'} (${readerAccount.readerId || 'SSO-READER-000'})`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 hover:border-emerald-400 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] group cursor-pointer relative overflow-hidden"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              {/* Animated Rotating Quotation between Name and Account User ID */}
              <div className="min-w-[95px] max-w-[140px] h-4.5 flex items-center justify-start overflow-hidden relative">
                {accountFlipMode === 'name' ? (
                  <div key="name" className="flex items-center gap-0.5 text-emerald-300 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <span className="font-serif italic text-emerald-400 text-xs font-bold leading-none">“</span>
                    <span className="truncate font-semibold text-xs leading-none">
                      {readerAccount.name || (readerAccount.phone ? `${readerAccount.countryCode || ''} ${readerAccount.phone.slice(-4)}` : 'Reader')}
                    </span>
                    <span className="font-serif italic text-emerald-400 text-xs font-bold leading-none">”</span>
                  </div>
                ) : (
                  <div key="id" className="flex items-center gap-0.5 text-gold-400 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span className="font-serif italic text-gold-500 text-xs font-bold leading-none">“</span>
                    <span className="font-mono font-bold text-[11px] tracking-wider leading-none">
                      {readerAccount.readerId || 'SSO-READER-000'}
                    </span>
                    <span className="font-serif italic text-gold-500 text-xs font-bold leading-none">”</span>
                  </div>
                )}
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAccount();
              }}
              title="Sign In with Phone, Email or Password"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-void-900 hover:bg-void-800 text-slate-200 hover:text-gold-300 border border-void-700 hover:border-gold-500/50 transition-all shadow-sm cursor-pointer relative overflow-hidden"
            >
              <User className="w-3.5 h-3.5 text-electric-400 shrink-0" />
              <div className="min-w-[95px] max-w-[130px] h-4.5 flex items-center justify-start overflow-hidden relative">
                {accountFlipMode === 'name' ? (
                  <div key="guest-sign" className="flex items-center gap-0.5 text-slate-200 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <span className="font-serif italic text-slate-400 text-xs">“</span>
                    <span className="text-xs font-semibold truncate">Sign In / Join</span>
                    <span className="font-serif italic text-slate-400 text-xs">”</span>
                  </div>
                ) : (
                  <div key="guest-id" className="flex items-center gap-0.5 text-gold-400 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span className="font-serif italic text-gold-500 text-xs">“</span>
                    <span className="font-mono font-bold text-[11px] tracking-wider truncate">
                      {readerAccount?.readerId || 'SSO-READER-000'}
                    </span>
                    <span className="font-serif italic text-gold-500 text-xs">”</span>
                  </div>
                )}
              </div>
            </button>
          )}

          {/* More Options Dropdown (...) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                sound.playClick();
                setMoreDropdownOpen(!moreDropdownOpen);
              }}
              title="More Features & Settings"
              className={`p-2 rounded-full border transition-all ${
                moreDropdownOpen
                  ? 'bg-gold-500/20 text-gold-300 border-gold-500/40 shadow-[0_0_12px_rgba(255,215,0,0.25)]'
                  : 'bg-void-900 hover:bg-void-800 text-slate-300 hover:text-white border-void-800 hover:border-slate-600'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Popover */}
            {moreDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-void-950/95 border border-void-700/80 p-2 shadow-[0_15px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-void-800/80 flex items-center justify-between">
                  <span>Multiverse Controls</span>
                  <span className="text-electric-400 font-mono">v2.4</span>
                </div>

                <div className="p-1 space-y-1">
                  {/* View Mode Switcher (Owner Only) */}
                  {isOwner && onToggleViewMode && (
                    <button
                      onClick={() => {
                        onToggleViewMode();
                        setMoreDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-void-800/80 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        {viewMode === 'reader' ? (
                          <Eye className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Edit3 className="w-4 h-4 text-gold-400" />
                        )}
                        <div>
                          <div className="text-slate-200 group-hover:text-white font-medium">
                            {viewMode === 'reader' ? 'Reader Mode Active' : 'Creator Mode Active'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {viewMode === 'reader' ? 'Sample Chapter Unlocked' : 'Clean Creator Canvas'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        viewMode === 'reader'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                      }`}>
                        Switch
                      </span>
                    </button>
                  )}

                  {/* Fortress Security Center */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenFortressSecurity();
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-emerald-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-slate-200 group-hover:text-emerald-300 font-medium">
                          Fortress Security
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Zero-Trust Data Protection
                        </div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </button>

                  {/* About Author Srinivas Vennu */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenAboutAuthor();
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-violet-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Feather className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-slate-200 group-hover:text-violet-300 font-medium">
                          About the Author
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Srinivas Vennu • Creator Vision
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </button>

                  {/* Anime Studio Shortcut */}
                  <button
                    onClick={() => handleNavClick('anime')}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-void-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Film className="w-4 h-4 text-electric-400" />
                      <div>
                        <div className="text-slate-200 group-hover:text-electric-300 font-medium">
                          Anime Studio
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Teaser Clips & Motion Panels
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </button>

                  {/* Replay Cinematic Intro */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onReplayIntro();
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-gold-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Play className="w-4 h-4 text-gold-400" />
                      <div>
                        <div className="text-slate-200 group-hover:text-gold-300 font-medium">
                          Replay Intro
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Original Cinematic Experience
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </button>

                  {/* Owner & Studio Gateway */}
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => {
                          sound.playClick();
                          handleNavClick('owner');
                        }}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-gold-500/10 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="text-slate-200 group-hover:text-gold-300 font-medium">
                              Owner Command Center
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Transactions, Users & Pricing
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
                          Admin
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setOwnerSession(false);
                          const guest = logoutReaderAccount();
                          if (onAccountUpdated) {
                            onAccountUpdated(guest);
                          }
                          setMoreDropdownOpen(false);
                          onSelectTab('home');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-rose-500/10 transition-all text-rose-300 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                          <span>Lock Studio &amp; Admin</span>
                        </div>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setMoreDropdownOpen(false);
                        setOwnerPasscodeModalOpen(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-gold-500/10 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Crown className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="text-slate-200 group-hover:text-gold-300 font-medium">
                            Author &amp; Owner Login
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Phone &amp; Laptop Master Key
                          </div>
                        </div>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA: Read Chapter 1 */}
          <button
            onClick={() => handleNavClick('manga')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 hover:brightness-110 shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all font-display shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Ch. 1</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Quick VIP Pass button on mobile */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenPricing();
            }}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/40"
          >
            VIP ₹19
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-electric-400" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-void-900 border border-void-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-void-950/98 border-b border-void-800 px-4 pt-3 pb-6 space-y-3 backdrop-blur-3xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Simplified Core Navigation Groups on Mobile */}
          <div className="space-y-2">
            {/* 1. Universe & Worlds Option Group */}
            <div className="p-2 rounded-2xl bg-void-900/70 border border-void-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" />
                Universe &amp; Worlds
              </span>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                      : 'text-slate-300 hover:bg-void-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Universe</span>
                </button>
                <button
                  onClick={() => handleNavClick('lore')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'lore'
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                      : 'text-slate-300 hover:bg-void-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Worlds</span>
                </button>
              </div>
            </div>

            {/* 2. Manga & Characters Option Group */}
            <div className="p-2 rounded-2xl bg-void-900/70 border border-void-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-gold-400" />
                Manga &amp; Characters
              </span>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  onClick={() => handleNavClick('manga')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'manga'
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                      : 'text-slate-300 hover:bg-void-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-gold-400" />
                  <span>Manga</span>
                </button>
                <button
                  onClick={() => handleNavClick('characters')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'characters'
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                      : 'text-slate-300 hover:bg-void-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Characters</span>
                </button>
              </div>
            </div>

            {/* 3. Users Tab */}
            <button
              onClick={() => handleNavClick('users')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30 font-bold'
                  : 'text-slate-300 hover:bg-void-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-electric-400" />
                <span>Users &amp; Profile</span>
              </div>
              <span className="font-mono text-[10px] text-gold-400">
                {readerAccount?.readerId || 'SSO-READER-000'}
              </span>
            </button>

            {/* 4. Studio & Admin (Owner Only) */}
            {isOwner && (
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  onClick={() => handleNavClick('studio')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === 'studio'
                      ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30'
                      : 'text-electric-300 hover:bg-void-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-electric-400" />
                    <span>Studio</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">Owner</span>
                </button>
                <button
                  onClick={() => handleNavClick('owner')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === 'owner'
                      ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30'
                      : 'text-purple-300 hover:bg-void-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Admin</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions & Utilities */}
          <div className="pt-3 border-t border-void-800/80 space-y-2">
            
            {/* View Mode Switcher (Owner Only) */}
            {isOwner && onToggleViewMode && (
              <button
                onClick={() => {
                  onToggleViewMode();
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 text-xs font-bold text-center rounded-xl border flex items-center justify-center gap-2 uppercase tracking-wider ${
                  viewMode === 'reader'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-gold-500/15 text-gold-300 border-gold-500/40'
                }`}
              >
                {viewMode === 'reader' ? (
                  <>
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Mode: Reader View (Sample Active)</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 text-gold-400" />
                    <span>Mode: Creator View</span>
                  </>
                )}
              </button>
            )}

            {!isOwner && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOwnerPasscodeModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-gold-500/10 to-amber-500/10 border border-gold-500/30 text-gold-400 font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <Crown className="w-4 h-4 text-gold-400" />
                <span>Author &amp; Owner Login (Phone &amp; Laptop)</span>
              </button>
            )}

            {/* Fortress Security Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenFortressSecurity();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SUKA SRI FORTRESS — Security</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* Quick Grid Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPricing();
                }}
                className="py-2 text-[11px] font-bold text-center rounded-xl bg-gold-500/15 text-gold-300 border border-gold-500/40 flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" /> VIP Pass
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className={`py-2 text-[11px] font-bold text-center rounded-xl border flex items-center justify-center gap-1 uppercase tracking-wider ${
                  readerAccount?.isLoggedIn
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-void-900 text-slate-300 border border-void-800'
                }`}
              >
                <User className="w-3.5 h-3.5 text-electric-400" />
                <span>{readerAccount?.isLoggedIn ? 'Profile' : 'Sign In'}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAboutAuthor();
                }}
                className="py-2 text-[11px] font-bold text-center rounded-xl bg-void-900 text-slate-300 border border-void-800 flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                <Feather className="w-3.5 h-3.5 text-violet-400" /> Author
              </button>
            </div>

            {/* Ambient BGM and Read Ch. 1 */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={toggleAmbient}
                className={`flex-1 py-2 text-xs font-semibold text-center rounded-xl border flex items-center justify-center gap-2 ${
                  isAmbientOn
                    ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
                    : 'bg-void-900 border-void-800 text-slate-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAmbientOn ? 'bg-violet-400 animate-ping' : 'bg-slate-500'}`} />
                <span>Atmospheric BGM</span>
              </button>

              <button
                onClick={() => handleNavClick('manga')}
                className="flex-1 py-2 text-xs font-bold text-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 uppercase shadow-md"
              >
                Read Ch. 1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OWNER PASSCODE UNLOCK MODAL */}
      {ownerPasscodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-void-900 border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.25)] space-y-5 text-center">
            <button
              onClick={() => {
                sound.playClick();
                setOwnerPasscodeModalOpen(false);
                setPasscodeError(null);
                setPasscodeInput('');
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-void-950 border border-void-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Key className="w-7 h-7" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                Author &amp; Owner Gateway
              </span>
              <h3 className="font-display text-xl font-black text-white mt-2">
                Unlock Creator Studio &amp; Admin
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Master Owner Passcode (e.g. <code>9502714652</code> or <code>SUKASRI2026</code>).
              </p>
            </div>

            <form onSubmit={handleUnlockOwner} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter Master Passcode..."
                  className="w-full px-4 py-3 rounded-xl bg-void-950 border border-void-800 focus:border-gold-400 text-white placeholder-slate-600 text-center font-mono tracking-widest text-lg outline-none"
                  autoFocus
                />
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 text-xs text-slate-400">
                  <span>Quick Fill:</span>
                  <button
                    type="button"
                    onClick={() => setPasscodeInput('9502714652')}
                    className="px-2 py-0.5 rounded bg-void-800 hover:bg-gold-500/20 text-gold-400 font-mono cursor-pointer transition-colors"
                  >
                    9502714652
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasscodeInput('SUKASRI2026')}
                    className="px-2 py-0.5 rounded bg-void-800 hover:bg-gold-500/20 text-gold-400 font-mono cursor-pointer transition-colors"
                  >
                    SUKASRI2026
                  </button>
                </div>
                {passcodeError && (
                  <p className="text-xs text-rose-400 mt-2 font-medium">
                    {passcodeError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-void-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify &amp; Unlock Studio</span>
              </button>
            </form>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-void-800">
              Official Author: Srinivas Vennu • Payee: Kanaka Rao Vennu (9502714652@axl)
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
