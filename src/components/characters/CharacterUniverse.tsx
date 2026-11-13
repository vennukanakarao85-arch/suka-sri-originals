import React, { useState, useMemo } from 'react';
import { Character, ReaderAccount } from '../../types';
import { INITIAL_CHARACTERS } from '../../data/initialCanon';
import { Character3DCard } from './Character3DCard';
import { CharacterModal } from './CharacterModal';
import { MasterPosterModal, PosterKey } from '../common/MasterPosterModal';
import { Sparkles, Users, Network, Search, Filter, ShieldCheck, Maximize2, ArrowUpDown } from 'lucide-react';
import { sound } from '../../data/soundEffects';
import { isOwnerOrAdmin } from '../../services/authService';

interface CharacterUniverseProps {
  characters?: Character[];
  onOpenStudio?: () => void;
  readerAccount?: ReaderAccount;
}

export const CharacterUniverse: React.FC<CharacterUniverseProps> = ({
  characters = [],
  onOpenStudio,
  readerAccount,
}) => {
  const [selectedAffinity, setSelectedAffinity] = useState<string>('all');
  const [selectedFaction, setSelectedFaction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'roster' | 'name' | 'faction'>('roster');
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [activeView, setActiveView] = useState<'cards' | 'network'>('cards');
  const [posterModalKey, setPosterModalKey] = useState<PosterKey | null>(null);

  const characterList = characters.length > 0 ? characters : INITIAL_CHARACTERS;

  // Extract unique factions for filter
  const factions = useMemo(() => {
    const set = new Set<string>();
    characterList.forEach((c) => {
      if (c.faction) set.add(c.faction);
    });
    return Array.from(set).sort();
  }, [characterList]);

  const filteredCharacters = useMemo(() => {
    return characterList.filter((c) => {
      const matchesAffinity =
        selectedAffinity === 'all' ||
        c.affinity.toLowerCase().includes(selectedAffinity.toLowerCase());

      const matchesFaction =
        selectedFaction === 'all' ||
        (c.faction && c.faction.toLowerCase() === selectedFaction.toLowerCase());

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        (c.japaneseName && c.japaneseName.toLowerCase().includes(q)) ||
        (c.rosterNumber && String(c.rosterNumber).includes(q));

      return matchesAffinity && matchesFaction && matchesSearch;
    });
  }, [characterList, selectedAffinity, selectedFaction, searchQuery]);

  const sortedCharacters = useMemo(() => {
    return [...filteredCharacters].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'faction') {
        const fA = a.faction || '';
        const fB = b.faction || '';
        const cmp = fA.localeCompare(fB);
        if (cmp !== 0) return cmp;
        return (a.rosterNumber || 0) - (b.rosterNumber || 0);
      }
      return (a.rosterNumber || 0) - (b.rosterNumber || 0);
    });
  }, [filteredCharacters, sortBy]);

  const displayedCharacters = useMemo(() => {
    return sortedCharacters.slice(0, visibleCount);
  }, [sortedCharacters, visibleCount]);

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-void-900 border border-electric-500/30 text-electric-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Module 03 • Canonical Personas Codex
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-100 uppercase tracking-wide mb-3">
            CHARACTER UNIVERSE
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            The official 93 canonical personas of <span className="text-gold-400 font-bold">Mirai o Tsukuru Mono</span> across 16 narrative groups, created by author <span className="text-slate-200 font-semibold">Srinivas Vennu</span>.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-900/90 border border-gold-500/30 text-gold-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            93 Official Personas Loaded • Name-Wise 8K Master Gallery
          </div>
        </div>

        {/* Grand 93-Characters Master Poster Showcase Banner */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-void-900 via-void-850 to-void-900 border border-gold-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(255,215,0,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                OFFICIAL 8K CANON POSTERS & 93-PERSONAS MASTER GALLERY
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                THE GRAND SAGA MASTER ROSTER
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rendered directly from author <strong className="text-gold-400">Srinivas Vennu's</strong> official master artwork. Inspect all 93 canonical personas, center heroes Shin & Rosey, guardian dragon Ryūjin, and the official Part 1, Part 2, and Part 3 saga posters in ultra-HD resolution with interactive zoom.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('grand-saga');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  Inspect 93 Characters Poster (8K)
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('part-1');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-void-900 hover:bg-void-800 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Part 1 Poster
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('part-2');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-void-900 hover:bg-void-800 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Part 2 Poster
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setPosterModalKey('part-3');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-void-900 hover:bg-void-800 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Part 3 Poster
                </button>
              </div>
            </div>

            <div
              onClick={() => {
                sound.playClick();
                setPosterModalKey('grand-saga');
              }}
              className="relative w-full lg:w-72 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gold-500/40 shadow-2xl cursor-pointer group shrink-0"
              title="Click to view 93-Character Grand Saga Poster in 8K"
            >
              <img
                src="/images/mirai-official-saga-poster.jpg"
                alt="Mirai o Tsukuru Mono Official 93-Character Saga Poster"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="px-3 py-1.5 rounded-xl bg-void-950/90 border border-gold-500/50 text-gold-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click for 8K Zoom</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {characterList.length === 0 ? (
          <div className="py-20 text-center bg-void-900/60 rounded-3xl border border-dashed border-void-800 p-8 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4 text-gold-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              Character Universe — Clean Slate
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-md mx-auto">
              No character profiles have been pre-filled. Create and upload your original characters with 3D cards, affinity matrices, and weapons in the Creator Studio.
            </p>
            {isOwnerOrAdmin(readerAccount) && onOpenStudio && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenStudio();
                }}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                + Create Characters in Studio
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Search and Filters Bar */}
            <div className="space-y-4 mb-10 pb-6 border-b border-void-800">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, role, or roster number..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-void-900 border border-void-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Faction and Sort Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-4 h-4 text-gold-400" />
                  <select
                    value={selectedFaction}
                    onChange={(e) => {
                      sound.playClick();
                      setSelectedFaction(e.target.value);
                      setVisibleCount(24);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-void-900 border border-void-800 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors cursor-pointer"
                  >
                    <option value="all">All Groups ({characterList.length})</option>
                    {factions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-electric-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        sound.playClick();
                        setSortBy(e.target.value as 'roster' | 'name' | 'faction');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-void-900 border border-void-800 text-xs text-slate-200 focus:outline-none focus:border-electric-500 transition-colors cursor-pointer"
                    >
                      <option value="roster">Roster # (#01 to #93)</option>
                      <option value="name">Name (A — Z)</option>
                      <option value="faction">Canonical Group</option>
                    </select>
                  </div>
                </div>

                  {/* View toggle */}
                  <div className="flex rounded-xl bg-void-900 p-1 border border-void-800 ml-auto">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveView('cards');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeView === 'cards'
                          ? 'bg-gold-500 text-void-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> 3D Cards
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveView('network');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeView === 'network'
                          ? 'bg-electric-500 text-void-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" /> Codex Web
                    </button>
                  </div>
                </div>

              {/* Affinity Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {['all', 'solar', 'void', 'celestial', 'umbral', 'cosmic'].map((aff) => (
                  <button
                    key={aff}
                    onClick={() => {
                      sound.playClick();
                      setSelectedAffinity(aff);
                      setVisibleCount(24);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedAffinity === aff
                        ? 'bg-gold-500 text-void-950 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                        : 'bg-void-900 text-slate-400 hover:text-white border border-void-800 hover:border-void-700'
                    }`}
                  >
                    {aff === 'all' ? 'All Affinities' : `${aff} Affinity`}
                  </button>
                ))}
                <span className="text-xs text-slate-500 ml-auto font-mono">
                  Showing {displayedCharacters.length} of {filteredCharacters.length} personas
                </span>
              </div>
            </div>

            {/* View 1: 3D Holographic Cards */}
            {activeView === 'cards' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedCharacters.map((char) => (
                    <Character3DCard
                      key={char.id}
                      character={char}
                      onInspect={(c) => setActiveCharacter(c)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredCharacters.length && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setVisibleCount((prev) => prev + 24);
                      }}
                      className="px-8 py-3.5 rounded-xl bg-void-900 border border-gold-500/40 text-gold-400 hover:bg-gold-500 hover:text-void-950 font-display text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] cursor-pointer"
                    >
                      Load More Canonical Personas ({filteredCharacters.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View 2: Relationship Network Codex */}
            {activeView === 'network' && (
              <div className="bg-void-900/90 border border-void-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
                <div className="text-center mb-8 max-w-xl mx-auto">
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    Canonical Persona Codex
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Canonical persona records, affinities, and character bonds from the official 450-chapter saga. Click any card to inspect full holographic dossier and power metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {displayedCharacters.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveCharacter(char);
                      }}
                      className="cursor-pointer rounded-2xl bg-void-950 border border-void-800 hover:border-gold-500/50 p-5 flex flex-col justify-between transition-all hover:scale-[1.02] group shadow-lg"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={char.avatarUrl}
                            alt={char.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-gold-500/50 bg-void-900 group-hover:border-gold-400 transition-colors filter contrast-[1.1] brightness-[1.05]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              {char.rosterNumber && (
                                <span className="text-[10px] font-mono text-gold-400 font-bold">
                                  #{String(char.rosterNumber).padStart(2, '0')}
                                </span>
                              )}
                              <h4 className="font-display text-base font-bold text-white group-hover:text-gold-300 transition-colors">
                                {char.name}
                              </h4>
                            </div>
                            <span className="text-[10px] text-electric-400 font-bold uppercase tracking-wider block">
                              {char.title || char.role}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {char.faction}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 italic">
                          "{char.quote}"
                        </p>
                      </div>

                      <button className="mt-4 w-full py-2 rounded-lg bg-void-900 group-hover:bg-gold-500 group-hover:text-void-950 text-xs font-semibold text-slate-300 uppercase tracking-wider border border-void-800 transition-colors">
                        Inspect Dossier & Stats
                      </button>
                    </div>
                  ))}
                </div>

                {visibleCount < filteredCharacters.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setVisibleCount((prev) => prev + 24);
                      }}
                      className="px-8 py-3 rounded-xl bg-void-900 border border-void-700 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Show More Personas ({filteredCharacters.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal Inspector */}
        {activeCharacter && (
          <CharacterModal
            character={activeCharacter}
            onClose={() => setActiveCharacter(null)}
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
    </div>
  );
};
