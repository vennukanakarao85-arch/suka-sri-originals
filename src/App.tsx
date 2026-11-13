import React, { useState, useMemo, useEffect } from 'react';
import { Chapter, Character, MangaSeries, UniverseConfig, ReaderAccount } from './types';
import { supabaseService } from './services/supabase';
import { getReaderAccount } from './services/storage';
import { SAMPLE_CHAPTER_1, SAMPLE_CHARACTERS } from './data/initialCanon';
import { sound } from './data/soundEffects';
import { ArrowLeft, BookOpen, ShieldAlert } from 'lucide-react';
import { CosmicBackground } from './components/common/CosmicBackground';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CinematicEntrance } from './components/home/CinematicEntrance';
import { HeroSection } from './components/home/HeroSection';
import { FeaturedSaga } from './components/home/FeaturedSaga';
import { LatestUpdates } from './components/home/LatestUpdates';
import { MangaLibrary } from './components/manga/MangaLibrary';
import { MangaDetailPage } from './components/manga/MangaDetailPage';
import { MangaReader } from './components/manga/MangaReader';
import { CharacterUniverse } from './components/characters/CharacterUniverse';
import { WorldsAndLore } from './components/lore/WorldsAndLore';
import { AnimeStudio } from './components/anime/AnimeStudio';
import { CreatorStudio } from './components/studio/CreatorStudio';
import { OwnerCommandCenter } from './components/admin/OwnerCommandCenter';
import { UsersPage } from './components/account/UsersPage';
import { UserAuthModal } from './components/account/UserAuthModal';
import { PaymentModal } from './components/manga/PaymentModal';
import { AboutAuthorModal } from './components/author/AboutAuthorModal';
import { FortressSecurityModal } from './components/security/FortressSecurityModal';
import { isOwnerOrAdmin } from './services/authService';

interface RouteState {
  tab: string;
  mangaId: string | null;
  chapterId: string | null;
}

function parseHash(hashStr: string): RouteState {
  const cleaned = hashStr.replace(/^#\/?/, '').trim();
  if (!cleaned || cleaned === 'home') {
    return { tab: 'home', mangaId: null, chapterId: null };
  }
  const parts = cleaned.split('/');
  const primary = parts[0];

  if (primary === 'reader' && parts[1]) {
    return { tab: 'reader', mangaId: 'mirai-o-tsukuru-mono', chapterId: parts[1] };
  }

  if (primary === 'manga') {
    if (parts[1]) {
      return { tab: 'manga-detail', mangaId: parts[1], chapterId: null };
    }
    return { tab: 'manga', mangaId: null, chapterId: null };
  }

  if (['characters', 'lore', 'anime', 'studio', 'users', 'owner'].includes(primary)) {
    return { tab: primary, mangaId: null, chapterId: null };
  }

  if (primary === 'login' || primary === 'account') {
    return { tab: 'users', mangaId: null, chapterId: null };
  }

  return { tab: 'home', mangaId: null, chapterId: null };
}

function formatHash(tab: string, mangaId: string | null, readingChapterId: string | null): string {
  if (readingChapterId) {
    return `#/reader/${readingChapterId}`;
  }
  if (tab === 'manga-detail' && mangaId) {
    return `#/manga/${mangaId}`;
  }
  if (tab && tab !== 'home') {
    return `#/${tab}`;
  }
  return `#/home`;
}

export function App() {
  const initialRoute = useMemo(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        return parseHash(hash);
      }
      const saved = localStorage.getItem('suka_sri_last_route');
      if (saved && saved.length > 1) {
        return parseHash(saved);
      }
    }
    return { tab: 'home', mangaId: null, chapterId: null };
  }, []);

  const [activeTab, setActiveTab] = useState<string>(
    initialRoute.tab === 'reader' ? 'manga-detail' : initialRoute.tab
  );
  const [viewMode, setViewMode] = useState<'reader' | 'creator'>('reader');
  const [mangaList, setMangaList] = useState<MangaSeries[]>(() => supabaseService.getMangaCollection());
  const [selectedMangaId, setSelectedMangaId] = useState<string | null>(
    initialRoute.mangaId || (initialRoute.tab === 'manga-detail' || initialRoute.tab === 'reader' ? 'mirai-o-tsukuru-mono' : null)
  );
  const [studioInitialMangaId, setStudioInitialMangaId] = useState<string | undefined>(undefined);
  const [readingChapterId, setReadingChapterId] = useState<string | null>(initialRoute.chapterId);
  const [config, setConfig] = useState<UniverseConfig>(() => supabaseService.getConfig());
  const [readerAccount, setReaderAccount] = useState<ReaderAccount>(() => getReaderAccount());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentChapter, setPaymentChapter] = useState<Chapter | null>(null);
  const [paymentMode, setPaymentMode] = useState<'chapter' | 'membership'>('chapter');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState<boolean>(false);
  const [isFortressModalOpen, setIsFortressModalOpen] = useState<boolean>(false);
  const [showEntrance, setShowEntrance] = useState<boolean>(() => {
    // If user arrived directly via a deep link or reader, skip intro overlay
    if (initialRoute.chapterId || initialRoute.tab !== 'home') {
      return false;
    }
    return sessionStorage.getItem('suka_sri_intro_seen') !== 'true';
  });

  // 1. Synchronize URL hash when application navigation state changes
  useEffect(() => {
    const targetHash = formatHash(activeTab, selectedMangaId, readingChapterId);
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
    try {
      localStorage.setItem('suka_sri_last_route', targetHash);
    } catch {
      // Ignore in restricted environments
    }
  }, [activeTab, selectedMangaId, readingChapterId]);

  // 2. Browser Back / Forward / Manual Hash Navigation Listener
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHash(window.location.hash);
      if (route.chapterId) {
        setReadingChapterId(route.chapterId);
      } else {
        setReadingChapterId(null);
        if (route.tab === 'manga-detail') {
          setActiveTab('manga-detail');
          setSelectedMangaId(route.mangaId || 'mirai-o-tsukuru-mono');
        } else {
          setActiveTab(route.tab);
          if (route.tab === 'manga') {
            setSelectedMangaId(null);
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenPayment = (chapter?: Chapter, mode: 'chapter' | 'membership' = 'chapter') => {
    setPaymentChapter(chapter || null);
    setPaymentMode(mode);
    setIsPaymentModalOpen(true);
  };

  const handleEntranceComplete = () => {
    setShowEntrance(false);
    sessionStorage.setItem('suka_sri_intro_seen', 'true');
  };

  const handleReplayIntro = () => {
    setShowEntrance(true);
  };

  const handleSelectManga = (mangaId: string) => {
    setSelectedMangaId(mangaId);
    setActiveTab('manga-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudioForManga = (mangaId?: string) => {
    setStudioInitialMangaId(mangaId);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLibrary = () => {
    setSelectedMangaId(null);
    setActiveTab('manga');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Provide clean, launch-ready Manga collection with genuine creator-uploaded chapters and canonical personas
  const effectiveMangaList = useMemo(() => {
    return mangaList.map((m) => {
      if (m.id === 'mirai-o-tsukuru-mono') {
        const characters = (m.characters && m.characters.length > 0) ? m.characters : SAMPLE_CHARACTERS;
        return {
          ...m,
          chapters: (m.chapters && m.chapters.length > 0) ? m.chapters : [SAMPLE_CHAPTER_1],
          characters,
        };
      }
      return m;
    });
  }, [mangaList]);

  // Aggregate all chapters from all series for reader and global navigation
  const allChapters = useMemo(() => {
    const list: Chapter[] = [];
    effectiveMangaList.forEach((m) => {
      (m.chapters || []).forEach((ch) => list.push(ch));
    });
    return list;
  }, [effectiveMangaList]);

  const publishedChapters = useMemo(() => {
    return allChapters.filter(
      (c) =>
        !c.isDraft &&
        ((c.pages && c.pages.length > 0) || (c.textContent && c.textContent.trim().length > 0))
    );
  }, [allChapters]);

  const allCharacters = useMemo(() => {
    const chars: Character[] = [];
    effectiveMangaList.forEach((m) => {
      (m.characters || []).forEach((c) => chars.push(c));
    });
    return chars;
  }, [effectiveMangaList]);

  const firstPublishedChapter =
    publishedChapters.find((c) => c.chapterNumber === 1) || publishedChapters[0] || null;

  const activeReadingChapter = allChapters.find((c) => c.id === readingChapterId) || null;
  const selectedManga = effectiveMangaList.find((m) => m.id === selectedMangaId) || effectiveMangaList[0];

  return (
    <div className="relative min-h-screen bg-void-950 text-slate-100 flex flex-col font-sans selection:bg-gold-500 selection:text-void-950">
      {/* Dynamic Cosmic Background */}
      <CosmicBackground />

      {/* Cinematic Entrance Overlay */}
      {showEntrance && (
        <CinematicEntrance
          officialLogoUrl={config.officialLogoUrl}
          onComplete={handleEntranceComplete}
        />
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab === 'manga-detail' ? 'manga' : activeTab}
        onSelectTab={(tab) => {
          if (tab === 'manga') {
            setSelectedMangaId(null);
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        officialLogoUrl={config.officialLogoUrl}
        onReplayIntro={handleReplayIntro}
        viewMode={viewMode}
        onToggleViewMode={() => {
          sound.playClick();
          setViewMode((v) => (v === 'reader' ? 'creator' : 'reader'));
        }}
        onOpenAccount={() => {
          sound.playClick();
          setIsAccountModalOpen(true);
        }}
        onOpenPricing={() => {
          sound.playClick();
          handleOpenPayment(undefined, 'membership');
        }}
        onOpenAboutAuthor={() => {
          sound.playClick();
          setIsAuthorModalOpen(true);
        }}
        onOpenFortressSecurity={() => {
          sound.playClick();
          setIsFortressModalOpen(true);
        }}
        readerAccount={readerAccount}
        onAccountUpdated={(updated) => setReaderAccount(updated)}
      />

      {/* Main Module Content */}
      <main className="flex-1 relative z-10">
        {/* Universal Backward Navigation Button & Module Breadcrumb */}
        {activeTab !== 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
            <button
              onClick={() => {
                sound.playClick();
                if (activeTab === 'manga-detail') {
                  setActiveTab('manga');
                } else {
                  setActiveTab('home');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-void-900 border border-void-800 text-xs font-bold text-slate-300 hover:text-gold-400 hover:border-gold-500/50 transition-all shadow-md group active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gold-400" />
              <span>
                {activeTab === 'manga-detail'
                  ? '← Back to Manga Library'
                  : '← Back to Universe'}
              </span>
            </button>

            {/* Breadcrumb Module Path */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('home');
                }}
                className="hover:text-gold-400 transition-colors cursor-pointer uppercase"
              >
                UNIVERSE
              </button>
              <span>/</span>
              <span className="text-electric-400 font-bold uppercase tracking-wider">
                {activeTab === 'manga-detail'
                  ? 'Manga Series Codex'
                  : activeTab === 'manga'
                  ? 'Manga Library'
                  : activeTab === 'characters'
                  ? 'Canonical Personas'
                  : activeTab === 'lore'
                  ? 'Worlds & Lore'
                  : activeTab === 'anime'
                  ? 'Anime Studio'
                  : activeTab === 'studio'
                  ? 'Creator Studio'
                  : activeTab === 'users'
                  ? 'Users Portal & Accounts'
                  : activeTab}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div>
            <HeroSection
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onReadChapter={(chapterId) => setReadingChapterId(chapterId)}
              onSelectManga={handleSelectManga}
              hasPublishedChapters={publishedChapters.length > 0}
              firstChapterId={firstPublishedChapter?.id || null}
            />
            <FeaturedSaga
              onReadChapter={(chapterId) => setReadingChapterId(chapterId)}
              onExploreCharacters={() => {
                setActiveTab('characters');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectManga={handleSelectManga}
              hasPublishedChapters={publishedChapters.length > 0}
              firstChapterId={firstPublishedChapter?.id || null}
              onOpenStudio={() => handleOpenStudioForManga()}
              readerAccount={readerAccount}
            />
            <LatestUpdates
              mangaList={effectiveMangaList}
              onReadChapter={(chapterId) => setReadingChapterId(chapterId)}
              onSelectManga={handleSelectManga}
              onOpenStudio={() => handleOpenStudioForManga()}
              onViewAllManga={() => {
                setActiveTab('manga');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              readerAccount={readerAccount}
            />
          </div>
        )}

        {activeTab === 'manga' && (
          <MangaLibrary
            mangaList={effectiveMangaList}
            onSelectManga={handleSelectManga}
            onOpenStudio={() => handleOpenStudioForManga()}
            readerAccount={readerAccount}
          />
        )}

        {activeTab === 'manga-detail' && selectedManga && (
          <MangaDetailPage
            manga={selectedManga}
            onBackToLibrary={handleBackToLibrary}
            onReadChapter={(chapterId) => setReadingChapterId(chapterId)}
            onOpenStudioForManga={(mangaId) => handleOpenStudioForManga(mangaId)}
            readerAccount={readerAccount}
            onOpenPaymentModal={(ch, mode) => handleOpenPayment(ch, mode)}
          />
        )}

        {activeTab === 'characters' && (
          <CharacterUniverse
            characters={allCharacters}
            onOpenStudio={() => handleOpenStudioForManga()}
            readerAccount={readerAccount}
          />
        )}

        {activeTab === 'lore' && <WorldsAndLore />}

        {activeTab === 'anime' && (
          <AnimeStudio onOpenStudio={() => handleOpenStudioForManga()} />
        )}

        {activeTab === 'studio' && (
          isOwnerOrAdmin(readerAccount) ? (
            <CreatorStudio
              mangaList={mangaList}
              onMangaListUpdated={(updated) => setMangaList(updated)}
              config={config}
              onConfigUpdated={(newConfig) => setConfig(newConfig)}
              onPreviewChapter={(ch) => {
                const targetMangaId = ch.mangaId || mangaList[0]?.id;
                const target = mangaList.find((m) => m.id === targetMangaId);
                if (target && !target.chapters.some((c) => c.id === ch.id)) {
                  target.chapters.unshift(ch);
                  setMangaList([...mangaList]);
                }
                setReadingChapterId(ch.id);
              }}
              initialMangaId={studioInitialMangaId}
            />
          ) : readerAccount?.isLoggedIn ? (
            <div className="py-24 text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 rounded-2xl bg-void-900 border border-void-800 flex items-center justify-center mx-auto mb-4 text-gold-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Private Creator Studio</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                The Manga Production Studio is reserved exclusively for the author and publishing owner. Regular reader accounts do not have creator editing privileges.
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-bold text-xs uppercase tracking-wider"
              >
                Return to Universe
              </button>
            </div>
          ) : (
            <OwnerCommandCenter
              currentAccount={readerAccount}
              onNavigateToStudio={() => setActiveTab('studio')}
              onNavigateToUniverse={() => setActiveTab('home')}
            />
          )
        )}

        {activeTab === 'owner' && (
          isOwnerOrAdmin(readerAccount) ? (
            <OwnerCommandCenter
              currentAccount={readerAccount}
              onNavigateToStudio={() => setActiveTab('studio')}
              onNavigateToUniverse={() => setActiveTab('home')}
            />
          ) : readerAccount?.isLoggedIn ? (
            <div className="py-24 text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 rounded-2xl bg-void-900 border border-void-800 flex items-center justify-center mx-auto mb-4 text-purple-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Restricted Command Center</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                The Admin Command Center is reserved exclusively for the author Srinivas Vennu.
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-bold text-xs uppercase tracking-wider"
              >
                Return to Universe
              </button>
            </div>
          ) : (
            <OwnerCommandCenter
              currentAccount={readerAccount}
              onNavigateToStudio={() => setActiveTab('studio')}
              onNavigateToUniverse={() => setActiveTab('home')}
            />
          )
        )}

        {activeTab === 'users' && (
          <UsersPage
            readerAccount={readerAccount}
            onAccountUpdated={(updated) => setReaderAccount(updated)}
            allChapters={allChapters}
            onReadChapter={(chapterId) => setReadingChapterId(chapterId)}
            onOpenPricing={() => handleOpenPayment(undefined, 'membership')}
            onOpenOwnerCommandCenter={() => setActiveTab('owner')}
            onOpenStudio={() => {
              setActiveTab('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={(tab) => {
          if (tab === 'manga') {
            setSelectedMangaId(null);
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        officialLogoUrl={config.officialLogoUrl}
        readerAccount={readerAccount}
      />

      {/* Pro Manga Reader Modal */}
      {activeReadingChapter && (
        <MangaReader
          chapter={activeReadingChapter}
          allChapters={allChapters}
          onClose={() => setReadingChapterId(null)}
          onSelectChapter={(nextId) => setReadingChapterId(nextId)}
          readerAccount={readerAccount}
          onOpenPaymentModal={(ch, mode) => handleOpenPayment(ch, mode)}
        />
      )}

      {/* Payment & Subscription Modal (UPI QR & Stripe Simulation) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        chapter={paymentChapter}
        mode={paymentMode}
        readerAccount={readerAccount}
        onAccountUpdated={(updated) => setReaderAccount(updated)}
        onSuccessOpenChapter={(chapterId) => {
          setReadingChapterId(chapterId);
        }}
      />

      {/* Reader Account & Authentication Modal (Phone OTP & Email OTP) */}
      <UserAuthModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        readerAccount={readerAccount}
        onAccountUpdated={(updated) => setReaderAccount(updated)}
        allChapters={allChapters}
        onReadChapter={(chapterId) => {
          setIsAccountModalOpen(false);
          setReadingChapterId(chapterId);
        }}
        onOpenPricing={() => {
          setIsAccountModalOpen(false);
          handleOpenPayment(undefined, 'membership');
        }}
        onOpenOwnerCommandCenter={() => {
          setIsAccountModalOpen(false);
          setActiveTab('owner');
        }}
        onOpenStudio={() => {
          setIsAccountModalOpen(false);
          setActiveTab('studio');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* About Author Modal (Srinivas Vennu) */}
      <AboutAuthorModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
      />

      {/* SUKA SRI FORTRESS — Zero-Trust Security Center Modal */}
      <FortressSecurityModal
        isOpen={isFortressModalOpen}
        onClose={() => setIsFortressModalOpen(false)}
        mangaList={mangaList}
        onMangaListUpdated={(updated) => setMangaList(updated)}
        readerAccount={readerAccount}
        sampleChapter={firstPublishedChapter || SAMPLE_CHAPTER_1}
      />
    </div>
  );
}

export default App;
