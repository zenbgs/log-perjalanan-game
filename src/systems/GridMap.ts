import { TILE } from '../data/config';
import { TILE_ID, type Nine, type Wall } from '../data/tiles';

export const EMPTY = -1;

/**
 * Indoor tiles (Kenney Roguelike Indoors) live in a second tileset. Their ids are
 * offset by this value so one number can address either sheet. Use `indoor(i)`.
 */
export const INDOOR_BASE = 1000;
export const indoor = (i: number) => INDOOR_BASE + i;

/** Hand-drawn props in `props.png`, in strip order. See tools/pack_assets.py. */
export const PROP_FRAME = { tv: 0, walker: 1, wheelchair: 2, toys: 3, mie: 4, gitar: 5, nasi: 6, api: 7 } as const;
export type PropName = keyof typeof PROP_FRAME;

export interface MapProp {
  tx: number;
  ty: number;
  name: PropName;
}

/** Label teks di peta (papan nama warung, warnet, dst). Posisi dalam tile. */
export interface MapLabel {
  tx: number;
  ty: number;
  text: string;
}

/**
 * Peta berbasis grid yang disusun lewat kode. Tiga lapisan.
 * `ground` di paling bawah, `deco` (dinding, batang pohon, perabot) di bawah karakter,
 * `over` (atap, daun pohon) di atas karakter, supaya karakter bisa lewat "di belakangnya".
 * `solid` menandai tile yang tidak bisa dilewati.
 */
export class GridMap {
  readonly ground: number[][];
  readonly deco: number[][];
  readonly over: number[][];
  readonly solid: boolean[][];
  readonly labels: MapLabel[] = [];
  readonly props: MapProp[] = [];

  constructor(
    readonly cols: number,
    readonly rows: number,
    fill: number,
  ) {
    const grid = <T>(v: T) => Array.from({ length: rows }, () => Array<T>(cols).fill(v));
    this.ground = grid(fill);
    this.deco = grid(EMPTY);
    this.over = grid(EMPTY);
    this.solid = grid(false);
  }

  private inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }

  put(layer: number[][], x: number, y: number, t: number): this {
    if (this.inside(x, y)) layer[y][x] = t;
    return this;
  }

  fill(layer: number[][], x: number, y: number, w: number, h: number, t: number): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.put(layer, x + i, y + j, t);
    return this;
  }

  /** Persegi dengan tepi dan sudut (9-slice). */
  nine(layer: number[][], x: number, y: number, w: number, h: number, n: Nine): this {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const col = i === 0 ? 0 : i === w - 1 ? 2 : 1;
        const row = j === 0 ? 0 : j === h - 1 ? 2 : 1;
        this.put(layer, x + i, y + j, n[row * 3 + col]);
      }
    }
    return this;
  }

  block(x: number, y: number, w: number, h: number): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (this.inside(x + i, y + j)) this.solid[y + j][x + i] = true;
    return this;
  }

  /**
   * Bangunan tampak 3/4. Atap (lapisan atas) setinggi `roofH`, lalu dinding depan 2 baris.
   * Mengembalikan posisi tile tepat di depan pintu.
   */
  building(
    x: number,
    y: number,
    w: number,
    roofH: number,
    roof: Nine,
    wall: Wall,
    opt: { doorCol: number; door?: number; windows?: number[]; label?: string },
  ): { tx: number; ty: number } {
    this.nine(this.over, x, y, w, roofH, roof);
    const wy = y + roofH;
    for (let i = 0; i < w; i++) {
      const k = i === 0 ? 0 : i === w - 1 ? 2 : 1;
      this.put(this.deco, x + i, wy, wall.top[k]);
      this.put(this.deco, x + i, wy + 1, wall.bottom[k]);
    }
    // Jendela dan pintu adalah tile transparan yang ditumpuk di atas dinding.
    for (const c of opt.windows ?? []) this.put(this.over, x + c, wy, TILE_ID.WINDOW);
    this.put(this.over, x + opt.doorCol, wy + 1, opt.door ?? TILE_ID.DOOR);
    this.block(x, y, w, roofH + 2);
    if (opt.label) this.labels.push({ tx: x + w / 2, ty: wy, text: opt.label });
    return { tx: x + opt.doorCol, ty: wy + 2 };
  }

  /** Pohon 2 tile. Batang di (x, y) padat, daun di atasnya menutupi karakter. */
  tree(x: number, y: number, kind: readonly number[] = TILE_ID.TREE_GREEN): this {
    this.put(this.over, x, y - 1, kind[0]);
    this.put(this.deco, x, y, kind[1]);
    return this.block(x, y, 1, 1);
  }

  /** Objek 1 tile di lapisan dekorasi. */
  prop(x: number, y: number, t: number, solid = true): this {
    this.put(this.deco, x, y, t);
    return solid ? this.block(x, y, 1, 1) : this;
  }

  /** Hand-drawn prop (props.png), y-sorted with characters. */
  sprite(x: number, y: number, name: PropName, solid = true): this {
    this.props.push({ tx: x, ty: y, name });
    return solid ? this.block(x, y, 1, 1) : this;
  }

  /** Objek 2 tile bertumpuk (atas di lapisan atas). Contoh rambu, lampu jalan. */
  tall(x: number, y: number, pair: readonly number[]): this {
    this.put(this.over, x, y - 1, pair[0]);
    return this.prop(x, y, pair[1]);
  }

  /** Jalan aspal horizontal dengan trotoar di atas dan bawahnya. */
  road(y: number): this {
    this.fill(this.ground, 0, y, this.cols, 1, TILE_ID.SIDEWALK[4]);
    this.fill(this.ground, 0, y + 1, this.cols, 3, TILE_ID.ASPHALT);
    for (let x = 1; x < this.cols; x += 3) this.put(this.ground, x, y + 2, TILE_ID.ROAD_DASH);
    this.fill(this.ground, 0, y + 4, this.cols, 1, TILE_ID.SIDEWALK[4]);
    return this;
  }

  get widthPx(): number {
    return this.cols * TILE;
  }

  get heightPx(): number {
    return this.rows * TILE;
  }
}
