import type { CharKey, Facing } from '../data/tiles';
import type { GridMap } from '../systems/GridMap';
import type { Track } from '../data/tracks';

export interface Line {
  /** Nama pembicara. Kosong = narasi. */
  who?: string;
  text: string;
}

/** Titik di peta, dalam satuan tile (boleh pecahan). */
export interface At {
  tx: number;
  ty: number;
}

export interface ChoiceOption {
  label: string;
  /** Pilihan benar menutup pertanyaan. Pilihan salah memutar `reply` lalu pertanyaan diulang. */
  ok: boolean;
  reply: Line[];
}

/**
 * Langkah-langkah cerita. Dijalankan berurutan oleh WorldScene.
 * Semua cerita ditulis sebagai data, logika game tidak perlu disentuh.
 */
export type Action =
  | { say: Line[] }
  | { choose: { prompt: Line; options: ChoiceOption[] } }
  | { set: string }
  /** NPC berjalan melewati titik-titik. Tidak menunggu, pemain tetap bisa bergerak. */
  | { walk: { npc: string; path: At[]; vanish?: boolean } }
  /** Layar menggelap, dialog diputar di atas layar gelap, lalu terang lagi. */
  | { narrate: Line[] }
  | { teleport: At }
  /** Pindah ke scene lain, misalnya warnet atau perjalanan ke kota lain. */
  | { goto: { scene: string; data?: object } }
  /** Akhir chapter. Narasi penutup, "Bersambung", kembali ke judul. */
  | { end: Line[] };

/** Isi layar monitor di WarnetScene. Satu set per chapter. */
export interface WarnetText {
  title: string;
  farmHint: string;
  itemFound: string;
  chatBuy: { from: string; text: string };
  sold: string;
  chatJoki: { from: string; text: string };
  /** Label tombol untuk langkah progres (jokiin, enchant). */
  jokiHint: string;
  /** Label bilah progres di bawah layar. */
  jokiStatus: string;
  levelUp: string;
  chatThanks: { from: string; text: string };
  logout: string;
  intro: Line[];
}

export type Has = (flag: string) => boolean;

export interface NpcDef {
  id: string;
  sprite: CharKey;
  at: At;
  face?: Facing;
  /** NPC hanya muncul kalau ini bernilai true. */
  show?: (has: Has) => boolean;
  /** Alat bantu yang menempel pada NPC (alat bantu jalan, kursi roda). */
  aid?: (has: Has) => 'walker' | 'wheelchair' | undefined;
  /** NPC mengikuti pemain dari belakang. */
  follow?: (has: Has) => boolean;
  /** Bayang-bayang. Transparan dan bisa ditembus. */
  ghost?: boolean;
}

export interface Interactable {
  id: string;
  /** Posisi tetap, atau menempel pada NPC. */
  at: At | { npc: string };
  show?: (has: Has) => boolean;
  script: (has: Has) => Action[];
}

export interface MapDef {
  id: string;
  /** Kunci penyimpanan progres. Satu chapter = satu kunci. */
  flagsKey: string;
  build(): GridMap;
  /** BGM peta. Fungsi boleh mengembalikan undefined untuk hening. */
  music: Track | ((has: Has) => Track | undefined);
  /** BGM saat chapter berakhir di peta ini. Default Small Things. */
  endMusic?: Track;
  /** Warna lapisan suasana (misalnya malam yang sunyi). */
  tint?: (has: Has) => { color: number; alpha: number } | undefined;
  /** Sumber cahaya hangat (api unggun) yang tetap terang di atas lapisan malam. */
  glow?: At[];
  /** Kecepatan jalan pemain, misalnya melambat saat menemani seseorang. */
  playerSpeed?: (has: Has) => number | undefined;
  spawn: At;
  npcs: NpcDef[];
  interactables: Interactable[];
  /** Diputar saat masuk peta. Kembalikan [] kalau tidak ada. */
  onEnter(has: Has): Action[];
  /** Petunjuk tujuan di pojok kiri atas. */
  objective(has: Has): string | undefined;
}
