"""Prepare game assets in public/assets/ from Kenney packs (CC0) plus a few hand-drawn props.

Sumber disimpan di repo: assets-src/kenney-rpg-urban/tilemap_packed.png (27x18 tile, 16px, tanpa spasi).
Jalankan ulang kalau sumber berubah. Jangan edit hasil di public/assets/ secara manual.

    python tools/pack_assets.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "kenney-rpg-urban" / "tilemap_packed.png"
INDOOR = ROOT / "assets-src" / "kenney-roguelike-indoors" / "roguelikeIndoor_transparent.png"
OUT = ROOT / "public" / "assets"
COLS = 27
T = 16

# Karakter di sheet: 4 kolom (samping, depan, belakang, samping-cermin) x 3 baris
# (diam, langkah 1, langkah 2). Index = tile kiri-atas blok karakter.
KARAKTER = {
    "zain": 23,      # anak kaus hijau
    "siti": 104,     # anak perempuan rambut panjang
    "kakek": 185,    # rambut abu, berjenggot
    "pekerja": 266,  # helm kuning, om-om pelanggan
    "bapak": 347,    # botak, om-om pelanggan
    "nenek": 428,    # rambut gelap, diwarnai ulang jadi abu (lihat UBAN)
    # Chapter 3 street kids. Base sprites recolored so they read as different people.
    "punk1": 428,    # headband, dark hair, unchanged colors
    "punk2": 23,     # red hair, black tee
    "punk3": 266,    # dark beanie instead of a hard hat, olive jacket
}

# Per-character color swaps, measured from the base tiles.
RECOLOR = {
    "punk2": {
        (220, 134, 82, 255): (214, 64, 64, 255),
        (197, 118, 82, 255): (176, 46, 52, 255),
        (66, 163, 121, 255): (58, 58, 68, 255),
        (54, 144, 105, 255): (40, 40, 48, 255),
        (214, 212, 170, 255): (92, 102, 140, 255),
    },
    "punk3": {
        (245, 169, 76, 255): (74, 74, 86, 255),
        (218, 146, 62, 255): (60, 60, 70, 255),
        (188, 125, 54, 255): (48, 48, 56, 255),
        (145, 142, 185, 255): (112, 122, 82, 255),
    },
}

# Rambut gelap -> uban, khusus Nenek. Warna diukur dari tile 429.
UBAN = {
    (55, 55, 51, 255): (150, 150, 146, 255),
    (96, 96, 90, 255): (204, 204, 198, 255),
}


def tile(sheet: Image.Image, i: int) -> Image.Image:
    x, y = (i % COLS) * T, (i // COLS) * T
    return sheet.crop((x, y, x + T, y + T))


# Hand-drawn props that no Kenney pack has. One letter = one pixel, "." = transparent.
# Colors are sampled from the Kenney sheets so the props do not look pasted in.
PALETTE = {
    "K": (43, 40, 46, 255),     # outline
    "G": (92, 92, 104, 255),    # dark grey
    "L": (160, 160, 172, 255),  # light grey
    "W": (236, 236, 240, 255),  # white
    "B": (79, 163, 217, 255),   # screen
    "D": (30, 58, 92, 255),     # screen edge
    "O": (199, 120, 60, 255),   # wood
    "N": (138, 90, 51, 255),    # dark wood
    "R": (210, 76, 63, 255),    # red
    "S": (196, 198, 206, 255),  # steel
    "Y": (242, 204, 96, 255),   # yellow
    "P": (214, 170, 120, 255),  # brown paper
    "M": (232, 226, 210, 255),  # newspaper
}

PROPS = {
    # CRT TV on a wooden stand, PS2 on the shelf below.
    "tv": [
        "................",
        "..KKKKKKKKKKKK..",
        "..KGGGGGGGGGGK..",
        "..KGDDDDDDDDGK..",
        "..KGDBBBBBBDGK..",
        "..KGDBWBBBBDGK..",
        "..KGDBBBBBBDGK..",
        "..KGDDDDDDDDGK..",
        "..KGGGGGGGLRGK..",
        "..KKKKKKKKKKKK..",
        "...NNNNNNNNNN...",
        "...NOOOOOOOON...",
        "...NOKKKKKKON...",
        "...NOGKKKKKON...",
        "...NOOOOOOOON...",
        "...NN......NN...",
    ],
    # Walking frame (alat bantu jalan), seen from the front.
    "walker": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "...SSSSSSSSSS...",
        "...S........S...",
        "...SSSSSSSSSS...",
        "...S........S...",
        "...S........S...",
        "...S........S...",
        "...S........S...",
        "...S........S...",
        "...S........S...",
        "..KK........KK..",
        "................",
    ],
    # Wheelchair drawn over the lower half of a sitting character.
    "wheelchair": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        ".KK..........KK.",
        "KSSK........KSSK",
        "KSLK........KLSK",
        "KSLKGGGGGGGGKLSK",
        "KSLKGGGGGGGGKLSK",
        "KSLK........KLSK",
        "KSSK........KSSK",
        ".KK..KK..KK..KK.",
        ".....GG..GG.....",
        "................",
    ],
    # Toy cooking set (masak-masakan): a little pot and a plate.
    "toys": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "...KKKKK........",
        "..KRRRRRK.......",
        ".KKRRRRRKK......",
        "..KRRRRRK..WWWW.",
        "..KRRRRRK.WLLLLW",
        "...KKKKK...WWWW.",
        "................",
        "................",
        "................",
        "................",
    ],
    # Instant noodle packs, a little stack of them.
    "mie": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "....KKKKKKKK....",
        "....KYYYYYYK....",
        "....KYRRRRYK....",
        "..KKKKKKKKKKKK..",
        "..KYYYYYYYYYYK..",
        "..KYRRRRRRRRYK..",
        "..KYYYYYYYYYYK..",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
    ],
    # Small guitar for busking (ngamen).
    "gitar": [
        "................",
        ".............KK.",
        "............KNK.",
        "...........KNK..",
        "..........KNK...",
        ".........KNK....",
        "....KKK.KNK.....",
        "...KOOOKNK......",
        "..KOOOOOKK......",
        "..KOOKKOOK......",
        "..KOOKKOOK......",
        "..KOOOOOOK......",
        "...KOOOOK.......",
        "....KKKK........",
        "................",
        "................",
    ],
    # Rice wrapped in brown paper (nasi bungkus) on a sheet of newspaper.
    "nasi": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "........KKK.....",
        "..KKK..KPPPK....",
        ".KPPPK.KPPPK....",
        ".KPPPKKKKKKKK...",
        "MMKKKKMMMMMMMMM.",
        "MMMMMMMMMMMMMMM.",
        "................",
        "................",
        "................",
    ],
    # Campfire (api unggun) in Lembang: flames over crossed logs, ringed by stones.
    "api": [
        "................",
        "................",
        "................",
        ".......Y........",
        "......YY........",
        "......YRY.......",
        ".....YRRY..Y....",
        ".....RRYR.YY....",
        "....RRYYRRYR....",
        "....RYYYYRRR....",
        "...KRRYYYYRK....",
        "..NNNKRRRKNNN...",
        ".GNOOONNNOOONG..",
        "..GNNOOOOONNG...",
        "...GGNNNNNGG....",
        "................",
    ],
}


def draw(rows: list[str]) -> Image.Image:
    assert len(rows) == T and all(len(r) == T for r in rows), "props must be 16x16"
    img = Image.new("RGBA", (T, T))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != ".":
                img.putpixel((x, y), PALETTE[ch])
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SRC).convert("RGBA")
    sheet.save(OUT / "city.png")
    print("tileset city.png", sheet.size)

    # Indoor sheet has 1px spacing between tiles. Repack it tight so both tilesets
    # use the same 16px grid with no spacing.
    indoor = Image.open(INDOOR).convert("RGBA")
    cols, rows = (indoor.width + 1) // 17, (indoor.height + 1) // 17
    tight = Image.new("RGBA", (cols * T, rows * T))
    for r in range(rows):
        for c in range(cols):
            tight.paste(indoor.crop((c * 17, r * 17, c * 17 + T, r * 17 + T)), (c * T, r * T))
    tight.save(OUT / "indoor.png")
    print("tileset indoor.png", tight.size)

    strip = Image.new("RGBA", (T * len(PROPS), T))
    for i, rows_ in enumerate(PROPS.values()):
        strip.paste(draw(rows_), (i * T, 0))
    strip.save(OUT / "props.png")
    print("props.png", list(PROPS))

    for nama, base in KARAKTER.items():
        out = Image.new("RGBA", (4 * T, 3 * T))
        for r in range(3):
            for c in range(4):
                out.paste(tile(sheet, base + r * COLS + c), (c * T, r * T))
        swap = UBAN if nama == "nenek" else RECOLOR.get(nama)
        if swap:
            px = out.load()
            for y in range(out.height):
                for x in range(out.width):
                    px[x, y] = swap.get(px[x, y], px[x, y])
        out.save(OUT / f"{nama}.png")
        print("karakter", nama)


if __name__ == "__main__":
    main()
