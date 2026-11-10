import React, { useState } from 'react';
import { MangaSeries, Chapter, Character } from '../../types';
import { Character3DCard } from '../characters/Character3DCard';
import { CharacterModal } from '../characters/CharacterModal';
import { MasterPosterModal, PosterKey } from '../common/MasterPosterModal';
import {
  BookOpen,
  Calendar,
  Eye,
  Bookmark,
  Share2,
  ArrowLeft,
  Sparkles,
  Layers,
  Compass,
  Film,
  Search,
  Star,
  CheckCircle2,
  Clock,
  Play,
  Download,
  Check,
  Lock,
  Unlock,
  ShieldCheck,
  Maximize2,
  Heart
} from 'lucide-react';
import { sound } from '../../data/soundEffects';
import { ReaderAccount } from '../../types';
import { isChapterUnlocked, downloadWatermarkedChapter } from '../../services/storage';
import { engagementService } from '../../services/realEngagement';

interface MangaDetailPageProps {
  manga: MangaSeries;
  onBackToLibrary: () => void;
  onReadChapter: (chapterId: string) => void;
  onOpenStudioForManga: (mangaId: string) => void;
  readerAccount: ReaderAccount;
  onOpenPaymentModal: (chapter?: Chapter, mode?: 'chapter' | 'membership') => void;
}

export const MangaDetailPage: React.FC<MangaDetailPageProps> = ({
  manga,
  onBackToLibrary,
  onReadChapter,
  onOpenStudioForManga,
  readerAccount,
  onOpenPaymentModal,
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'arcs' | 'characters' | 'lore'>('chapters');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [chapterSearch, setChapterSearch] = useState<string>('');
  const [selectedPartFilter, setSelectedPartFilter] = useState<number | 'all'>('all');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [chapterViewMode, setChapterViewMode] = useState<'by-arc' | 'all'>('by-arc');
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [posterModalKey, setPosterModalKey] = useState<PosterKey | null>(null);

  const handleDownloadChapter = (e: React.MouseEvent, chapter: Chapter) => {
    e.stopPropagation();
    sound.playClick();
    const unlocked = isChapterUnlocked(readerAccount, chapter);
    if (!unlocked) {
      onOpenPaymentModal(chapter, 'chapter');
      return;
    }
    downloadWatermarkedChapter(chapter, readerAccount);
  };

  const handleReadClick = (chapter: Chapter) => {
    sound.playClick();
    const unlocked = isChapterUnlocked(readerAccount, chapter);
    if (!unlocked) {
      onOpenPaymentModal(chapter, 'chapter');
      return;
    }
    onReadChapter(chapter.id);
  };

  const handleShareChapter = async (e: React.MouseEvent, chapter: Chapter) => {
    e.stopPropagation();
    sound.playClick();
    const title = `${manga.title} - Ch. ${chapter.chapterNumber}: ${chapter.title}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Read Chapter ${chapter.chapterNumber} on SUKA SRI ORIGINALS!`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(`Copied link to Chapter ${chapter.chapterNumber}!`);
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  const publishedChapters = manga.chapters
    .filter((c) => !c.isDraft)
    .sort((a, b) => b.chapterNumber - a.chapterNumber);

  const filteredChapters = publishedChapters.filter((c) => {
    if (selectedPartFilter !== 'all' && c.partId !== selectedPartFilter) return false;
    if (chapterSearch.trim()) {
      const q = chapterSearch.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.chapterNumber.toString().includes(q) ||
        c.arcTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const firstChapter = publishedChapters[publishedChapters.length - 1];
  const latestChapter = publishedChapters[0];

  const handleBookmark = () => {
    sound.playCelestialChime();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Back Button Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <button
          onClick={() => {
            sound.playClick();
            onBackToLibrary();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-void-900 border border-void-800 text-xs font-semibold text-slate-300 hover:text-gold-400 hover:border-gold-500/40 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Series Catalog</span>
        </button>
      </div>

      {/* Hero Panoramic Header */}
      <div className="relative mt-2 overflow-hidden border-y border-void-800 bg-void-950">
        {/* Blurred backdrop image */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <img
            src={manga.bannerUrl || manga.coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/80 to-void-950/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Column: Vertical Poster Cover */}
            <div className="w-full sm:w-64 md:w-72 shrink-0 flex flex-col items-center">
              <div
                onClick={() => {
                  sound.playClick();
                  setPosterModalKey('grand-saga');
                }}
                className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-gold-500/40 shadow-[0_0_40px_rgba(255,215,0,0.25)] group bg-void-900 cursor-pointer"
                title="Click to inspect official 93-characters Master Poster in 8K"
              >
                <img
                  src={manga.coverUrl}
                  alt={manga.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Format & Status Pills */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-void-950/90 text-gold-400 border border-gold-500/40 shadow-lg backdrop-blur-md">
                    {manga.format}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      manga.status === 'Ongoing'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : manga.status === 'Completed'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {manga.status}
                  </span>
                </div>

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-void-950/90 text-gold-400 border border-gold-500/40 shadow flex items-center gap-1 backdrop-blur-md">
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>8K</span>
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-void-950/90 border border-void-800 text-xs font-mono font-bold text-gold-400 flex items-center gap-1 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-current text-gold-400" />
                  {manga.rating}
                </div>
              </div>

              {/* Quick Actions under Cover */}
              <div className="w-full space-y-2 mt-4">
                <button
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('grand-saga');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500/20 to-amber-500/20 hover:from-gold-500/30 hover:to-amber-500/30 text-gold-300 border border-gold-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,215,0,0.1)] cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                  <span>Inspect 8K Master Posters</span>
                </button>

                <div className="w-full grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBookmark}
                    className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                      isBookmarked
                        ? 'bg-gold-500 text-void-950 border-gold-400 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                        : 'bg-void-900 text-slate-300 hover:text-white border-void-800 hover:border-gold-500/30'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenStudioForManga(manga.id);
                    }}
                    className="py-2 rounded-xl bg-electric-500/10 hover:bg-electric-500/20 border border-electric-500/30 text-electric-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    + Add Chapter
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Metadata, Synopsis, Buttons */}
            <div className="flex-1 w-full space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-400 text-[11px] font-black tracking-widest uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    3 PARTS • 450 CHAPTERS • 28 ARCS
                  </span>
                  <span className="text-violet-400 text-xs font-bold tracking-widest uppercase">
                    SUKA SRI ORIGINALS EXCLUSIVE • {manga.language}
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-wide uppercase leading-tight">
                  {manga.title}
                </h1>

                {manga.japaneseTitle && (
                  <p className="font-display text-base sm:text-lg text-gold-400 font-semibold tracking-wider mt-1">
                    {manga.japaneseTitle}
                  </p>
                )}

                <p className="mt-2 text-slate-300 text-xs sm:text-sm italic border-l-2 border-gold-500/70 pl-3 py-0.5 leading-relaxed">
                  "The future is not decided by power alone. It is created by the choices we make together."
                </p>
              </div>

              {/* Author & Stats bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 border-y border-void-800/80 py-3">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Author</span>
                  <strong className="text-white">{manga.author}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Studio / Brand</span>
                  <strong className="text-gold-400 font-bold">SUKA SRI</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Planned Scale</span>
                  <strong className="text-gold-400">3 Parts • 450 Chapters</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Canonical Arcs</span>
                  <strong className="text-electric-400">28 Story Arcs</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Published</span>
                  <strong className={publishedChapters.length > 0 ? "text-emerald-400" : "text-amber-400"}>
                    {publishedChapters.length} Chapters
                  </strong>
                </div>
              </div>

              {/* 3 Parts Quick Architecture Overview with Interactive 8K Posters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Part 1 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('part-1');
                  }}
                  className="p-3 rounded-xl bg-void-950/80 border border-amber-500/30 hover:border-amber-400/80 flex gap-3 items-center cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                  title="Click to inspect Part 1 poster in 8K Ultra-HD"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden border border-amber-500/40 shrink-0 bg-void-900 relative">
                    <img src="/images/part1-poster.jpg" alt="Part 1 Poster" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">PART 1</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">POWER</span>
                    </div>
                    <h4 className="font-display text-xs font-bold text-white mt-0.5 truncate group-hover:text-amber-300 transition-colors">Rise of the Empire</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">10 Arcs • Ch. 001–150</span>
                  </div>
                </div>

                {/* Part 2 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('part-2');
                  }}
                  className="p-3 rounded-xl bg-void-950/80 border border-rose-500/30 hover:border-rose-400/80 flex gap-3 items-center cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                  title="Click to inspect Part 2 poster in 8K Ultra-HD"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden border border-rose-500/40 shrink-0 bg-void-900 relative">
                    <img src="/images/part2-poster.jpg" alt="Part 2 Poster" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">PART 2</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">TRUTH</span>
                    </div>
                    <h4 className="font-display text-xs font-bold text-white mt-0.5 truncate group-hover:text-rose-300 transition-colors">The Dark Shadow</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">11 Arcs • Ch. 151–300</span>
                  </div>
                </div>

                {/* Part 3 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('part-3');
                  }}
                  className="p-3 rounded-xl bg-void-950/80 border border-electric-500/30 hover:border-electric-400/80 flex gap-3 items-center cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                  title="Click to inspect Part 3 poster in 8K Ultra-HD"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden border border-electric-500/40 shrink-0 bg-void-900 relative">
                    <img src="/images/part3-poster.jpg" alt="Part 3 Poster" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-electric-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-electric-400">PART 3</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-electric-500/20 text-electric-300 border border-electric-500/30">CHOICE</span>
                    </div>
                    <h4 className="font-display text-xs font-bold text-white mt-0.5 truncate group-hover:text-electric-300 transition-colors">The Era of Zero</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">10 Arcs • Ch. 301–450</span>
                  </div>
                </div>
              </div>

              {/* Genres Pills */}
              <div className="flex flex-wrap gap-2">
                {manga.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg bg-void-900 border border-void-800 text-[11px] font-semibold text-slate-300 hover:border-gold-500/30 transition-colors"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-1.5">
                  Official Synopsis
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {manga.synopsis}
                </p>
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {firstChapter ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onReadChapter(firstChapter.id);
                    }}
                    className="px-7 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 via-amber-500 to-electric-400 text-void-950 hover:brightness-110 shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all flex items-center gap-2 active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read First Chapter (Ch. {firstChapter.chapterNumber})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenStudioForManga(manga.id);
                    }}
                    className="px-7 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 hover:brightness-110 shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all flex items-center gap-2 active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    + Upload Chapter 1 (Creator Studio)
                  </button>
                )}

                {latestChapter && latestChapter.id !== firstChapter?.id && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onReadChapter(latestChapter.id);
                    }}
                    className="px-6 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-void-900 text-slate-200 hover:text-white border border-void-700 hover:border-gold-500/50 shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Clock className="w-4 h-4 text-electric-400" />
                    Latest (Ch. {latestChapter.chapterNumber})
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('arcs');
                  }}
                  className="px-5 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-void-900 text-slate-300 hover:text-white border border-void-800 hover:border-gold-500/40 transition-all flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-gold-400" />
                  View 30+ Arcs Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex border-b border-void-800 gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('chapters');
            }}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 relative transition-all ${
              activeTab === 'chapters'
                ? 'text-gold-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Chapters ({publishedChapters.length})
            {activeTab === 'chapters' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 via-amber-400 to-electric-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('arcs');
            }}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 relative transition-all ${
              activeTab === 'arcs'
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Saga & 28 Story Arcs ({manga.arcs?.length || 28})
            {activeTab === 'arcs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('characters');
            }}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 relative transition-all ${
              activeTab === 'characters'
                ? 'text-electric-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Characters ({manga.characters?.length || 0})
            {activeTab === 'characters' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('lore');
            }}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 relative transition-all ${
              activeTab === 'lore'
                ? 'text-violet-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            World & Lore ({manga.loreLocations?.length || 0})
            {activeTab === 'lore' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: CHAPTERS LISTING */}
        {activeTab === 'chapters' && (
          <div className="py-8 space-y-6">
            {/* VIP Monthly Membership Promotional Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-void-900 via-void-950 to-void-900 border border-gold-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(255,215,0,0.1)]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs uppercase tracking-wider text-gold-400">
                      SUKA SRI VIP Monthly All-Access
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-400 border border-electric-500/30 font-bold uppercase">
                      ₹19 / $0.50 Per Month
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Get full, unrestricted reading and licensed downloads for all 450 chapters across Part 1, Part 2 & Part 3. Individual chapters are ₹49 / $1.00.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenPaymentModal(undefined, 'membership');
                }}
                className="shrink-0 w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-void-950 font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Unlock All Chapters (₹19 / $0.50)
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-void-900 border border-void-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search chapters or arcs..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full bg-void-950 border border-void-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Part selector if multiple parts exist */}
              {manga.parts && manga.parts.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                  <button
                    onClick={() => setSelectedPartFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedPartFilter === 'all'
                        ? 'bg-gold-500 text-void-950 font-bold'
                        : 'bg-void-950 text-slate-400 border border-void-800 hover:text-white'
                    }`}
                  >
                    All Parts (28 Arcs)
                  </button>
                  {manga.parts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPartFilter(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                        selectedPartFilter === p.id
                          ? 'bg-gold-500 text-void-950 font-bold'
                          : 'bg-void-950 text-slate-400 border border-void-800 hover:text-white'
                      }`}
                    >
                      Part {p.number} • {p.theme || p.title}
                    </button>
                  ))}
                </div>
              )}

              {/* View Switcher: Separated by Arc vs All Grid */}
              <div className="flex items-center bg-void-950 p-1 rounded-xl border border-void-800 shrink-0">
                <button
                  onClick={() => setChapterViewMode('by-arc')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    chapterViewMode === 'by-arc'
                      ? 'bg-gold-500 text-void-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> By Arc
                </button>
                <button
                  onClick={() => setChapterViewMode('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    chapterViewMode === 'all'
                      ? 'bg-gold-500 text-void-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> All Grid
                </button>
              </div>
            </div>

            {/* VIEW MODE 1: EMPTY CHAPTER LISTS SEPARATED BY ARC */}
            {chapterViewMode === 'by-arc' && (
              <div className="space-y-6">
                {(manga.arcs || [])
                  .filter((arc) => (selectedPartFilter === 'all' ? true : arc.partId === selectedPartFilter))
                  .filter((arc) => {
                    if (!chapterSearch.trim()) return true;
                    const q = chapterSearch.toLowerCase();
                    return (
                      arc.title.toLowerCase().includes(q) ||
                      arc.arcNumber.toString().includes(q) ||
                      publishedChapters.some(
                        (c) =>
                          (c.arcId === arc.id || c.arcTitle === arc.title) &&
                          (c.title.toLowerCase().includes(q) || c.chapterNumber.toString().includes(q))
                      )
                    );
                  })
                  .map((arc) => {
                    const arcChapters = publishedChapters.filter(
                      (c) => c.arcId === arc.id || c.arcTitle === arc.title
                    );
                    const part = (manga.parts || []).find((p) => p.id === arc.partId);

                    return (
                      <div
                        key={arc.id}
                        className="rounded-2xl bg-void-900 border border-void-800 p-5 space-y-4 hover:border-gold-500/30 transition-all shadow-lg"
                      >
                        {/* Arc Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-void-800/80">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 rounded-lg overflow-hidden border border-void-700 bg-void-950 shrink-0">
                              <img src={arc.coverUrl || manga.coverUrl} alt={arc.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-gold-400">
                                  ARC {arc.arcNumber.toString().padStart(2, '0')}
                                </span>
                                {part && (
                                  <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-void-950 text-slate-400 border border-void-800">
                                    Part {part.number} • {part.theme}
                                  </span>
                                )}
                                <span className="text-[11px] font-mono text-slate-400">
                                  {arc.chapterRange}
                                </span>
                              </div>
                              <h4 className="font-display text-base font-bold text-white mt-0.5">
                                {arc.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                arcChapters.length > 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-void-950 text-amber-400/90 border border-amber-500/30'
                              }`}
                            >
                              {arcChapters.length > 0
                                ? `${arcChapters.length} Released`
                                : 'Empty Arc (0 Chapters)'}
                            </span>
                            <button
                              onClick={() => onOpenStudioForManga(manga.id)}
                              className="text-[11px] font-bold text-electric-400 hover:text-white px-3 py-1.5 rounded-lg bg-electric-500/10 hover:bg-electric-500/20 border border-electric-500/30 transition-all uppercase tracking-wider"
                            >
                              + Add Chapter
                            </button>
                          </div>
                        </div>

                        {/* Chapters in this Arc or Empty Arc State */}
                        {arcChapters.length === 0 ? (
                          <div className="py-4 px-4 rounded-xl bg-void-950/50 border border-dashed border-void-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="leading-relaxed">
                              Empty Arc · Chapters across <strong className="text-slate-300">{arc.chapterRange}</strong> have not been published yet.
                            </span>
                            <button
                              onClick={() => onOpenStudioForManga(manga.id)}
                              className="text-gold-400 hover:text-gold-300 text-xs font-bold underline shrink-0 inline-flex items-center gap-1"
                            >
                              Publish for this Arc &rarr;
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {arcChapters.map((ch, idx) => {
                              const isUnlocked = isChapterUnlocked(readerAccount, ch);
                              return (
                                <div
                                  key={ch.id}
                                  className="group rounded-xl bg-void-950 border border-void-800 hover:border-gold-500/50 p-3.5 transition-all flex flex-col justify-between"
                                >
                                  <div className="flex gap-3 items-start">
                                    <div
                                      onClick={() => handleReadClick(ch)}
                                      className="relative w-16 h-20 rounded-lg overflow-hidden bg-void-900 border border-void-800 shrink-0 cursor-pointer"
                                    >
                                      <img
                                        src={ch.coverUrl || manga.coverUrl}
                                        alt={ch.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <span className="absolute bottom-1 right-1 bg-void-950/90 text-gold-400 text-[9px] font-bold px-1 rounded font-mono">
                                        TXT
                                      </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-display font-bold text-gold-400 text-xs">
                                          CH. {ch.chapterNumber}
                                        </span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                            isUnlocked
                                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                              : 'bg-gold-500/20 text-gold-400 border-gold-500/30'
                                          }`}
                                        >
                                          {isUnlocked ? (
                                            <>
                                              <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                                              {ch.chapterNumber === 1 || ch.accessType === 'free' ? 'FREE' : 'UNLOCKED'}
                                            </>
                                          ) : (
                                            <>
                                              <Lock className="w-2.5 h-2.5 text-gold-400" />
                                              ₹49 / $1
                                            </>
                                          )}
                                        </span>
                                      </div>

                                      <h4
                                        onClick={() => handleReadClick(ch)}
                                        className="font-display text-xs font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1 cursor-pointer"
                                      >
                                        {ch.title}
                                      </h4>

                                      <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-1.5 flex-wrap">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-slate-500" />
                                          {ch.releaseDate}
                                        </span>
                                        <span className="flex items-center gap-1" title="Real Viewer Reads">
                                          <Eye className="w-3 h-3 text-slate-500" />
                                          {engagementService.getChapterViews(ch.id, ch.views).toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-pink-400" title="Reader Likes">
                                          <Heart className="w-3 h-3 text-pink-400 fill-pink-400/40" />
                                          {engagementService.getChapterLikes(ch.id, ch.likes).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Read, Download, Share Controls */}
                                  <div className="mt-3 pt-2.5 border-t border-void-800/80 flex items-center justify-between text-xs">
                                    <button
                                      onClick={() => handleReadClick(ch)}
                                      className={`font-bold text-xs flex items-center gap-1 ${
                                        isUnlocked ? 'text-gold-400 hover:text-gold-300' : 'text-amber-400 hover:text-amber-300'
                                      }`}
                                    >
                                      {isUnlocked ? <BookOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                      {isUnlocked ? 'Read' : 'Unlock (₹49 / $1)'}
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={(e) => handleDownloadChapter(e, ch)}
                                        title={isUnlocked ? 'Download Licensed Copy' : 'Unlock Chapter to Download (₹49 / $1)'}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                          isUnlocked
                                            ? 'bg-void-900 hover:bg-gold-500 hover:text-void-950 text-slate-400'
                                            : 'bg-gold-500/10 text-gold-400 border border-gold-500/30 hover:bg-gold-500 hover:text-void-950'
                                        }`}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => handleShareChapter(e, ch)}
                                        title="Share Chapter Link"
                                        className="p-1.5 rounded-lg bg-void-900 hover:bg-electric-400 hover:text-void-950 text-slate-400 transition-colors"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* VIEW MODE 2: ALL PUBLISHED CHAPTERS GRID */}
            {chapterViewMode === 'all' && (
              <div>
                {filteredChapters.length === 0 ? (
                  <div className="text-center py-16 bg-void-900/40 rounded-3xl border border-dashed border-void-800 p-8 max-w-2xl mx-auto">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="font-display text-lg font-bold text-slate-200">No Chapters Uploaded Yet</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-5 leading-relaxed">
                      This 450-chapter saga is partitioned across 3 parts and 28 canonical arcs. Once you publish Chapter 1 via Creator Studio, it will appear here and become readable in the library.
                    </p>
                    <button
                      onClick={() => onOpenStudioForManga(manga.id)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:brightness-110 transition-all inline-flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      + Upload Chapter 1 in Creator Studio
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredChapters.map((ch, idx) => {
                      const isUnlocked = isChapterUnlocked(readerAccount, ch);
                      return (
                        <div
                          key={ch.id}
                          className="group rounded-2xl bg-void-900 border border-void-800 hover:border-gold-500/50 p-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,215,0,0.18)] flex flex-col justify-between"
                        >
                          <div className="flex gap-4 items-start">
                            <div
                              onClick={() => handleReadClick(ch)}
                              className="relative w-20 h-24 rounded-xl overflow-hidden bg-void-950 border border-void-800 shrink-0 cursor-pointer"
                            >
                              <img
                                src={ch.coverUrl || manga.coverUrl}
                                alt={ch.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-1 right-1 bg-void-950/90 text-gold-400 text-[10px] font-bold px-1 rounded font-mono">
                                TXT
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-display font-bold text-gold-400 text-sm">
                                  CH. {ch.chapterNumber}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                    isUnlocked
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-gold-500/20 text-gold-400 border-gold-500/30'
                                  }`}
                                >
                                  {isUnlocked ? (
                                    <>
                                      <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                                      {ch.chapterNumber === 1 || ch.accessType === 'free' ? 'FREE' : 'UNLOCKED'}
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-2.5 h-2.5 text-gold-400" />
                                      ₹49 / $1
                                    </>
                                  )}
                                </span>
                              </div>

                              <h4
                                onClick={() => handleReadClick(ch)}
                                className="font-display text-sm font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1 cursor-pointer"
                              >
                                {ch.title}
                              </h4>

                              <span className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase block mt-1 line-clamp-1">
                                {ch.arcTitle}
                              </span>

                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {ch.releaseDate}
                              </span>
                            </div>
                          </div>

                          {/* Read, Download, Share Controls */}
                          <div className="mt-3 pt-3 border-t border-void-800/80 flex items-center justify-between text-xs text-slate-400">
                            <button
                              onClick={() => handleReadClick(ch)}
                              className={`font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${
                                isUnlocked ? 'text-gold-400' : 'text-amber-400'
                              }`}
                            >
                              {isUnlocked ? 'Read Chapter' : 'Unlock Chapter'} {isUnlocked ? <BookOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDownloadChapter(e, ch)}
                              title="Download Chapter"
                              className="p-1.5 rounded-lg bg-void-950 hover:bg-gold-500 hover:text-void-950 text-slate-400 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleShareChapter(e, ch)}
                              title="Share Chapter Link"
                              className="p-1.5 rounded-lg bg-void-950 hover:bg-electric-400 hover:text-void-950 text-slate-400 transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAGA ARCHITECTURE & 28 CANONICAL ARCS */}
        {activeTab === 'arcs' && (
          <div className="py-8 space-y-10">
            {/* Header info */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-gold-400 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 inline-block">
                CANONICAL ARCHITECTURE • 3 PARTS • 450 CHAPTERS • 28 ARCS
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
                The Master Saga Roadmap
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Created by Srinivas Vennu. Explore the three grand movements of destiny, spanning 28 canonical arcs and 450 chapters.
              </p>
            </div>

            {/* 3 Parts Container */}
            <div className="space-y-12">
              {(manga.parts && manga.parts.length > 0 ? manga.parts : []).map((part) => {
                const partArcs = (manga.arcs || []).filter((a) => a.partId === part.id);
                const themeStyles =
                  part.number === 1
                    ? {
                        border: 'border-amber-500/40',
                        glow: 'shadow-[0_0_40px_rgba(245,158,11,0.12)]',
                        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                        accent: 'text-amber-400',
                        gradient: 'from-amber-950/30 via-void-900 to-void-950',
                      }
                    : part.number === 2
                    ? {
                        border: 'border-rose-500/40',
                        glow: 'shadow-[0_0_40px_rgba(244,63,94,0.12)]',
                        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                        accent: 'text-rose-400',
                        gradient: 'from-rose-950/30 via-void-900 to-void-950',
                      }
                    : {
                        border: 'border-electric-500/40',
                        glow: 'shadow-[0_0_40px_rgba(0,229,255,0.12)]',
                        badge: 'bg-electric-500/20 text-electric-300 border-electric-500/40',
                        accent: 'text-electric-400',
                        gradient: 'from-cyan-950/30 via-void-900 to-void-950',
                      };

                return (
                  <div
                    key={part.id}
                    className={`rounded-3xl border ${themeStyles.border} ${themeStyles.glow} bg-gradient-to-br ${themeStyles.gradient} p-6 sm:p-8 space-y-6`}
                  >
                    {/* Part Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-void-800">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-black tracking-widest text-slate-400 uppercase">
                            PART {part.number}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${themeStyles.badge}`}>
                            THEME: {part.theme || 'CANON'}
                          </span>
                          {part.chapterRange && (
                            <span className="text-[10px] font-mono font-bold text-slate-300 bg-void-950 px-2.5 py-0.5 rounded border border-void-800">
                              {part.chapterRange}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
                          {part.title}
                        </h3>

                        {part.japaneseTitle && (
                          <span className={`font-display text-sm font-semibold tracking-wider ${themeStyles.accent}`}>
                            {part.japaneseTitle}
                          </span>
                        )}

                        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                          {part.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Arcs Included</span>
                        <span className="font-display text-xl sm:text-2xl font-black text-white">
                          {partArcs.length} Arcs
                        </span>
                      </div>
                    </div>

                    {/* Arcs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {partArcs.map((arc) => (
                        <div
                          key={arc.id}
                          className="rounded-2xl bg-void-950/90 border border-void-800/80 hover:border-gold-500/40 p-4 flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-mono font-bold text-gold-400 text-[11px]">
                                ARC {arc.arcNumber.toString().padStart(2, '0')}
                              </span>
                              {arc.chapterRange && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  {arc.chapterRange}
                                </span>
                              )}
                            </div>

                            <h4 className="font-display text-sm font-bold text-white mb-2 leading-snug">
                              {arc.title}
                            </h4>

                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                              {arc.summary}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-void-800/80 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 uppercase font-semibold">Canon Arc</span>
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                arc.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : arc.status === 'Ongoing'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-electric-500/10 text-electric-400 border border-electric-500/20'
                              }`}
                            >
                              {arc.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="py-8">
            {(!manga.characters || manga.characters.length === 0) ? (
              <div className="text-center py-16 bg-void-900/40 rounded-3xl border border-dashed border-void-800 p-8">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="font-display text-lg font-bold text-slate-300">No Character Profiles Yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Use the Creator Studio Character Studio to add characters for {manga.title}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {manga.characters.map((char) => (
                  <Character3DCard
                    key={char.id}
                    character={char}
                    onInspect={(c) => setSelectedCharacter(c)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WORLD & LORE */}
        {activeTab === 'lore' && (
          <div className="py-8 space-y-6">
            {(!manga.loreLocations || manga.loreLocations.length === 0) ? (
              <div className="text-center py-16 bg-void-900/40 rounded-3xl border border-dashed border-void-800 p-8">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="font-display text-lg font-bold text-slate-300">No World Archives Yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Add realm locations and historical events in Creator Studio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {manga.loreLocations.map((loc) => (
                  <div key={loc.id} className="rounded-2xl bg-void-900 border border-void-800 overflow-hidden shadow-xl">
                    <img src={loc.imageUrl} alt={loc.name} className="w-full h-44 object-cover" />
                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                        {loc.type} • {loc.realm}
                      </span>
                      <h4 className="font-display text-lg font-bold text-white mt-1">{loc.name}</h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{loc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Character Modal Inspector */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}

      {/* 8K Master Poster Inspection Modal */}
      {posterModalKey && (
        <MasterPosterModal
          initialPoster={posterModalKey}
          onClose={() => setPosterModalKey(null)}
        />
      )}
    </div>
  );
};
