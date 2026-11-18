/**
 * Chapter 1. Teks cerita, diambil dari artikel "Anak yang Nggak Tahu Umurnya Sendiri"
 * (Log Perjalanan Hidup #1). Mau ganti kalimat? Edit di sini, logika game tidak perlu disentuh.
 *
 * Aturan gaya (dicek `npm test`). Tanpa titik dua dan tanpa em dash.
 */
import type { Line, WarnetText } from './types';

export const CHAPTER_ID = 'ch1';
export const FLAGS_KEY = `lph:${CHAPTER_ID}`;

export const ZAIN = 'Zain';
export const SITI = 'Siti';
export const KAKEK = 'Kakek';
export const NENEK = 'Nenek';
export const OM_HELM = 'Om helm';
export const OM_BOTAK = 'Om botak';

export const FLAG = {
  INTRO: 'intro',
  DIAJAK_SITI: 'diajak-siti',
  SITI_DONE: 'siti-done',
  WARNET_DONE: 'warnet-done',
  WARNET_TOLD: 'warnet-told',
  M_INTRO: 'malang-intro',
  DISURUH_MAKAN: 'disuruh-makan',
  SUDAH_MAKAN: 'sudah-makan',
  CUCI_DONE: 'cuci-done',
  BUNGKUS_DONE: 'bungkus-done',
} as const;

// ---------- prolog ----------

export const PROLOGUE_COMMAND = 'cat 001-masa-kecil.log';
export const PROLOGUE: string[] = [
  'Kalau ada yang tanya umurku, biasanya aku jawab dua puluh empat. Atau dua puluh lima. Aku sendiri nggak begitu yakin, hehe.',
  'Namaku Zain Bagus Dwi Asmoro.',
  'Katanya aku lahir di Kota Malang. Ada seseorang yang bilang begitu, dan aku percaya saja.',
  'Aku nggak punya orang tua kandung. Yang aku punya hanya orang tua angkat.',
  'Waktu masih kecil aku dibawa ke Bandung, dan di sana aku diasuh oleh tanteku.',
  'Rumah itu jarang sepi. Tapi ramainya bikin aku pengin keluar.',
  'Dan aku memang selalu keluar.',
];
export const CARD_BANDUNG = { label: 'Chapter 1', title: 'Bandung', caption: 'tentang rumah yang berisik, dan rumah yang selalu terbuka' };

// ---------- Bandung ----------

export const INTRO: Line[] = [
  { text: 'Rumah lagi ribut lagi.' },
  { text: 'Gerak pakai panah atau WASD. Tekan E atau Spasi untuk ngobrol. Di HP, tahan layar untuk jalan dan ketuk untuk ngobrol.' },
];

export const NOISE = ['BRAK!', '!!', '...!', 'BERISIK!'];

export const SITI_HOUSE: Line[] = [
  { text: 'Di rumah Siti, aku bisa duduk dengan tenang tanpa takut ada yang tiba-tiba teriak.' },
  { text: 'Aneh juga ya. Aku belajar seperti apa rasanya keluarga yang hangat justru dari keluarga orang lain.' },
  { text: 'Masa SD-ku jauh dari kata teladan. Aku sering nggak masuk sekolah.' },
  { text: 'Yang ada di kepalaku cuma game, dan tempat paling nyaman buat itu ya warnet.' },
];

export const AFTER_WARNET: Line[] = [
  { text: 'Anak SD yang hobinya bolos, punya pelanggan om-om kantoran. Absurd juga sih kalau diceritakan sekarang.' },
  { text: 'Di antara semua itu, ada satu hal yang selalu aku tunggu.' },
  { text: 'Liburan ke Malang.' },
];

export const CARD_MALANG = { label: 'Liburan', title: 'Malang', caption: 'rumah Kakek dan Nenek' };

// ---------- warnet (layar monitor) ----------

/** Pesan chat di dalam game online. Ditampilkan gaya IRC, <nama> pesan. */
export const WARNET: WarnetText = {
  title: 'GAME ONLINE',
  farmHint: 'farming',
  itemFound: 'Dapat item langka!',
  chatBuy: { from: 'om_kantor', text: 'dek, item itu dijual? om beli ya' },
  sold: 'Terjual. Uang jajan nambah.',
  chatJoki: { from: 'om_helm', text: 'dek jokiin akunku sampai naik level ya, om masuk kerja dulu' },
  jokiHint: 'jokiin',
  jokiStatus: 'level om_helm',
  levelUp: 'Level akun om_helm naik!',
  chatThanks: { from: 'om_helm', text: 'mantap dek. besok lagi ya' },
  logout: 'keluar',
  intro: [
    { text: 'Di game online itu aku jadi petani. Itu sebutan buat pemain yang kerjanya ngumpulin item dan uang di dalam game, lalu dijual lagi.' },
  ],
};

// ---------- Malang ----------

export const MALANG_INTRO: Line[] = [
  { text: 'Setiap liburan aku dititipkan ke Kakek dan Nenek.' },
  { text: 'Di rumah merekalah untuk pertama kalinya aku merasa diperhatikan.' },
  { text: 'Tapi jujur, awalnya nggak enak.' },
  { text: 'Kakek dan Nenek itu keras. Mereka orang Jawa yang masih memegang ajaran kejawen, dan aturannya ada di mana-mana.' },
];

export const ENDING: Line[] = [
  { text: 'Waktu itu aku cuma merasa dikekang.' },
  { text: 'Baru belakangan aku ngerti kenapa mereka begitu. Mereka mau repot-repot negur aku dan ngajarin aku, padahal bisa saja mereka diam dan membiarkan.' },
  { text: 'Buat anak yang sebelumnya nggak pernah diurusin, dimarahi pun ternyata bisa terasa seperti disayang.' },
];
