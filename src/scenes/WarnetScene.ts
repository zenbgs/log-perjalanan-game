import Phaser from 'phaser';
import { COLOR, FONT } from '../data/config';
import { FLAG, FLAGS_KEY, WARNET } from '../story/chapter1';
import { FLAG4, FLAGS4_KEY, WARNET4 } from '../story/chapter4';
import type { At, WarnetText } from '../story/types';
import { DialogueBox } from '../systems/DialogueBox';
import { Flags } from '../systems/Flags';
import { Music, MUSIC_VOLUME, TRACKS } from '../systems/Music';
import { Sfx } from '../systems/Sfx';
import { isTouchDevice } from '../systems/TouchPad';

type Step = 'intro' | 'farm' | 'sell' | 'joki' | 'bye' | 'done';

const ITEMS_NEEDED = 3;
const JOKI_PRESSES = 4;

/** One visit to the café. Which text to show, which flag to set, where to walk out to. */
interface WarnetRun {
  text: WarnetText;
  flagsKey: string;
  flag: string;
  back: { map: string; spawn: At };
}

const RUNS: Record<string, WarnetRun> = {
  ch1: { text: WARNET, flagsKey: FLAGS_KEY, flag: FLAG.WARNET_DONE, back: { map: 'bandung', spawn: { tx: 30, ty: 10 } } },
  ch4: { text: WARNET4, flagsKey: FLAGS4_KEY, flag: FLAG4.UANG, back: { map: 'bandung-keluarga', spawn: { tx: 30, ty: 10 } } },
};

/**
 * Di dalam warnet. Seluruh layar adalah monitor yang menampilkan "game online".
 * Urutannya farming item, menjual ke om_kantor, jokiin akun om_helm, lalu keluar.
 * Tidak meniru game mana pun. Ini cuma gambaran rasanya jadi "petani" di warnet.
 */
export class WarnetScene extends Phaser.Scene {
  private step: Step = 'intro';
  private dialogue!: DialogueBox;
  private items = 0;
  private hp = 100;
  private joki = 0;

  private hero!: Phaser.GameObjects.Sprite;
  private monster!: Phaser.GameObjects.Graphics;
  private hpBar!: Phaser.GameObjects.Rectangle;
  private status!: Phaser.GameObjects.Text;
  private action!: Phaser.GameObjects.Text;
  private chat!: Phaser.GameObjects.Text;
  private chatLines: string[] = [];
  private chatMaxH = 0;
  private heroX = 0;
  private run: WarnetRun = RUNS.ch1;

  constructor() {
    super('warnet');
  }

  init(data?: { run?: string }): void {
    this.run = RUNS[data?.run ?? 'ch1'] ?? RUNS.ch1;
  }

  create(): void {
    this.step = 'intro';
    this.items = 0;
    this.hp = 100;
    this.joki = 0;
    this.chatLines = [];

    const WARNET = this.run.text;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#120e18').fadeIn(500, 11, 15, 24);
    Music.play(this, TRACKS.c64, MUSIC_VOLUME.world, 1500);

    // Desk and CRT monitor, sized from the screen so it fits phones and desktops alike.
    this.add.rectangle(0, height - 30, width, 30, 0x3b2a20).setOrigin(0);
    const mx = Math.round(Math.max(10, width * 0.06));
    const my = 6;
    const mw = width - mx * 2;
    const mh = height - 52;
    this.add.rectangle(mx, my, mw, mh, 0xc9c3b4).setOrigin(0).setStrokeStyle(2, 0x8d877a);
    this.add.rectangle(width / 2 - 30, my + mh, 60, 14, 0xa59f91).setOrigin(0);
    const sx = mx + 10;
    const sy = my + 10;
    const sw = mw - 20;
    const sh = mh - 26;
    this.add.rectangle(sx, sy, sw, sh, 0x0d1b2a).setOrigin(0);
    this.add.circle(mx + mw - 14, my + mh - 8, 2, 0x7ee787);

    // Bilah judul aplikasi.
    this.add.rectangle(sx, sy, sw, 12, 0x24477a).setOrigin(0);
    this.add.text(sx + 4, sy + 2, WARNET.title, { fontFamily: FONT, fontSize: '8px', color: '#ffffff' });

    // Panel kiri. Arena farming.
    const gx = sx + 6;
    const gy = sy + 18;
    const gw = Math.round((sw - 18) * 0.52);
    const gh = sh - 18 - 24;
    this.add.rectangle(gx, gy, gw, gh, 0x3f7d3a).setOrigin(0).setStrokeStyle(1, 0x2b5a28);
    this.heroX = gx + Math.round(gw * 0.25);
    this.hero = this.add.sprite(this.heroX, gy + gh - 22, 'zain').play('zain-idle-right').setScale(2);
    this.monster = this.add.graphics();
    const mxm = gx + Math.round(gw * 0.72);
    this.drawMonster(mxm, gy + gh - 30);
    this.add.rectangle(mxm - 20, gy + 10, 40, 4, 0x000000).setOrigin(0);
    this.hpBar = this.add.rectangle(mxm - 20, gy + 10, 40, 4, 0xe2504b).setOrigin(0);
    this.tweens.add({ targets: this.monster, y: -3, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Panel kanan. Chat.
    const cx = gx + gw + 6;
    const cw = sx + sw - cx - 6;
    this.add.rectangle(cx, gy, cw, gh, 0x081220).setOrigin(0).setStrokeStyle(1, 0x24477a);
    this.add.text(cx + 4, gy + 3, '#chat', { fontFamily: FONT, fontSize: '8px', color: '#5a8ad6' });
    this.chat = this.add.text(cx + 4, gy + 16, '', {
      fontFamily: FONT,
      fontSize: '8px',
      color: COLOR.text,
      lineSpacing: 4,
      wordWrap: { width: cw - 8, useAdvancedWrap: true },
    });
    this.chatMaxH = gh - 20;

    // Status dan tombol aksi di bawah layar.
    this.status = this.add.text(gx, gy + gh + 8, '', { fontFamily: FONT, fontSize: '8px', color: '#7ee787' });
    this.action = this.add
      .text(sx + sw - 6, gy + gh + 8, '', { fontFamily: FONT, fontSize: '8px', color: '#0d1b2a', backgroundColor: '#f2cc60', padding: { x: 4, y: 2 } })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.act());

    this.dialogue = new DialogueBox(this);
    const kb = this.input.keyboard!;
    for (const k of ['E', 'SPACE', 'ENTER']) kb.on(`keydown-${k}`, () => this.act());
    kb.on('keydown-M', () => Sfx.toggleMute(this.sound));
    this.input.on('pointerup', (_p: Phaser.Input.Pointer, over: unknown[]) => {
      if (over.length === 0) this.act();
    });

    this.refresh();
    this.time.delayedCall(600, () => this.dialogue.open(WARNET.intro, () => this.go('farm')));
  }

  private drawMonster(x: number, y: number): void {
    const g = this.monster;
    g.clear().setPosition(0, 0);
    g.fillStyle(0x6fd3e8).fillEllipse(x, y + 8, 30, 22);
    g.fillStyle(0xffffff).fillCircle(x - 6, y + 5, 3).fillCircle(x + 6, y + 5, 3);
    g.fillStyle(0x0d1b2a).fillCircle(x - 5, y + 5, 1.5).fillCircle(x + 7, y + 5, 1.5);
  }

  private say(from: string, text: string): void {
    this.chatLines.push(`<${from}> ${text}`);
    // Buang pesan paling lama sampai muat di panel chat.
    let shown = this.chatLines.slice();
    this.chat.setText(shown.join('\n'));
    while (shown.length > 1 && this.chat.height > this.chatMaxH) {
      shown = shown.slice(1);
      this.chat.setText(shown.join('\n'));
    }
    Sfx.select();
  }

  private go(step: Step): void {
    const WARNET = this.run.text;
    this.step = step;
    if (step === 'sell') this.say(WARNET.chatBuy.from, WARNET.chatBuy.text);
    if (step === 'joki') this.say(WARNET.chatJoki.from, WARNET.chatJoki.text);
    if (step === 'bye') this.say(WARNET.chatThanks.from, WARNET.chatThanks.text);
    this.refresh();
  }

  private refresh(): void {
    const WARNET = this.run.text;
    const key = isTouchDevice(this) ? '' : ' [E]';
    const label: Record<Step, string> = {
      intro: '',
      farm: `${WARNET.farmHint}${key}`,
      sell: `jual ke ${WARNET.chatBuy.from}${key}`,
      joki: `${WARNET.jokiHint}${key}`,
      bye: `${WARNET.logout}${key}`,
      done: '',
    };
    this.action.setText(label[this.step]).setVisible(label[this.step] !== '');
    const jokiBar = '#'.repeat(this.joki) + '.'.repeat(JOKI_PRESSES - this.joki);
    this.status.setText(this.step === 'joki' || this.step === 'bye' ? `${WARNET.jokiStatus} [${jokiBar}]` : `item ${this.items}/${ITEMS_NEEDED}`);
    this.hpBar.width = 40 * (this.hp / 100);
  }

  private act(): void {
    const WARNET = this.run.text;
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    if (this.step === 'farm') this.farm();
    else if (this.step === 'sell') {
      this.flash(WARNET.sold);
      this.go('joki');
    } else if (this.step === 'joki') {
      this.joki += 1;
      this.swing();
      if (this.joki >= JOKI_PRESSES) {
        this.flash(WARNET.levelUp);
        this.go('bye');
      } else this.refresh();
    } else if (this.step === 'bye') this.leave();
  }

  private swing(): void {
    Sfx.advance();
    this.tweens.killTweensOf(this.hero);
    this.hero.x = this.heroX;
    this.tweens.add({ targets: this.hero, x: this.heroX + 10, duration: 70, yoyo: true });
  }

  private farm(): void {
    const WARNET = this.run.text;
    if (this.items >= ITEMS_NEEDED) return; // waiting for the buyer to show up
    this.swing();
    this.hp = Math.max(0, this.hp - 34);
    this.cameras.main.shake(60, 0.003);
    if (this.hp === 0) {
      this.items += 1;
      Sfx.confirm();
      this.flash(WARNET.itemFound);
      this.hp = 100;
      if (this.items >= ITEMS_NEEDED) {
        this.time.delayedCall(500, () => this.go('sell'));
      }
    }
    this.refresh();
  }

  private flash(text: string): void {
    const t = this.add
      .text(this.scale.width / 2, 90, text, { fontFamily: FONT, fontSize: '8px', color: '#ffe08a', stroke: '#000000', strokeThickness: 3 })
      .setOrigin(0.5)
      .setDepth(50);
    this.tweens.add({ targets: t, y: 70, alpha: 0, duration: 1400, delay: 300, onComplete: () => t.destroy() });
  }

  private leave(): void {
    if (this.step === 'done') return;
    this.step = 'done';
    new Flags(this.run.flagsKey).add(this.run.flag);
    this.cameras.main.fadeOut(700, 11, 15, 24);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
      this.scene.start('world', this.run.back),
    );
  }
}
