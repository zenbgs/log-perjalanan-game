import { TRACKS } from '../data/tracks';
import {
  BAGI_LINES,
  CARD_LEMBANG,
  ESKRIM_LINES,
  FLAG4,
  FLAGS4_KEY,
  IKAT,
  K_INTRO,
  KUPLUK,
  MERAH,
  RAPOR_WAIT,
  TURNAMEN_LINES,
  ZAIN,
} from '../story/chapter4';
import type { Action, Has, MapDef } from '../story/types';
import { buildBandung, PARK_BENCH } from './bandung';

const DOOR_WARNET = { tx: 30, ty: 9 };
const BENCH_SPOT = { tx: PARK_BENCH.tx + 0.5, ty: PARK_BENCH.ty + 1 };
const GANG = { ikat: { tx: 18, ty: 18 }, merah: { tx: 20, ty: 18 }, kupluk: { tx: 19, ty: 20 } };

/** Sharing the game money. They refuse; Zain insists. Then it is nasi bungkus for everyone, in Lembang. */
const BAGI: Action[] = [
  { say: [{ text: 'Uang dari game sudah di tangan. Nggak seberapa, tapi ada.' }] },
  {
    choose: {
      prompt: { text: 'Mau diapain uangnya?' },
      options: [
        {
          label: 'Simpan sendiri',
          ok: false,
          reply: [{ text: 'Rasanya nggak benar. Mereka selama ini selalu bagi apa pun yang mereka punya ke aku, sekecil apa pun.' }],
        },
        { label: 'Bagi ke mereka', ok: true, reply: [{ who: ZAIN, text: 'Nih. Buat kita.' }] },
      ],
    },
  },
  { say: [{ who: IKAT, text: 'Eh, nggak usah. Itu uangmu, simpan aja.' }, { who: MERAH, text: 'Iya, Zain. Simpan.' }] },
  {
    choose: {
      prompt: { text: 'Mereka malah nolak.' },
      options: [
        { label: 'Ya udah, aku simpan', ok: false, reply: [{ text: 'Nggak. Kali ini aku yang ngotot.' }] },
        {
          label: 'Paksa sampai mau',
          ok: true,
          reply: [
            { who: ZAIN, text: 'Pokoknya ambil. Aku nggak mau tahu.' },
            { who: IKAT, text: 'Haha. Iya, iya. Keras kepala juga kamu.' },
          ],
        },
      ],
    },
  },
  { narrate: BAGI_LINES },
  { set: FLAG4.BAGI },
  { goto: { scene: 'story', data: { card: CARD_LEMBANG, music: 'fire', next: { scene: 'world', data: { map: 'lembang' } } } } },
];

const ikatScript = (has: Has): Action[] =>
  !has(FLAG4.LINDUNG)
    ? [
        {
          say: [
            { who: IKAT, text: 'Zain, sini. Ada yang gangguin kamu lagi nggak?' },
            { who: ZAIN, text: 'Nggak ada.' },
            { who: IKAT, text: 'Bagus. Kalau ada, bilang. Jangan dipendam sendiri kayak waktu di mall itu.' },
          ],
        },
        { narrate: ESKRIM_LINES },
        { set: FLAG4.LINDUNG },
      ]
    : !has(FLAG4.TURNAMEN)
      ? [{ say: [{ who: IKAT, text: 'Katanya ada turnamen di warnet hari ini. Ikut sana.' }] }]
      : !has(FLAG4.RAYAKAN)
        ? [{ say: [{ who: IKAT, text: 'Gimana turnamennya? Cerita ke Si Rambut Merah tuh, dari tadi nanyain.' }] }]
        : !has(FLAG4.RAPOR_PERGI)
          ? [
              {
                say: [
                  { who: IKAT, text: 'Eh, hari ini pembagian rapor kan?' },
                  { who: ZAIN, text: 'Iya. Males ke sekolah.' },
                  { who: IKAT, text: 'Biar aku yang ambil. Kamu tunggu aja di taman.' },
                ],
              },
              { set: FLAG4.RAPOR_PERGI },
              { walk: { npc: 'ikat', path: [{ tx: 30, ty: 18 }, { tx: 39, ty: 18 }], vanish: true } },
            ]
          : !has(FLAG4.RAPOR)
            ? [
                {
                  say: [
                    { who: IKAT, text: 'Nih rapormu.' },
                    { who: IKAT, text: 'Tiga besar! Jarang masuk aja tiga besar. Gimana kalau rajin?' },
                    { who: MERAH, text: 'Wah, adik kita pinter!' },
                    { text: 'Anehnya, walaupun jarang masuk, aku selalu masuk tiga besar. Dan mereka bangganya bukan main, lebih bangga dari aku sendiri.' },
                  ],
                },
                { set: FLAG4.RAPOR },
              ]
            : !has(FLAG4.UANG)
              ? [{ say: [{ who: IKAT, text: 'Mau ke warnet? Sana. Hati-hati, jangan pulang kemaleman.' }] }]
              : BAGI;

export const BANDUNG_KELUARGA: MapDef = {
  id: 'bandung-keluarga',
  flagsKey: FLAGS4_KEY,
  build: () => {
    const m = buildBandung();
    m.sprite(17, 19, 'gitar', false);
    return m;
  },
  music: TRACKS.town,
  spawn: { tx: 16, ty: 20 },

  npcs: [
    { id: 'ikat', sprite: 'punk1', at: GANG.ikat, face: 'down', show: (has) => !has(FLAG4.RAPOR_PERGI) || has(FLAG4.RAPOR_PULANG) },
    { id: 'merah', sprite: 'punk2', at: GANG.merah, face: 'left' },
    { id: 'kupluk', sprite: 'punk3', at: GANG.kupluk, face: 'up' },
  ],

  onEnter: (has) => (has(FLAG4.K_INTRO) ? [] : [{ narrate: K_INTRO }, { set: FLAG4.K_INTRO }]),

  objective: (has) =>
    !has(FLAG4.LINDUNG)
      ? 'Ngobrol dengan Si Ikat Kepala'
      : !has(FLAG4.TURNAMEN)
        ? 'Ikut turnamen di warnet'
        : !has(FLAG4.RAYAKAN)
          ? 'Kabari Si Rambut Merah'
          : !has(FLAG4.RAPOR_PERGI)
            ? 'Ngobrol dengan Si Ikat Kepala'
            : !has(FLAG4.RAPOR_PULANG)
              ? 'Tunggu di bangku taman'
              : !has(FLAG4.RAPOR)
                ? 'Si Ikat Kepala sudah balik'
                : !has(FLAG4.UANG)
                  ? 'Cari uang di warnet'
                  : 'Bagi uangnya ke yang lain',

  interactables: [
    { id: 'ikat', at: { npc: 'ikat' }, script: ikatScript },
    {
      id: 'merah',
      at: { npc: 'merah' },
      script: (has) =>
        has(FLAG4.TURNAMEN) && !has(FLAG4.RAYAKAN)
          ? [
              {
                say: [
                  { who: ZAIN, text: 'Aku menang turnamen.' },
                  { who: MERAH, text: 'Hah? Juara?! Serius?' },
                  { who: MERAH, text: 'Woy, semuanya! Zain juara turnamen!' },
                  { text: 'Mereka heboh, nepuk-nepuk pundakku, cerita ke yang lain seolah aku baru juara sesuatu yang penting.' },
                  { text: 'Di rumah, aku nggak ingat kapan terakhir ada yang nanya hariku gimana.' },
                ],
              },
              { set: FLAG4.RAYAKAN },
            ]
          : has(FLAG4.UANG) && !has(FLAG4.BAGI)
            ? BAGI
            : [{ say: [{ who: MERAH, text: has(FLAG4.RAYAKAN) ? 'Juara turnamen, hehe. Aku masih nggak percaya.' : 'Kenapa, Zain? Cerita aja.' }] }],
    },
    {
      id: 'kupluk',
      at: { npc: 'kupluk' },
      script: (has) => [
        {
          say: [
            {
              who: KUPLUK,
              text: has(FLAG4.RAYAKAN) ? 'Ceritain lagi dong yang final tadi. Aku belum dengar sampai habis.' : 'Sini duduk. Cerita soal game-mu juga boleh.',
            },
          ],
        },
      ],
    },
    {
      id: 'warnet',
      at: DOOR_WARNET,
      script: (has) =>
        !has(FLAG4.LINDUNG)
          ? [{ say: [{ text: 'Warnet. Nanti dulu, Si Ikat Kepala manggil.' }] }]
          : !has(FLAG4.TURNAMEN)
            ? [{ narrate: TURNAMEN_LINES }, { set: FLAG4.TURNAMEN }]
            : has(FLAG4.RAPOR) && !has(FLAG4.UANG)
              ? [{ goto: { scene: 'warnet', data: { run: 'ch4' } } }]
              : [{ say: [{ text: 'Barusan dari sana.' }] }],
    },
    {
      id: 'bangku',
      at: BENCH_SPOT,
      script: (has) =>
        has(FLAG4.RAPOR_PERGI) && !has(FLAG4.RAPOR_PULANG)
          ? [{ narrate: RAPOR_WAIT }, { set: FLAG4.RAPOR_PULANG }]
          : [{ say: [{ text: 'Bangku taman.' }] }],
    },
  ],
};
