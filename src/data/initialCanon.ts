import { Part, Arc, Chapter, Character, LoreLocation, Faction, TimelineEra, AnimeMedia, ArtGalleryItem, MangaSeries } from '../types';
import { CANON_93_CHARACTERS } from './canonCharacters93';

export const INITIAL_PARTS: Part[] = [
  {
    id: 1,
    number: 1,
    title: 'Rise of the Empire',
    subtitle: 'Part 1',
    theme: 'POWER',
    chapterRange: 'Chapters 001 — 150',
    posterUrl: '/images/part1-poster.jpg',
    japaneseTitle: '帝国興起',
    description: 'Part 1 establishes the world, Shin Takamori\'s journey, the rise of the Empire, and the foundations of SUKA SRI across 8 official arcs.',
    arcRange: '8 Arcs (Chapters 001–150)'
  },
  {
    id: 2,
    number: 2,
    title: 'The Dark Shadow',
    subtitle: 'Part 2',
    theme: 'TRUTH',
    chapterRange: 'Chapters 151 — 300',
    posterUrl: '/images/part2-poster.jpg',
    japaneseTitle: '暗黒の影',
    description: 'Investigating hidden authority, contested records, memory, identity, and the limits of power across 10 arcs and the final arc THE TRUTH.',
    arcRange: '10 Arcs (Chapters 151–300)'
  },
  {
    id: 3,
    number: 3,
    title: 'The Era of Zero',
    subtitle: 'The Future We Create',
    theme: 'CHOICE',
    chapterRange: 'Chapters 301 — 450',
    posterUrl: '/images/part3-poster.jpg',
    japaneseTitle: 'ゼロの時代：Rei no Jidai',
    description: 'The future is not decided by power alone. It is created by the choices we make together. Across 10 canonical arcs of 15 chapters each.',
    arcRange: '10 Arcs (Chapters 301–450)'
  }
];

export const INITIAL_ARCS: Arc[] = [
  // --- PART 1: RISE OF THE EMPIRE (Chapters 001 — 150) [POWER] • 8 ARCS ---
  {
    id: 'arc-1',
    partId: 1,
    arcNumber: 1,
    title: 'THE DREAM BEGINS',
    summary: 'Opening arc establishing Shin Takamori\'s journey, early alliances, and the foundational genesis of SUKA SRI.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 001 — 015'
  },
  {
    id: 'arc-2',
    partId: 1,
    arcNumber: 2,
    title: 'CHALLENGE OF SUMMER',
    summary: 'The trials of summer testing emerging leadership, personal resolve, and early relationships.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 016 — 030'
  },
  {
    id: 'arc-3',
    partId: 1,
    arcNumber: 3,
    title: 'SHIN\'S RESOLVE',
    summary: 'Confronting family legacy and early technological breakthroughs in Neo-Kyoto.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 031 — 050'
  },
  {
    id: 'arc-4',
    partId: 1,
    arcNumber: 4,
    title: 'BLOOD OF THE TAKAMORI',
    summary: 'Ancient lineage secrets unravel as Shin uncovers forbidden family records.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 051 — 070'
  },
  {
    id: 'arc-5',
    partId: 1,
    arcNumber: 5,
    title: 'WINDS OF NEO-KYOTO',
    summary: 'Political intrigue and corporate maneuvers collide across the neon metropolis.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 071 — 090'
  },
  {
    id: 'arc-6',
    partId: 1,
    arcNumber: 6,
    title: 'GUARDIAN DRAGON',
    summary: 'The sapphire-blue dragon Ryūjin awakens, forging the first covenant of power.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 091 — 110'
  },
  {
    id: 'arc-7',
    partId: 1,
    arcNumber: 7,
    title: 'SOLAR ALLIANCE',
    summary: 'Forming strategic allegiances and consolidating regional influence under SUKA SRI.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 111 — 130'
  },
  {
    id: 'arc-8',
    partId: 1,
    arcNumber: 8,
    title: 'THE EMPIRE AWAKENS',
    summary: 'The grand climax of Part 1. Shin establishes sovereign mortal power and lays the foundations of the Empire.',
    coverUrl: '/images/part1-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 131 — 150'
  },

  // --- PART 2: THE DARK SHADOW (Chapters 151 — 300) [TRUTH] • 10 ARCS ---
  {
    id: 'arc-9',
    partId: 2,
    arcNumber: 1,
    title: 'SYNDICATE RETURNS',
    summary: 'The clandestine syndicate resurfaces, initiating covert moves against established institutions.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 151 — 165'
  },
  {
    id: 'arc-10',
    partId: 2,
    arcNumber: 2,
    title: 'THE BLACK MARK',
    summary: 'Contested markings and sealed records appear, triggering investigation into hidden authority.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 166 — 180'
  },
  {
    id: 'arc-11',
    partId: 2,
    arcNumber: 3,
    title: 'QUEEN AKARI',
    summary: 'Queen Akari Himemiya enters the investigation, connecting royal authority with syndicate mysteries.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 181 — 195'
  },
  {
    id: 'arc-12',
    partId: 2,
    arcNumber: 4,
    title: 'SYNDICATE ELITE',
    summary: 'Confronting the elite operatives and hidden networks manipulating corporate and political spheres.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 196 — 210'
  },
  {
    id: 'arc-13',
    partId: 2,
    arcNumber: 5,
    title: 'RYŪJIN’S MEMORY',
    summary: 'Ancient memories of the sapphire-blue dragon guardian surface—serving as clues that demand verification.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 211 — 225'
  },
  {
    id: 'arc-14',
    partId: 2,
    arcNumber: 6,
    title: 'FALSE KING',
    summary: 'An illegitimate authority claims the sovereign mantle; routes and credentials are put to the test.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 226 — 240'
  },
  {
    id: 'arc-15',
    partId: 2,
    arcNumber: 7,
    title: 'SHIN’S TWIST',
    summary: 'Shin Takamori encounters unexpected revelations regarding route holds, releases, and authority protocols.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 241 — 255'
  },
  {
    id: 'arc-16',
    partId: 2,
    arcNumber: 8,
    title: 'KING’S SHADOW',
    summary: 'Uncovering the hidden silhouette behind the throne and the unresolved origins of the Shadow King.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 256 — 270'
  },
  {
    id: 'arc-17',
    partId: 2,
    arcNumber: 9,
    title: 'BROTHER',
    summary: 'Shin and Ken Takamori\'s bond is tested as family loyalties collide with unresolved identities.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 271 — 285'
  },
  {
    id: 'arc-18',
    partId: 2,
    arcNumber: 10,
    title: 'THE TRUTH',
    summary: 'Final Arc of Part 2. The sealed records are breached, unmasking the shadow syndicate and bridging directly into the Era of Zero.',
    coverUrl: '/images/part2-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 286 — 300'
  },

  // --- PART 3: THE ERA OF ZERO (Chapters 301 — 450) [CHOICE] • 10 ARCS ---
  {
    id: 'arc-19',
    partId: 3,
    arcNumber: 1,
    title: 'AFTER THE SHADOW',
    summary: 'Rebuilding; Shin and Rosey\'s married life; Shin begins ZGS; Ken begins Ares Nexus.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 301 — 315'
  },
  {
    id: 'arc-20',
    partId: 3,
    arcNumber: 2,
    title: 'THE ZERO ARCHIVE',
    summary: 'Discovering the archive; investigating records without assuming content or authority is proven.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 316 — 330'
  },
  {
    id: 'arc-21',
    partId: 3,
    arcNumber: 3,
    title: 'THE LOST ERA',
    summary: 'Exploring ancient ruins, testing systems, and comparing conflicting historical evidence.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 331 — 345'
  },
  {
    id: 'arc-22',
    partId: 3,
    arcNumber: 4,
    title: 'THE FIRST GUARDIAN',
    summary: 'Ryūjin\'s clues awaken alongside Shin Takamori\'s emerging Zero-linked abilities.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 346 — 360'
  },
  {
    id: 'arc-23',
    partId: 3,
    arcNumber: 5,
    title: 'THE WORLD DIVIDED',
    summary: 'Global powers debate control, legitimacy, and the brothers\' growing planetary influence.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 361 — 375'
  },
  {
    id: 'arc-24',
    partId: 3,
    arcNumber: 6,
    title: 'THE ZERO SYNDICATE',
    summary: 'Faction conflict escalates toward the midpoint Takamori Ascendancy.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 376 — 390'
  },
  {
    id: 'arc-25',
    partId: 3,
    arcNumber: 7,
    title: 'THE FORBIDDEN MEMORY',
    summary: 'Investigating deep-seated memories and concealed historical evidence.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 391 — 405'
  },
  {
    id: 'arc-26',
    partId: 3,
    arcNumber: 8,
    title: 'THE CREATOR\'S DESIGN',
    summary: 'Studying the ancient system mechanisms and their true primordial purpose.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 406 — 420'
  },
  {
    id: 'arc-27',
    partId: 3,
    arcNumber: 9,
    title: 'THE LAST HUMAN CHOICE',
    summary: 'Both systems face their greatest test as the cast unites to defend human agency.',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 421 — 435'
  },
  {
    id: 'arc-28',
    partId: 3,
    arcNumber: 10,
    title: 'THE NEW ERA',
    summary: 'Final Zero confrontation and a choice about the world\'s future: “The future is created by the choices we make together.”',
    coverUrl: '/images/part3-poster.jpg',
    status: 'Upcoming',
    chapterRange: 'Ch. 436 — 450'
  }
];

// Pure empty canvas — no preloaded chapters
export const INITIAL_CHAPTERS: Chapter[] = [];

// Canonical 93 Characters from Srinivas Vennu's Master Roster
export const INITIAL_CHARACTERS: Character[] = CANON_93_CHARACTERS;

// Official Sample Chapter for Visitor / Reader View
export const SAMPLE_CHAPTER_1: Chapter = {
  id: 'sample-ch-1',
  mangaId: 'mirai-o-tsukuru-mono',
  mangaTitle: 'MIRAI O TSUKURU MONO',
  chapterNumber: 1,
  title: 'Chapter 001: The Dream Begins',
  partId: 1,
  arcId: 'arc-1',
  arcTitle: 'THE DREAM BEGINS',
  coverUrl: '/images/part1-poster.jpg',
  synopsis: 'The opening genesis of the saga. In the obsidian metropolis of Neo-Kyoto, Shin Takamori confronts ancient records as the sapphire-blue dragon Ryūjin stirs from ten thousand years of slumber.',
  releaseDate: '2026-11-08',
  isDraft: false,
  contentType: 'text',
  textContent: `SCENE 1: THE OBSIDIAN CITADEL OF NEO-KYOTO — MIDNIGHT
HEAVY CYBERNETIC RAIN DRUMS AGAINST THE REINFORCED BASALT PLATING OF THE LOWER RESIDENCE.

NARRATION:
For ten thousand years, the ancient architects maintained that mortal destiny was written in sealed star-charts. Every birth, every battle, every dynasty—presumed to follow a predetermined code. But beneath the basalt foundations of the Takamori residence, a forbidden frequency was humming.

SHIN TAKAMORI (Standing atop the observation platform, his dark tailored coat caught in the updraft):
"A referenced record is not destiny. Transmission is not delivery; delivery is not acceptance. The future belongs to those who choose it."

ROSEY RINA KOBAYASHI (Approaching with her solar terminal glowing softly in rose-gold):
"Shin... the energy sensors in the deep vaults just spiked across all frequencies. It isn't a malfunction. The guardian dragon's eye is opening."

KEN TAKAMORI (Over the encrypted Ares communication link):
"Brother, Ares Nexus is detecting unverified authority signals penetrating the perimeter network. Whoever is manipulating the route records... they know you've uncovered the truth."

RYŪJIN (Deep harmonic resonance shaking the atmosphere, sapphire-blue eyes illuminating the storm clouds):
"Mortal of the Sovereign Line... the covenant of the first age is fractured. Show me the future you will create."

[To be continued in Chapter 002: Challenge of Summer...]`,
  pages: [],
  views: 0,
  likes: 0
};

// Official Canonical Personas for Visitor / Reader View
export const SAMPLE_CHARACTERS: Character[] = CANON_93_CHARACTERS;

export const INITIAL_LOCATIONS: LoreLocation[] = [
  {
    id: 'loc-1',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'SUKA SRI Headquarters',
    realm: 'Quadrant I — Takamori Sphere',
    type: 'Citadel',
    description: 'The central operations complex and organizational foundation of SUKA SRI, established by Shin Takamori. Serves as the global development nexus for the Zero Genesis System (ZGS), advanced research, and crisis coordination.',
    historicalSignificance: 'The continuing foundation in the series where human sovereignty and high-speed technology converge.',
    imageUrl: '/characters/batch2/03_SUKA_SRI_Headquarters_Concepts/Headquarters_Exterior_and_Interior.png'
  },
  {
    id: 'loc-2',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'ARES Command Center',
    realm: 'Quadrant I — Takamori Sphere',
    type: 'Citadel',
    description: 'Ken Takamori\'s proposed independent defensive systems facility. Operates the ARES NEXUS SYSTEM for rapid threat analysis, planetary defense, and emergency resilience.',
    historicalSignificance: 'Operates completely independently from Zero Genesis; exchanges only authorized protocols to guarantee fail-safe protection.',
    imageUrl: '/characters/batch2/03_SUKA_SRI_Headquarters_Concepts/Headquarters_Exterior_and_Interior.png'
  },
  {
    id: 'loc-3',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'The Zero Archive',
    realm: 'Subterranean Basalt Depths',
    type: 'Sacred Realm',
    description: 'The central ancient mystery of the creators, containing sealed historical records, route logs, and primordial architecture mechanisms.',
    historicalSignificance: 'Site of the climactic terminal readout: “CREATOR RECOGNIZED. ORIGINAL AUTHORITY: UNVERIFIED.”',
    imageUrl: '/characters/reference_pack/Mirai_O_Tsukuru_Mono_Character_Reference_Pack/Part3_Era_of_Zero_Reference_Board.png'
  },
  {
    id: 'loc-4',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Part 1: Rise of the Empire Bastions',
    realm: 'Ancient Planetary Frontier',
    type: 'Void Rift',
    description: 'Megalithic ruins and subterranean vaults preserving physical evidence of forgotten civilizations and contested pre-Zero history.',
    historicalSignificance: 'Where the cast investigates conflicting historical records without assuming content or authority is proven.',
    imageUrl: '/characters/batch2/04_Part_1_2_3_Location_Concepts/Part_1_Rise_of_the_Empire.png'
  },
  {
    id: 'loc-5',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'The First Guardian Sanctuary',
    realm: 'Sacred Celestial Boundary',
    type: 'Sacred Realm',
    description: 'Ancient sanctuary deeply connected to Ryūjin\'s memories. A realm preserving guardian covenants and clues to primordial cosmic events.',
    historicalSignificance: 'Sacred sanctuary where Ryūjin and Shin commune to verify ancient memory fragments against physical records.',
    imageUrl: '/characters/batch2/01_Main_Trio/Ryujin/Ryujin_Dragon_Portrait_and_Angles.png'
  },
  {
    id: 'loc-6',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Part 2: The Dark Shadow Citadel',
    realm: 'Quadrant III — Syndicate Sphere',
    type: 'Battleground',
    description: 'Covert facilities, hidden communication relays, and surviving shadow networks operating beneath official metropolitan sectors.',
    historicalSignificance: 'The staging grounds for clandestine operations investigated by Shin, Ken, and Queen Akari throughout Part 2.',
    imageUrl: '/characters/batch2/04_Part_1_2_3_Location_Concepts/Part_2_The_Dark_Shadow.png'
  },
  {
    id: 'loc-7',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Part 3: The Era of Zero Frontier',
    realm: 'Quadrant IV — Independent Coalition',
    type: 'Floating Sanctuary',
    description: 'Diverse sovereign territories and civilian alliances that maintain independence and resist autocratic centralized control.',
    historicalSignificance: 'The geopolitical backbone of the Independent Coalition, proving that humanity\'s future cannot be dictated by a single authority.',
    imageUrl: '/characters/batch2/04_Part_1_2_3_Location_Concepts/Part_3_The_Era_of_Zero.png'
  },
  {
    id: 'loc-8',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Zero Threshold',
    realm: 'Sub-Dimensional Core',
    type: 'Void Rift',
    description: 'The deep system nexus connected to the Zero Archive\'s ultimate functions, where universal causal destiny is confronted.',
    historicalSignificance: 'The final stage in Chapter 450 where humanity claims sovereign free will: “The future is created by the choices we make together.”',
    imageUrl: '/images/promo/a_detailed_cinematic_high_detail_anime_illustrat.png'
  }
];

export const INITIAL_FACTIONS: Faction[] = [
  {
    id: 'fac-1',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Quadrant I — Takamori Sphere',
    crestIcon: 'Sun',
    leader: 'Shin Takamori & Ken Takamori',
    creed: 'SUKA SRI • Zero Genesis • Ares Nexus',
    philosophy: 'Shin, Ken, SUKA SRI, Zero Genesis System, and Ares Nexus: independent defense, technological innovation, and societal protection.',
    color: '#FFD700'
  },
  {
    id: 'fac-2',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Quadrant II — Imperial Sphere',
    crestIcon: 'Shield',
    leader: 'Imperial Sovereign Authority',
    creed: 'Heritage • Order • Political Legitimacy',
    philosophy: 'The sovereign empire\'s historic legacy, political institutions, and traditional governing structures balancing authority and mortal law.',
    color: '#F472B6'
  },
  {
    id: 'fac-3',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Quadrant III — Syndicate Sphere',
    crestIcon: 'Compass',
    leader: 'Syndicate Networks & Queen Akari',
    creed: 'Covert Power • Contested Records',
    philosophy: 'Clandestine syndicates and shadow networks whose unverified authority and deep records spark the critical mysteries of Part 2.',
    color: '#8A2BE2'
  },
  {
    id: 'fac-4',
    mangaId: 'mirai-o-tsukuru-mono',
    name: 'Quadrant IV — Independent Coalition',
    crestIcon: 'Flag',
    leader: 'Seven Territories Council',
    creed: 'Human Free Will • Collective Choice',
    philosophy: 'Sovereign territories and civilian coalitions resisting singular control: "The future is created by the choices we make together."',
    color: '#00E5FF'
  }
];

export const INITIAL_TIMELINE: TimelineEra[] = [
  {
    era: 'Part 1: Rise of the Empire',
    timeframe: 'Chapters 001 — 150 (10 Arcs)',
    title: 'POWER — The Genesis of SUKA SRI',
    description: 'Shin Takamori\'s journey begins, establishing alliances, family relationships, the foundations of SUKA SRI, and the rise of the sovereign Empire.',
    catalyst: 'The Dream Begins & Summer Trials'
  },
  {
    era: 'Part 2: The Dark Shadow',
    timeframe: 'Chapters 151 — 300 (11 Arcs)',
    title: 'TRUTH — Contested Records & The Truth',
    description: 'Investigating hidden systems of authority, route hold/release records, Ryūjin\'s memories, and the mysteries of the Shadow King leading to THE TRUTH.',
    catalyst: 'Syndicate Return & Breach of Sealed Records'
  },
  {
    era: 'Part 3: The Era of Zero',
    timeframe: 'Chapters 301 — 450 (10 Arcs)',
    title: 'CHOICE — The Future We Create',
    description: 'Shin creates ZGS, Ken creates Ares Nexus. Humanity unites across the Four Quadrants to confront the Zero Archive and claim sovereign choice.',
    catalyst: '“The future is created by the choices we make together.”'
  }
];

// Official Anime Media Trailers using Original Artwork
export const INITIAL_ANIME_MEDIA: AnimeMedia[] = [
  {
    id: 'anime-master',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Mirai o Tsukuru Mono — Master Saga Official Anime Preview',
    category: 'Grand Saga Teaser',
    duration: '2:30',
    releaseDate: 'SUKA SRI ORIGINALS',
    resolution: '4K CINEMA',
    thumbnailUrl: '/images/promo/a_detailed_cinematic_high_detail_anime_illustrat.png',
    videoUrl: '/videos/intro.mp4',
    videoPlaceholderText: 'The official master saga anime preview by Srinivas Vennu. Shin, Ken, Rosey, and the cosmic sapphire dragon Ryūjin.',
    synopsis: 'The complete canonical anime experience of SUKA SRI ORIGINALS.'
  },
  {
    id: 'anime-part1',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Part 1: Rise of the Empire — Official Anime Teaser',
    category: 'Official Anime Trailer',
    duration: '1:45',
    releaseDate: '2026 Season 1',
    resolution: '4K ULTRA HD',
    thumbnailUrl: '/images/part1-poster.jpg',
    videoUrl: '/videos/part1_teaser.mp4',
    videoPlaceholderText: 'Official anime adaptation teaser for Part 1: Rise of the Empire. Follow Shin Takamori as he awakens his abilities and unifies the border bastions.',
    synopsis: 'Giant cybernetic dragon unleashing a plasma blast, neon circuits glowing over the futuristic battlefront.'
  },
  {
    id: 'anime-part2',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Part 2: The Dark Shadow — Official Storyboard Reel',
    category: 'Motion Comic Reel',
    duration: '2:15',
    releaseDate: '2026 Season 2',
    resolution: '4K 60FPS',
    thumbnailUrl: '/images/part2-poster.jpg',
    videoPlaceholderText: 'Motion comic teaser for Part 2: The Dark Shadow. Investigating hidden authority, clandestine syndicates, and the truth behind the Shadow King.',
    synopsis: 'Tall twin men standing back to back across the shadowy divide.'
  },
  {
    id: 'anime-part3',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Part 3: The Era of Zero — Zero Genesis Anime Reveal',
    category: 'Cinematic Concept',
    duration: '3:00',
    releaseDate: '2027 Season 3',
    resolution: '8K MASTER',
    thumbnailUrl: '/images/part3-poster.jpg',
    videoPlaceholderText: '“The future is not decided by power alone. It is created by the choices we make together.” Zero Genesis System anime adaptation reveal.',
    synopsis: 'Cosmic anime keyart showcasing the battle for sovereign human free will across 450 chapters.'
  }
];

// Official Posters and Production Gallery
export const INITIAL_GALLERY: ArtGalleryItem[] = [
  {
    id: 'gal-visdev',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Visual Development Master Board — Main Trio & World',
    category: 'Character Design',
    imageUrl: '/characters/batch2/05_Complete_Visual_Development_Board/Main_Trio_and_World_Development_Board.png',
    artistNote: 'Official visual development board featuring Shin Takamori, Rosey Rina, Ryūjin, SUKA SRI Headquarters, and core world elements.'
  },
  {
    id: 'gal-promo-anime',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Cinematic High-Detail Anime Illustration',
    category: 'Battle Keyframe',
    imageUrl: '/images/promo/a_detailed_cinematic_high_detail_anime_illustrat.png',
    artistNote: 'Official cinematic 4K anime key illustration for Srinivas Vennu’s Mirai o Tsukuru Mono saga.'
  },
  {
    id: 'gal-promo-collage',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Promotional Anime Montage Collage',
    category: 'Manga Spread',
    imageUrl: '/images/promo/a_detailed_promotional_collage_poster_for_an_anime.png',
    artistNote: 'Dynamic high-impact promotional montage poster covering key arcs and battles across the three parts.'
  },
  {
    id: 'gal-era-zero',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Part 3: The Era of Zero Reference Board',
    category: 'World Architecture',
    imageUrl: '/characters/reference_pack/Mirai_O_Tsukuru_Mono_Character_Reference_Pack/Part3_Era_of_Zero_Reference_Board.png',
    artistNote: 'Reference board for the final 10 arcs of the saga (Chapters 301–450).'
  },
  {
    id: 'gal-character-ref',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Original Character Codex Reference Board',
    category: 'Character Design',
    imageUrl: '/characters/reference_pack/Mirai_O_Tsukuru_Mono_Character_Reference_Pack/Original_Character_Gallery.png',
    artistNote: 'Full-color character gallery showcase featuring Shin, Ken, Rosey, Ryūjin, and key quadrant figures.'
  },
  {
    id: 'gal-roster-93',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Official 93 Canonical Characters Roster Source',
    category: 'Character Design',
    imageUrl: '/characters/starter/MIRAI_O_TSUKURU_MONO_CHARACTER_ART_PHASE1/MASTER_93_CHARACTER_ROSTER_SOURCE.png',
    artistNote: 'The master reference sheet grouping all 93 canonical characters into 16 narrative groups.'
  },
  {
    id: 'gal-part1',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Part 1 Official Poster — Rise of the Empire',
    category: 'Official Poster',
    imageUrl: '/images/part1-poster.jpg',
    artistNote: 'Giant cybernetic dragon unleashing a plasma blast, neon circuits glowing over the futuristic battlefront. Covers Chapters 001–150 (10 Arcs).'
  },
  {
    id: 'gal-part2',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Part 2 Official Poster — The Dark Shadow',
    category: 'Official Poster',
    imageUrl: '/images/part2-poster.jpg',
    artistNote: 'Art illustration of tall twin men, standing back to back and holding hands across the shadowy divide. Covers Chapters 151–300 (11 Arcs).'
  },
  {
    id: 'gal-part3',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Part 3 Official Poster — The Era of Zero',
    category: 'Official Poster',
    imageUrl: '/images/part3-poster.jpg',
    artistNote: 'Cybernetic warriors in the celestial skies creating the sovereign future. Covers Chapters 301–450 (10 Arcs).'
  },
  {
    id: 'gal-master',
    mangaId: 'mirai-o-tsukuru-mono',
    title: 'Master Saga Poster — Mirai o Tsukuru Mono',
    category: 'Official Poster',
    imageUrl: '/images/mirai-official-saga-poster.jpg',
    artistNote: 'Official grand saga artwork by Srinivas Vennu depicting Shin Takamori, Ken Takamori, and the sapphire-blue dragon Ryūjin.'
  }
];

// Universal Publishing Company Manga Collection
export const INITIAL_MANGA_COLLECTION: MangaSeries[] = [
  {
    id: 'mirai-o-tsukuru-mono',
    title: 'MIRAI O TSUKURU MONO',
    japaneseTitle: '未来を創る者 — THE ONE WHO CREATES THE FUTURE',
    slug: 'mirai-o-tsukuru-mono',
    coverUrl: '/images/mirai-original-master-poster.jpg',
    bannerUrl: '/images/mirai-original-master-poster.jpg',
    synopsis: '“The future is not decided by power alone. It is created by the choices we make together.” The complete official manga series by Srinivas Vennu. A grand saga spanning 3 parts (Part 1: Rise of the Empire [Power, Ch. 001–150], Part 2: The Dark Shadow [Truth, Ch. 151–300], Part 3: The Era of Zero [Choice, Ch. 301–450]) across 28 official story arcs.',
    author: 'Srinivas Vennu',
    artist: 'SUKA SRI ORIGINALS',
    genres: ['Action', 'Cyber-Fantasy', 'Supernatural', 'Shonen', 'Adventure', 'Empire Building'],
    status: 'Ongoing',
    format: 'Manga',
    language: 'English / Japanese Original',
    releaseSchedule: '3 Parts • 450 Chapters • 28 Story Arcs',
    rating: 9.9,
    views: 0,
    bookmarks: 0,
    parts: INITIAL_PARTS,
    arcs: INITIAL_ARCS,
    chapters: [],
    characters: INITIAL_CHARACTERS,
    loreLocations: INITIAL_LOCATIONS,
    factions: INITIAL_FACTIONS,
    timeline: INITIAL_TIMELINE,
    featured: true
  }
];
