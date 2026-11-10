import React, { useState } from 'react';
import { BookOpen, Sparkles, Compass, ShieldCheck, Eye, Layers } from 'lucide-react';
import { Emblem3D } from '../common/Emblem3D';
import { sound } from '../../data/soundEffects';

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
  onReadChapter: (chapterId: string) => void;
  onSelectManga?: (mangaId: string) => void;
  hasPublishedChapters?: boolean;
  firstChapterId?: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onReadChapter,
  onSelectManga,
  hasPublishedChapters = false,
  firstChapterId = null,
}) => {
  const [heroDisplay, setHeroDisplay] = useState<'keyart' | '3d'>('keyart');

  return (
    <section className="relative pt-10 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Live Universe Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-void-900/90 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Official Canon Universe • Manga • Anime • Original Worlds</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl xl:text-7xl font-black text-slate-100 tracking-tight leading-[1.05] mb-6">
              SUKA SRI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-electric-400">
                ORIGINALS
              </span>
            </h1>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[11px] font-bold uppercase tracking-widest mb-3">
              A Manga Series by Srinivas Vennu
            </div>

            <p className="font-body text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-8">
              Explore the complete canonical saga of <strong className="text-electric-400 font-semibold">Shin Takamori</strong>, <strong className="text-pink-400 font-semibold">Rosey Rina Kobayashi</strong>, <strong className="text-gold-400 font-semibold">Ken Takamori</strong>, and the sapphire-blue dragon <strong className="text-cyan-400 font-semibold">Ryūjin</strong> in <em>MIRAI O TSUKURU MONO: THE ONE WHO CREATES THE FUTURE</em>. Spanning <strong className="text-white">3 Epic Parts</strong>, <strong className="text-white">450 Chapters</strong>, and <strong className="text-white">28 Canonical Arcs</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {hasPublishedChapters && firstChapterId ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    onReadChapter(firstChapterId);
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 hover:brightness-110 shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  Read Chapter 1
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onNavigate('studio');
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 hover:brightness-110 shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  Upload Chapter 1
                </button>
              )}

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('characters');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase bg-void-900 hover:bg-void-850 text-electric-400 border border-electric-500/40 hover:border-electric-400 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-electric-400" />
                Viao & Aurion Dossiers
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('lore');
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-display text-xs sm:text-sm font-bold tracking-widest uppercase text-violet-300 hover:text-white bg-void-900/60 border border-violet-500/30 hover:border-violet-500/60 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                World Codex
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 pt-8 border-t border-void-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
              <div>
                <span className="block font-display text-2xl font-black text-gold-400">3 PARTS</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Power • Truth • Choice</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-electric-400">450 CHS</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">The Complete Saga</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-violet-400">28 ARCS</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Canonical Arcs</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-5 h-5" /> CANON
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">By Srinivas Vennu</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with Toggle */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* View Switcher Pills */}
            <div className="flex items-center gap-2 mb-4 bg-void-900/90 border border-void-800 rounded-xl p-1 z-20">
              <button
                onClick={() => {
                  sound.playClick();
                  setHeroDisplay('keyart');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  heroDisplay === 'keyart'
                    ? 'bg-gold-500 text-void-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Official Saga Poster
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setHeroDisplay('3d');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  heroDisplay === '3d'
                    ? 'bg-electric-500 text-void-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> 3D WebGL Emblem
              </button>
            </div>

            {/* Visual Container */}
            <div className="relative w-full max-w-[560px] aspect-[16/11] flex items-center justify-center rounded-3xl overflow-hidden border border-gold-500/40 bg-void-900 shadow-[0_0_50px_rgba(255,215,0,0.25)]">
              {/* Glow backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/15 via-violet-600/20 to-electric-500/20 blur-2xl pointer-events-none" />

              {heroDisplay === 'keyart' ? (
                <div
                  onClick={() => {
                    if (onSelectManga) {
                      sound.playClick();
                      onSelectManga('mirai-o-tsukuru-mono');
                    }
                  }}
                  className="relative w-full h-full group cursor-pointer"
                  title="Click to view MIRAI O TSUKURU MONO dedicated series page"
                >
                  <img
                    src="/images/mirai-original-master-poster.jpg"
                    alt="MIRAI O TSUKURU MONO Original Master Poster by Srinivas Vennu"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-void-950/80 border border-gold-500/40 text-[10px] font-bold text-gold-400 uppercase tracking-widest backdrop-blur-md flex items-center gap-1 group-hover:border-gold-400 group-hover:scale-105 transition-all">
                    <span>Series Codex</span>
                    <span>→</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-200 bg-void-950/85 px-3 py-1.5 rounded-xl border border-void-800 backdrop-blur-md">
                    <span className="font-bold text-electric-400">VIAO & AURION</span>
                    <span className="font-black text-gold-400">3 Parts • 450 Chapters • 28 Arcs</span>
                    <span className="font-bold text-pink-400">Srinivas Vennu</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <Emblem3D size={360} className="drop-shadow-[0_0_35px_rgba(255,215,0,0.35)]" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">
                    Interactive Gyroscope • Move Cursor
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
