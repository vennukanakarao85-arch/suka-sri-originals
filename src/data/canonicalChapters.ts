import { Chapter, Page } from '../types';
import { SAMPLE_CHAPTER_1 } from './initialCanon';

interface ArcDefinition {
  arcId: string;
  arcNumber: number;
  partId: 1 | 2 | 3;
  title: string;
  startCh: number;
  endCh: number;
  partName: string;
  poster: string;
  theme: string;
}

const ARC_DEFINITIONS: ArcDefinition[] = [
  // --- PART 1: RISE OF THE EMPIRE (Chapters 001 — 150) [POWER] • 8 ARCS ---
  { arcId: 'arc-1', arcNumber: 1, partId: 1, title: 'THE DREAM BEGINS', startCh: 1, endCh: 15, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },
  { arcId: 'arc-2', arcNumber: 2, partId: 1, title: 'CHALLENGE OF SUMMER', startCh: 16, endCh: 30, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },
  { arcId: 'arc-3', arcNumber: 3, partId: 1, title: 'SHIN\'S RESOLVE', startCh: 31, endCh: 50, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },
  { arcId: 'arc-4', arcNumber: 4, partId: 1, title: 'BLOOD OF THE TAKAMORI', startCh: 51, endCh: 70, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },
  { arcId: 'arc-5', arcNumber: 5, partId: 1, title: 'WINDS OF NEO-KYOTO', startCh: 71, endCh: 90, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },
  { arcId: 'arc-6', arcNumber: 6, partId: 1, title: 'GUARDIAN DRAGON', startCh: 91, endCh: 110, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },
  { arcId: 'arc-7', arcNumber: 7, partId: 1, title: 'SOLAR ALLIANCE', startCh: 111, endCh: 130, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },
  { arcId: 'arc-8', arcNumber: 8, partId: 1, title: 'THE EMPIRE AWAKENS', startCh: 131, endCh: 150, partName: 'Rise of the Empire', poster: '/images/part1-poster.jpg', theme: 'POWER' },

  // --- PART 2: THE DARK SHADOW (Chapters 151 — 300) [TRUTH] • 10 ARCS ---
  { arcId: 'arc-9', arcNumber: 1, partId: 2, title: 'SYNDICATE RETURNS', startCh: 151, endCh: 165, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-10', arcNumber: 2, partId: 2, title: 'THE BLACK MARK', startCh: 166, endCh: 180, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-11', arcNumber: 3, partId: 2, title: 'QUEEN AKARI', startCh: 181, endCh: 195, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-12', arcNumber: 4, partId: 2, title: 'SYNDICATE ELITE', startCh: 196, endCh: 210, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-13', arcNumber: 5, partId: 2, title: 'RYŪJIN’S MEMORY', startCh: 211, endCh: 225, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-14', arcNumber: 6, partId: 2, title: 'FALSE KING', startCh: 226, endCh: 240, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-15', arcNumber: 7, partId: 2, title: 'SHIN’S TWIST', startCh: 241, endCh: 255, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-16', arcNumber: 8, partId: 2, title: 'KING’S SHADOW', startCh: 256, endCh: 270, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-17', arcNumber: 9, partId: 2, title: 'BROTHER', startCh: 271, endCh: 285, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },
  { arcId: 'arc-18', arcNumber: 10, partId: 2, title: 'THE TRUTH', startCh: 286, endCh: 300, partName: 'The Dark Shadow', poster: '/images/part2-poster.jpg', theme: 'TRUTH' },

  // --- PART 3: THE ERA OF ZERO (Chapters 301 — 450) [CHOICE] • 10 ARCS ---
  { arcId: 'arc-19', arcNumber: 1, partId: 3, title: 'AFTER THE SHADOW', startCh: 301, endCh: 315, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-20', arcNumber: 2, partId: 3, title: 'THE ZERO ARCHIVE', startCh: 316, endCh: 330, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-21', arcNumber: 3, partId: 3, title: 'THE LOST ERA', startCh: 331, endCh: 345, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-22', arcNumber: 4, partId: 3, title: 'THE FIRST GUARDIAN', startCh: 346, endCh: 360, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-23', arcNumber: 5, partId: 3, title: 'THE WORLD DIVIDED', startCh: 361, endCh: 375, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-24', arcNumber: 6, partId: 3, title: 'THE ZERO SYNDICATE', startCh: 376, endCh: 390, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-25', arcNumber: 7, partId: 3, title: 'THE FORBIDDEN MEMORY', startCh: 391, endCh: 405, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-26', arcNumber: 8, partId: 3, title: 'THE CREATOR\'S DESIGN', startCh: 406, endCh: 420, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-27', arcNumber: 9, partId: 3, title: 'THE LAST HUMAN CHOICE', startCh: 421, endCh: 435, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
  { arcId: 'arc-28', arcNumber: 10, partId: 3, title: 'THE NEW ERA', startCh: 436, endCh: 450, partName: 'The Era of Zero', poster: '/images/part3-poster.jpg', theme: 'CHOICE' },
];

function getArcForChapter(chNum: number): ArcDefinition {
  const match = ARC_DEFINITIONS.find((a) => chNum >= a.startCh && chNum <= a.endCh);
  if (match) return match;
  if (chNum <= 150) return ARC_DEFINITIONS[0];
  if (chNum <= 300) return ARC_DEFINITIONS[8];
  return ARC_DEFINITIONS[18];
}

// Helper to generate canonical chapter title
function getChapterTitle(chNum: number, arc: ArcDefinition): string {
  const formatted = String(chNum).padStart(3, '0');
  if (chNum === 1) return 'Chapter 001: The Dream Begins';
  if (chNum === 150) return 'Chapter 150: Rise of the Empire (Part 1 Grand Climax)';
  if (chNum === 151) return 'Chapter 151: The Shadow Wakens (Part 2 Opening)';
  if (chNum === 300) return 'Chapter 300: The Truth (Part 2 Grand Climax)';
  if (chNum === 301) return 'Chapter 301: After the Shadow (Part 3 Opening)';
  if (chNum === 450) return 'Chapter 450: The Era of Zero: The Future We Create (Grand Finale)';

  return `Chapter ${formatted}: ${arc.title} • Part ${chNum - arc.startCh + 1}`;
}

// Helper to generate engaging manga text script
function generateChapterScript(chNum: number, arc: ArcDefinition): string {
  const formatted = String(chNum).padStart(3, '0');
  
  if (chNum === 1) {
    return SAMPLE_CHAPTER_1.textContent || '';
  }

  if (chNum === 150) {
    return `SCENE 1: THE IMPERIAL PINNACLE OF NEO-KYOTO — SUNRISE
THE DAWN BREAKS OVER THE EXPANDING SKYLINE OF SUKA SRI HEADQUARTERS.
AFTER 150 CHAPTERS OF TRIALS, THE FOUNDATION IS COMPLETE.

NARRATION:
One hundred and fifty chapters of courage, alliance, and sacrifice. Shin Takamori stands at the sovereign terrace overlooking Neo-Kyoto. The sapphire skies are clear, yet in the horizon, a darker frequency hums.

SHIN TAKAMORI (Looking toward the horizon):
"Part 1 is finished. The Empire has risen. But this is merely the foundation... The true trial lies in the shadows ahead."

ROSEY RINA KOBAYASHI (Hand resting over Shin's shoulder, solar aura shimmering):
"No matter what darkness awakes, Shin... we face it as one."

RYŪJIN (Roaring across the heavens with sapphire lightning):
"THE FOUNDATION IS SEALED! BUT HEARKEN—THE SHADOW OF AUTHORITY AWAKENS AT CHAPTER 151!"

[END OF PART 1: RISE OF THE EMPIRE • PROCEED TO PART 2: THE DARK SHADOW]`;
  }

  if (chNum === 151) {
    return `SCENE 1: THE LOWER SECTOR VAULTS — DEEP MIDNIGHT
ATMOSPHERIC RAIN DRIZZLES OVER CORRODED CYBERNETIC PIPELINES.
A BRAND NEW ERA BEGINS: PART 2 — THE DARK SHADOW.

NARRATION:
Chapter 151 marks the threshold into the unknown. As the morning celebrations of the Empire settle, an anomalous frequency pulses from the unverified subterranean archives.

KEN TAKAMORI (Adjusting the Ares tactical link):
"Shin, something is wrong with the central registry. Someone has bypassed the root key. Unverified authority records are circulating."

SHIN TAKAMORI (Eyes narrowing with resolve):
"Let them challenge the crown. In this second saga, we uncover the unvarnished TRUTH."

QUEEN AKARI HIMEMIYA (Observing from the glass observatory of the Syndicate):
"Enjoy your throne, Takamori. The darkness moves faster than the light."

[PART 2: THE DARK SHADOW BEGINS HERE]`;
  }

  if (chNum === 300) {
    return `SCENE 1: THE SANCTUM OF THE RECORD BREACH
THE FINAL BATTLE OF PART 2 REACHES ITS CRITICAL JUNCTURE.

NARRATION:
Three hundred chapters. Every secret exposed, every false king dismantled. Shin Takamori and Ken Takamori stand side-by-side as the final seal of THE TRUTH shatters into radiant stardust.

SHIN TAKAMORI:
"Truth was never an enemy. It was the key to unlocking what lies beyond."

KEN TAKAMORI:
"Brother... look at the coordinates revealed behind the breach. The Zero Era is waiting."

RYŪJIN:
"THE SAGA OF SHADOWS DISSOLVES! THE ERA OF ZERO AWAITS HUMANITY'S FINAL CHOICE!"

[END OF PART 2: THE DARK SHADOW • PROCEED TO PART 3: THE ERA OF ZERO]`;
  }

  if (chNum === 301) {
    return `SCENE 1: THE CITADEL OF RECONSTRUCTION — DAWN OF THE ZERO ERA
A TRANSCENDENT SKYLINE EMERGES FROM THE SMOKE OF RECONSTRUCTION.
PART 3 COMMENCES: THE ERA OF ZERO.

NARRATION:
Chapters 301 to 450. The ultimate culmination of Srinivas Vennu's epic multiverse. Power alone cannot decide the universe; only the collective choices of humanity will forge the tomorrow.

SHIN TAKAMORI (Initiating the Zero Genesis System):
"We do not inherit the future. We create it."

ROSEY RINA KOBAYASHI:
"From Neo-Kyoto to the ends of the stars, let our choices echo."

VIAO & AURION (Harmonizing dual neural cores):
"Zero systems synchronized. All quadrants aligned for the final journey."

[PART 3: THE ERA OF ZERO HAS AWAKENED]`;
  }

  if (chNum === 450) {
    return `SCENE 1: THE COSMIC CONVERGENCE — NEO-KYOTO & THE UNIVERSAL NEXUS
THE GRAND FINALE OF MIRAI O TSUKURU MONO. 450 CHAPTERS COMPLETE.

NARRATION:
The four quadrants unite. Takamori family, friends, allies, dragons, and sovereign citizens gather across Neo-Kyoto. 

SHIN TAKAMORI (Voice resonating across all 16 canonical groups and every corner of the Multiverse):
"One boy. One vision. One empire.
A referenced record was never our destiny.
The future is created by the choices we make together."

ROSEY RINA, KEN, RYŪJIN, AND ALL 93 CANONICAL PERSONAS (In unified voice):
"WE CREATE THE FUTURE!"

[THE END OF THE SAGA • THANK YOU FOR READING SUKA SRI ORIGINALS BY SRINIVAS VENNU]`;
  }

  return `SCENE 1: ${arc.partName.toUpperCase()} — ARC: ${arc.title}
LOCATION: NEO-KYOTO SECTOR ${((chNum * 7) % 12) + 1}
ATMOSPHERE: THE CHRONICLES OF SUKA SRI CONTINUES (CHAPTER ${formatted})

NARRATION:
Chapter ${chNum} of the canonical saga. As the events of ${arc.title} unfold, Shin Takamori and the allies of SUKA SRI navigate the delicate balance of ${arc.theme.toLowerCase()}.

SHIN TAKAMORI:
"Every step through this arc brings us closer to understanding our sovereign path. We leave no one behind."

ROSEY RINA KOBAYASHI:
"The solar resonance is holding steady. Stay focused on the objective."

KEN TAKAMORI (Via tactical link):
"Perimeter cleared. Proceed to the next milestone."

NARRATION:
With unwavering resolve, the journey advances. The record stands verified under the banner of Srinivas Vennu.`;
}

// Generate all 450 canonical chapters
export const CANONICAL_450_CHAPTERS: Chapter[] = Array.from({ length: 450 }, (_, i) => {
  const chNum = i + 1;
  const arc = getArcForChapter(chNum);
  const formatted = String(chNum).padStart(3, '0');

  return {
    id: `mirai-ch-${chNum}`,
    mangaId: 'mirai-o-tsukuru-mono',
    mangaTitle: 'MIRAI O TSUKURU MONO',
    chapterNumber: chNum,
    title: getChapterTitle(chNum, arc),
    partId: arc.partId,
    arcId: arc.arcId,
    arcTitle: arc.title,
    coverUrl: arc.poster,
    synopsis: chNum === 1
      ? (SAMPLE_CHAPTER_1.synopsis || '')
      : `Canonical Chapter ${formatted} of ${arc.partName} (${arc.title}). Shin Takamori and allies advance through the trials of ${arc.theme.toLowerCase()}.`,
    releaseDate: '2026-11-08',
    isDraft: true,
    contentType: 'text',
    textContent: generateChapterScript(chNum, arc),
    pages: [] as Page[],
    views: 0,
    likes: 0,
    accessType: chNum === 1 ? 'free' : 'paid',
    priceInr: 49,
    priceUsd: 1.0,
  };
});

// Helper for finding chapter
export function getCanonicalChapter(chapterIdOrNumber: string | number): Chapter | undefined {
  if (typeof chapterIdOrNumber === 'number') {
    return CANONICAL_450_CHAPTERS[chapterIdOrNumber - 1];
  }
  return CANONICAL_450_CHAPTERS.find((c) => c.id === chapterIdOrNumber);
}
