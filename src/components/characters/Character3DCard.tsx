import React, { useState, useRef } from 'react';
import { Character } from '../../types';
import { sound } from '../../data/soundEffects';
import { Shield, Zap, Sparkles, Sword } from 'lucide-react';

interface Character3DCardProps {
  character: Character;
  onInspect: (character: Character) => void;
}

export const Character3DCard: React.FC<Character3DCardProps> = ({ character, onInspect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseEnter = () => {
    sound.playHoloShimmer();
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((p) => ({ ...p, opacity: 0 }));
  };

  const themeBorder: Record<string, string> = {
    electric: 'hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(0,229,255,0.45)]',
    gold: 'hover:border-amber-400 hover:shadow-[0_0_35px_rgba(255,215,0,0.45)]',
    violet: 'hover:border-purple-500 hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]',
    pink: 'hover:border-pink-400 hover:shadow-[0_0_35px_rgba(244,114,182,0.45)]',
    rose: 'hover:border-rose-400 hover:shadow-[0_0_35px_rgba(251,113,133,0.45)]',
    crimson: 'hover:border-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.45)]',
    emerald: 'hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]',
    amber: 'hover:border-amber-500 hover:shadow-[0_0_35px_rgba(245,158,11,0.45)]',
    sapphire: 'hover:border-blue-400 hover:shadow-[0_0_35px_rgba(59,130,246,0.45)]',
    teal: 'hover:border-teal-400 hover:shadow-[0_0_35px_rgba(20,184,166,0.45)]',
    indigo: 'hover:border-indigo-400 hover:shadow-[0_0_35px_rgba(99,102,241,0.45)]',
  };

  const themeAccent: Record<string, string> = {
    electric: 'text-cyan-400 bg-cyan-500/15 border-cyan-400/40',
    gold: 'text-amber-400 bg-amber-500/15 border-amber-400/40',
    violet: 'text-purple-400 bg-purple-500/15 border-purple-400/40',
    pink: 'text-pink-400 bg-pink-500/15 border-pink-400/40',
    rose: 'text-rose-400 bg-rose-500/15 border-rose-400/40',
    crimson: 'text-red-400 bg-red-500/15 border-red-400/40',
    emerald: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/40',
    amber: 'text-amber-400 bg-amber-500/15 border-amber-400/40',
    sapphire: 'text-blue-400 bg-blue-500/15 border-blue-400/40',
    teal: 'text-teal-400 bg-teal-500/15 border-teal-400/40',
    indigo: 'text-indigo-400 bg-indigo-500/15 border-indigo-400/40',
  };

  const themeAura: Record<string, string> = {
    electric: 'from-cyan-950 via-void-950 to-void-950',
    gold: 'from-amber-950 via-void-950 to-void-950',
    violet: 'from-purple-950 via-void-950 to-void-950',
    pink: 'from-pink-950 via-void-950 to-void-950',
    rose: 'from-rose-950 via-void-950 to-void-950',
    crimson: 'from-red-950 via-void-950 to-void-950',
    emerald: 'from-emerald-950 via-void-950 to-void-950',
    amber: 'from-yellow-950 via-void-950 to-void-950',
    sapphire: 'from-blue-950 via-void-950 to-void-950',
    teal: 'from-teal-950 via-void-950 to-void-950',
    indigo: 'from-indigo-950 via-void-950 to-void-950',
  };

  // Determine image display mode
  const isHdPhoto =
    character.avatarUrl.includes('/hd/') ||
    character.avatarUrl.includes('Portrait_Crops');

  const isSyndicateColor =
    character.avatarUrl.includes('canon_exact') &&
    (character.rosterNumber ? character.rosterNumber >= 82 : false);

  const isFullBleed = isHdPhoto || isSyndicateColor;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        sound.playClick();
        onInspect(character);
      }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className={`relative cursor-pointer rounded-2xl overflow-hidden bg-void-900 border border-void-800 ${
        themeBorder[character.themeColor] || themeBorder.gold
      } transition-shadow duration-300 group flex flex-col`}
    >
      {/* Dynamic Holographic Glare Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(0, 229, 255, 0.2) 25%, transparent 60%)`,
        }}
      />

      {/* Character Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-void-950">
        <div className="w-full h-full relative">
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 filter contrast-[1.12] brightness-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-900 via-transparent to-transparent opacity-90" />
          <div
            className={`absolute bottom-3 left-4 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase border ${
              isHdPhoto
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-gold-500/20 border-gold-400/50 text-gold-300'
            }`}
          >
            {isHdPhoto ? 'HD MASTER ART' : `CANON PERSONA #${character.rosterNumber ? String(character.rosterNumber).padStart(2, '0') : ''}`}
          </div>
        </div>

        {/* Japanese Title Badge */}
        {character.japaneseName && (
          <div className="absolute top-3 right-3 writing-vertical px-1.5 py-2 rounded bg-void-950/85 backdrop-blur-md text-[10px] font-bold text-slate-200 tracking-widest uppercase border border-void-800">
            {character.japaneseName}
          </div>
        )}

        {/* Affinity Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${
              themeAccent[character.themeColor] || themeAccent.gold
            }`}
          >
            {character.affinity}
          </span>
          {character.rosterNumber && (
            <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-void-950/80 text-slate-300 border border-void-800">
              #{String(character.rosterNumber).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-5 flex flex-col justify-between flex-1 relative z-10 bg-void-900 border-t border-void-800/80">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              {character.role}
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
              {character.faction}
            </span>
          </div>

          <h3 className="font-display text-xl font-bold text-white tracking-wide group-hover:text-gold-300 transition-colors">
            {character.name}
          </h3>

          <p className="text-xs text-slate-300 italic mt-2 line-clamp-2 leading-relaxed">
            "{character.quote}"
          </p>
        </div>

        {/* Power Matrix Mini-Bar */}
        <div className="mt-4 pt-3 border-t border-void-800/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-slate-200 font-bold">{character.powerRadar.attack}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-slate-200 font-bold">{character.powerRadar.defense}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-200 font-bold">{character.powerRadar.speed}</span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 group-hover:translate-x-1 transition-transform">
            Dossier →
          </span>
        </div>
      </div>
    </div>
  );
};
