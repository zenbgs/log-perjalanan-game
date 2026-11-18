import { TILE_ID } from '../data/tiles';
import { TRACKS } from '../data/tracks';
import {
  DATANG_LINES,
  ENDING4,
  FLAG4,
  FLAGS4_KEY,
  IKAT,
  KUPLUK,
  LEMBANG_INTRO,
  MERAH,
  MURUNG_LINES,
  TEMANI_LINES,
} from '../story/chapter4';
import type { MapDef } from '../story/types';
import { GridMap } from '../systems/GridMap';

const FIRE = { tx: 16, ty: 10 };
/** The lone tree where Zain goes to sit by himself. */
const LONE_TREE = { tx: 26, ty: 6 };
const LONE_SPOT = { tx: 26, ty: 7 };

/** Trees scattered around the clearing. Kept clear of the fire and the lone tree. */
const TREES: [number, number][] = [
  [4, 5], [7, 3], [9, 7], [5, 11], [3, 15], [8, 14], [11, 17], [6, 17], [2, 9], [10, 11], [3, 3], [9, 15],
  [13, 3], [19, 3], [22, 5], [23, 9], [29, 4], [29, 10], [27, 13], [23, 15], [20, 17], [12, 14], [26, 17],
  [21, 13], [25, 15], [28, 16], [29, 7], [16, 3], [24, 2], [2, 13], [17, 16],
];

function buildLembang(): GridMap {
  const m = new GridMap(32, 20, TILE_ID.GRASS);
  // Thick woods on every edge.
  for (let x = 0; x < m.cols; x += 2) m.tree(x, 1).tree(x + 1, 19);
  for (let y = 3; y < m.rows - 1; y += 2) m.tree(0, y).tree(m.cols - 1, y);
  for (const [x, y] of TREES) m.tree(x, y);
  m.tree(LONE_TREE.tx, LONE_TREE.ty);
  m.prop(10, 4, TILE_ID.TREE_SMALL).prop(21, 12, TILE_ID.TREE_SMALL).prop(4, 8, TILE_ID.TREE_SMALL).prop(25, 11, TILE_ID.TREE_SMALL);
  m.prop(13, 17, TILE_ID.HEDGE[0]).prop(14, 17, TILE_ID.HEDGE[1]).prop(15, 17, TILE_ID.HEDGE[2]);
  m.sprite(FIRE.tx, FIRE.ty, 'api');
  m.sprite(17, 12, 'gitar', false);
  return m;
}

/** Night in Lembang. Zain sits alone, Si Kupluk keeps him company without asking, and they walk back to the fire. */
export const LEMBANG: MapDef = {
  id: 'lembang',
  flagsKey: FLAGS4_KEY,
  build: buildLembang,
  music: TRACKS.fire,
  endMusic: TRACKS.fire,
  tint: () => ({ color: 0x07102a, alpha: 0.55 }),
  glow: [FIRE],
  spawn: { tx: 16, ty: 13 },

  npcs: [
    { id: 'ikat', sprite: 'punk1', at: { tx: 16, ty: 9 }, face: 'down' },
    { id: 'merah', sprite: 'punk2', at: { tx: 14, ty: 10 }, face: 'right' },
    { id: 'kupluk', sprite: 'punk3', at: { tx: 18, ty: 10 }, face: 'left', show: (has) => !has(FLAG4.MURUNG) },
    {
      id: 'kupluk-temani',
      sprite: 'punk3',
      at: { tx: 25, ty: 7 },
      face: 'right',
      show: (has) => has(FLAG4.MURUNG),
      follow: (has) => has(FLAG4.TEMANI),
    },
  ],

  onEnter: (has) => (has(FLAG4.L_INTRO) ? [] : [{ narrate: LEMBANG_INTRO }, { set: FLAG4.L_INTRO }]),

  objective: (has) =>
    !has(FLAG4.MURUNG) ? 'Duduk sendiri di bawah pohon' : !has(FLAG4.TEMANI) ? 'Si Kupluk di sebelahmu' : 'Kembali ke api unggun',

  interactables: [
    {
      id: 'pohon',
      at: LONE_SPOT,
      script: (has) =>
        has(FLAG4.MURUNG)
          ? [{ say: [{ text: 'Angin lewat pepohonan. Dingin.' }] }]
          : [{ say: MURUNG_LINES }, { set: FLAG4.MURUNG }, { narrate: DATANG_LINES }],
    },
    {
      id: 'kupluk-temani',
      at: { npc: 'kupluk-temani' },
      script: () => [
        { say: [{ who: KUPLUK, text: '...' }, ...TEMANI_LINES, { who: KUPLUK, text: 'Dingin ya. Balik ke api yuk.' }] },
        { set: FLAG4.TEMANI },
      ],
    },
    {
      id: 'api',
      at: { tx: FIRE.tx, ty: FIRE.ty + 1 },
      script: (has) =>
        has(FLAG4.TEMANI)
          ? [{ say: [{ who: MERAH, text: 'Nah, balik juga. Sini, dekat api.' }] }, { end: ENDING4 }]
          : [{ say: [{ text: 'Apinya hangat. Tapi malam ini aku pengin duduk sendiri dulu.' }] }],
    },
    {
      id: 'ikat',
      at: { npc: 'ikat' },
      script: () => [{ say: [{ who: IKAT, text: 'Tidur dekat api ya. Di sini kalau malam dingin banget.' }] }],
    },
    {
      id: 'merah',
      at: { npc: 'merah' },
      script: () => [{ say: [{ who: MERAH, text: 'Besok ngamen ke mana kita?' }] }],
    },
    {
      id: 'kupluk',
      at: { npc: 'kupluk' },
      script: () => [{ say: [{ who: KUPLUK, text: 'Nasi bungkus tadi enak ya. Makasih, Zain.' }] }],
    },
  ],
};
