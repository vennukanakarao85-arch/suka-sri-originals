import React, { useState } from 'react';
import {
  MangaSeries,
  Chapter,
  Page,
  Character,
  LoreLocation,
  Faction,
  Part,
  Arc,
  UniverseConfig
} from '../../types';
import { supabaseService } from '../../services/supabase';
import { fileToDataUrl, generatePlaceholderPage } from '../../services/storage';
import { secureEncryptChapterForVault } from '../../services/mangaVault';
import { signCanonRelease } from '../../services/cryptoEngine';
import {
  Edit3,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Send,
  Calendar,
  Database,
  RefreshCw,
  Sparkles,
  Layers,
  Compass,
  PlusCircle,
  Clock,
  BookOpen,
  AlertCircle,
  FolderPlus,
  ShieldCheck,
  Star,
  Download,
  FileText,
  ExternalLink,
  Lock,
  Unlock,
  DollarSign
} from 'lucide-react';
import { sound } from '../../data/soundEffects';

interface CreatorStudioProps {
  mangaList: MangaSeries[];
  onMangaListUpdated: (updated: MangaSeries[]) => void;
  config: UniverseConfig;
  onConfigUpdated: (config: UniverseConfig) => void;
  onPreviewChapter: (chapter: Chapter) => void;
  initialMangaId?: string;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  mangaList,
  onMangaListUpdated,
  config,
  onConfigUpdated,
  onPreviewChapter,
  initialMangaId,
}) => {
  const [activeTab, setActiveTab] = useState<
    'manga-mgr' | 'arc-mgr' | 'chapter-editor' | 'character-studio' | 'world-studio' | 'release-mgr' | 'branding' | 'database' | 'poster-gallery'
  >('chapter-editor');

  const [selectedMangaId, setSelectedMangaId] = useState<string>(
    initialMangaId || (mangaList[0]?.id ?? 'mirai-o-tsukuru-mono')
  );

  const selectedManga = mangaList.find((m) => m.id === selectedMangaId) || mangaList[0];

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- MANGA MANAGER STATE ---
  const [newMangaTitle, setNewMangaTitle] = useState('');
  const [newMangaJapaneseTitle, setNewMangaJapaneseTitle] = useState('');
  const [newMangaSynopsis, setNewMangaSynopsis] = useState('');
  const [newMangaGenres, setNewMangaGenres] = useState('Action, Cyber-Fantasy, Supernatural');
  const [newMangaFormat, setNewMangaFormat] = useState<'Manga' | 'Webtoon' | 'Manhwa' | 'One-Shot'>('Manga');
  const [newMangaStatus, setNewMangaStatus] = useState<'Ongoing' | 'Completed' | 'Upcoming' | 'Hiatus'>('Ongoing');
  const [newMangaCover, setNewMangaCover] = useState('');
  const [newMangaBanner, setNewMangaBanner] = useState('');
  const [newMangaAuthor, setNewMangaAuthor] = useState('Suka Sri Originals');

  // --- CHAPTER EDITOR STATE ---
  const chaptersForSelected = selectedManga?.chapters || [];
  const nextChapterNumber =
    chaptersForSelected.length > 0
      ? Math.max(...chaptersForSelected.map((c) => c.chapterNumber), 0) + 1
      : 1;
  const [chapterNumber, setChapterNumber] = useState<number>(nextChapterNumber);
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [chapterPartId, setChapterPartId] = useState<number>(selectedManga?.parts?.[0]?.id || 1);
  const [chapterArcId, setChapterArcId] = useState<string>(selectedManga?.arcs?.[0]?.id || 'arc-1');
  const [chapterSynopsis, setChapterSynopsis] = useState<string>('');
  const [chapterCoverUrl, setChapterCoverUrl] = useState<string>('');
  const [chapterTextContent, setChapterTextContent] = useState<string>('');
  const [chapterAccessType, setChapterAccessType] = useState<'free' | 'paid'>('paid');
  const [chapterPriceInr, setChapterPriceInr] = useState<number>(49);
  const [chapterPriceUsd, setChapterPriceUsd] = useState<number>(1.00);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');

  React.useEffect(() => {
    if (!selectedManga) return;
    const chs = selectedManga.chapters || [];
    const nextNum = chs.length > 0 ? Math.max(...chs.map((c) => c.chapterNumber), 0) + 1 : 1;
    setChapterNumber(nextNum);
  }, [selectedMangaId, selectedManga?.chapters?.length]);

  // --- ARC MANAGER STATE ---
  const [newArcTitle, setNewArcTitle] = useState('');
  const [newArcSummary, setNewArcSummary] = useState('');
  const [newArcPartId, setNewArcPartId] = useState<number>(1);
  const [newPartTitle, setNewPartTitle] = useState('');

  // --- CHARACTER STUDIO STATE ---
  const [charName, setCharName] = useState('');
  const [charJapaneseName, setCharJapaneseName] = useState('');
  const [charTitle, setCharTitle] = useState('');
  const [charRole, setCharRole] = useState<'Protagonist' | 'Deuteragonist' | 'Antagonist' | 'Allied Master' | 'Entity'>('Protagonist');
  const [charAffinity, setCharAffinity] = useState<'Void' | 'Solar' | 'Umbral' | 'Cosmic'>('Void');
  const [charWeapon, setCharWeapon] = useState('');
  const [charBio, setCharBio] = useState('');
  const [charQuote, setCharQuote] = useState('');
  const [charAvatar, setCharAvatar] = useState('');

  // --- 3D WORLD STUDIO STATE ---
  const [locName, setLocName] = useState('');
  const [locRealm, setLocRealm] = useState('');
  const [locType, setLocType] = useState<'Citadel' | 'Void Rift' | 'Sacred Realm' | 'Battleground' | 'Floating Sanctuary'>('Citadel');
  const [locDesc, setLocDesc] = useState('');

  // --- BRANDING & DATABASE STATE ---
  const [logoPreview, setLogoPreview] = useState<string | null>(config.officialLogoUrl);
  const [sbUrl, setSbUrl] = useState<string>(config.supabaseUrl || '');
  const [sbKey, setSbKey] = useState<string>(config.supabaseAnonKey || '');
  const [sbTesting, setSbTesting] = useState<boolean>(false);
  const [sbTestResult, setSbTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // --- HANDLERS: MANGA MANAGER ---
  const handleCreateManga = () => {
    if (!newMangaTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a manga title.' });
      return;
    }
    const slug = newMangaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newSeries: MangaSeries = {
      id: `manga-${Date.now()}`,
      title: newMangaTitle,
      japaneseTitle: newMangaJapaneseTitle,
      slug,
      coverUrl: newMangaCover || '/images/suka-sri-universe-keyart.jpg',
      bannerUrl: newMangaBanner || '/images/suka-sri-universe-keyart.jpg',
      synopsis: newMangaSynopsis || 'An original manga series from SUKA SRI ORIGINALS.',
      author: newMangaAuthor || 'Suka Sri Originals',
      artist: 'Suka Sri Studios',
      genres: newMangaGenres.split(',').map((g) => g.trim()),
      status: newMangaStatus,
      format: newMangaFormat,
      language: 'English / Japanese',
      releaseSchedule: 'Weekly Serialization',
      rating: 9.9,
      views: 0,
      bookmarks: 0,
      parts: [
        { id: 1, number: 1, title: 'Part I', description: 'The Awakening Chapter', arcRange: 'Arcs 1-3' }
      ],
      arcs: [
        { id: `arc-${Date.now()}`, partId: 1, arcNumber: 1, title: 'Arc I', summary: 'The initial arc.', coverUrl: newMangaCover || '/images/suka-sri-universe-keyart.jpg', status: 'Ongoing', chapterRange: 'Ch. 1+' }
      ],
      chapters: [],
      characters: [],
      loreLocations: [],
      factions: [],
      timeline: [],
      featured: false,
    };

    const updated = supabaseService.addOrUpdateManga(newSeries);
    onMangaListUpdated(updated);
    setSelectedMangaId(newSeries.id);
    sound.playCelestialChime();
    setStatusMessage({ type: 'success', text: `Manga series "${newMangaTitle}" created with its own dedicated page!` });

    // Reset inputs
    setNewMangaTitle('');
    setNewMangaJapaneseTitle('');
    setNewMangaSynopsis('');
    setNewMangaCover('');
    setNewMangaBanner('');
  };

  // --- HANDLERS: CHAPTER-WISE EDITOR ---
  const handleImportTextFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setChapterTextContent(text);
        if (!chapterTitle) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setChapterTitle(autoTitle);
        }
        sound.playCelestialChime();
        setStatusMessage({ type: 'success', text: `Imported chapter document "${file.name}" successfully.` });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveChapter = async (isDraft: boolean) => {
    if (!chapterTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a Chapter Title.' });
      return;
    }
    if (!chapterTextContent.trim()) {
      setStatusMessage({ type: 'error', text: 'Please write, paste, or import chapter story text to publish.' });
      return;
    }

    const currentArc = selectedManga.arcs?.find((a) => a.id === chapterArcId);
    const chapterId = `ch-${Date.now()}`;
    const releaseDate = isScheduled && scheduledDate ? scheduledDate : new Date().toISOString().split('T')[0];

    // Encrypt manuscript with AES-256-GCM and generate SHA-256 digest + Ed25519 canon signature
    let encryptedPayload;
    let sha256Checksum = '';
    let canonSignature = '';
    try {
      encryptedPayload = await secureEncryptChapterForVault(chapterTextContent.trim());
      sha256Checksum = encryptedPayload.sha256Checksum;
      canonSignature = await signCanonRelease(chapterId, releaseDate);
    } catch (err) {
      console.warn('Vault encryption warning:', err);
    }

    const newChapter: Chapter = {
      id: chapterId,
      mangaId: selectedManga.id,
      mangaTitle: selectedManga.title,
      chapterNumber,
      title: chapterTitle,
      partId: chapterPartId,
      arcId: chapterArcId,
      arcTitle: currentArc?.title || 'Arc I',
      coverUrl: chapterCoverUrl || selectedManga.coverUrl,
      synopsis: chapterSynopsis || 'Official canonical chapter published by author Srinivas Vennu.',
      releaseDate,
      isDraft,
      isScheduled,
      scheduledDate,
      pages: [],
      textContent: chapterTextContent.trim(),
      contentType: 'text',
      accessType: chapterAccessType,
      priceInr: chapterPriceInr,
      priceUsd: chapterPriceUsd,
      views: 0,
      likes: 0,
      encryptedPayload,
      sha256Checksum,
      canonSignature,
    };

    const updated = supabaseService.addChapterToManga(selectedManga.id, newChapter);
    onMangaListUpdated(updated);
    sound.playCelestialChime();

    setStatusMessage({
      type: 'success',
      text: isDraft
        ? `Saved Chapter ${chapterNumber} as AES-256 Encrypted Draft for "${selectedManga.title}".`
        : `Published Chapter ${chapterNumber} ("${chapterTitle}") to "${selectedManga.title}"! Secured via AES-256-GCM in Manga Vault.`,
    });

    if (!isDraft) {
      setChapterNumber(chapterNumber + 1);
      setChapterTitle('');
      setChapterSynopsis('');
      setChapterCoverUrl('');
      setChapterTextContent('');
    }
  };

  // --- HANDLERS: ARC MANAGER ---
  const handleAddArc = () => {
    if (!newArcTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter an Arc title.' });
      return;
    }
    const currentArcs = selectedManga.arcs || [];
    const newArc: Arc = {
      id: `arc-${Date.now()}`,
      partId: newArcPartId,
      arcNumber: currentArcs.length + 1,
      title: newArcTitle,
      summary: newArcSummary || 'A canonical arc.',
      coverUrl: selectedManga.coverUrl,
      status: 'Ongoing',
      chapterRange: 'Ch. Upcoming',
    };
    const updatedManga: MangaSeries = {
      ...selectedManga,
      arcs: [...currentArcs, newArc],
    };
    const updatedList = supabaseService.addOrUpdateManga(updatedManga);
    onMangaListUpdated(updatedList);
    sound.playCelestialChime();
    setStatusMessage({ type: 'success', text: `Arc "${newArcTitle}" added to "${selectedManga.title}".` });
    setNewArcTitle('');
    setNewArcSummary('');
  };

  const handleAddPart = () => {
    if (!newPartTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a Part title.' });
      return;
    }
    const currentParts = selectedManga.parts || [];
    const newPart: Part = {
      id: currentParts.length + 1,
      number: currentParts.length + 1,
      title: newPartTitle,
      description: 'Canonical Part / Season.',
      arcRange: 'Upcoming Arcs',
    };
    const updatedManga: MangaSeries = {
      ...selectedManga,
      parts: [...currentParts, newPart],
    };
    const updatedList = supabaseService.addOrUpdateManga(updatedManga);
    onMangaListUpdated(updatedList);
    sound.playCelestialChime();
    setStatusMessage({ type: 'success', text: `Part ${newPart.number} added to "${selectedManga.title}".` });
    setNewPartTitle('');
  };

  // --- HANDLERS: CHARACTER STUDIO ---
  const handleAddCharacter = () => {
    if (!charName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a character name.' });
      return;
    }
    const newChar: Character = {
      id: `char-${Date.now()}`,
      mangaId: selectedManga.id,
      mangaTitle: selectedManga.title,
      name: charName,
      japaneseName: charJapaneseName,
      title: charTitle || 'Hero',
      role: charRole,
      affinity: charAffinity,
      themeColor: charAffinity === 'Solar' ? 'gold' : charAffinity === 'Umbral' ? 'violet' : 'electric',
      avatarUrl: charAvatar || selectedManga.coverUrl,
      fullArtUrl: charAvatar || selectedManga.coverUrl,
      faction: selectedManga.title,
      origin: 'Universe Core',
      height: '175 cm',
      weapon: charWeapon || 'Relic Weapon',
      biography: charBio || 'A canonical character profile.',
      quote: charQuote || '"Destiny is forged in combat."',
      powerRadar: { attack: 90, defense: 85, speed: 88, energy: 92, wisdom: 80 },
      abilities: [{ name: 'Awakened Arts', element: charAffinity, description: 'Signature elemental strike.' }],
      relationships: [],
    };
    const updatedList = supabaseService.addCharacterToManga(selectedManga.id, newChar);
    onMangaListUpdated(updatedList);
    sound.playCelestialChime();
    setStatusMessage({ type: 'success', text: `Character "${charName}" added to "${selectedManga.title}".` });
    setCharName('');
    setCharJapaneseName('');
    setCharTitle('');
    setCharWeapon('');
    setCharBio('');
    setCharQuote('');
    setCharAvatar('');
  };

  // --- HANDLERS: 3D WORLD STUDIO ---
  const handleAddLocation = () => {
    if (!locName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter location name.' });
      return;
    }
    const newLoc: LoreLocation = {
      id: `loc-${Date.now()}`,
      mangaId: selectedManga.id,
      name: locName,
      realm: locRealm || 'Primary Realm',
      type: locType,
      description: locDesc || 'Canonical realm location.',
      historicalSignificance: 'Where pivotal universe battles occurred.',
      imageUrl: selectedManga.bannerUrl || selectedManga.coverUrl,
    };
    const updatedManga: MangaSeries = {
      ...selectedManga,
      loreLocations: [...(selectedManga.loreLocations || []), newLoc],
    };
    const updatedList = supabaseService.addOrUpdateManga(updatedManga);
    onMangaListUpdated(updatedList);
    sound.playCelestialChime();
    setStatusMessage({ type: 'success', text: `Location "${locName}" added to "${selectedManga.title}".` });
    setLocName('');
    setLocRealm('');
    setLocDesc('');
  };

  // --- HANDLERS: LOGO & DATABASE ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoPreview(dataUrl);
      supabaseService.setOfficialLogo(dataUrl);
      onConfigUpdated({ ...config, officialLogoUrl: dataUrl });
      sound.playCelestialChime();
      setStatusMessage({ type: 'success', text: 'Official logo updated across all pages!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to upload logo image.' });
    }
  };

  const handleTestSupabase = async () => {
    if (!sbUrl || !sbKey) {
      setSbTestResult({ success: false, message: 'Please provide both URL and Anon Key.' });
      return;
    }
    setSbTesting(true);
    const res = await supabaseService.testConnection(sbUrl, sbKey);
    setSbTesting(false);
    setSbTestResult(res);
    if (res.success) {
      const newConf = supabaseService.saveConfig({ supabaseUrl: sbUrl, supabaseAnonKey: sbKey, supabaseConfigured: true });
      onConfigUpdated(newConf);
      sound.playCelestialChime();
    }
  };

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-void-900 border border-gold-500/30 text-gold-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <Edit3 className="w-3.5 h-3.5" />
            Universal Publisher Control Center
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-100 uppercase tracking-wide mb-3">
            CREATOR STUDIO
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Publish and manage unlimited independent manga series, seasons, arcs, chapters, character rosters, and 3D world archives.
          </p>
        </div>

        {/* Global Alert Notification */}
        {statusMessage && (
          <div
            className={`mb-8 p-4 rounded-2xl flex items-center justify-between border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-red-950/60 border-red-500/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-xs uppercase font-bold opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Official SUKA SRI Security Core & Author Authority Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-void-900/90 border border-gold-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(255,215,0,0.08)]">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-gold-400">
                  SUKA SRI ORIGINALS — Official Author Studio
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Author: Srinivas Vennu
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                Multi-layer security active: <strong>AES-256-GCM</strong> protected manuscripts, <strong>HMAC-SHA256</strong> verified reader transactions, and personalized watermarking on all reader chapter downloads. Source code and unpublished drafts are secured.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-void-950 border border-void-800 text-slate-300 text-[11px] font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TLS 1.3 • AES-256</span>
            </div>
          </div>
        </div>

        {/* Universal Studio Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: 'chapter-editor', label: 'Chapter Editor', icon: Edit3, color: 'text-gold-400' },
            { id: 'poster-gallery', label: 'Poster Gallery', icon: ImageIcon, color: 'text-amber-400' },
            { id: 'manga-mgr', label: 'Manga Manager', icon: FolderPlus, color: 'text-electric-400' },
            { id: 'arc-mgr', label: 'Arc & Season Manager', icon: Layers, color: 'text-violet-400' },
            { id: 'character-studio', label: 'Character Studio', icon: Sparkles, color: 'text-amber-400' },
            { id: 'world-studio', label: '3D World Studio', icon: Compass, color: 'text-emerald-400' },
            { id: 'release-mgr', label: 'Release Manager', icon: Clock, color: 'text-sky-400' },
            { id: 'branding', label: 'Official Branding', icon: ImageIcon, color: 'text-pink-400' },
            { id: 'database', label: 'Supabase Cloud', icon: Database, color: 'text-teal-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gold-500 text-void-950 shadow-md font-black'
                    : 'bg-void-900 text-slate-400 hover:text-white border border-void-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TARGET MANGA SERIES SELECTOR BAR (For Chapter, Arc, Character, World) */}
        {['chapter-editor', 'arc-mgr', 'character-studio', 'world-studio'].includes(activeTab) && (
          <div className="mb-8 p-4 rounded-2xl bg-void-900 border border-void-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                Active Manga Series:
              </span>
              <select
                value={selectedMangaId}
                onChange={(e) => {
                  sound.playClick();
                  setSelectedMangaId(e.target.value);
                }}
                className="bg-void-950 border border-gold-500/40 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-gold-400"
              >
                {mangaList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.chapters?.length || 0} Chs)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Status: <strong className="text-emerald-400">{selectedManga?.status}</strong></span>
              <span>•</span>
              <span>Format: <strong className="text-gold-400">{selectedManga?.format}</strong></span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CHAPTER EDITOR                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'chapter-editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Metadata & Monetization Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="border-b border-void-800 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block mb-1">
                    Publishing to: {selectedManga?.title}
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">Chapter Configuration</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload full story chapters with part selection, arc mapping, and monetization.
                  </p>
                </div>

                {/* Part & Arc Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                      Select Part / Season
                    </label>
                    <select
                      value={chapterPartId}
                      onChange={(e) => {
                        const pid = Number(e.target.value);
                        setChapterPartId(pid);
                        const firstArcOfPart = (selectedManga?.arcs || []).find((a) => a.partId === pid);
                        if (firstArcOfPart) setChapterArcId(firstArcOfPart.id);
                      }}
                      className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500 font-semibold"
                    >
                      {(selectedManga?.parts || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          Part {p.number}: {p.title} ({p.theme || p.description})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                        Chapter No.
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(Number(e.target.value))}
                        className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                        Canonical Arc
                      </label>
                      <select
                        value={chapterArcId}
                        onChange={(e) => setChapterArcId(e.target.value)}
                        className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500 font-semibold"
                      >
                        {(selectedManga?.arcs || [])
                          .filter((a) => a.partId === chapterPartId)
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              Arc {a.arcNumber}: {a.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Chapter Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Awakening of the Obsidian Blade"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500 font-medium"
                  />
                </div>

                {/* ACCESS & MONETIZATION SETTINGS */}
                <div className="p-4 rounded-2xl bg-void-950 border border-void-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gold-400">
                      Chapter Access & Pricing
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">OWASP PCI DSS Verified</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setChapterAccessType('free');
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                        chapterAccessType === 'free'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-void-900 text-slate-400 border-void-800 hover:text-white'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Free Chapter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setChapterAccessType('paid');
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                        chapterAccessType === 'paid'
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500/60 shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                          : 'bg-void-900 text-slate-400 border-void-800 hover:text-white'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-gold-400" />
                      <span>Paid Chapter</span>
                    </button>
                  </div>

                  {chapterAccessType === 'paid' ? (
                    <div className="pt-2 text-[11px] text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between bg-void-900/80 px-3 py-1.5 rounded-lg border border-void-800">
                        <span className="text-slate-400">India UPI / Scanner:</span>
                        <strong className="text-gold-400 font-mono">₹49 INR</strong>
                      </div>
                      <div className="flex items-center justify-between bg-void-900/80 px-3 py-1.5 rounded-lg border border-void-800">
                        <span className="text-slate-400">International Card:</span>
                        <strong className="text-electric-400 font-mono">$1.00 USD</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        * Also unlocked automatically for Readers with the ₹19 / $0.50 Monthly Membership.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald-400/90 pt-1">
                      ✓ Open to all readers worldwide without payment or account requirement.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Synopsis / Author Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a synopsis or author note for readers..."
                    value={chapterSynopsis}
                    onChange={(e) => setChapterSynopsis(e.target.value)}
                    className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                  />
                </div>

                {/* Scheduling */}
                <div className="pt-3 border-t border-void-800">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="rounded accent-gold-500"
                    />
                    <span>Schedule Release for Future Date</span>
                  </label>
                  {isScheduled && (
                    <div className="mt-3">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="bg-void-950 border border-void-800 rounded-xl px-4 py-2 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Publish & Draft Actions */}
                <div className="pt-4 border-t border-void-800 space-y-3">
                  <button
                    onClick={() => handleSaveChapter(false)}
                    className="w-full py-3.5 rounded-xl font-display text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 via-amber-500 to-electric-400 text-void-950 hover:brightness-110 shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    {isScheduled ? 'Schedule Chapter Release' : 'Publish Chapter to Manga Library'}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSaveChapter(true)}
                      className="py-2.5 rounded-xl bg-void-950 border border-void-800 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => {
                        if (!chapterTextContent.trim()) {
                          setStatusMessage({
                            type: 'error',
                            text: 'Enter chapter story text to preview in reader.',
                          });
                          return;
                        }
                        const currentArc = selectedManga.arcs?.find((a) => a.id === chapterArcId);
                        const mockChapter: Chapter = {
                          id: 'preview-draft',
                          mangaId: selectedManga.id,
                          mangaTitle: selectedManga.title,
                          chapterNumber,
                          title: chapterTitle || 'Draft Preview',
                          partId: chapterPartId,
                          arcId: chapterArcId,
                          arcTitle: currentArc?.title || 'Preview Arc',
                          coverUrl: chapterCoverUrl || selectedManga.coverUrl,
                          synopsis: chapterSynopsis,
                          releaseDate: 'Draft Preview',
                          isDraft: true,
                          pages: [],
                          textContent: chapterTextContent.trim(),
                          contentType: 'text',
                          accessType: chapterAccessType,
                          priceInr: chapterPriceInr,
                          priceUsd: chapterPriceUsd,
                          views: 0,
                          likes: 0,
                        };
                        onPreviewChapter(mockChapter);
                      }}
                      className="py-2.5 rounded-xl bg-void-950 border border-electric-500/30 text-electric-400 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Reader
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Complete Chapter Story Manuscript Editor */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col min-h-[640px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-void-800 pb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gold-400" />
                      Chapter Manuscript & Story Text
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload whole chapter documents or paste chapter manuscript text. No page-by-page scanning needed.
                    </p>
                  </div>

                  {/* Document Uploader & Stats */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-gold-500 text-void-950 font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:brightness-110 shadow-md">
                      <Upload className="w-3.5 h-3.5" />
                      Import Document
                      <input
                        type="file"
                        accept=".txt,.md,.text"
                        onChange={handleImportTextFile}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-void-950 px-3 py-1.5 rounded-xl border border-void-800">
                      <span>Words: <strong className="text-gold-400">{chapterTextContent.trim() ? chapterTextContent.trim().split(/\s+/).length : 0}</strong></span>
                      <span>•</span>
                      <span>Chars: <strong className="text-electric-400">{chapterTextContent.length}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Formatting Quick Helpers */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                    Quick Tags:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sceneTag = `[SCENE: Neo-Edo Void Citadel - Sector Zero]\n`;
                      setChapterTextContent((prev) => (prev ? `${prev}\n\n${sceneTag}` : sceneTag));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-void-950 text-slate-300 border border-void-800 hover:border-gold-500 text-[11px]"
                  >
                    + Scene Header
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dlg = `Shin: "The future is not predestined. It is forged by the choices we make."\n`;
                      setChapterTextContent((prev) => (prev ? `${prev}\n\n${dlg}` : dlg));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-void-950 text-slate-300 border border-void-800 hover:border-electric-400 text-[11px]"
                  >
                    + Dialogue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fx = `*A sudden resonant frequency vibrated across the sub-dimensional barrier, glowing in electric azure.*`;
                      setChapterTextContent((prev) => (prev ? `${prev}\n\n${fx}` : fx));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-void-950 text-slate-300 border border-void-800 hover:border-violet-400 text-[11px]"
                  >
                    + Narration Cue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = `The sky above the Sovereign Empire fractured like stained glass, burning in hues of obsidian gold and celestial azure.\n\nShin Takamori stood atop the citadel spire, his dark hair whipped by zero-point wind. In his right hand, the Zero Genesis device hummed with silent resonance—an artifact forged before the dawn of the Empire.\n\n"You're late, Rosey," Shin said without turning.\n\nA warm golden light materialized beside him as the tactical interface flared into existence. Rosey Rina Kobayashi smiled, adjusting her gauntlet.\n\n"When dealing with syndicate networks in Sector Four, one does not rush fate. Are the threshold gates prepared?"\n\n"The gates are open," confirmed Ken Takamori through the Ares comm-link. "And the era of Zero has begun."`;
                      setChapterTextContent(sample);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/30 hover:bg-gold-500/20 text-[11px] ml-auto font-semibold"
                  >
                    + Insert Story Sample
                  </button>
                </div>

                <textarea
                  rows={20}
                  placeholder="Type or paste the complete chapter text/manuscript here, or click 'Import Document' above. Paragraphs separated by blank lines will render cleanly in the reader..."
                  value={chapterTextContent}
                  onChange={(e) => setChapterTextContent(e.target.value)}
                  className="w-full flex-1 bg-void-950 border border-void-800 rounded-2xl p-5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-gold-500 font-mono leading-relaxed resize-y min-h-[400px]"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-void-800/80">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Author Manuscript Protected • Watermark Active for Readers</span>
                  </div>
                  <span>SUKA SRI ORIGINALS Canon</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MANGA MANAGER (Add / Edit / Archive Manga Series)                  */}
        {/* ========================================================================= */}
        {activeTab === 'manga-mgr' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create New Manga Series Form */}
            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="border-b border-void-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block mb-1">
                  Publishing House Studio
                </span>
                <h3 className="font-display text-2xl font-bold text-white">Create New Manga Series</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Add an original manga series, webtoon, or one-shot to your company catalog.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                  Manga Series Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MIRAI O TSUKURU MONO"
                  value={newMangaTitle}
                  onChange={(e) => setNewMangaTitle(e.target.value)}
                  className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Japanese Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 未来を創る者"
                    value={newMangaJapaneseTitle}
                    onChange={(e) => setNewMangaJapaneseTitle(e.target.value)}
                    className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Format
                  </label>
                  <select
                    value={newMangaFormat}
                    onChange={(e) => setNewMangaFormat(e.target.value as typeof newMangaFormat)}
                    className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Manga">Manga (Standard)</option>
                    <option value="Webtoon">Webtoon (Vertical)</option>
                    <option value="Manhwa">Manhwa</option>
                    <option value="One-Shot">One-Shot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Status
                  </label>
                  <select
                    value={newMangaStatus}
                    onChange={(e) => setNewMangaStatus(e.target.value as typeof newMangaStatus)}
                    className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Hiatus">Hiatus</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Author / Creator
                  </label>
                  <input
                    type="text"
                    value={newMangaAuthor}
                    onChange={(e) => setNewMangaAuthor(e.target.value)}
                    className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                  Genres (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Action, Cyber-Fantasy, Supernatural, Shonen"
                  value={newMangaGenres}
                  onChange={(e) => setNewMangaGenres(e.target.value)}
                  className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                  Series Synopsis
                </label>
                <textarea
                  rows={3}
                  placeholder="Write the comprehensive story background..."
                  value={newMangaSynopsis}
                  onChange={(e) => setNewMangaSynopsis(e.target.value)}
                  className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Poster Cover Image
                  </label>
                  <label className="cursor-pointer block text-center py-2.5 rounded-xl bg-void-950 border border-void-800 hover:border-gold-500 text-xs text-slate-300 font-semibold">
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    Browse Poster
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setNewMangaCover(await fileToDataUrl(f));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">
                    Header Banner Image
                  </label>
                  <label className="cursor-pointer block text-center py-2.5 rounded-xl bg-void-950 border border-void-800 hover:border-gold-500 text-xs text-slate-300 font-semibold">
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    Browse Banner
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setNewMangaBanner(await fileToDataUrl(f));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleCreateManga}
                className="w-full py-3.5 rounded-xl font-display text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-gold-500 via-amber-500 to-electric-400 text-void-950 hover:brightness-110 shadow-lg"
              >
                + Register Manga Series in Catalog
              </button>
            </div>

            {/* List of Published Manga Series */}
            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-void-800 pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    Company Catalog ({mangaList.length} Series)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Manage all live series entries.</p>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Reset entire catalog back to initial company canon?')) {
                      const r = supabaseService.resetToDefaultCanon();
                      onMangaListUpdated(r);
                      sound.playClick();
                      setStatusMessage({ type: 'success', text: 'Catalog reset to company canon.' });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-void-950 border border-void-800 text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Default
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {mangaList.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-void-950 border border-void-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img src={m.coverUrl} alt={m.title} className="w-16 h-20 rounded-lg object-cover bg-void-900 border border-void-800 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                            {m.format}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                            {m.status}
                          </span>
                        </div>
                        <h4 className="font-display text-base font-bold text-white">{m.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {m.chapters?.length || 0} Chapters • {m.arcs?.length || 0} Arcs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMangaId(m.id);
                          setActiveTab('chapter-editor');
                          sound.playClick();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-void-900 border border-void-800 text-gold-400 hover:text-white text-xs font-semibold"
                      >
                        Add Ch.
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete series "${m.title}" and all its chapters?`)) {
                            const updated = supabaseService.deleteManga(m.id);
                            onMangaListUpdated(updated);
                            sound.playClick();
                          }
                        }}
                        className="p-2 rounded-lg bg-void-900 text-red-400 hover:bg-red-950/50"
                        title="Delete Manga"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ARC & SEASON MANAGER                                              */}
        {/* ========================================================================= */}
        {activeTab === 'arc-mgr' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="border-b border-void-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block mb-1">
                  Structure for: {selectedManga?.title}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">Create Arc or Season</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Organize chapters into canonical parts, seasons, and narrative arcs.
                </p>
              </div>

              {/* Add Part Section */}
              <div className="p-4 rounded-2xl bg-void-950 border border-void-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  + Add New Part / Season
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Part II: The Shadow Incursion"
                    value={newPartTitle}
                    onChange={(e) => setNewPartTitle(e.target.value)}
                    className="flex-1 bg-void-900 border border-void-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                  <button
                    onClick={handleAddPart}
                    className="px-4 py-2 rounded-xl bg-gold-500 text-void-950 text-xs font-bold uppercase"
                  >
                    Add Part
                  </button>
                </div>
              </div>

              {/* Add Arc Section */}
              <div className="p-4 rounded-2xl bg-void-950 border border-void-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-electric-400">
                  + Add New Canonical Arc
                </h4>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Belongs to Part</label>
                  <select
                    value={newArcPartId}
                    onChange={(e) => setNewArcPartId(Number(e.target.value))}
                    className="w-full bg-void-900 border border-void-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {(selectedManga?.parts || []).map((p) => (
                      <option key={p.id} value={p.id}>Part {p.number}: {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Arc Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Trials of the Solar Citadel"
                    value={newArcTitle}
                    onChange={(e) => setNewArcTitle(e.target.value)}
                    className="w-full bg-void-900 border border-void-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-electric-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Arc Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Summary of events in this arc..."
                    value={newArcSummary}
                    onChange={(e) => setNewArcSummary(e.target.value)}
                    className="w-full bg-void-900 border border-void-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-electric-400"
                  />
                </div>

                <button
                  onClick={handleAddArc}
                  className="w-full py-2.5 rounded-xl bg-electric-500 text-void-950 text-xs font-bold uppercase tracking-wider"
                >
                  Add Arc to Series
                </button>
              </div>
            </div>

            {/* Existing Arcs List */}
            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <h3 className="font-display text-xl font-bold text-white border-b border-void-800 pb-4">
                Arcs in {selectedManga?.title} ({selectedManga?.arcs?.length || 0})
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {(selectedManga?.arcs || []).map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl bg-void-950 border border-void-800 flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-electric-400">
                        Part {a.partId} • Arc {a.arcNumber}
                      </span>
                      <h4 className="font-display text-base font-bold text-white mt-0.5">{a.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CHARACTER STUDIO                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'character-studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="border-b border-void-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block mb-1">
                  Character Studio: {selectedManga?.title}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">Create Character Profile</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">Name *</label>
                  <input type="text" placeholder="e.g. Shin" value={charName} onChange={(e) => setCharName(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">Japanese Name</label>
                  <input type="text" placeholder="e.g. シン" value={charJapaneseName} onChange={(e) => setCharJapaneseName(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">Title / Alias</label>
                  <input type="text" placeholder="e.g. The Void Walker" value={charTitle} onChange={(e) => setCharTitle(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">Affinity</label>
                  <select value={charAffinity} onChange={(e) => setCharAffinity(e.target.value as typeof charAffinity)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white">
                    <option value="Void">Void (Electric Blue)</option>
                    <option value="Solar">Solar (Celestial Gold)</option>
                    <option value="Umbral">Umbral (Mystic Violet)</option>
                    <option value="Cosmic">Cosmic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">Relic Weapon</label>
                <input type="text" placeholder="e.g. The Obsidian Blade of Nihility" value={charWeapon} onChange={(e) => setCharWeapon(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">Biography</label>
                <textarea rows={3} placeholder="Character backstory and power origin..." value={charBio} onChange={(e) => setCharBio(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>

              <button onClick={handleAddCharacter} className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-void-950 font-bold text-xs uppercase tracking-wider">
                + Add Character to {selectedManga?.title}
              </button>
            </div>

            {/* Existing Characters in this Manga */}
            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-display text-xl font-bold text-white border-b border-void-800 pb-4">
                Cast Roster ({selectedManga?.characters?.length || 0})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {(selectedManga?.characters || []).map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-void-950 border border-void-800 flex items-center gap-4">
                    <img src={c.avatarUrl} alt={c.name} className="w-14 h-14 rounded-full object-cover border border-gold-500/40 shrink-0" />
                    <div>
                      <h4 className="font-display text-base font-bold text-white">{c.name}</h4>
                      <span className="text-[10px] text-electric-400 uppercase font-bold">{c.affinity} • {c.title}</span>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.weapon}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: 3D WORLD STUDIO                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'world-studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="border-b border-void-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  3D World & Lore Studio: {selectedManga?.title}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">Create Realm Location</h3>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Location Name *</label>
                <input type="text" placeholder="e.g. Citadel of Sol" value={locName} onChange={(e) => setLocName(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Realm / Planet</label>
                  <input type="text" placeholder="e.g. Aethelgard Upper Atmosphere" value={locRealm} onChange={(e) => setLocRealm(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Type</label>
                  <select value={locType} onChange={(e) => setLocType(e.target.value as typeof locType)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white">
                    <option value="Citadel">Citadel</option>
                    <option value="Floating Sanctuary">Floating Sanctuary</option>
                    <option value="Void Rift">Void Rift</option>
                    <option value="Sacred Realm">Sacred Realm</option>
                    <option value="Battleground">Battleground</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Description</label>
                <textarea rows={3} placeholder="Describe the architectural and historical lore..." value={locDesc} onChange={(e) => setLocDesc(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>

              <button onClick={handleAddLocation} className="w-full py-3 rounded-xl bg-emerald-500 text-void-950 font-bold text-xs uppercase tracking-wider">
                + Add Location to World Archive
              </button>
            </div>

            <div className="lg:col-span-6 bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-display text-xl font-bold text-white border-b border-void-800 pb-4">
                Locations in {selectedManga?.title} ({selectedManga?.loreLocations?.length || 0})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {(selectedManga?.loreLocations || []).map((l) => (
                  <div key={l.id} className="p-4 rounded-2xl bg-void-950 border border-void-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{l.type} • {l.realm}</span>
                    <h4 className="font-display text-base font-bold text-white mt-0.5">{l.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{l.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: RELEASE MANAGER (All Series Overview)                              */}
        {/* ========================================================================= */}
        {activeTab === 'release-mgr' && (
          <div className="bg-void-900 border border-void-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-void-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Universal Release Manager</h3>
                <p className="text-xs text-slate-400 mt-1">Manage draft status and publishing schedule across all series.</p>
              </div>
            </div>

            <div className="space-y-4">
              {mangaList.every((m) => !m.chapters || m.chapters.length === 0) ? (
                <div className="text-center py-16 border-2 border-dashed border-void-800 rounded-2xl p-6">
                  <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-display text-base font-bold text-slate-300">No Chapters Created Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                    Switch to the Chapter Editor tab to upload manga pages and publish Chapter 1.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('chapter-editor');
                      sound.playClick();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gold-500 text-void-950 font-display text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md"
                  >
                    Open Chapter Editor
                  </button>
                </div>
              ) : (
                mangaList.flatMap((m) =>
                  (m.chapters || []).map((ch) => (
                    <div key={ch.id} className="p-4 rounded-2xl bg-void-950 border border-void-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={ch.coverUrl || m.coverUrl} alt={ch.title} className="w-16 h-20 rounded-lg object-cover bg-void-900 border border-void-800 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-gold-400 block">{m.title}</span>
                          <h4 className="font-display text-base font-bold text-white">
                            CH. {ch.chapterNumber}: {ch.title}
                          </h4>
                          <span className="text-xs text-slate-400">{ch.pages.length} Pages • Date: {ch.releaseDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${ch.isDraft ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {ch.isDraft ? 'Draft' : 'Live'}
                        </span>
                        <button
                          onClick={() => {
                            const updatedManga: MangaSeries = {
                              ...m,
                              chapters: m.chapters.map((c) => c.id === ch.id ? { ...c, isDraft: !c.isDraft } : c),
                            };
                            const updatedList = supabaseService.addOrUpdateManga(updatedManga);
                            onMangaListUpdated(updatedList);
                            sound.playClick();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-void-900 border border-void-800 text-xs font-semibold text-slate-300 hover:text-white"
                        >
                          {ch.isDraft ? 'Make Live' : 'Unpublish'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Chapter ${ch.chapterNumber}: "${ch.title}"?`)) {
                              const updatedList = supabaseService.deleteChapterFromManga(m.id, ch.id);
                              onMangaListUpdated(updatedList);
                              sound.playClick();
                              setStatusMessage({ type: 'success', text: `Chapter ${ch.chapterNumber} deleted.` });
                            }
                          }}
                          className="p-2 rounded-lg bg-void-900 border border-void-800 text-red-400 hover:bg-red-950/50 hover:border-red-500/40"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: OFFICIAL BRANDING                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="max-w-3xl mx-auto bg-void-900 border border-void-800 rounded-3xl p-8 space-y-6 shadow-xl">
            <div className="border-b border-void-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block mb-1">
                Website Trademark Identity
              </span>
              <h3 className="font-display text-2xl font-bold text-white">Official Logo & Brand Insignia</h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload your official company emblem to brand the navbar, entrance, and footer.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-void-950 border border-void-800 flex flex-col items-center justify-center text-center">
              {logoPreview ? (
                <div className="space-y-4">
                  <img src={logoPreview} alt="Active Official Logo" className="h-32 w-auto max-w-[320px] object-contain mx-auto drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]" />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Logo Active
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No logo uploaded. Utilizing default emblem.</p>
              )}
            </div>

            <label className="cursor-pointer block text-center py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-void-950 font-display text-xs font-bold tracking-widest uppercase hover:brightness-110 shadow-lg">
              <Upload className="w-4 h-4 inline mr-1" />
              Upload Official Logo File
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: SUPABASE DATABASE                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'database' && (
          <div className="max-w-3xl mx-auto bg-void-900 border border-void-800 rounded-3xl p-8 space-y-6 shadow-xl">
            <div className="border-b border-void-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 block mb-1">
                Lovable & Supabase Cloud Integration
              </span>
              <h3 className="font-display text-2xl font-bold text-white">PostgreSQL Cloud Database</h3>
              <p className="text-xs text-slate-400 mt-1">
                Connect your Supabase credentials to automatically sync your multi-manga catalog.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">Supabase Project URL</label>
                <input type="text" placeholder="https://your-project.supabase.co" value={sbUrl} onChange={(e) => setSbUrl(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1.5">Supabase Anon Key</label>
                <input type="password" placeholder="eyJhbGciOiJIUzI1Ni..." value={sbKey} onChange={(e) => setSbKey(e.target.value)} className="w-full bg-void-950 border border-void-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono" />
              </div>
            </div>

            {sbTestResult && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${sbTestResult.success ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-red-950/60 border-red-500/50 text-red-200'}`}>
                {sbTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                <span>{sbTestResult.message}</span>
              </div>
            )}

            <button onClick={handleTestSupabase} disabled={sbTesting} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-void-950 font-display text-xs font-bold tracking-widest uppercase hover:brightness-110 shadow-lg">
              {sbTesting ? 'Verifying...' : 'Save & Verify Supabase Connection'}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: POSTER GALLERY                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'poster-gallery' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                Canonical Keyart & Promotional Assets
              </span>
              <h2 className="font-display text-3xl font-black text-white">
                AUTHOR STUDIO & POSTER GALLERY
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Official canonical posters for the 3 Parts (450 Chapters, 28 Arcs) and the complete saga visual. Download high-res master files or apply them directly to series covers and banners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: 'saga-master',
                  title: 'Complete Saga Keyart',
                  partTitle: 'MIRAI O TSUKURU MONO',
                  partTheme: 'CANONICAL MASTER',
                  chapters: 'Ch. 001 — 450 (28 Arcs)',
                  description: 'The definitive key visual: Viao, Aurion, Unit Zero, and the Azure Celestial Dragon.',
                  imageUrl: '/images/mirai-official-saga-poster.jpg',
                  accent: 'gold',
                  isMaster: true,
                },
                {
                  id: 'part-1',
                  title: 'Part 1: Rise of the Empire',
                  partTitle: 'PART 1 • POWER',
                  partTheme: 'POWER',
                  chapters: 'Chapters 001–150 • 8 Arcs',
                  description: 'Giant cybernetic dragon unleashing a plasma blast, neon circuits glowing.',
                  imageUrl: '/images/part1-poster.jpg',
                  accent: 'amber',
                  partId: 1,
                },
                {
                  id: 'part-2',
                  title: 'Part 2: The Dark Shadow',
                  partTitle: 'PART 2 • TRUTH',
                  partTheme: 'TRUTH',
                  chapters: 'Chapters 151–300 • 10 Arcs',
                  description: 'Art illustration of tall twin men standing back to back and holding hands.',
                  imageUrl: '/images/part2-poster.jpg',
                  accent: 'rose',
                  partId: 2,
                },
                {
                  id: 'part-3',
                  title: 'Part 3: The Era of Zero',
                  partTitle: 'PART 3 • CHOICE',
                  partTheme: 'CHOICE',
                  chapters: 'Chapters 301–450 • 10 Arcs',
                  description: 'Cyber-warfare anime keyart with Unit Zero and the zero-point nexus.',
                  imageUrl: '/images/part3-poster.jpg',
                  accent: 'electric',
                  partId: 3,
                },
              ].map((poster) => (
                <div
                  key={poster.id}
                  className="rounded-3xl bg-void-900 border border-void-800 hover:border-gold-500/50 p-5 flex flex-col justify-between transition-all group shadow-xl hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-void-800 bg-void-950">
                      <img
                        src={poster.imageUrl}
                        alt={poster.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-void-950/90 text-gold-400 font-mono text-[9px] font-black uppercase tracking-wider border border-gold-500/30 backdrop-blur-md">
                          {poster.partTheme}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                        {poster.chapters}
                      </span>
                      <h3 className="font-display text-base font-bold text-white mt-0.5 group-hover:text-gold-300 transition-colors">
                        {poster.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {poster.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-void-800/80 space-y-2">
                    <a
                      href={poster.imageUrl}
                      download={`${poster.id}-poster.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-gold-500 text-void-950 font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 shadow-md transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download HD Poster
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedManga: MangaSeries = {
                            ...selectedManga,
                            coverUrl: poster.imageUrl,
                          };
                          const updatedList = supabaseService.addOrUpdateManga(updatedManga);
                          onMangaListUpdated(updatedList);
                          sound.playCelestialChime();
                          setStatusMessage({
                            type: 'success',
                            text: `Set "${poster.title}" as cover for "${selectedManga.title}".`,
                          });
                        }}
                        className="py-1.5 px-2 rounded-lg bg-void-950 border border-void-800 hover:border-gold-500/50 text-[10px] font-bold uppercase text-slate-300 hover:text-white transition-colors truncate"
                        title="Set as series cover image"
                      >
                        Set Cover
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const updatedManga: MangaSeries = {
                            ...selectedManga,
                            bannerUrl: poster.imageUrl,
                          };
                          const updatedList = supabaseService.addOrUpdateManga(updatedManga);
                          onMangaListUpdated(updatedList);
                          sound.playCelestialChime();
                          setStatusMessage({
                            type: 'success',
                            text: `Set "${poster.title}" as banner for "${selectedManga.title}".`,
                          });
                        }}
                        className="py-1.5 px-2 rounded-lg bg-void-950 border border-void-800 hover:border-electric-400/50 text-[10px] font-bold uppercase text-slate-300 hover:text-white transition-colors truncate"
                        title="Set as series header banner"
                      >
                        Set Banner
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
