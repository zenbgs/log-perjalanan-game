import Phaser from 'phaser';
import { COLOR, FONT, TILE } from '../data/config';
import { BANDUNG_ROAD, buildBandung } from '../maps/bandung';
import { MAPS } from '../maps';
import { CARD_BANDUNG, FLAGS_KEY } from '../story/chapter1';
import { CARD2, FLAGS2_KEY, PROLOGUE2, PROLOGUE2_COMMAND } from '../story/chapter2';
import { CARD3, FLAGS3_KEY, PROLOGUE3, PROLOGUE3_COMMAND } from '../story/chapter3';
import { CARD4, FLAGS4_KEY, PROLOGUE4, PROLOGUE4_COMMAND } from '../story/chapter4';
import type { StoryData } from './StoryScene';
import { LAST_MAP_KEY } from './WorldScene';
import { renderGridMap } from '../systems/renderGridMap';
import { Flags } from '../systems/Flags';
import { Music, MUSIC_VOLUME, TRACKS } from '../systems/Music';
import { Sfx } from '../systems/Sfx';
import { isTouchDevice } from '../systems/TouchPad';

/**
 * Layar judul. Latarnya peta Bandung sungguhan yang bergeser pelan, dengan Zain
 * dan Siti berjalan di jalan utama. Alurnya PRESS START, lalu menu (kalau ada
 * progres tersimpan), lalu prolog atau langsung lanjut main.
 */
/** Chapter 2 opening, passed to StoryScene. */
const CHAPTER2_STORY: StoryData = {
  command: PROLOGUE2_COMMAND,
  lines: PROLOGUE2,
  card: CARD2,
  music: 'snowfall',
  next: { scene: 'world', data: { map: 'rumah-siti' } },
};

/** Chapter 3 opening. */
const CHAPTER3_STORY: StoryData = {
  command: PROLOGUE3_COMMAND,
  lines: PROLOGUE3,
  card: CARD3,
  music: 'c64',
  next: { scene: 'world', data: { map: 'bandung-sepi' } },
};

/** Chapter 4 opening. */
const CHAPTER4_STORY: StoryData = {
  command: PROLOGUE4_COMMAND,
  lines: PROLOGUE4,
  card: CARD4,
  next: { scene: 'world', data: { map: 'bandung-keluarga' } },
};

/** Last visited map, if its chapter still has saved progress (so "Continue" makes sense). */
function resumeMap(): string | undefined {
  try {
    const id = localStorage.getItem(LAST_MAP_KEY);
    const def = id ? MAPS[id] : undefined;
    return def && localStorage.getItem(def.flagsKey) ? def.id : undefined;
  } catch {
    return undefined;
  }
}

export class TitleScene extends Phaser.Scene {
  private stage: 'press' | 'menu' | 'leaving' = 'press';
  private options: { label: string; run: () => void }[] = [];
  private optionButtons: { bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }[] = [];
  private selected = 0;
  private tagline?: Phaser.GameObjects.Text;

  constructor() {
    super('title');
  }

  create(): void {
    this.stage = 'press';
    this.selected = 0;
    this.optionButtons = [];
    const { width, height } = this.scale;
    const cx = width / 2;

    this.buildBackdrop();

    const top = Math.max(40, height * 0.2);
    const touch = isTouchDevice(this);
    // Gelapkan latar supaya teks terbaca, lebih gelap di tengah atas tempat judul.
    this.add.rectangle(0, 0, width, height, COLOR.bg, 0.55).setOrigin(0).setScrollFactor(0).setDepth(100_000);
    this.add.rectangle(0, top - 22, width, 82, COLOR.bg, 0.5).setOrigin(0).setScrollFactor(0).setDepth(100_000);
    this.add.rectangle(0, height - 22, width, 22, COLOR.bg, 0.7).setOrigin(0).setScrollFactor(0).setDepth(100_000);

    const ui = (x: number, y: number, text: string, size: number, color: string) =>
      this.add.text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, color }).setScrollFactor(0).setDepth(100_001);

    // Baris terminal kecil yang mengetik sendiri, benang merah dengan cover artikel.
    const term = ui(12, 12, '', 8, '#7ee787');
    const cmd = 'zain@malang:~/hidup$ tail -f zain.log';
    let n = 0;
    this.time.addEvent({ delay: 45, repeat: cmd.length - 1, callback: () => term.setText(cmd.slice(0, ++n) + '_') });

    const title1 = ui(cx, top, 'LOG PERJALANAN', 16, COLOR.text).setOrigin(0.5);
    const title2 = ui(cx, top + 25, 'HIDUP', 24, COLOR.name).setOrigin(0.5);
    title1.setShadow(2, 2, '#000000', 0, false, true);
    title2.setShadow(2, 2, '#000000', 0, false, true);
    this.tagline = ui(cx, top + 49, 'sebuah cerita, empat chapter', 8, COLOR.dim).setOrigin(0.5);

    const press = ui(cx, height * 0.69, 'PRESS START', 8, COLOR.text).setOrigin(0.5);
    const pressHint = ui(cx, height * 0.69 + 16, touch ? 'ketuk layar' : 'Enter / ketuk layar', 8, COLOR.dim).setOrigin(0.5);
    this.tweens.add({ targets: press, alpha: 0.15, duration: 600, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [3] });

    if (!touch) ui(8, height - 8, 'M  suara', 8, COLOR.dim).setOrigin(0, 1);
    // Narrow phones: the terminal line already fills the top row.
    if (width >= 460) ui(width - 8, 8, 'prototipe v0.7', 8, COLOR.dim).setOrigin(1, 0);

    this.cameras.main.fadeIn(800, 11, 15, 24);
    Music.play(this, TRACKS.town, MUSIC_VOLUME.title, 1500);

    // ---- input ----
    const kb = this.input.keyboard!;
    const onConfirm = () => {
      if (this.stage === 'press') {
        Sfx.confirm();
        press.destroy();
        pressHint.destroy();
        this.openMenu();
      } else if (this.stage === 'menu') {
        Sfx.confirm();
        this.options[this.selected].run();
      }
    };
    kb.on('keydown-ENTER', onConfirm);
    kb.on('keydown-SPACE', onConfirm);
    kb.on('keydown-E', onConfirm);
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-W', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-S', () => this.move(1));
    kb.on('keydown-M', () => Sfx.toggleMute(this.sound));
    // Ketukan di luar opsi menu = PRESS START. Opsi menu punya handler sendiri.
    this.input.on('pointerup', (_p: Phaser.Input.Pointer, over: unknown[]) => {
      if (this.stage === 'press' && over.length === 0) onConfirm();
    });
  }

  private buildBackdrop(): void {
    const grid = buildBandung();
    renderGridMap(this, grid, false);
    const W = grid.widthPx;
    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, grid.heightPx).setRoundPixels(true);
    cam.setScroll(0, Math.max(0, (BANDUNG_ROAD + 3) * TILE - this.scale.height * 0.62));
    this.tweens.add({ targets: cam, scrollX: W - this.scale.width, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Zain dan Siti berjalan berdampingan di jalan utama, lalu muncul lagi dari kiri.
    const roadY = (BANDUNG_ROAD + 3) * TILE + 2;
    const zain = this.add.sprite(-20, roadY, 'zain').setOrigin(0.5, 1).play('zain-walk-right').setDepth(roadY);
    const siti = this.add.sprite(-38, roadY - 3, 'siti').setOrigin(0.5, 1).play('siti-walk-right').setDepth(roadY - 3);
    this.tweens.add({ targets: [zain, siti], x: `+=${W + 80}`, duration: 26000, repeat: -1 });
  }

  private openMenu(): void {
    this.stage = 'menu';
    const resume = resumeMap();
    const start = (key: string, data?: StoryData) => () => {
      new Flags(key).reset();
      this.leave('story', data);
    };
    this.options = [
      ...(resume ? [{ label: 'Lanjutkan', run: () => this.leave('world', { map: resume }) }] : []),
      { label: `${CARD_BANDUNG.label}. ${CARD_BANDUNG.title}`, run: start(FLAGS_KEY) },
      { label: `${CARD2.label}. ${CARD2.title}`, run: start(FLAGS2_KEY, CHAPTER2_STORY) },
      { label: `${CARD3.label}. ${CARD3.title}`, run: start(FLAGS3_KEY, CHAPTER3_STORY) },
      { label: `${CARD4.label}. ${CARD4.title}`, run: start(FLAGS4_KEY, CHAPTER4_STORY) },
    ];
    // Menu entries are buttons, not text lines, so a thumb can hit them on a phone.
    const cx = this.scale.width / 2;
    const h = 17;
    const step = h + 3;
    const w = 200;
    // Start at mid-screen, but move up if the last entry would fall off a short phone screen.
    const lastFits = this.scale.height - 10 - h / 2 - (this.options.length - 1) * step;
    const first = Math.min(Math.max(this.scale.height * 0.5, 112), lastFits);
    // On short screens the menu climbs over the tagline; drop it rather than overlap.
    if (this.tagline && first - h / 2 < this.tagline.getBounds().bottom + 2) this.tagline.setVisible(false);
    this.optionButtons = this.options.map((o, i) => {
      const bg = this.add.rectangle(0, 0, w, h, COLOR.panel, 0.9).setStrokeStyle(1, COLOR.panelEdge);
      const label = this.add.text(0, 0, o.label, { fontFamily: FONT, fontSize: '8px', color: COLOR.text }).setOrigin(0.5);
      const box = this.add.container(cx, first + i * step, [bg, label]).setScrollFactor(0).setDepth(100_001).setSize(w, h);
      box
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.select(i))
        .on('pointerup', () => {
          this.select(i);
          Sfx.confirm();
          o.run();
        });
      return { bg, label };
    });
    this.select(0);
  }

  private move(d: number): void {
    if (this.stage !== 'menu') return;
    this.select((this.selected + d + this.options.length) % this.options.length);
    Sfx.select();
  }

  private select(i: number): void {
    this.selected = i;
    this.optionButtons.forEach((b, j) => {
      const on = j === i;
      b.bg.setFillStyle(on ? 0xf2cc60 : COLOR.panel, on ? 1 : 0.9).setStrokeStyle(1, on ? 0xffe9a8 : COLOR.panelEdge);
      b.label.setColor(on ? '#0b0f18' : COLOR.text);
    });
  }

  private leave(next: 'story' | 'world', data?: object): void {
    if (this.stage === 'leaving') return;
    this.stage = 'leaving';
    this.cameras.main.fadeOut(600, 11, 15, 24);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(next, data));
  }
}
