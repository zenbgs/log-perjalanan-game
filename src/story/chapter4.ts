/**
 * Chapter 4. Keluarga. Teks diambil dari artikel "Rumah yang Nggak Punya Atap"
 * (Log Perjalanan Hidup #4).
 *
 * Kejadian di mall hanya diceritakan lewat narasi, tidak dijadikan mekanik permainan.
 *
 * Aturan gaya (dicek `npm test`). Tanpa titik dua dan tanpa em dash.
 */
import type { Line, WarnetText } from './types';

export { IKAT, KUPLUK, MERAH, ZAIN } from './chapter3';

export const FLAGS4_KEY = 'lph:ch4';

export const FLAG4 = {
  K_INTRO: 'keluarga-intro',
  LINDUNG: 'dilindungi',
  TURNAMEN: 'turnamen',
  RAYAKAN: 'rayakan',
  RAPOR_PERGI: 'rapor-pergi',
  RAPOR_PULANG: 'rapor-pulang',
  RAPOR: 'rapor',
  UANG: 'uang-game',
  BAGI: 'bagi-uang',
  L_INTRO: 'lembang-intro',
  MURUNG: 'murung',
  TEMANI: 'ditemani',
} as const;

// ---------- prolog ----------

export const PROLOGUE4_COMMAND = 'cat 004-keluarga.log';
export const PROLOGUE4: string[] = [
  'Kata keluarga dulu buatku cuma kata di buku pelajaran.',
  'Aku tahu artinya. Bapak, ibu, anak, tinggal serumah. Tapi rasanya seperti apa, aku nggak pernah benar-benar tahu.',
];
export const CARD4 = { label: 'Chapter 4', title: 'Keluarga', caption: 'rumah yang nggak punya atap' };

// ---------- Bandung ----------

export const K_INTRO: Line[] = [
  { text: 'Di rumah lebih sering ada suara orang bertengkar daripada suara orang ngobrol.' },
  { text: 'Makin lama aku nongkrong bareng anak-anak jalan itu, makin aku sadar, ternyata begini rasanya.' },
];

export const ESKRIM_LINES: Line[] = [
  { text: 'Pernah suatu kali aku ketahuan nyuri es krim di sebuah mall. Iya, es krim.' },
  { text: 'Aku sudah ketangkap security, dan yang pertama datang belain aku ya mereka. Urusannya jadi panjang, sampai ribut sama security segala.' },
  { text: 'Sekarang aku nggak bangga sama kejadian itu. Tapi aku juga nggak bisa lupa gimana rasanya lihat mereka datang buat aku.' },
  { text: 'Aku nggak terbiasa dibela. Selama ini kalau ada masalah ya aku tanggung sendiri, diam, lalu lupa.' },
];

export const TURNAMEN_LINES: Line[] = [
  { text: 'Hari itu ada turnamen game di warnet. Aku ikut daftar.' },
  { text: 'Satu per satu lawan tumbang.' },
  { text: 'Dan aku menang.' },
];

export const RAPOR_WAIT: Line[] = [
  { text: 'Waktu itu aku masih sekolah, walaupun jarang masuk.' },
  { text: 'Pas pembagian rapor, kadang yang datang ngambil rapor ke sekolah itu mereka.' },
  { text: 'Bayangin wali kelas yang nyerahin rapor ke anak jalanan, hehe.' },
];

export const BAGI_LINES: Line[] = [
  { text: 'Dulu, uang dari game habisnya buat game lagi.' },
  { text: 'Sekarang uang itu jadi nasi bungkus yang dimakan rame-rame. Rasanya beda. Jauh lebih enak.' },
];

export const CARD_LEMBANG = { label: 'Malamnya', title: 'Lembang', caption: 'tempat kami ngumpul, dan tidur' };

/** Isi layar monitor di warnet, versi Chapter 4. */
export const WARNET4: WarnetText = {
  title: 'GAME ONLINE',
  farmHint: 'farming',
  itemFound: 'Dapat bahan enchant!',
  chatBuy: { from: 'juragan_item', text: 'bahan enchant itu dijual? aku ambil semua' },
  sold: 'Terjual!',
  chatJoki: { from: 'om_helm', text: 'dek, weapon om tolong di-enchant ya' },
  jokiHint: 'enchant',
  jokiStatus: 'weapon om_helm',
  levelUp: 'Enchant berhasil!',
  chatThanks: { from: 'om_helm', text: 'mantap dek. nih bayarannya' },
  logout: 'keluar',
  intro: [
    { text: 'Waktu itu aku masih dapat uang dari game, dan sumbernya masih RF Classic.' },
    { text: 'Bertani, enchant weapon, jualan item buat enchant, joki akun. Kerjaan lama yang dari SD sudah aku tekuni.' },
  ],
};

// ---------- Lembang ----------

export const LEMBANG_INTRO: Line[] = [
  { text: 'Hidupku berjalan terus seperti itu, 24 jam bareng mereka. Tidur, makan, ngamen, nongkrong, semuanya di jalan.' },
  { text: 'Tempat ngumpul kami biasanya di daerah Lembang. Di sana kami juga tidur.' },
  { text: 'Hijau di mana-mana, pohonnya banyak, udaranya dingin. Kalau malam sudah sepi dan cuma ada suara angin lewat pepohonan, suasananya syahdu sekali.' },
];

export const MURUNG_LINES: Line[] = [
  { text: 'Ada malam-malam di mana aku murung tanpa alasan yang jelas.' },
  { text: 'Aku duduk sendirian, jauh dari api.' },
];

export const DATANG_LINES: Line[] = [{ text: 'Nggak lama, Si Kupluk datang lalu duduk di sebelahku.' }];

export const TEMANI_LINES: Line[] = [
  { text: 'Dia nggak nanya aku kenapa. Nggak ada yang maksa.' },
  { text: 'Kalau aku mau cerita, mereka dengerin. Kalau nggak, ya sudah, kami diam bareng.' },
];

export const ENDING4: Line[] = [
  { text: 'Hidup seperti itu jelas jauh dari kata ideal. Besok makan apa pun sering nggak ada yang tahu.' },
  { text: 'Tapi waktu itu aku nggak peduli. Aku sedang menikmati sesuatu yang belum pernah aku punya.' },
  { text: 'Rumahku waktu itu nggak punya atap. Isinya segerombolan orang yang nungguin aku sebelum mulai makan, dan langsung pasang badan kalau ada yang ganggu aku.' },
  { text: 'Dan itu sudah lebih dari cukup.' },
];
