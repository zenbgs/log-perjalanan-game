import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { Flags } from '../systems/Flags';
import { AFTER_WARNET, CARD_BANDUNG, CARD_MALANG, ENDING, FLAG, MALANG_INTRO, PROLOGUE, SITI_HOUSE, WARNET } from './chapter1';
import * as C2 from './chapter2';
import * as C3 from './chapter3';
import * as C4 from './chapter4';
import type { Action, Line, MapDef } from './types';
import { TRACKS } from '../data/tracks';

const TRACKS_TOWN = TRACKS.town;

const CHAPTERS = [
  { order: Object.values(FLAG) as string[], maps: [MAPS.bandung, MAPS.malang] },
  { order: Object.values(C2.FLAG2) as string[], maps: [MAPS['rumah-siti'], MAPS['bandung-siti']] },
  { order: Object.values(C3.FLAG3) as string[], maps: [MAPS['bandung-sepi'], MAPS.jalanan] },
  { order: Object.values(C4.FLAG4) as string[], maps: [MAPS['bandung-keluarga'], MAPS.lembang] },
];

/** Semua baris teks dalam daftar aksi, termasuk prompt & jawaban pilihan. */
function linesOf(actions: Action[]): Line[] {
  return actions.flatMap((a): Line[] => {
    if ('say' in a) return a.say;
    if ('narrate' in a) return a.narrate;
    if ('end' in a) return a.end;
    if ('choose' in a) return [a.choose.prompt, ...a.choose.options.flatMap((o) => [{ text: o.label }, ...o.reply])];
    return [];
  });
}

/** Evaluate scripts at every point of progress (each prefix of the chapter's flag order). */
function everyState<T>(fn: (has: (f: string) => boolean, maps: MapDef[]) => T[]): T[] {
  const out: T[] = [];
  for (const { order, maps } of CHAPTERS) {
    for (let n = 0; n <= order.length; n++) {
      const set = new Set(order.slice(0, n));
      out.push(...fn((f) => set.has(f), maps));
    }
  }
  return out;
}

function allLines(): Line[] {
  return [
    ...C2.PROLOGUE2.map((text) => ({ text })),
    { text: C2.CARD2.caption },
    ...[C2.ROOM_INTRO, C2.PS_LINES, C2.SAKIT_LINES, C2.WALKER_LINES, C2.NANTI_LINES, C2.KURSI_LINES, C2.RENTAL_LINES, C2.PERGI_LINES, C2.AFTER_PERGI, C2.ENDING2].flat(),
    ...Object.values(C2.MEMORY_LINES).map((text) => ({ text })),
    ...C3.PROLOGUE3.map((text) => ({ text })),
    { text: C3.CARD3.caption },
    ...[C3.SEPI_LINES, C3.DAY1_WARNET, C3.DAY1_HOME, C3.DAY2_WARNET, C3.WARUNG_LINES, C3.DAY2_HOME, C3.DAY3_WARNET, C3.JALAN_INTRO, C3.MEET_LINES, C3.MAKAN_LINES, C3.ENDING3].flat(),
    ...C4.PROLOGUE4.map((text) => ({ text })),
    ...[C4.CARD4, C4.CARD_LEMBANG].map((c) => ({ text: c.caption })),
    ...[C4.K_INTRO, C4.ESKRIM_LINES, C4.TURNAMEN_LINES, C4.RAPOR_WAIT, C4.BAGI_LINES, C4.LEMBANG_INTRO, C4.MURUNG_LINES, C4.DATANG_LINES, C4.TEMANI_LINES, C4.ENDING4, C4.WARNET4.intro].flat(),
    ...[C4.WARNET4.chatBuy, C4.WARNET4.chatJoki, C4.WARNET4.chatThanks].map((c) => ({ text: c.text })),
    ...PROLOGUE.map((text) => ({ text })),
    ...[CARD_BANDUNG, CARD_MALANG].flatMap((c) => [{ text: c.caption }]),
    ...SITI_HOUSE,
    ...AFTER_WARNET,
    ...MALANG_INTRO,
    ...ENDING,
    ...WARNET.intro,
    ...[WARNET.chatBuy, WARNET.chatJoki, WARNET.chatThanks].map((c) => ({ text: c.text })),
    ...everyState((has, maps) => maps.flatMap((m) => [...linesOf(m.onEnter(has)), ...m.interactables.flatMap((i) => linesOf(i.script(has)))])),
    ...everyState((has, maps) => maps.map((m) => ({ text: m.objective(has) ?? '' }))),
  ];
}

describe('gaya tulisan', () => {
  it('teks cerita tanpa titik dua dan tanpa em dash', () => {
    for (const l of allLines()) expect(l.text, l.text).not.toMatch(/[:—]/);
  });

  it('tiap pertanyaan punya tepat satu jawaban benar', () => {
    const choices = everyState((has, maps) =>
      maps.flatMap((m) => m.interactables.flatMap((i) => i.script(has).filter((a) => 'choose' in a))),
    );
    expect(choices.length).toBeGreaterThan(0);
    for (const c of choices) if ('choose' in c) expect(c.choose.options.filter((o) => o.ok)).toHaveLength(1);
  });
});

describe('peta', () => {
  it.each(Object.values(MAPS))('$id. id interaksi unik, NPC yang dirujuk ada', (m: MapDef) => {
    const ids = m.interactables.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const npcs = new Set(m.npcs.map((n) => n.id));
    for (const i of m.interactables) if ('npc' in i.at) expect(npcs.has(i.at.npc), i.id).toBe(true);
  });

  it.each(Object.values(MAPS))('$id. titik spawn dan NPC tidak berada di tile padat', (m: MapDef) => {
    const g = m.build();
    expect(g.solid[m.spawn.ty][m.spawn.tx], 'spawn').toBe(false);
    for (const n of m.npcs) expect(g.solid[n.at.ty][n.at.tx], n.id).toBe(false);
  });
});

describe('playthrough', () => {
  /** Jalankan skrip seperti WorldScene, memilih jawaban benar. Kembalikan aksi goto/end yang ditemui. */
  function play(map: MapDef, id: string, flags: Set<string>): Action[] {
    const has = (f: string) => flags.has(f);
    const i = map.interactables.find((x) => x.id === id)!;
    const exits: Action[] = [];
    for (const a of i.script(has)) {
      if ('set' in a) flags.add(a.set);
      if ('goto' in a || 'end' in a) exits.push(a);
    }
    return exits;
  }

  it('bisa ditamatkan dari awal sampai akhir', () => {
    const f = new Set<string>([FLAG.INTRO]);
    const { bandung, malang } = MAPS;

    play(bandung, 'siti', f);
    expect(f.has(FLAG.DIAJAK_SITI)).toBe(true);
    play(bandung, 'pintu-siti', f);
    expect(f.has(FLAG.SITI_DONE)).toBe(true);

    const toWarnet = play(bandung, 'warnet', f);
    expect(toWarnet).toEqual([{ goto: { scene: 'warnet' } }]);
    f.add(FLAG.WARNET_DONE); // dipasang WarnetScene saat keluar

    const toMalang = play(bandung, 'halte', f);
    expect(toMalang[0] && 'goto' in toMalang[0] && toMalang[0].goto.scene).toBe('story');

    for (const id of ['nenek', 'meja', 'keran', 'nenek']) play(malang, id, f);
    expect(f.has(FLAG.BUNGKUS_DONE)).toBe(true);
    const end = play(malang, 'kakek', f);
    expect(end.some((a) => 'end' in a)).toBe(true);
  });

  it('Chapter 2 bisa ditamatkan, termasuk ketiga bayang-bayang', () => {
    const F = C2.FLAG2;
    const f = new Set<string>([F.RS_INTRO]);
    const room = MAPS['rumah-siti'];
    const town = MAPS['bandung-siti'];

    expect(play(room, 'pintu', f)).toEqual([]); // belum boleh keluar
    play(room, 'tv', f);
    play(room, 'siti', f);
    expect(f.has(F.MASAK_DONE)).toBe(true);
    const out = play(room, 'pintu', f);
    expect(out[0] && 'goto' in out[0] && out[0].goto.data).toMatchObject({ map: 'bandung-siti' });
    expect(f.has(F.SAKIT)).toBe(true);

    f.add(F.JALAN_INTRO);
    play(town, 'siti', f);
    const npc = town.npcs.find((n) => n.id === 'siti')!;
    const has = (x: string) => f.has(x);
    expect(npc.follow?.(has)).toBe(true);
    expect(town.playerSpeed?.(has)).toBeLessThan(40); // langkah ikut melambat
    expect(npc.aid?.(has)).toBe('walker');

    play(town, 'bangku', f);
    expect(f.has(F.KURSI_RODA)).toBe(true);
    expect(npc.aid?.(has)).toBe('wheelchair');
    expect(npc.follow?.(has)).toBe(false);
    play(town, 'siti', f);
    expect(npc.follow?.(has)).toBe(true);
    play(town, 'rental', f);
    expect(f.has(F.PERGI)).toBe(true);
    expect(npc.show?.(has)).toBe(false);
    expect(town.music instanceof Function && town.music(has)).toBeUndefined(); // hening
    expect(town.tint?.(has)).toBeDefined();

    f.add(F.PERGI_TOLD);
    const ends = ['bayang-stik', 'bayang-masak', 'bayang-nanti'].map((id) => play(town, id, f));
    expect(ends.slice(0, 2).every((e) => e.length === 0)).toBe(true);
    expect(ends[2].some((a) => 'end' in a)).toBe(true);
  });

  it('Chapter 3 bisa ditamatkan. Tiga hari sepi, lalu keluarga dari jalanan', () => {
    const F = C3.FLAG3;
    const f = new Set<string>([F.INTRO]);
    const sepi = MAPS['bandung-sepi'];
    const street = MAPS.jalanan;
    const has = (x: string) => f.has(x);

    for (const id of ['warnet', 'rumah', 'warnet', 'warung', 'rumah']) play(sepi, id, f);
    expect(f.has(F.H2_RUMAH)).toBe(true);
    const out = play(sepi, 'warnet', f);
    expect(out[0] && 'goto' in out[0] && out[0].goto.data).toMatchObject({ map: 'jalanan' });

    f.add(F.J_INTRO);
    play(street, 'ikat', f);
    expect(f.has(F.DEKAT1)).toBe(false); // belum lontang-lantung, cuma lewat
    play(street, 'bangku', f);
    play(street, 'halte', f);
    for (let i = 0; i < 3; i++) play(street, 'ikat', f);
    expect(f.has(F.GABUNG)).toBe(true);
    expect(typeof street.music === 'function' && street.music(has)).toBe(TRACKS_TOWN);

    play(street, 'merah', f);
    expect(f.has(F.MAKAN_DATANG)).toBe(true);
    const kupluk = street.npcs.find((n) => n.id === 'kupluk')!;
    expect(kupluk.show?.(has)).toBe(true);
    play(street, 'kupluk', f);
    expect(kupluk.follow?.(has)).toBe(true);
    play(street, 'ikat', f);
    expect(f.has(F.MAKAN_DONE)).toBe(true);

    play(street, 'merah', f);
    expect(f.has(F.RAHASIA)).toBe(true);
    play(street, 'om-botak', f); // belum punya gitar, belum bisa ngamen
    expect(f.has(F.N_BOTAK)).toBe(false);
    play(street, 'ikat', f);
    for (const id of ['om-botak', 'om-helm', 'warung']) play(street, id, f);
    const end = play(street, 'ikat', f);
    expect(end.some((a) => 'end' in a)).toBe(true);
  });

  it('Chapter 4 bisa ditamatkan. Dilindungi, dirayakan, berbagi, lalu malam di Lembang', () => {
    const F = C4.FLAG4;
    const f = new Set<string>([F.K_INTRO]);
    const town = MAPS['bandung-keluarga'];
    const camp = MAPS.lembang;
    const has = (x: string) => f.has(x);

    expect(play(town, 'warnet', f)).toEqual([]); // dipanggil Si Ikat Kepala dulu
    expect(f.has(F.TURNAMEN)).toBe(false);
    play(town, 'ikat', f);
    expect(f.has(F.LINDUNG)).toBe(true);
    play(town, 'warnet', f);
    play(town, 'merah', f);
    expect(f.has(F.RAYAKAN)).toBe(true);

    const ikat = town.npcs.find((n) => n.id === 'ikat')!;
    play(town, 'ikat', f);
    expect(ikat.show?.(has)).toBe(false); // pergi ambil rapor
    play(town, 'bangku', f);
    expect(ikat.show?.(has)).toBe(true); // sudah balik
    play(town, 'ikat', f);
    expect(f.has(F.RAPOR)).toBe(true);

    expect(play(town, 'warnet', f)).toEqual([{ goto: { scene: 'warnet', data: { run: 'ch4' } } }]);
    f.add(F.UANG); // dipasang WarnetScene saat keluar
    const out = play(town, 'ikat', f);
    expect(f.has(F.BAGI)).toBe(true);
    expect(out[0] && 'goto' in out[0] && out[0].goto.data).toMatchObject({ next: { data: { map: 'lembang' } } });

    f.add(F.L_INTRO);
    expect(play(camp, 'api', f)).toEqual([]); // belum waktunya
    play(camp, 'pohon', f);
    const temani = camp.npcs.find((n) => n.id === 'kupluk-temani')!;
    expect(temani.show?.(has)).toBe(true);
    play(camp, 'kupluk-temani', f);
    expect(temani.follow?.(has)).toBe(true);
    const end = play(camp, 'api', f);
    expect(end.some((a) => 'end' in a)).toBe(true);
  });

  it('halte tidak bisa dipakai sebelum ke warnet', () => {
    const f = new Set<string>([FLAG.INTRO, FLAG.DIAJAK_SITI, FLAG.SITI_DONE]);
    expect(play(MAPS.bandung, 'halte', f)).toEqual([]);
  });
});

describe('Flags', () => {
  function memStorage() {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
    };
  }

  it('progres bertahan antar sesi', () => {
    const s = memStorage();
    new Flags('k', s).add('a');
    expect(new Flags('k', s).has('a')).toBe(true);
  });

  it('reset menghapus progres tersimpan', () => {
    const s = memStorage();
    const f = new Flags('k', s);
    f.add('a');
    f.reset();
    expect(new Flags('k', s).has('a')).toBe(false);
  });

  it('data rusak tidak bikin crash', () => {
    const s = memStorage();
    s.setItem('k', '{bukan json');
    expect(new Flags('k', s).has('a')).toBe(false);
  });
});
