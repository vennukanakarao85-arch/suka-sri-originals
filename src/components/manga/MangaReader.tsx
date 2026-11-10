import React, { useState, useEffect, useRef } from 'react';
import { Chapter } from '../../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Volume2,
  VolumeX,
  ArrowRight,
  LayoutList,
  Columns,
  BookOpen,
  Download,
  Share2,
  Check,
  FileText,
  Lock,
  Unlock,
  Sparkles,
  ShieldCheck,
  Heart,
  Eye
} from 'lucide-react';
import { sound } from '../../data/soundEffects';
import { ReaderAccount } from '../../types';
import { isChapterUnlocked, downloadWatermarkedChapter } from '../../services/storage';
import { secureDecryptChapterContent } from '../../services/mangaVault';
import { engagementService } from '../../services/realEngagement';

interface MangaReaderProps {
  chapter: Chapter;
  allChapters: Chapter[];
  onClose: () => void;
  onSelectChapter: (chapterId: string) => void;
  readerAccount: ReaderAccount;
  onOpenPaymentModal: (chapter?: Chapter, mode?: 'chapter' | 'membership') => void;
}

type ReadingMode = 'vertical' | 'single' | 'double';
type ReadingTheme = 'void' | 'charcoal' | 'sepia' | 'light';
type ReadingDirection = 'rtl' | 'ltr';

export const MangaReader: React.FC<MangaReaderProps> = ({
  chapter,
  allChapters,
  onClose,
  onSelectChapter,
  readerAccount,
  onOpenPaymentModal,
}) => {
  const hasPages = chapter.pages && chapter.pages.length > 0;
  const hasText = Boolean(chapter.textContent && chapter.textContent.trim().length > 0);
  const isUnlocked = isChapterUnlocked(readerAccount, chapter);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [contentView, setContentView] = useState<'pages' | 'text'>(
    !hasPages && hasText ? 'text' : 'pages'
  );
  const [readingMode, setReadingMode] = useState<ReadingMode>('vertical');
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('void');
  const [direction, setDirection] = useState<ReadingDirection>('rtl');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [textFontSize, setTextFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!sound.getMuted());
  const [copied, setCopied] = useState<boolean>(false);
  const [decryptedText, setDecryptedText] = useState<string>(chapter.textContent || '');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  // Real viewer and like metrics (zero baseline, real reader tracking)
  const [viewCount, setViewCount] = useState<number>(() =>
    engagementService.getChapterViews(chapter.id, chapter.views)
  );
  const [likeCount, setLikeCount] = useState<number>(() =>
    engagementService.getChapterLikes(chapter.id, chapter.likes)
  );
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    engagementService.isChapterLiked(chapter.id)
  );

  useEffect(() => {
    const updatedViews = engagementService.recordChapterView(chapter.id, chapter.views);
    setViewCount(updatedViews);
    setLikeCount(engagementService.getChapterLikes(chapter.id, chapter.likes));
    setIsLiked(engagementService.isChapterLiked(chapter.id));
  }, [chapter.id]);

  const handleToggleLike = () => {
    const result = engagementService.toggleChapterLike(chapter.id, chapter.likes);
    setIsLiked(result.liked);
    setLikeCount(result.count);
    if (result.liked) {
      sound.playCelestialChime();
    } else {
      sound.playClick();
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isUnlocked) {
      setIsDecrypting(true);
      secureDecryptChapterContent(chapter, readerAccount)
        .then((text) => {
          if (isMounted) {
            setDecryptedText(text);
            setIsDecrypting(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setDecryptedText(chapter.textContent || '');
            setIsDecrypting(false);
          }
        });
    } else {
      setDecryptedText('');
    }
    return () => {
      isMounted = false;
    };
  }, [chapter.id, isUnlocked, readerAccount.membershipStatus, readerAccount.unlockedChapterIds]);

  const containerRef = useRef<HTMLDivElement>(null);
  const totalPages = chapter.pages?.length || 0;

  // Previous & Next Chapter resolution
  const sortedChapters = [...allChapters]
    .filter((c) => !c.isDraft && (!chapter.mangaId || c.mangaId === chapter.mangaId))
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const currentIndex = sortedChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setMuted(!next);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      sound.playPageTurn();
      setCurrentPage((p) => p + (readingMode === 'double' ? 2 : 1));
    } else if (nextChapter) {
      sound.playCelestialChime();
      onSelectChapter(nextChapter.id);
      setCurrentPage(1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      sound.playPageTurn();
      setCurrentPage((p) => Math.max(1, p - (readingMode === 'double' ? 2 : 1)));
    } else if (prevChapter) {
      sound.playCelestialChime();
      onSelectChapter(prevChapter.id);
      setCurrentPage(1);
    }
  };

  const handleDownload = () => {
    sound.playClick();
    if (!isUnlocked) {
      onOpenPaymentModal(chapter, 'chapter');
      return;
    }
    downloadWatermarkedChapter(chapter, readerAccount);
  };

  const handleShare = async () => {
    sound.playClick();
    const url = window.location.href;
    const shareData = {
      title: `${chapter.title} - Chapter ${chapter.chapterNumber} | SUKA SRI ORIGINALS`,
      text: `Read Chapter ${chapter.chapterNumber}: "${chapter.title}" from ${chapter.mangaTitle || 'SUKA SRI ORIGINALS'}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (direction === 'rtl') goToPrevPage();
        else goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        if (direction === 'rtl') goToNextPage();
        else goToPrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, direction, readingMode]);

  // Theme styles
  const themeStyles: Record<ReadingTheme, string> = {
    void: 'bg-void-950 text-slate-100',
    charcoal: 'bg-[#15161e] text-slate-200',
    sepia: 'bg-[#f4ecd8] text-[#433422]',
    light: 'bg-[#ffffff] text-slate-900',
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles[readingTheme]} select-none transition-colors duration-300 overflow-hidden`}
    >
      {/* Top HUD Toolbar */}
      <div className="h-16 border-b border-void-800/80 bg-void-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-void-900 hover:bg-void-800 text-slate-300 hover:text-white border border-void-800 transition-colors flex items-center gap-1.5"
            title="Exit Reader"
          >
            <X className="w-4 h-4 text-gold-400" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Close</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base text-gold-400">
                CH. {chapter.chapterNumber}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="font-display text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                {chapter.title}
              </span>
            </div>
            <span className="text-[10px] text-violet-400 uppercase tracking-widest font-semibold block truncate max-w-xs sm:max-w-md">
              {chapter.mangaTitle ? `${chapter.mangaTitle} • ` : ''}{chapter.arcTitle}
            </span>
          </div>
        </div>

        {/* Chapter selector & Page counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chapter Selector Dropdown with Part optgroups */}
          <select
            value={chapter.id}
            onChange={(e) => {
              sound.playClick();
              onSelectChapter(e.target.value);
              setCurrentPage(1);
            }}
            className="hidden md:block bg-void-900 border border-void-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 max-w-[240px] truncate"
          >
            <optgroup label="Part 1: Rise of the Empire (Ch. 001 — 150)">
              {sortedChapters
                .filter((c) => c.chapterNumber <= 150)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    Ch. {c.chapterNumber}: {c.title}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Part 2: The Dark Shadow (Ch. 151 — 300)">
              {sortedChapters
                .filter((c) => c.chapterNumber > 150 && c.chapterNumber <= 300)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    Ch. {c.chapterNumber}: {c.title}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Part 3: The Era of Zero (Ch. 301 — 450)">
              {sortedChapters
                .filter((c) => c.chapterNumber > 300)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    Ch. {c.chapterNumber}: {c.title}
                  </option>
                ))}
            </optgroup>
          </select>

          {/* Content Mode Toggle (if both pages and text exist) */}
          {hasPages && hasText && (
            <div className="flex bg-void-900 border border-void-800 rounded-lg p-0.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setContentView('pages');
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                  contentView === 'pages'
                    ? 'bg-gold-500 text-void-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pages ({totalPages})</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setContentView('text');
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                  contentView === 'text'
                    ? 'bg-gold-500 text-void-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Novel</span>
              </button>
            </div>
          )}

          {/* Reading Mode Pills (Only for Pages) */}
          {contentView === 'pages' && hasPages && (
            <div className="hidden sm:flex bg-void-900 border border-void-800 rounded-lg p-0.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setReadingMode('vertical');
                }}
                className={`p-1.5 rounded text-xs font-semibold ${
                  readingMode === 'vertical' ? 'bg-gold-500 text-void-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Webtoon Vertical Mode"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setReadingMode('single');
                }}
                className={`p-1.5 rounded text-xs font-semibold ${
                  readingMode === 'single' ? 'bg-gold-500 text-void-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Single Page Mode"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setReadingMode('double');
                }}
                className={`p-1.5 rounded text-xs font-semibold ${
                  readingMode === 'double' ? 'bg-gold-500 text-void-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Double Page Spread Mode"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Real Views counter */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-void-900 border border-void-800 text-xs text-slate-300 font-mono"
            title="Real Viewer Reads"
          >
            <Eye className="w-3.5 h-3.5 text-electric-400" />
            <span>{viewCount.toLocaleString()}</span>
          </div>

          {/* Real Like Button */}
          <button
            onClick={handleToggleLike}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              isLiked
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-void-900 border-void-800 text-slate-400 hover:text-pink-400 hover:border-pink-500/30'
            }`}
            title={isLiked ? 'Unlike Chapter' : 'Like Chapter'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-pink-400' : ''}`} />
            <span>{likeCount.toLocaleString()}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-void-900 border border-void-800 text-slate-400 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
            title="Download Chapter Content"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-void-900 border border-void-800 text-slate-400 hover:text-electric-400 hover:border-electric-500/40 transition-colors"
            title={copied ? 'Copied to Clipboard!' : 'Share Chapter'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-void-900 border border-void-800 text-slate-400 hover:text-white"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-electric-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-void-900 border border-void-800 text-slate-400 hover:text-gold-400"
            title="Reader Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-void-900 border border-void-800 text-slate-400 hover:text-white"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Popover */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-40 bg-void-900 border border-void-800 rounded-2xl p-5 shadow-2xl w-72 space-y-4 backdrop-blur-xl">
          {contentView === 'pages' && hasPages && (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-2">
                  Reader Layout
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['vertical', 'single', 'double'] as ReadingMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setReadingMode(mode)}
                      className={`py-1.5 rounded capitalize font-medium ${
                        readingMode === mode
                          ? 'bg-gold-500 text-void-950 font-bold'
                          : 'bg-void-950 text-slate-300 border border-void-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-2">
                  Reading Direction
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setDirection('rtl')}
                    className={`py-1.5 rounded font-medium ${
                      direction === 'rtl'
                        ? 'bg-electric-500 text-void-950 font-bold'
                        : 'bg-void-950 text-slate-300 border border-void-800'
                    }`}
                  >
                    RTL (Manga)
                  </button>
                  <button
                    onClick={() => setDirection('ltr')}
                    className={`py-1.5 rounded font-medium ${
                      direction === 'ltr'
                        ? 'bg-electric-500 text-void-950 font-bold'
                        : 'bg-void-950 text-slate-300 border border-void-800'
                    }`}
                  >
                    LTR (Webcomic)
                  </button>
                </div>
              </div>
            </>
          )}

          {hasText && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-2">
                Novel Text Size
              </label>
              <div className="grid grid-cols-4 gap-1 text-xs">
                {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTextFontSize(sz)}
                    className={`py-1.5 rounded uppercase font-medium ${
                      textFontSize === sz
                        ? 'bg-gold-500 text-void-950 font-bold'
                        : 'bg-void-950 text-slate-300 border border-void-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-2">
              Theme Palette
            </label>
            <div className="grid grid-cols-4 gap-1 text-xs">
              {(['void', 'charcoal', 'sepia', 'light'] as ReadingTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setReadingTheme(thm)}
                  className={`py-1.5 rounded capitalize font-medium ${
                    readingTheme === thm
                      ? 'bg-violet-600 text-white font-bold'
                      : 'bg-void-950 text-slate-300 border border-void-800'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">
              Zoom: {zoomLevel}%
            </label>
            <input
              type="range"
              min="80"
              max="160"
              step="10"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-full accent-gold-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto relative flex justify-center items-center">
        {!isUnlocked ? (
          <div className="max-w-md p-8 rounded-3xl bg-void-900 border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.25)] text-center space-y-5 m-4">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block mb-1">
                Official Paid Chapter • {chapter.arcTitle}
              </span>
              <h3 className="font-display text-2xl font-black text-white">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {chapter.synopsis || 'This canonical story chapter requires an authorized unlock or monthly VIP membership.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-void-950 border border-void-800 text-xs flex items-center justify-between">
              <span className="text-slate-400">Chapter Unlock Price:</span>
              <strong className="text-gold-400 font-mono">₹49 INR / $1.00 USD</strong>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onOpenPaymentModal(chapter, 'chapter')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-void-950 font-display text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                Unlock Chapter (₹49 / $1)
              </button>
              <button
                onClick={() => onOpenPaymentModal(undefined, 'membership')}
                className="w-full py-3 rounded-xl bg-void-950 border border-electric-400 text-electric-300 hover:text-white font-display text-xs font-bold uppercase tracking-wider transition-all"
              >
                Get Monthly VIP (₹19 / $0.50)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TEXT / NOVEL CHAPTER READING VIEW */}
        {(contentView === 'text' || (!hasPages && hasText)) && (
          <div
            className="w-full max-w-3xl flex flex-col py-10 px-4 sm:px-8 space-y-6"
            style={{ width: `${zoomLevel}%` }}
          >
            <div className="text-center pb-6 border-b border-void-800">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
                {chapter.mangaTitle || 'SUKA SRI ORIGINALS'} • {chapter.arcTitle}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-black text-white tracking-wide">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </h2>
              {chapter.releaseDate && (
                <span className="text-xs text-slate-400 mt-2 block">
                  Canonical Release: {chapter.releaseDate}
                </span>
              )}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>SUKA SRI FORTRESS • In-Memory AES-256-GCM Decryption</span>
              </div>
            </div>

            {chapter.synopsis && (
              <div className="p-4 rounded-xl bg-void-900 border-l-4 border-gold-500 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                {chapter.synopsis}
              </div>
            )}

            <div
              className={`space-y-5 leading-relaxed font-body select-none ${
                textFontSize === 'sm'
                  ? 'text-sm'
                  : textFontSize === 'base'
                  ? 'text-base'
                  : textFontSize === 'lg'
                  ? 'text-lg'
                  : 'text-xl'
              }`}
            >
              {isDecrypting ? (
                <div className="text-center py-12 text-xs font-mono text-emerald-400 animate-pulse">
                  Decrypting manuscript in-memory with AES-256-GCM authenticated cipher...
                </div>
              ) : (
                (decryptedText || chapter.textContent || '').split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-slate-200">
                    {paragraph}
                  </p>
                ))
              )}
            </div>

            {/* End of chapter banner with Part Transition Milestones */}
            <div className="w-full py-12 text-center rounded-3xl bg-void-900 border border-void-800 p-6 sm:p-8 mt-8 shadow-2xl relative overflow-hidden">
              {/* Part 1 Milestone Celebration (Ch. 150) */}
              {chapter.chapterNumber === 150 && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-gold-500/15 to-purple-500/20 border border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>GRAND MILESTONE: PART 1 COMPLETE!</span>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  </div>
                  <h4 className="font-display text-xl sm:text-2xl font-black text-white mt-1">
                    Rise of the Empire (150 Chapters) Finished
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
                    You have finished the complete 150-chapter saga of Part 1. The sovereign foundation of the Empire is sealed. The shadow wakens in Chapter 151!
                  </p>
                </div>
              )}

              {/* Part 2 Milestone Celebration (Ch. 300) */}
              {chapter.chapterNumber === 300 && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 via-purple-500/15 to-cyan-500/20 border border-rose-400/50 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                  <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-rose-400 mb-1">
                    <Sparkles className="w-4 h-4 text-rose-300 animate-spin" />
                    <span>GRAND MILESTONE: PART 2 COMPLETE!</span>
                    <Sparkles className="w-4 h-4 text-rose-300 animate-spin" />
                  </div>
                  <h4 className="font-display text-xl sm:text-2xl font-black text-white mt-1">
                    The Dark Shadow (Chapters 151–300) Finished
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
                    The final arc THE TRUTH is breached! You have uncovered the secrets of the throne. Prepare for Part 3: The Era of Zero (Chapter 301)!
                  </p>
                </div>
              )}

              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
                Chapter Complete
              </span>
              <h3 className="font-display text-xl sm:text-3xl font-black text-white mb-4">
                You reached the end of Chapter {chapter.chapterNumber}
              </h3>

              {nextChapter ? (
                <button
                  onClick={() => {
                    sound.playCelestialChime();
                    onSelectChapter(nextChapter.id);
                    setCurrentPage(1);
                  }}
                  className={`px-8 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2.5 shadow-xl hover:brightness-110 active:scale-95 transition-all ${
                    chapter.chapterNumber === 150
                      ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]'
                      : chapter.chapterNumber === 300
                      ? 'bg-gradient-to-r from-cyan-500 via-electric-500 to-purple-600 text-void-950 shadow-[0_0_25px_rgba(0,229,255,0.4)]'
                      : 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                  }`}
                >
                  <span>
                    {chapter.chapterNumber === 150
                      ? 'Begin Part 2 • Chapter 151 (The Shadow Wakens)'
                      : chapter.chapterNumber === 300
                      ? 'Begin Part 3 • Chapter 301 (The Era of Zero)'
                      : `Continue to Chapter ${nextChapter.chapterNumber}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="font-display text-base font-bold text-gold-400">
                    🏆 The Grand 450-Chapter Multiverse Saga is Complete!
                  </p>
                  <p className="text-xs text-slate-400">
                    “The future is created by the choices we make together.” — Srinivas Vennu
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EMPTY STATE IF NEITHER PAGES NOR TEXT */}
        {!hasPages && !hasText && (
          <div className="text-center py-20 px-6 max-w-md bg-void-900/60 rounded-3xl border border-dashed border-void-800">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-white mb-2">
              Chapter {chapter.chapterNumber} is Empty
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              No manga panel pages or text narrative have been uploaded for this chapter yet. You can publish content in the Creator Studio.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gold-500 text-void-950 font-display text-xs font-bold uppercase tracking-wider hover:brightness-110"
            >
              Close Reader
            </button>
          </div>
        )}

        {/* VERTICAL CONTINUOUS WEBTOON MODE (For Pages) */}
        {contentView === 'pages' && hasPages && readingMode === 'vertical' && (
          <div
            className="w-full max-w-3xl flex flex-col items-center py-8 space-y-4 px-2"
            style={{ width: `${zoomLevel}%` }}
          >
            {chapter.pages.map((p) => (
              <div
                key={p.id}
                className="w-full flex flex-col items-center shadow-2xl rounded-lg overflow-hidden bg-void-950 border border-void-800/60"
              >
                <img
                  src={p.imageUrl}
                  alt={`Page ${p.pageNumber}`}
                  className="w-full h-auto object-contain block"
                  loading="lazy"
                />
                {p.caption && (
                  <div className="w-full bg-void-950/90 border-t border-void-800 p-3 text-center text-xs font-medium text-slate-300">
                    {p.caption}
                  </div>
                )}
              </div>
            ))}

            {/* End of chapter banner */}
            <div className="w-full py-12 text-center rounded-2xl bg-void-900 border border-void-800 p-6 mt-8">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
                Chapter Complete
              </span>
              <h3 className="font-display text-2xl font-black text-white mb-4">
                You reached the end of Chapter {chapter.chapterNumber}
              </h3>
              {nextChapter ? (
                <button
                  onClick={() => {
                    sound.playCelestialChime();
                    onSelectChapter(nextChapter.id);
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg hover:brightness-110"
                >
                  <span>Continue to Ch. {nextChapter.chapterNumber}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  You are fully up to date with the latest canonical release!
                </p>
              )}
            </div>
          </div>
        )}

        {/* SINGLE OR DOUBLE PAGE BOOK MODE (For Pages) */}
        {contentView === 'pages' && hasPages && readingMode !== 'vertical' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            {/* Prev button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1 && !prevChapter}
              className="absolute left-4 z-20 p-3 rounded-full bg-void-950/80 hover:bg-gold-500 hover:text-void-950 text-slate-200 border border-void-800 transition-all disabled:opacity-20 shadow-xl"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Pages container */}
            <div
              className={`flex items-center justify-center gap-2 max-h-[85vh] transition-transform`}
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {/* Left page */}
              {chapter.pages[currentPage - 1] && (
                <div className="max-h-[82vh] rounded-lg overflow-hidden shadow-2xl border border-void-800/80 bg-void-950 flex flex-col">
                  <img
                    src={chapter.pages[currentPage - 1].imageUrl}
                    alt={`Page ${currentPage}`}
                    className="max-h-[76vh] w-auto object-contain"
                  />
                  {chapter.pages[currentPage - 1].caption && (
                    <div className="bg-void-900/90 text-center text-xs p-2 text-slate-300">
                      {chapter.pages[currentPage - 1].caption}
                    </div>
                  )}
                </div>
              )}

              {/* Right page for double spread */}
              {readingMode === 'double' && chapter.pages[currentPage] && (
                <div className="max-h-[82vh] rounded-lg overflow-hidden shadow-2xl border border-void-800/80 bg-void-950 flex flex-col">
                  <img
                    src={chapter.pages[currentPage].imageUrl}
                    alt={`Page ${currentPage + 1}`}
                    className="max-h-[76vh] w-auto object-contain"
                  />
                  {chapter.pages[currentPage].caption && (
                    <div className="bg-void-900/90 text-center text-xs p-2 text-slate-300">
                      {chapter.pages[currentPage].caption}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={goToNextPage}
              className="absolute right-4 z-20 p-3 rounded-full bg-void-950/80 hover:bg-gold-500 hover:text-void-950 text-slate-200 border border-void-800 transition-all shadow-xl"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
          </>
        )}
      </div>

      {/* Bottom Progress & Quick Jump Bar */}
      <div className="h-14 border-t border-void-800/80 bg-void-950/90 backdrop-blur-md px-6 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          {contentView === 'pages' && hasPages ? (
            <>
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="text-xs font-semibold uppercase tracking-wider text-gold-400 hover:text-white"
              >
                {showThumbnails ? 'Hide Thumbnails' : 'Page Thumbnails'}
              </button>
              <span>•</span>
              <span>
                Page <strong className="text-white">{currentPage}</strong> of{' '}
                <strong className="text-white">{totalPages}</strong>
              </span>
            </>
          ) : (
            <span className="text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              <span>Novel / Script Text Chapter</span>
              {chapter.textContent && (
                <span className="text-slate-500">
                  ({chapter.textContent.trim().split(/\s+/).length} words)
                </span>
              )}
            </span>
          )}
        </div>

        {/* Thumbnail drawer (Pages Only) */}
        {contentView === 'pages' && showThumbnails && hasPages && (
          <div className="absolute bottom-14 left-0 right-0 h-28 bg-void-950/95 border-t border-void-800 p-3 flex gap-3 overflow-x-auto z-40 backdrop-blur-2xl">
            {chapter.pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  sound.playPageTurn();
                  setCurrentPage(idx + 1);
                }}
                className={`relative shrink-0 h-full aspect-[2/3] rounded-md overflow-hidden border-2 transition-all ${
                  currentPage === idx + 1
                    ? 'border-gold-500 shadow-[0_0_15px_rgba(255,215,0,0.5)] scale-105'
                    : 'border-void-800 hover:border-slate-500 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={p.imageUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-void-950/80 text-[10px] px-1 rounded text-white">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {prevChapter && (
            <button
              onClick={() => {
                sound.playClick();
                onSelectChapter(prevChapter.id);
                setCurrentPage(1);
              }}
              className="text-slate-400 hover:text-gold-400 uppercase font-semibold"
            >
              ← Prev Ch. {prevChapter.chapterNumber}
            </button>
          )}
          {nextChapter && (
            <button
              onClick={() => {
                sound.playClick();
                onSelectChapter(nextChapter.id);
                setCurrentPage(1);
              }}
              className="text-gold-400 hover:text-amber-300 font-bold uppercase"
            >
              Next Ch. {nextChapter.chapterNumber} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
