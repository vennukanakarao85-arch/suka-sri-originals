import React, { useState } from 'react';
import { Sparkles, ArrowRight, Eye, Layers, Maximize2 } from 'lucide-react';
import { sound } from '../../data/soundEffects';
import { MasterPosterModal, PosterKey } from '../common/MasterPosterModal';
import { ReaderAccount } from '../../types';
import { isOwnerOrAdmin } from '../../services/authService';

interface FeaturedSagaProps {
  onReadChapter: (chapterId: string) => void;
  onExploreCharacters: () => void;
  onSelectManga?: (mangaId: string) => void;
  hasPublishedChapters?: boolean;
  firstChapterId?: string | null;
  onOpenStudio?: () => void;
  readerAccount?: ReaderAccount;
}

export const FeaturedSaga: React.FC<FeaturedSagaProps> = ({
  onReadChapter,
  onExploreCharacters,
  onSelectManga,
  hasPublishedChapters = false,
  firstChapterId = null,
  onOpenStudio,
  readerAccount,
}) => {
  const [selectedPosterKey, setSelectedPosterKey] = useState<PosterKey | null>(null);

  const handleOpenPoster = (key: PosterKey, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setSelectedPosterKey(key);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-gold-500/30 bg-gradient-to-r from-void-900 via-void-850 to-void-900 p-8 sm:p-12 shadow-[0_0_50px_rgba(255,215,0,0.12)]">
          {/* Subtle background glow graphics */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-400 text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                The Complete Saga • A Manga Series by Srinivas Vennu
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-100 tracking-wide uppercase leading-tight">
                MIRAI O TSUKURU MONO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-electric-400">
                  THE ONE WHO CREATES THE FUTURE
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl italic border-l-2 border-gold-500/60 pl-3">
                “One boy. One vision. One empire. A future created by the choices of humanity.”
              </p>

              {/* 3 Parts Grid Cards with Interactive 8K Master Posters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Part 1 Card */}
                <div
                  onClick={(e) => handleOpenPoster('part-1', e)}
                  className="p-2.5 rounded-xl bg-void-950/80 border border-amber-500/30 hover:border-amber-400/80 flex items-center gap-3 cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                  title="Click to inspect Part 1: Rise of the Empire in 8K Ultra-HD"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden border border-amber-500/40 shrink-0 bg-void-900 relative">
                    <img src="/images/part1-poster.jpg" alt="Part 1 Poster" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest">PART 1 • POWER</span>
                      <span className="text-[8px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1 rounded">8K</span>
                    </div>
                    <h4 className="font-display text-xs font-bold text-white mt-0.5 truncate group-hover:text-amber-300 transition-colors">Rise of the Empire</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">10 Arcs • Ch. 001–150</span>
                  </div>
                </div>

                {/* Part 2 Card */}
                <div
                  onClick={(e) => handleOpenPoster('part-2', e)}
                  className="p-2.5 rounded-xl bg-void-950/80 border border-rose-500/30 hover:border-rose-400/80 flex items-center gap-3 cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                  title="Click to inspect Part 2: The Dark Shadow in 8K Ultra-HD"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden border border-rose-500/40 shrink-0 bg-void-900 relative">
                    <img src="/images/part2-poster.jpg" alt="Part 2 Poster" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="w-3 h-3 text-rose-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-rose-400 tracking-widest">PART 2 • TRUTH</span>
                      <span className="text-[8px] font-mono font-bold text-rose-300 bg-rose-500/20 px-1 rounded">8K</span>
                    </div>
                    <h4 className="font-display text-xs font-bold text-white mt-0.5 truncate group-hover:text-rose-300 transition-colors">The Dark Shadow</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">11 Arcs • Ch. 151–300</span>
                  </div>
                </div>

                {/* Part 3 Card */}
                <div
                  onClick={(e) => handleOpenPoster('part-3', e)}
                  className="p-2.5 rounded-xl bg-void-950/80 border border-electric-500/30 hover:border-electric-400/80 flex items-center gap-3 cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                  title="Click to inspect Part 3: The Era of Zero in 8K Ultra-HD"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden border border-electric-500/40 shrink-0 bg-void-900 relative">
                    <img src="/images/part3-poster.jpg" alt="Part 3 Poster" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="w-3 h-3 text-electric-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-electric-400 tracking-widest">PART 3 • CHOICE</span>
                      <span className="text-[8px] font-mono font-bold text-electric-300 bg-electric-500/20 px-1 rounded">8K</span>
                    </div>
                    <h4 className="font-display text-xs font-bold text-white mt-0.5 truncate group-hover:text-electric-300 transition-colors">The Era of Zero</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">10 Arcs • Ch. 301–450</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {hasPublishedChapters && firstChapterId ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onReadChapter(firstChapterId);
                    }}
                    className="px-6 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Read Prologue (Ch. 1)
                  </button>
                ) : isOwnerOrAdmin(readerAccount) && onOpenStudio ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenStudio();
                    }}
                    className="px-6 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Upload Chapter 1
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onReadChapter(firstChapterId || 'sample-ch-1');
                    }}
                    className="px-6 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Read Prologue (Ch. 1)
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    onExploreCharacters();
                  }}
                  className="px-6 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-void-800 text-slate-200 hover:text-white border border-void-700 hover:border-gold-500/40 transition-all flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-electric-400" />
                  View 93 Canonical Personas
                </button>

                <button
                  onClick={(e) => handleOpenPoster('grand-saga', e)}
                  className="px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500/20 to-amber-500/20 text-gold-300 hover:text-white border border-gold-500/40 hover:border-gold-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                >
                  <Maximize2 className="w-4 h-4 text-gold-400" />
                  <span>Inspect 8K Posters</span>
                </button>

                {onSelectManga && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectManga('mirai-o-tsukuru-mono');
                    }}
                    className="px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-void-800 text-gold-400 hover:text-white border border-gold-500/30 hover:border-gold-500 transition-all flex items-center gap-2"
                  >
                    <span>Series Codex</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Dual Masterpiece Showcase (Original Master Poster + Total 93 Characters) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Masterpiece 1: Original Master Poster */}
              <div
                onClick={(e) => handleOpenPoster('original-master', e)}
                className="relative group rounded-2xl overflow-hidden border-2 border-gold-400 shadow-[0_0_35px_rgba(255,215,0,0.3)] w-full cursor-pointer transition-all hover:scale-[1.02]"
                title="Click to inspect Original Series Master Poster in 8K Ultra-HD"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-void-950">
                  <img
                    src="/images/mirai-original-master-poster.jpg"
                    alt="MIRAI O TSUKURU MONO Original Series Master Poster by Srinivas Vennu"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-void-950/90 border border-gold-500/50 text-[10px] font-mono font-bold text-gold-400 flex items-center gap-1 shadow-lg backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    <span>ORIGINAL MASTER 8K</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/40 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-display font-semibold tracking-widest text-gold-400 uppercase">
                      Original Master Saga Artwork • A Manga Series by Srinivas Vennu
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-gold-300 transition-colors">
                      未来を創る者 — Mirai o Tsukuru Mono
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                      Part 1 (Ch. 1–150) • Part 2 (Ch. 151–300) • Part 3 (Ch. 301–450)
                    </p>
                  </div>
                </div>
              </div>

              {/* Masterpiece 2: Total 93 Characters Universe Poster */}
              <div
                onClick={(e) => handleOpenPoster('grand-saga', e)}
                className="relative group rounded-2xl overflow-hidden border border-electric-500/40 hover:border-electric-400/80 shadow-xl w-full cursor-pointer transition-all hover:scale-[1.02]"
                title="Click to inspect Total 93 Characters Universe Poster in 8K Ultra-HD"
              >
                <div className="relative aspect-[16/8] overflow-hidden bg-void-950">
                  <img
                    src="/images/mirai-official-saga-poster.jpg"
                    alt="Total 93 Canonical Characters Master Poster"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-void-950/90 border border-electric-500/50 text-[10px] font-mono font-bold text-electric-400 flex items-center gap-1 shadow-lg backdrop-blur-md">
                    <Layers className="w-3 h-3" />
                    <span>TOTAL 93 PERSONAS 8K</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/40 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-display font-semibold tracking-widest text-electric-300 uppercase">
                      The Complete Multiverse Codex
                    </span>
                    <h4 className="font-display text-sm font-bold text-white tracking-wide group-hover:text-electric-300 transition-colors">
                      Total 93 Characters Universe Master Poster
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8K Master Poster Inspection Modal */}
      {selectedPosterKey && (
        <MasterPosterModal
          initialPoster={selectedPosterKey}
          onClose={() => setSelectedPosterKey(null)}
        />
      )}
    </section>
  );
};
