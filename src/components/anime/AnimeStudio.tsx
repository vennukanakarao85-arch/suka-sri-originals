import React, { useState } from 'react';
import { INITIAL_ANIME_MEDIA, INITIAL_GALLERY } from '../../data/initialCanon';
import { AnimeMedia, ArtGalleryItem } from '../../types';
import { Film, Play, Image, Sparkles, Clock, Calendar, CheckCircle, Maximize2, X, Upload } from 'lucide-react';
import { sound } from '../../data/soundEffects';

interface AnimeStudioProps {
  onOpenStudio?: () => void;
}

export const AnimeStudio: React.FC<AnimeStudioProps> = ({ onOpenStudio }) => {
  const mediaList = INITIAL_ANIME_MEDIA;
  const [selectedMedia, setSelectedMedia] = useState<AnimeMedia | null>(mediaList[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<ArtGalleryItem | null>(null);

  const handlePlayMedia = (media: AnimeMedia) => {
    sound.playCelestialChime();
    setSelectedMedia(media);
    setVideoError(false);
    setIsPlaying(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playSuccess();
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setVideoError(false);
      setIsPlaying(true);
    }
  };

  const activeVideoSrc = uploadedVideoUrl || selectedMedia?.videoUrl;

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-void-900 border border-electric-500/30 text-electric-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Film className="w-3.5 h-3.5" />
            Module 05 • Animation Production Hub
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-100 uppercase tracking-wide mb-4">
            ANIME STUDIO
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Official animated trailers, motion comic storyboards, concept artwork, and upcoming anime adaptation previews from SUKA SRI.
          </p>
        </div>

        {/* Feature Theater Video Player */}
        {selectedMedia && (
          <div className="mb-16 rounded-3xl overflow-hidden bg-void-900 border border-void-800 shadow-2xl">
            <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full bg-void-950 flex items-center justify-center overflow-hidden">
              {/* Background art */}
              <img
                src={selectedMedia.thumbnailUrl}
                alt={selectedMedia.title}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isPlaying ? 'scale-105 brightness-50' : 'brightness-75'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/30 to-transparent" />

            {/* Play overlay / Simulation */}
            {isPlaying && activeVideoSrc && !videoError ? (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-black">
                <video
                  src={activeVideoSrc}
                  controls
                  autoPlay
                  playsInline
                  onError={() => setVideoError(true)}
                  className="w-full h-full max-h-[70vh] object-contain"
                />
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-void-950/80 border border-void-800 text-xs font-semibold uppercase text-slate-300 hover:text-white flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
                >
                  <X className="w-4 h-4" /> Exit Video
                </button>
              </div>
            ) : !isPlaying ? (
              <button
                onClick={() => handlePlayMedia(selectedMedia)}
                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-gold-500 to-electric-400 flex items-center justify-center text-void-950 shadow-[0_0_40px_rgba(0,229,255,0.6)] hover:scale-110 active:scale-95 transition-all group cursor-pointer"
                title="Play Preview"
              >
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
                <span className="absolute -bottom-8 text-[11px] font-display font-bold tracking-widest text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Play Trailer / Intro
                </span>
              </button>
            ) : (
              <div className="relative z-10 p-6 sm:p-8 max-w-xl text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-electric-500/20 border border-electric-400 flex items-center justify-center animate-pulse">
                  <Play className="w-5 h-5 text-electric-400 fill-current" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {selectedMedia.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-void-950/80 p-4 rounded-xl border border-void-800">
                  {selectedMedia.videoPlaceholderText}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="px-5 py-2 rounded-xl bg-void-900 border border-void-800 text-xs font-semibold uppercase text-slate-300 hover:text-white cursor-pointer"
                  >
                    Return to Poster
                  </button>
                  <label className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Load Video File
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Tip: Drop intro video files into <code className="text-electric-400 font-mono">public/videos/intro.mp4</code> to stream automatically!
                </p>
              </div>
            )}

            {/* Status watermark */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded bg-void-950/80 border border-void-800 text-[10px] font-mono text-electric-400 font-bold uppercase">
              {selectedMedia.resolution} • {selectedMedia.duration}
            </div>
          </div>

          {/* Details under player */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                {selectedMedia.category}
              </span>
              <h2 className="font-display text-2xl font-black text-white mt-0.5">
                {selectedMedia.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{selectedMedia.synopsis}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                {selectedMedia.releaseDate}
              </span>
            </div>
          </div>
        </div>
        )}

        {/* Media Selector Playlist */}
        <div className="mb-16">
          <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Film className="w-4 h-4 text-gold-400" />
            Trailers & Motion Comics Reel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaList.map((media) => (
              <div
                key={media.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedMedia(media);
                  setIsPlaying(false);
                }}
                className={`cursor-pointer rounded-2xl bg-void-900 border overflow-hidden transition-all p-4 ${
                  selectedMedia?.id === media.id
                    ? 'border-gold-500/60 shadow-[0_0_25px_rgba(255,215,0,0.2)]'
                    : 'border-void-800 hover:border-void-700'
                }`}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-void-950">
                  <img src={media.thumbnailUrl} alt={media.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-void-950/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-void-950/80 border border-gold-400/50 flex items-center justify-center text-gold-400">
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-void-950/80 text-[10px] font-mono text-slate-200">
                    {media.duration}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-electric-400">
                  {media.category}
                </span>
                <h4 className="font-display text-sm font-bold text-white mt-1 line-clamp-1">
                  {media.title}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Concept Art & Visual Development Gallery */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-electric-400" />
              Visual Development & Concept Gallery
            </h3>
            <span className="text-xs text-slate-400">High-Resolution Model Sheets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INITIAL_GALLERY.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setLightboxImage(item);
                }}
                className="group cursor-pointer rounded-2xl bg-void-900 border border-void-800 overflow-hidden hover:border-gold-500/50 transition-all hover:shadow-[0_0_25px_rgba(255,215,0,0.15)] flex flex-col"
              >
                <div className="relative aspect-[4/5] bg-void-950 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 right-3 p-2 rounded-lg bg-void-950/80 opacity-0 group-hover:opacity-100 transition-opacity text-slate-200">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                      {item.category}
                    </span>
                    <h4 className="font-display text-sm font-bold text-white mt-0.5 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic">
                    {item.artistNote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/90 backdrop-blur-xl">
            <div className="relative max-w-4xl max-h-[90vh] bg-void-900 border border-void-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-void-950/80 hover:bg-gold-500 hover:text-void-950 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative flex-1 bg-void-950 flex items-center justify-center overflow-hidden">
                <img
                  src={lightboxImage.imageUrl}
                  alt={lightboxImage.title}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 bg-void-900 border-t border-void-800">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                  {lightboxImage.category}
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-0.5">
                  {lightboxImage.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{lightboxImage.artistNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
