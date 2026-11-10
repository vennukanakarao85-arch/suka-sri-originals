import React from 'react';
import { Chapter, MangaSeries } from '../../types';
import { BookOpen, Calendar, FileText, ArrowRight, PlusCircle, Eye, Sparkles, Heart } from 'lucide-react';
import { sound } from '../../data/soundEffects';
import { engagementService } from '../../services/realEngagement';

interface LatestUpdatesProps {
  mangaList: MangaSeries[];
  onReadChapter: (chapterId: string) => void;
  onSelectManga: (mangaId: string) => void;
  onOpenStudio: () => void;
  onViewAllManga: () => void;
}

export const LatestUpdates: React.FC<LatestUpdatesProps> = ({
  mangaList,
  onReadChapter,
  onSelectManga,
  onOpenStudio,
  onViewAllManga,
}) => {
  // Aggregate all published chapters across all manga series
  const allUpdates: { chapter: Chapter; manga: MangaSeries }[] = [];
  mangaList.forEach((manga) => {
    (manga.chapters || []).forEach((ch) => {
      if (!ch.isDraft) {
        allUpdates.push({ chapter: ch, manga });
      }
    });
  });

  // Sort descending by release date or chapter number
  allUpdates.sort((a, b) => {
    const timeA = new Date(a.chapter.releaseDate).getTime() || 0;
    const timeB = new Date(b.chapter.releaseDate).getTime() || 0;
    return timeB - timeA || b.chapter.chapterNumber - a.chapter.chapterNumber;
  });

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 pb-4 border-b border-void-800">
          <div>
            <div className="inline-flex items-center gap-2 text-electric-400 text-xs font-bold tracking-widest uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-electric-400 animate-pulse" />
              Universal Chapter Release Feed
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-black text-slate-100 uppercase tracking-wide">
              LATEST CHAPTER UPDATES
            </h2>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onOpenStudio();
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase bg-electric-500/10 hover:bg-electric-500/20 text-electric-400 border border-electric-500/30 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Creator Studio
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onViewAllManga();
              }}
              className="text-xs font-semibold text-slate-400 hover:text-gold-400 flex items-center gap-1 uppercase tracking-wider transition-colors"
            >
              Browse All Series <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-Series Chapter Feed Grid */}
        {allUpdates.length === 0 ? (
          <div className="rounded-3xl bg-void-900/60 border border-dashed border-void-800 p-12 text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center mx-auto mb-4 text-electric-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" /> Ready For Official Launch
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 uppercase">
              No Chapter Releases Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
              The universal chapter release feed is clear and ready. All view counts and like metrics start at 0 and track genuine viewer engagement once official chapters are published by author Srinivas Vennu.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                onOpenStudio();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-void-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Upload Chapter 1 in Studio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUpdates.slice(0, 9).map(({ chapter, manga }, idx) => (
              <div
                key={chapter.id}
                className="group rounded-2xl bg-void-900 border border-void-800 hover:border-gold-500/40 p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] flex flex-col justify-between"
              >
              <div>
                {/* Thumbnail banner */}
                <div
                  onClick={() => {
                    sound.playClick();
                    onReadChapter(chapter.id);
                  }}
                  className="relative rounded-xl overflow-hidden aspect-[16/9] mb-4 bg-void-950 cursor-pointer"
                >
                  <img
                    src={chapter.coverUrl || (chapter.pages[0]?.imageUrl) || manga.coverUrl}
                    alt={chapter.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {idx === 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-gold-500 to-amber-500 text-void-950 shadow-lg">
                      NEW RELEASE
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-void-950/80 backdrop-blur-sm text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-electric-400" />
                    {chapter.textContent && (!chapter.pages || chapter.pages.length === 0)
                      ? 'Novel Script'
                      : `${chapter.pages?.length || 0} Pages`}
                  </span>
                </div>

                {/* Parent Manga Series Link */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectManga(manga.id);
                    }}
                    className="font-display font-bold text-xs uppercase tracking-wider text-gold-400 hover:text-white transition-colors truncate max-w-[200px] text-left"
                  >
                    {manga.title}
                  </button>
                  <span className="font-mono font-bold text-electric-400 text-xs">
                    CH. {chapter.chapterNumber}
                  </span>
                </div>

                {/* Chapter Title */}
                <h3
                  onClick={() => {
                    sound.playClick();
                    onReadChapter(chapter.id);
                  }}
                  className="font-display text-base font-bold text-slate-100 group-hover:text-gold-300 transition-colors line-clamp-1 mb-1 cursor-pointer"
                >
                  {chapter.title}
                </h3>

                {/* Arc Title */}
                <span className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase block mb-3 line-clamp-1">
                  {chapter.arcTitle}
                </span>

                {/* Synopsis snippet */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {chapter.synopsis}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-void-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {chapter.releaseDate}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" title="Genuine Viewer Reads">
                    <Eye className="w-3 h-3 text-slate-500" />
                    {engagementService.getChapterViews(chapter.id, chapter.views).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-pink-400" title="Reader Likes">
                    <Heart className="w-3 h-3 text-pink-400 fill-pink-400/40" />
                    {engagementService.getChapterLikes(chapter.id, chapter.likes).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onReadChapter(chapter.id);
                  }}
                  className="font-semibold text-gold-400 text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Read <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
  );
};
