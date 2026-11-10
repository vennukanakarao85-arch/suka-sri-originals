import React from 'react';
import { Character } from '../../types';
import { X, Sword, Shield, Zap, Wind, Compass, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../../data/soundEffects';

interface CharacterModalProps {
  character: Character;
  onClose: () => void;
  onSelectRelatedCharacter?: (name: string) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ character, onClose }) => {
  const radarMetrics = [
    { label: 'Attack', value: character.powerRadar.attack, icon: Sword, color: 'text-gold-400' },
    { label: 'Defense', value: character.powerRadar.defense, icon: Shield, color: 'text-violet-400' },
    { label: 'Speed', value: character.powerRadar.speed, icon: Wind, color: 'text-electric-400' },
    { label: 'Energy', value: character.powerRadar.energy, icon: Zap, color: 'text-amber-400' },
    { label: 'Wisdom', value: character.powerRadar.wisdom, icon: Compass, color: 'text-emerald-400' },
  ];

  const handlePlayVoice = () => {
    sound.playCelestialChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/85 backdrop-blur-xl select-none overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-void-900 border border-void-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-8 max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-void-950/80 hover:bg-gold-500 hover:text-void-950 text-slate-300 border border-void-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Full Artwork & Holographic Frame */}
        <div className="md:w-1/2 relative bg-void-950 flex flex-col items-center justify-end overflow-hidden p-6 min-h-[400px]">
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-full h-full object-cover object-top absolute inset-0 opacity-95 filter contrast-[1.12] brightness-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/20 to-transparent pointer-events-none" />
          <div className="absolute top-4 left-4 z-20">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase bg-void-950/90 text-gold-400 border border-gold-500/40 shadow-lg backdrop-blur-md">
              CANON PERSONA #{character.rosterNumber ? String(character.rosterNumber).padStart(2, '0') : ''}
            </span>
          </div>

          {/* Character Quote Box */}
          <div className="relative z-10 w-full p-4 rounded-2xl bg-void-950/90 border border-void-800 backdrop-blur-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                Canonical Voice Inscription
              </span>
              <button
                onClick={handlePlayVoice}
                className="p-1.5 rounded-lg bg-void-900 hover:bg-gold-500 hover:text-void-950 text-slate-300 transition-colors text-xs flex items-center gap-1"
                title="Play Audio Quote"
              >
                <Volume2 className="w-3.5 h-3.5 text-electric-400" />
              </button>
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              {character.quote}
            </p>
          </div>
        </div>

        {/* Right Column: Deep Dossier & Stats */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-electric-500/10 border border-electric-500/30 text-[10px] font-black uppercase tracking-widest text-electric-400">
                {character.affinity} Affinity
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase">
                {character.role}
              </span>
            </div>
            <h2 className="font-display text-3xl font-black text-white">{character.name}</h2>
            <p className="text-xs text-gold-400 font-medium">{character.title}</p>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-void-950 p-4 rounded-xl border border-void-800">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Faction</span>
              <span className="text-slate-200 font-semibold">{character.faction}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Origin</span>
              <span className="text-slate-200 font-semibold">{character.origin}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-void-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Relic Weapon</span>
              <span className="text-gold-300 font-semibold">{character.weapon}</span>
            </div>
          </div>

          {/* Biography */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">
              Canonical Biography
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {character.biography}
            </p>
          </div>

          {/* Power Radar Bar Metrics */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-gold-400 mb-3">
              Power Matrix
            </h4>
            <div className="space-y-2.5">
              {radarMetrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                        {m.label}
                      </span>
                      <span className="font-mono text-slate-400 font-bold">{m.value} / 100</span>
                    </div>
                    <div className="w-full h-1.5 bg-void-950 rounded-full overflow-hidden border border-void-800">
                      <div
                        className="h-full bg-gradient-to-r from-gold-500 via-electric-400 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signature Abilities */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">
              Signature Techniques
            </h4>
            <div className="space-y-2">
              {character.abilities.map((ab) => (
                <div key={ab.name} className="p-3 rounded-xl bg-void-950 border border-void-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">{ab.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold uppercase">
                      {ab.element}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ab.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Canon Relationships */}
          {character.relationships && character.relationships.length > 0 && (
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">
                Universe Connections
              </h4>
              <div className="space-y-2 text-xs">
                {character.relationships.map((rel) => (
                  <div key={rel.targetName} className="p-2.5 rounded-lg bg-void-950 border border-void-800 flex flex-col">
                    <span className="font-bold text-electric-400">{rel.targetName}</span>
                    <span className="text-[11px] text-slate-300 mt-0.5">{rel.relation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
