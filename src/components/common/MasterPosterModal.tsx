import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Sparkles, Layers, Shield, Eye, Compass } from 'lucide-react';
import { sound } from '../../data/soundEffects';

export type PosterKey = 'original-master' | 'grand-saga' | 'part-1' | 'part-2' | 'part-3';

export interface PosterMeta {
  key: PosterKey;
  title: string;
  subtitle: string;
  partBadge: string;
  theme: string;
  themeColor: string;
  chapters: string;
  arcs: string;
  imageUrl: string;
  tagline: string;
  highlights: string[];
}

export const OFFICIAL_POSTERS: Record<PosterKey, PosterMeta> = {
  'original-master': {
    key: 'original-master',
    title: '未来を創る者 — Mirai o Tsukuru Mono (Original Series Master Poster)',
    subtitle: 'The One Who Creates The Future • A Manga Series by Srinivas Vennu',
    partBadge: 'ORIGINAL SAGA MASTER ARTWORK',
    theme: 'POWER • TRUTH • CHOICE',
    themeColor: 'from-gold-400 via-amber-200 to-electric-400 text-gold-300 border-gold-500/50',
    chapters: '450 Chapters Across 3 Epic Parts',
    arcs: '28 Canonical Arcs',
    imageUrl: '/images/mirai-original-master-poster.jpg',
    tagline: '“One boy. One vision. One empire. A future created by the choices of humanity.”',
    highlights: [
      'Original Series Master Visual featuring Shin Takamori & Rosey Rina Kobayashi',
      'VIAO and AURION AI Companions & The Sapphire Dragon Ryūjin',
      'Part 1: Rise of the Empire (Ch. 001–150 • POWER • 8 Arcs)',
      'Part 2: The Dark Shadow (Ch. 151–300 • TRUTH • 10 Arcs)',
      'Part 3: The Era of Zero (Ch. 301–450 • CHOICE • 10 Arcs)',
      'SUKA SRI Sovereign Headquarters & Mount Fuji Skyline'
    ]
  },
  'grand-saga': {
    key: 'grand-saga',
    title: '未来を創る者 — Mirai o Tsukuru Mono',
    subtitle: 'The One Who Creates The Future • Official 93 Canonical Personas Master Roster',
    partBadge: 'ALL 93 CANON CHARACTERS',
    theme: 'DESTINY & CREATION',
    themeColor: 'from-amber-400 to-gold-500 text-amber-300 border-amber-500/40',
    chapters: '450 Chapters Total (Complete Saga)',
    arcs: '28 Arcs Across 3 Parts',
    imageUrl: '/images/mirai-official-saga-poster.jpg',
    tagline: '“The future is not created by one hero alone. It is built by every family member, every friend, and every person who chooses hope over fear.” — Shin Takamori',
    highlights: [
      'All 93 Named Personas across 16 canonical groups',
      'Shin Takamori (Hero) & Rosey Rina Kobayashi (Heroine)',
      'Ryūjin (Guardian Dragon), Seiryū, Byakko & Sōgen',
      'The 12 Major Locations including SUKA SRI HQ & ZGS',
      'Part 3 10-Arc Structure Roadmap'
    ]
  },
  'part-1': {
    key: 'part-1',
    title: 'Part 1: Rise of the Empire',
    subtitle: '帝国興起 • 150 Chapters • Chapters 001 — 150',
    partBadge: 'PART 1 • POWER',
    theme: 'POWER & FOUNDATION',
    themeColor: 'from-amber-500 to-yellow-600 text-amber-400 border-amber-500/40',
    chapters: 'Chapters 001 — 150',
    arcs: '8 Canonical Arcs',
    imageUrl: '/images/part1-poster.jpg',
    tagline: '“One boy. One vision. One empire. The genesis of SUKA SRI under the sapphire skies of Neo-Kyoto.”',
    highlights: [
      'The awakening of Ryūjin the Guardian Dragon',
      'Shin & Rosey\'s bond and childhood companions',
      'The foundation of the sovereign Empire & Takamori legacy',
      '8 foundational arcs culminating in the Empire’s ascension'
    ]
  },
  'part-2': {
    key: 'part-2',
    title: 'Part 2: The Dark Shadow',
    subtitle: '暗黒の影 • 150 Chapters • Chapters 151 — 300',
    partBadge: 'PART 2 • TRUTH',
    theme: 'TRUTH & THE UNVERIFIED MANTLE',
    themeColor: 'from-rose-500 to-purple-600 text-rose-400 border-rose-500/40',
    chapters: 'Chapters 151 — 300',
    arcs: '10 Arcs (Concluding with THE TRUTH)',
    imageUrl: '/images/part2-poster.jpg',
    tagline: '“Two brothers. Two shadows. One destiny. Light gives birth to hope; darkness rules everything.”',
    highlights: [
      'The rise of Shadow King (Kage Takamori) & Queen Akari',
      'Syndicate covert operations and contested records',
      'The dual clash of dragons: Celestial White vs. Obsidian Dragon',
      'Climactic Arc 10: THE TRUTH (Chapters 286–300)'
    ]
  },
  'part-3': {
    key: 'part-3',
    title: 'Part 3: The Era of Zero',
    subtitle: '零の時代 • The Future We Create • Chapters 301 — 450',
    partBadge: 'PART 3 • CHOICE',
    theme: 'CHOICE & SOVEREIGN WILL',
    themeColor: 'from-cyan-400 to-purple-500 text-cyan-300 border-cyan-400/40',
    chapters: 'Chapters 301 — 450',
    arcs: '10 Grand Arcs (15 Chapters Each)',
    imageUrl: '/images/part3-poster.jpg',
    tagline: '“The future is not decided by power alone. It is created by the choices we make together.”',
    highlights: [
      'ZERO GENESIS SYSTEM (Technology × Global Intelligence)',
      'ARES NEXUS SYSTEM (Planetary Defense & Strategy)',
      'The Four Universal Quadrants: Takamori, Imperial, Syndicate, Independent',
      'The Final War: Humanity vs. The Zero Archive in Chapter 450'
    ]
  }
};

interface MasterPosterModalProps {
  initialPoster?: PosterKey;
  onClose: () => void;
}

export const MasterPosterModal: React.FC<MasterPosterModalProps> = ({
  initialPoster = 'grand-saga',
  onClose
}) => {
  const [activePoster, setActivePoster] = useState<PosterKey>(initialPoster);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const poster = OFFICIAL_POSTERS[activePoster];

  const handleSelectPoster = (key: PosterKey) => {
    sound.playClick();
    setActivePoster(key);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    sound.playClick();
    setZoomLevel((prev) => Math.min(prev + 0.35, 3));
  };

  const handleZoomOut = () => {
    sound.playClick();
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.7));
  };

  const handleResetZoom = () => {
    sound.playClick();
    setZoomLevel(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-void-950/95 backdrop-blur-2xl select-none overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-void-900 border border-void-800 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col my-4 max-h-[96vh]">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-6 bg-void-950 border-b border-void-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 block font-bold">
                SUKA SRI ORIGINALS • OFFICIAL 8K GALLERY
              </span>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide truncate max-w-md">
                {poster.title}
              </h2>
            </div>
          </div>

          {/* Poster Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-void-900 border border-void-800 shrink-0 overflow-x-auto max-w-full">
            {(['original-master', 'grand-saga', 'part-1', 'part-2', 'part-3'] as PosterKey[]).map((key) => {
              const p = OFFICIAL_POSTERS[key];
              const isActive = activePoster === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectPoster(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-void-800'
                  }`}
                >
                  {key === 'original-master'
                    ? 'Original Master Poster'
                    : key === 'grand-saga'
                    ? 'Total 93 Characters'
                    : key.toUpperCase().replace('-', ' ')}
                </button>
              );
            })}
          </div>

          {/* Close & Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={poster.imageUrl}
              download={`${poster.key}-official-master.jpg`}
              className="p-2 rounded-xl bg-void-900 hover:bg-gold-500 hover:text-void-950 text-slate-300 border border-void-800 transition-colors text-xs flex items-center gap-1"
              title="Download Full Ultra-HD Poster"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-bold">Download 8K</span>
            </a>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-void-900 hover:bg-red-500 hover:text-white text-slate-300 border border-void-800 transition-colors"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poster Canvas & Zoom Area */}
        <div className="relative flex-1 bg-void-950 overflow-hidden flex items-center justify-center p-2 sm:p-6 min-h-[380px] sm:min-h-[500px]">
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Image Container with Dynamic Scale */}
          <div
            className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={poster.imageUrl}
              alt={poster.title}
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] border border-void-700/60 filter contrast-[1.05] brightness-[1.02]"
            />
          </div>

          {/* Floating Zoom Controls Overlay */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-void-900/90 border border-void-700/80 backdrop-blur-md shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-void-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-void-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-void-800 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-400 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* Tagline Ribbon */}
          <div className="absolute bottom-4 left-4 z-20 max-w-lg hidden md:block">
            <div className="p-3 rounded-xl bg-void-950/85 border border-void-800 backdrop-blur-md">
              <p className="text-xs text-slate-200 italic leading-relaxed">
                {poster.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Metadata Drawer */}
        <div className="p-4 sm:p-5 bg-void-950 border-t border-void-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-void-900 border border-void-800">
            <div className="flex items-center gap-1.5 text-gold-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
              <Layers className="w-3.5 h-3.5" />
              <span>Saga Architecture</span>
            </div>
            <p className="text-slate-200 font-semibold">{poster.chapters}</p>
            <span className="text-slate-400 text-[11px] block mt-0.5">{poster.arcs}</span>
          </div>

          <div className="p-3 rounded-xl bg-void-900 border border-void-800">
            <div className="flex items-center gap-1.5 text-electric-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Canonical Theme</span>
            </div>
            <p className="text-slate-200 font-semibold">{poster.theme}</p>
            <span className="text-slate-400 text-[11px] block mt-0.5">Author: Srinivas Vennu</span>
          </div>

          <div className="p-3 rounded-xl bg-void-900 border border-void-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
              <Compass className="w-3.5 h-3.5" />
              <span>Key Focus</span>
            </div>
            <ul className="text-slate-300 text-[11px] space-y-0.5">
              {poster.highlights.slice(0, 2).map((h, i) => (
                <li key={i} className="truncate">• {h}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
