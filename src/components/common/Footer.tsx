import React from 'react';
import { Sparkles, BookOpen, Compass, Film, Edit3, Shield, ArrowUp } from 'lucide-react';
import { sound } from '../../data/soundEffects';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  officialLogoUrl: string | null;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, officialLogoUrl }) => {
  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-void-800 bg-void-950/90 pt-16 pb-12 z-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-void-800/80">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {officialLogoUrl ? (
                <img
                  src={officialLogoUrl}
                  alt="Official Logo"
                  className="h-10 w-auto max-w-[150px] object-contain rounded"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 via-violet-600/30 to-electric-500/20 border border-gold-500/40 flex items-center justify-center">
                  <span className="font-display font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-electric-400">
                    SS
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-display text-base font-bold text-white tracking-wider">
                  SUKA SRI ORIGINALS
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">
                  MANGA • ANIME • ORIGINAL WORLDS
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A flagship digital manga universe where readers explore original sagas, inspect 3D characters, read weekly serialized chapters, and immerse in cosmic lore.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900 border border-gold-500/30 text-[10px] font-bold text-gold-400 uppercase tracking-widest">
              <Shield className="w-3 h-3" /> Original Canon Protected
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white">
              Universe Modules
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onSelectTab('home')}
                className="text-left text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-gold-400" /> Home Universe
              </button>
              <button
                onClick={() => onSelectTab('manga')}
                className="text-left text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3 h-3 text-electric-400" /> Manga Library
              </button>
              <button
                onClick={() => onSelectTab('characters')}
                className="text-left text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-violet-400" /> 3D Characters
              </button>
              <button
                onClick={() => onSelectTab('lore')}
                className="text-left text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3 h-3 text-gold-400" /> Worlds & Lore
              </button>
              <button
                onClick={() => onSelectTab('anime')}
                className="text-left text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
              >
                <Film className="w-3 h-3 text-electric-400" /> Anime Studio
              </button>
              <button
                onClick={() => onSelectTab('studio')}
                className="text-left text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 font-bold text-electric-400"
              >
                <Edit3 className="w-3 h-3" /> Creator Studio
              </button>
            </div>
          </div>

          {/* Sagas & Arcs */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white">
              Canonical Scope
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Part I: Dawn of the Celestial Blade</li>
              <li>• Part II: The Shadow Incursion</li>
              <li>• Part III: Ascension of the Cosmic Void</li>
              <li className="text-gold-400 font-semibold pt-1">Ten Canonical Arcs In Full Serialization</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SUKA SRI ORIGINALS. All rights reserved. Original Manga Canon.</p>
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-void-900 border border-void-800 text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <ArrowUp className="w-4 h-4 text-gold-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
