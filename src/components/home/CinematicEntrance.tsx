import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../../data/soundEffects';

interface CinematicEntranceProps {
  onComplete: () => void;
  officialLogoUrl: string | null;
}

export const CinematicEntrance: React.FC<CinematicEntranceProps> = ({ onComplete, officialLogoUrl }) => {
  const [phase, setPhase] = useState<'ignite' | 'reveal' | 'ready'>('ignite');

  useEffect(() => {
    sound.playCelestialChime();
    const t1 = setTimeout(() => setPhase('reveal'), 900);
    const t2 = setTimeout(() => setPhase('ready'), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleEnter = () => {
    sound.playClick();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-950 overflow-hidden select-none">
      {/* Central expanding warp rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[600px] h-[600px] rounded-full border border-electric-500/20 transition-all duration-1000 ${
            phase !== 'ignite' ? 'scale-150 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
        <div
          className={`absolute w-[450px] h-[450px] rounded-full border border-gold-500/30 transition-all duration-1000 delay-200 ${
            phase !== 'ignite' ? 'scale-125 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
        <div
          className={`absolute w-[300px] h-[300px] rounded-full border border-violet-500/40 transition-all duration-1000 delay-300 ${
            phase !== 'ignite' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
        <div className="absolute w-96 h-96 bg-gradient-to-tr from-violet-600/25 via-electric-500/20 to-gold-500/25 blur-3xl rounded-full animate-pulse-slow" />
      </div>

      {/* Main Content Reveal */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Logo / Crest */}
        <div
          className={`transition-all duration-1000 transform ${
            phase === 'ignite'
              ? 'opacity-0 scale-75 -translate-y-8'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          {officialLogoUrl ? (
            <img
              src={officialLogoUrl}
              alt="SUKA SRI ORIGINALS Logo"
              className="h-36 sm:h-48 w-auto max-w-[380px] object-contain mx-auto mb-6 drop-shadow-[0_0_40px_rgba(255,215,0,0.7)]"
            />
          ) : (
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-500/30 via-violet-600/40 to-electric-500/30 border-2 border-gold-400 flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.4)]">
              <span className="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-white to-electric-400">
                SS
              </span>
            </div>
          )}
        </div>

        {/* Cinematic Titles */}
        <div
          className={`transition-all duration-1000 delay-300 transform ${
            phase === 'ignite' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900/80 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            Original Manga Universe
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-wider text-slate-100 uppercase mb-3 drop-shadow-2xl">
            SUKA SRI <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-electric-400">ORIGINALS</span>
          </h1>

          <p className="font-body text-sm sm:text-base text-violet-300/80 tracking-[0.3em] uppercase font-medium max-w-lg mx-auto mb-8">
            MANGA • ANIME • ORIGINAL WORLDS
          </p>
        </div>

        {/* Enter Universe Button */}
        <div
          className={`transition-all duration-700 delay-500 ${
            phase === 'ready' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <button
            onClick={handleEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-display text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 via-amber-500 to-electric-400 text-void-950 shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:shadow-[0_0_45px_rgba(0,229,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>Enter the Universe</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Skip button in corner */}
        <button
          onClick={handleEnter}
          className="absolute -bottom-24 text-xs font-medium text-slate-400 hover:text-slate-200 tracking-wider uppercase transition-colors"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
