export interface Track {
  key: string;
  path: string;
  /**
   * Penyeimbang kekerasan suara. Diukur dari RMS tiap file (Town Theme = 1).
   * Tanpa ini, trek ambient yang memang pelan nyaris tak terdengar
   * dibanding trek lain pada volume yang sama.
   */
  gain: number;
  /** Dimuat di BootScene. Trek untuk chapter yang belum ada tidak perlu ikut diunduh. */
  preload: boolean;
}

/** Semua BGM, CC0 dari OpenGameArt. Rincian sumber di CREDITS.md. */
export const TRACKS = {
  /** cynicmusic. Harpa dan recorder, hangat. Judul & Bandung. */
  town: { key: 'bgm-town', path: 'music/town-theme.mp3', gain: 1, preload: true },
  /** Joth. Ambient tanpa melodi, enak di bawah teks. Prolog. */
  contemplation: { key: 'bgm-contemplation', path: 'music/contemplation.mp3', gain: 2.5, preload: true },
  /** 3xBlast. Piano, gitar, string, melankolis. Ending chapter / momen refleksi. */
  smallThings: { key: 'bgm-small-things', path: 'music/small-things.mp3', gain: 0.9, preload: true },
  /** Kistol. Waltz piano pelan, loop mulus. Chapter 2, Untuk Siti. */
  snowfall: { key: 'bgm-snowfall', path: 'music/snowfall.ogg', gain: 2, preload: true },
  /** cynicmusic. Lonceng & arpeggio, lembut dan riang. Rumah Kakek dan Nenek di Malang. */
  lullaby: { key: 'bgm-lullaby', path: 'music/happy-lullaby.mp3', gain: 0.9, preload: true },
  /** skrjablin. Chiptune C64 sendu. Di dalam warnet. */
  c64: { key: 'bgm-c64', path: 'music/slow-melancholic-c64.ogg', gain: 2.5, preload: true },
  /** Trex0n (Cal McEachern). Gitar akustik pelan, suasana api unggun. Malam di Lembang. */
  fire: { key: 'bgm-small-fire', path: 'music/small-fire.mp3', gain: 2.5, preload: true },
} as const satisfies Record<string, Track>;

/** Volume dasar per suasana, sebelum dikali gain trek. */
export const MUSIC_VOLUME = { title: 0.45, prologue: 0.3, world: 0.4, ending: 0.4 } as const;
