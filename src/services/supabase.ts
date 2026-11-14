import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chapter, Character, MangaSeries, UniverseConfig } from '../types';
import { INITIAL_MANGA_COLLECTION } from '../data/initialCanon';

const STORAGE_KEYS = {
  COLLECTION: 'suka_sri_manga_collection_v8',
  CONFIG: 'suka_sri_config_v1',
  LOGO: 'suka_sri_official_logo_v1'
};

class SupabaseService {
  private client: SupabaseClient | null = null;
  private config: UniverseConfig;

  constructor() {
    // Purge outdated mock collections from browser storage
    try {
      localStorage.removeItem('suka_sri_manga_collection_v2');
      localStorage.removeItem('suka_sri_manga_collection_v3');
      localStorage.removeItem('suka_sri_manga_collection_v6');
      localStorage.removeItem('suka_sri_manga_collection_v7');
      localStorage.removeItem('suka_sri_manga_chapters_v1');
    } catch {}

    this.config = this.loadConfig();
    if (this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        this.client = createClient(this.config.supabaseUrl, this.config.supabaseAnonKey);
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
      }
    }
  }

  private loadConfig(): UniverseConfig {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const savedLogo = localStorage.getItem(STORAGE_KEYS.LOGO);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          officialLogoUrl: savedLogo || parsed.officialLogoUrl || '/images/suka-sri-logo.png'
        };
      } catch {}
    }
    return {
      universeTitle: 'SUKA SRI ORIGINALS',
      universeSubtitle: 'MANGA • ANIME • ORIGINAL WORLDS',
      officialLogoUrl: savedLogo || '/images/suka-sri-logo.png',
      supabaseConfigured: false
    };
  }

  public getConfig(): UniverseConfig {
    return this.config;
  }

  public saveConfig(newConfig: Partial<UniverseConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));

    if (this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        this.client = createClient(this.config.supabaseUrl, this.config.supabaseAnonKey);
        this.config.supabaseConfigured = true;
      } catch {
        this.config.supabaseConfigured = false;
      }
    } else {
      this.client = null;
      this.config.supabaseConfigured = false;
    }
    return this.config;
  }

  public setOfficialLogo(logoDataUrl: string) {
    this.config.officialLogoUrl = logoDataUrl;
    localStorage.setItem(STORAGE_KEYS.LOGO, logoDataUrl);
    this.saveConfig({ officialLogoUrl: logoDataUrl });
  }

  // Multi-Manga Collection Management
  public getMangaCollection(): MangaSeries[] {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTION);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean out deprecated sample series
          const filtered = parsed.filter(
            (m) => m.id !== 'chrono-souls' && m.id !== 'sakura-eclipse' && m.id !== 'val-garr-bastion'
          );
          if (filtered.length > 0) {
            return filtered;
          }
        }
      } catch {}
    }
    // Seed with clean initial collection
    localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(INITIAL_MANGA_COLLECTION));
    return INITIAL_MANGA_COLLECTION;
  }

  public getMangaById(id: string): MangaSeries | undefined {
    return this.getMangaCollection().find((m) => m.id === id || m.slug === id);
  }

  public saveMangaCollection(collection: MangaSeries[]) {
    localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(collection));
    if (this.client) {
      this.syncToSupabase(collection).catch((err) => {
        console.warn('Supabase sync skipped/deferred:', err);
      });
    }
  }

  public addOrUpdateManga(series: MangaSeries): MangaSeries[] {
    const list = this.getMangaCollection();
    const index = list.findIndex((m) => m.id === series.id);
    let updated: MangaSeries[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = series;
    } else {
      updated = [series, ...list];
    }
    this.saveMangaCollection(updated);
    return updated;
  }

  public deleteManga(mangaId: string): MangaSeries[] {
    const list = this.getMangaCollection().filter((m) => m.id !== mangaId);
    this.saveMangaCollection(list);
    return list;
  }

  public addChapterToManga(mangaId: string, chapter: Chapter): MangaSeries[] {
    const list = this.getMangaCollection();
    const targetManga = list.find((m) => m.id === mangaId);
    if (!targetManga) return list;

    chapter.mangaId = mangaId;
    chapter.mangaTitle = targetManga.title;

    const existingIdx = targetManga.chapters.findIndex((c) => c.id === chapter.id);
    let updatedChapters: Chapter[];
    if (existingIdx >= 0) {
      updatedChapters = [...targetManga.chapters];
      updatedChapters[existingIdx] = chapter;
    } else {
      updatedChapters = [chapter, ...targetManga.chapters];
    }
    targetManga.chapters = updatedChapters;
    this.saveMangaCollection(list);
    return list;
  }

  public deleteChapterFromManga(mangaId: string, chapterId: string): MangaSeries[] {
    const list = this.getMangaCollection();
    const targetManga = list.find((m) => m.id === mangaId);
    if (!targetManga) return list;

    targetManga.chapters = targetManga.chapters.filter((c) => c.id !== chapterId);
    this.saveMangaCollection(list);
    return list;
  }

  public addCharacterToManga(mangaId: string, character: Character): MangaSeries[] {
    const list = this.getMangaCollection();
    const targetManga = list.find((m) => m.id === mangaId);
    if (!targetManga) return list;

    character.mangaId = mangaId;
    character.mangaTitle = targetManga.title;

    const existingIdx = targetManga.characters.findIndex((c) => c.id === character.id);
    if (existingIdx >= 0) {
      targetManga.characters[existingIdx] = character;
    } else {
      targetManga.characters.push(character);
    }
    this.saveMangaCollection(list);
    return list;
  }

  // Get all published chapters flat across the entire company catalog for global feeds
  public getAllPublishedChapters(): { chapter: Chapter; manga: MangaSeries }[] {
    const list = this.getMangaCollection();
    const all: { chapter: Chapter; manga: MangaSeries }[] = [];
    list.forEach((manga) => {
      manga.chapters.forEach((ch) => {
        if (!ch.isDraft) {
          all.push({ chapter: ch, manga });
        }
      });
    });
    // Sort descending by chapter releaseDate or chapterNumber
    all.sort((a, b) => {
      const dateA = new Date(a.chapter.releaseDate).getTime();
      const dateB = new Date(b.chapter.releaseDate).getTime();
      return dateB - dateA;
    });
    return all;
  }

  // Legacy helper for chapters
  public getChapters(): Chapter[] {
    const flagship = this.getMangaById('mirai-o-tsukuru-mono') || this.getMangaCollection()[0];
    return flagship ? flagship.chapters : [];
  }

  public saveChapters(chapters: Chapter[]) {
    const list = this.getMangaCollection();
    if (list[0]) {
      list[0].chapters = chapters;
      this.saveMangaCollection(list);
    }
  }

  public addOrUpdateChapter(chapter: Chapter): Chapter[] {
    const mangaId = chapter.mangaId || 'mirai-o-tsukuru-mono';
    this.addChapterToManga(mangaId, chapter);
    return this.getChapters();
  }

  public deleteChapter(chapterId: string): Chapter[] {
    const list = this.getMangaCollection();
    for (const manga of list) {
      if (manga.chapters.some((c) => c.id === chapterId)) {
        this.deleteChapterFromManga(manga.id, chapterId);
        break;
      }
    }
    return this.getChapters();
  }

  public resetToDefaultCanon(): MangaSeries[] {
    localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(INITIAL_MANGA_COLLECTION));
    return INITIAL_MANGA_COLLECTION;
  }

  private async syncToSupabase(collection: MangaSeries[]) {
    if (!this.client) return;
    try {
      // 1. Upsert series into 'manga_series' table
      await this.client.from('manga_series').upsert(
        collection.map((m) => ({
          id: m.id,
          title: m.title,
          japanese_title: m.japaneseTitle,
          slug: m.slug,
          cover_url: m.coverUrl,
          banner_url: m.bannerUrl,
          synopsis: m.synopsis,
          author: m.author,
          artist: m.artist,
          genres: m.genres,
          status: m.status,
          format: m.format,
          views: m.views,
          bookmarks: m.bookmarks,
        }))
      );

      // 2. Upsert all chapters into 'manga_chapters' table
      const allChapters = collection.flatMap((m) =>
        m.chapters.map((c) => ({
          id: c.id,
          manga_id: m.id,
          chapter_number: c.chapterNumber,
          title: c.title,
          arc_id: c.arcId,
          arc_title: c.arcTitle,
          part_id: c.partId,
          synopsis: c.synopsis,
          release_date: c.releaseDate,
          content_type: c.contentType,
          text_content: c.textContent,
          pages: c.pages,
          cover_url: c.coverUrl,
          is_draft: c.isDraft,
          access_type: c.accessType,
          price_inr: c.priceInr,
          price_usd: c.priceUsd,
        }))
      );

      if (allChapters.length > 0) {
        await this.client.from('manga_chapters').upsert(allChapters);
      }
    } catch (err) {
      console.warn('Supabase sync skipped/deferred:', err);
    }
  }

  public async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    try {
      const testClient = createClient(url, key);
      const { error } = await testClient.from('manga_series').select('id').limit(1);
      if (error && error.code !== 'PGRST116' && error.message.includes('fetch')) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Successfully connected to Supabase project!' };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: err?.message || 'Connection failed' };
    }
  }
}

export const supabaseService = new SupabaseService();
