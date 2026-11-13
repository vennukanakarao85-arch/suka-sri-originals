import React, { useState, useMemo } from 'react';
import { MangaSeries, ReaderAccount } from '../../types';
import { Search, BookOpen, Layers, Sparkles, Filter, Star, Eye, PlusCircle, ArrowRight } from 'lucide-react';
import { sound } from '../../data/soundEffects';
import { isOwnerOrAdmin } from '../../services/authService';

interface MangaLibraryProps {
  mangaList: MangaSeries[];
  onSelectManga: (mangaId: string) => void;
  onOpenStudio: () => void;
  readerAccount?: ReaderAccount;
}

export const MangaLibrary: React.FC<MangaLibraryProps> = ({
  mangaList,
  onSelectManga,
  onOpenStudio,
  readerAccount,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    mangaList.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set);
  }, [mangaList]);

  const filteredManga = useMemo(() => {
    return mangaList.filter((m) => {
      if (selectedGenre !== 'all' && !m.genres.includes(selectedGenre)) return false;
      if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
      if (selectedFormat !== 'all' && m.format !== selectedFormat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchJap = m.japaneseTitle?.toLowerCase().includes(q);
        const matchSynopsis = m.synopsis.toLowerCase().includes(q);
        const matchAuthor = m.author.toLowerCase().includes(q);
        if (!matchTitle && !matchJap && !matchSynopsis && !matchAuthor) return false;
      }
      return true;
    });
  }, [mangaList, selectedGenre, selectedStatus, selectedFormat, searchQuery]);

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-void-900 border border-gold-500/30 text-gold-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <BookOpen className="w-3.5 h-3.5" />
            Publishing House Catalog • All Original Series
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-100 uppercase tracking-wide mb-4">
            MANGA LIBRARY
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Browse all serialized manga series, digital webtoons, and original universe one-shots from SUKA SRI ORIGINALS. Click any series to enter its dedicated page, chapters, characters, and lore.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-void-900 border border-void-800 rounded-3xl p-5 mb-10 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search series by title, Japanese title, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-void-950 border border-void-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            {/* Quick action: Add Manga (Owner Only) */}
            {isOwnerOrAdmin(readerAccount) && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenStudio();
                }}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider bg-electric-500/10 hover:bg-electric-500/20 text-electric-400 border border-electric-500/30 flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Publish New Series
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="pt-3 border-t border-void-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Status:</span>
              {['all', 'Ongoing', 'Completed', 'Upcoming'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    sound.playClick();
                    setSelectedStatus(st);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedStatus === st
                      ? 'bg-gold-500 text-void-950 font-bold'
                      : 'bg-void-950 text-slate-400 hover:text-white border border-void-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Format Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Format:</span>
              {['all', 'Manga', 'Webtoon', 'One-Shot'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    sound.playClick();
                    setSelectedFormat(fmt);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedFormat === fmt
                      ? 'bg-electric-500 text-void-950 font-bold'
                      : 'bg-void-950 text-slate-400 hover:text-white border border-void-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Series Cards Grid */}
        {filteredManga.length === 0 ? (
          <div className="text-center py-20 bg-void-900/60 rounded-3xl border border-dashed border-gold-500/30 p-8 max-w-2xl mx-auto shadow-[0_0_50px_rgba(255,215,0,0.06)]">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4 text-gold-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-black text-slate-100 uppercase tracking-wide mb-2">
              Awaiting Chapter 1 Release
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              {isOwnerOrAdmin(readerAccount)
                ? 'No manga series have uploaded chapters yet. Open the Creator Studio to upload your manga pages for Chapter 1 and publish it to the universe!'
                : 'Canonical chapters are being finalized and published by author Srinivas Vennu. Check back soon for the official release.'}
            </p>
            {isOwnerOrAdmin(readerAccount) ? (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenStudio();
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Upload Chapter 1 in Creator Studio
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedStatus('all');
                  setSelectedGenre('all');
                  setSelectedFormat('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                Explore Manga Arcs
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredManga.map((manga) => {
              const publishedChapters = manga.chapters?.filter((c) => !c.isDraft) || [];
              const latestChapter = publishedChapters[0];

              return (
                <div
                  key={manga.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectManga(manga.id);
                  }}
                  className="group cursor-pointer rounded-2xl bg-void-900 border border-void-800 hover:border-gold-500/50 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] flex flex-col justify-between"
                >
                  <div>
                    {/* Vertical Poster Cover */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-void-950">
                      <img
                        src={manga.coverUrl}
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent opacity-70" />

                      {/* Status & Format Pills */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-void-950/90 text-gold-400 border border-gold-500/40">
                          {manga.format}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            manga.status === 'Ongoing'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : manga.status === 'Completed'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {manga.status}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-void-950/90 border border-void-800 text-[11px] font-mono font-bold text-gold-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-gold-400" />
                        {manga.rating}
                      </div>

                      {/* Latest Chapter Pill */}
                      {latestChapter && (
                        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-void-950/90 border border-gold-500/30 text-[10px] font-display font-bold text-white">
                          CH. {latestChapter.chapterNumber}
                        </div>
                      )}
                    </div>

                    {/* Metadata Details */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-display text-base font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1">
                        {manga.title}
                      </h3>

                      {manga.japaneseTitle && (
                        <p className="text-[11px] text-gold-400 font-semibold line-clamp-1">
                          {manga.japaneseTitle}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {manga.synopsis}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {manga.genres.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="text-[10px] px-2 py-0.5 rounded bg-void-950 text-slate-400 border border-void-800"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-3 border-t border-void-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px]">
                      {publishedChapters.length > 0
                        ? `${publishedChapters.length} Chapters`
                        : '0 Chapters • Launch Ready'}
                    </span>
                    <span className="font-bold text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Series <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
