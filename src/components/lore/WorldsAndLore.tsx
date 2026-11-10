import React, { useState } from 'react';
import {
  INITIAL_LOCATIONS,
  INITIAL_FACTIONS,
  INITIAL_TIMELINE
} from '../../data/initialCanon';
import { Compass, MapPin, Flag, Clock, Globe, Shield, Sparkles } from 'lucide-react';
import { sound } from '../../data/soundEffects';

export const WorldsAndLore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'locations' | 'factions' | 'timeline'>('locations');
  const [selectedLocation, setSelectedLocation] = useState(INITIAL_LOCATIONS[0]);

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-void-900 border border-violet-500/30 text-violet-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(138,43,226,0.15)]">
            <Compass className="w-3.5 h-3.5" />
            Module 04 • Cosmological Archives
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-100 uppercase tracking-wide mb-4">
            WORLDS & LORE
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Official archives of SUKA SRI: Sovereign world quadrants, operational headquarters, ancient archives, and the Four Quadrants balancing power, truth, and choice.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl bg-void-900 p-1.5 border border-void-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('locations');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === 'locations'
                  ? 'bg-gold-500 text-void-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" /> Realm Atlas
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('factions');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === 'factions'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flag className="w-4 h-4" /> Sovereign Factions
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('timeline');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === 'timeline'
                  ? 'bg-electric-500 text-void-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" /> Timeline of Ages
            </button>
          </div>
        </div>

        {/* TAB 1: REALM ATLAS */}
        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Location selector list */}
            <div className="lg:col-span-5 space-y-4">
              {INITIAL_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedLocation(loc);
                  }}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                    selectedLocation.id === loc.id
                      ? 'bg-void-900 border-gold-500/50 shadow-[0_0_25px_rgba(255,215,0,0.2)]'
                      : 'bg-void-950 border-void-800 hover:border-void-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                      {loc.type}
                    </span>
                    <span className="text-slate-400 text-[11px]">{loc.realm}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-1">{loc.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Selected Location Feature Panel */}
            <div className="lg:col-span-7 rounded-3xl bg-void-900 border border-void-800 overflow-hidden shadow-2xl">
              {/* Tactical Header with SUKA SRI Brand Insignia & Node Classification (No Unwanted Images) */}
              <div className="relative p-6 sm:p-8 bg-gradient-to-br from-void-950 via-void-900 to-void-950 border-b border-void-800/80 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-electric-400 block font-bold">
                        SUKA SRI CANONICAL ARCHIVES • NODE {selectedLocation.id.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        QUADRANT CLASSIFICATION: {selectedLocation.realm}
                      </span>
                    </div>
                  </div>

                  <span className="px-3.5 py-1 rounded-full bg-void-900 border border-gold-500/40 text-[10px] font-black uppercase tracking-widest text-gold-400">
                    {selectedLocation.type}
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-electric-400">
                    {selectedLocation.realm}
                  </span>
                  <h2 className="font-display text-3xl font-black text-white mt-1">
                    {selectedLocation.name}
                  </h2>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedLocation.description}
                </p>

                <div className="p-5 rounded-2xl bg-void-950 border border-void-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Historical & Narrative Significance
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedLocation.historicalSignificance}
                  </p>
                </div>

                {/* Continuity & Evidence Protocol Box */}
                <div className="p-4 rounded-xl bg-void-950/60 border border-dashed border-void-800 text-[11px] text-slate-400 space-y-1">
                  <span className="text-gold-400/90 font-bold uppercase tracking-wider block">
                    Continuity & Verification Protocol:
                  </span>
                  <p className="leading-relaxed">
                    A referenced record is not proof of its contents. Transmission is not delivery; delivery is not acceptance. Owner consent and recipient free choice cannot be overridden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOVEREIGN FACTIONS */}
        {activeTab === 'factions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {INITIAL_FACTIONS.map((faction) => (
              <div
                key={faction.id}
                className="rounded-3xl bg-void-900 border border-void-800 p-8 flex flex-col justify-between hover:border-gold-500/40 transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]"
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border shadow-lg"
                    style={{
                      borderColor: faction.color,
                      backgroundColor: `${faction.color}15`,
                    }}
                  >
                    <Shield className="w-7 h-7" style={{ color: faction.color }} />
                  </div>

                  <h3 className="font-display text-2xl font-black text-white mb-2">
                    {faction.name}
                  </h3>

                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                      Leadership
                    </span>
                    <span className="text-xs font-semibold text-gold-400">
                      {faction.leader}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-void-950 border border-void-800 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      Sacred Creed
                    </span>
                    <p className="text-xs italic text-slate-200">"{faction.creed}"</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {faction.philosophy}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-void-800">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: faction.color }}
                  >
                    Canonical Order
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: TIMELINE OF AGES */}
        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto space-y-8 relative">
            {/* Center line */}
            <div className="hidden sm:block absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-gold-500 via-electric-400 to-violet-500 -translate-x-1/2 pointer-events-none" />

            {INITIAL_TIMELINE.map((event, idx) => (
              <div
                key={event.era}
                className={`flex flex-col sm:flex-row items-center gap-6 ${
                  idx % 2 === 0 ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Content Box */}
                <div className="w-full sm:w-1/2 p-6 rounded-2xl bg-void-900 border border-void-800 shadow-xl hover:border-gold-500/40 transition-all">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                      {event.era}
                    </span>
                    <span className="text-[11px] font-mono text-electric-400">
                      {event.timeframe}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {event.description}
                  </p>
                  <div className="pt-2 border-t border-void-800/80 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Catalyst:</strong> {event.catalyst}
                  </div>
                </div>

                {/* Timeline Node Badge */}
                <div className="z-10 w-9 h-9 rounded-full bg-void-950 border-2 border-gold-400 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.5)] shrink-0">
                  <span className="font-mono text-xs font-bold text-gold-400">{idx + 1}</span>
                </div>

                {/* Empty column for alignment */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
