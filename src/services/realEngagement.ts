// ===========================================================================
// SUKA SRI ORIGINALS — REAL VIEWER & LIKE ENGAGEMENT TRACKING SERVICE
// Zero Baseline: All counts start strictly at 0 (empty) and track genuine readers.
// ===========================================================================

const STORAGE_KEYS = {
  VIEWS: 'suka_sri_chapter_views_v1',
  LIKES: 'suka_sri_chapter_likes_v1',
  USER_LIKES: 'suka_sri_user_likes_v1',
};

class RealEngagementService {
  // --- VIEWS MANAGEMENT ---
  private loadViewsMap(): Record<string, number> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEWS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private saveViewsMap(map: Record<string, number>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify(map));
    } catch (err) {
      console.warn('Failed to save views map:', err);
    }
  }

  /**
   * Get real view count for a chapter (defaults to baseViews, which is 0).
   */
  public getChapterViews(chapterId: string, baseViews: number = 0): number {
    const map = this.loadViewsMap();
    if (typeof map[chapterId] === 'number') {
      return map[chapterId];
    }
    return baseViews || 0;
  }

  /**
   * Record a genuine viewer reading a chapter.
   * Dedupes within the same browser session so refreshing doesn't falsely inflate.
   */
  public recordChapterView(chapterId: string, baseViews: number = 0): number {
    const sessionKey = `suka_sri_viewed_${chapterId}`;
    const map = this.loadViewsMap();
    const current = typeof map[chapterId] === 'number' ? map[chapterId] : (baseViews || 0);

    // If already recorded in this active browser session, return current count
    try {
      if (sessionStorage.getItem(sessionKey) === 'true') {
        return current;
      }
      sessionStorage.setItem(sessionKey, 'true');
    } catch {}

    const updated = current + 1;
    map[chapterId] = updated;
    this.saveViewsMap(map);
    return updated;
  }

  // --- LIKES MANAGEMENT ---
  private loadLikesMap(): Record<string, number> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private saveLikesMap(map: Record<string, number>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(map));
    } catch (err) {
      console.warn('Failed to save likes map:', err);
    }
  }

  private loadUserLikedSet(): Set<string> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_LIKES);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveUserLikedSet(set: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_LIKES, JSON.stringify(Array.from(set)));
    } catch (err) {
      console.warn('Failed to save user liked set:', err);
    }
  }

  /**
   * Get real like count for a chapter (defaults to baseLikes, which is 0).
   */
  public getChapterLikes(chapterId: string, baseLikes: number = 0): number {
    const map = this.loadLikesMap();
    if (typeof map[chapterId] === 'number') {
      return map[chapterId];
    }
    return baseLikes || 0;
  }

  /**
   * Check if current user has liked this chapter.
   */
  public isChapterLiked(chapterId: string): boolean {
    const set = this.loadUserLikedSet();
    return set.has(chapterId);
  }

  /**
   * Toggle like for current user on a chapter.
   */
  public toggleChapterLike(
    chapterId: string,
    baseLikes: number = 0
  ): { liked: boolean; count: number } {
    const likedSet = this.loadUserLikedSet();
    const likesMap = this.loadLikesMap();
    const current = typeof likesMap[chapterId] === 'number' ? likesMap[chapterId] : (baseLikes || 0);

    const isLiked = likedSet.has(chapterId);
    let newCount: number;
    let newLiked: boolean;

    if (isLiked) {
      likedSet.delete(chapterId);
      newCount = Math.max(0, current - 1);
      newLiked = false;
    } else {
      likedSet.add(chapterId);
      newCount = current + 1;
      newLiked = true;
    }

    likesMap[chapterId] = newCount;
    this.saveLikesMap(likesMap);
    this.saveUserLikedSet(likedSet);

    return { liked: newLiked, count: newCount };
  }
}

export const engagementService = new RealEngagementService();
