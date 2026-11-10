export interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  caption?: string;
}

export interface Chapter {
  id: string;
  mangaId: string;
  mangaTitle?: string;
  chapterNumber: number;
  title: string;
  partId: number;
  arcId: string;
  arcTitle: string;
  coverUrl: string;
  synopsis: string;
  releaseDate: string;
  isDraft: boolean;
  isScheduled?: boolean;
  scheduledDate?: string;
  pages: Page[];
  views: number;
  likes: number;
  textContent?: string;
  contentType?: 'pages' | 'text' | 'hybrid';
  accessType?: 'free' | 'paid';
  priceInr?: number;
  priceUsd?: number;
  encryptedPayload?: EncryptedVaultPacket;
  sha256Checksum?: string;
  canonSignature?: string;
}

export type PaymentCurrency = 'INR' | 'USD';
export type PaymentMethod = 'UPI' | 'QR' | 'CARD' | 'NET_BANKING';

export interface PaymentTransaction {
  id: string;
  readerId: string;
  chapterId?: string;
  chapterTitle?: string;
  type: 'chapter_purchase' | 'monthly_membership';
  amount: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  hmacSignature: string;
  upiRefNumber?: string;
}

export interface ReaderAccount {
  readerId: string;
  name: string;
  email: string;
  country: 'IN' | 'INTL';
  membershipStatus: 'free' | 'monthly_member';
  membershipValidUntil?: string;
  unlockedChapterIds: string[];
  transactions: PaymentTransaction[];
  watermarkSignature: string;
}

export interface Part {
  id: number;
  number: number;
  title: string;
  subtitle?: string;
  japaneseTitle?: string;
  description: string;
  arcRange: string;
  chapterRange?: string;
  theme?: string;
  posterUrl?: string;
}

export interface Arc {
  id: string;
  partId: number;
  arcNumber: number;
  title: string;
  summary: string;
  coverUrl: string;
  status: 'Completed' | 'Ongoing' | 'Upcoming';
  chapterRange: string;
}

export interface PowerRadar {
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  wisdom: number;
}

export interface CharacterAbility {
  name: string;
  element: 'Void' | 'Solar' | 'Umbral' | 'Celestial' | 'Arcane' | 'Cosmic' | 'Emerald' | 'Crimson' | 'Teal' | 'Sapphire' | string;
  description: string;
}

export interface Character {
  id: string;
  rosterNumber?: number;
  mangaId?: string;
  mangaTitle?: string;
  name: string;
  japaneseName?: string;
  title: string;
  affinity: 'Void' | 'Solar' | 'Umbral' | 'Cosmic' | 'Celestial' | 'Arcane' | 'Emerald' | 'Crimson' | 'Teal' | 'Sapphire' | string;
  themeColor: 'electric' | 'gold' | 'violet' | 'rose' | 'pink' | 'crimson' | 'emerald' | 'amber' | 'sapphire' | 'teal' | 'indigo' | string;
  avatarUrl: string;
  fullArtUrl: string;
  role: string;
  faction: string;
  origin: string;
  height: string;
  weapon: string;
  biography: string;
  quote: string;
  powerRadar: PowerRadar;
  abilities: CharacterAbility[];
  relationships?: { targetName: string; relation: string }[];
}

export interface LoreLocation {
  id: string;
  mangaId?: string;
  name: string;
  realm: string;
  type: 'Citadel' | 'Void Rift' | 'Sacred Realm' | 'Battleground' | 'Floating Sanctuary';
  description: string;
  historicalSignificance: string;
  imageUrl: string;
}

export interface Faction {
  id: string;
  mangaId?: string;
  name: string;
  crestIcon: string;
  leader: string;
  creed: string;
  philosophy: string;
  color: string;
}

export interface TimelineEra {
  era: string;
  timeframe: string;
  title: string;
  description: string;
  catalyst: string;
}

export interface AnimeMedia {
  id: string;
  mangaId?: string;
  title: string;
  category: 'Trailer' | 'Motion Comic' | 'Preview' | 'Concept Reel' | string;
  duration: string;
  resolution: string;
  thumbnailUrl: string;
  videoUrl?: string;
  videoPlaceholderText: string;
  synopsis: string;
  releaseDate: string;
}

export interface ArtGalleryItem {
  id: string;
  mangaId?: string;
  title: string;
  category: 'Character Design' | 'World Architecture' | 'Battle Keyframe' | 'Manga Spread' | string;
  imageUrl: string;
  artistNote: string;
}

export interface MangaSeries {
  id: string;
  title: string;
  japaneseTitle?: string;
  slug: string;
  coverUrl: string;
  bannerUrl: string;
  synopsis: string;
  author: string;
  artist: string;
  genres: string[];
  status: 'Ongoing' | 'Completed' | 'Upcoming' | 'Hiatus';
  format: 'Manga' | 'Webtoon' | 'Manhwa' | 'One-Shot';
  language: string;
  releaseSchedule: string;
  rating: number;
  views: number;
  bookmarks: number;
  parts: Part[];
  arcs: Arc[];
  chapters: Chapter[];
  characters: Character[];
  loreLocations: LoreLocation[];
  factions: Faction[];
  timeline: TimelineEra[];
  featured?: boolean;
}

export interface UniverseConfig {
  universeTitle: string;
  universeSubtitle: string;
  officialLogoUrl: string | null;
  supabaseConfigured: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

// ---------------------------------------------------------------------------
// SUKA SRI FORTRESS — ZERO-TRUST PRODUCTION SECURITY TYPES
// ---------------------------------------------------------------------------

export interface EncryptedVaultPacket {
  algorithm: 'AES-256-GCM';
  keyDerivation: 'PBKDF2-SHA256-100K';
  iv: string; // 96-bit random initialization vector in hex
  salt: string; // 128-bit salt in hex
  ciphertext: string; // Base64 ciphertext
  authTagLength: number; // 128 bits
  sha256Checksum: string; // Integrity verification digest
  encryptedAt: string; // ISO timestamp
}

export type SecurityShieldId =
  | 'identity'
  | 'payment'
  | 'vault'
  | 'data'
  | 'defense'
  | 'recovery';

export interface SecurityShieldInfo {
  id: SecurityShieldId;
  name: string;
  code: string;
  technologies: string[];
  status: 'active' | 'warning' | 'testing';
  summary: string;
  metrics: { [key: string]: string | number };
}

export interface SecurityTestResult {
  id: string;
  testNumber: number;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'running' | 'idle';
  durationMs: number;
  cryptographicProof: string;
  description: string;
  details: string;
  passedAt?: string;
}

export type SecurityAuditSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface SecurityAuditLogEntry {
  id: string;
  timestamp: string;
  severity: SecurityAuditSeverity;
  event: string;
  source: string;
  details: string;
  ipHash: string;
  cryptographicHash: string;
}

export interface ExpiringDownloadToken {
  token: string;
  chapterId: string;
  readerId: string;
  issuedAt: number;
  expiresAt: number;
  hmacSignature: string;
}

