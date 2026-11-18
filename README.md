# Log Perjalanan Hidup — the game

A narrative, combat-free top-down RPG that turns the **"Log Perjalanan Hidup"** (*Life Journey Log*) essay series by Zain Bagus on Medium into something you can walk through. One essay, one playable chapter.

Built with **Phaser 3 + TypeScript + Vite**. Art from Kenney's RPG Urban Pack (CC0), music from OpenGameArt (CC0).

> In-game text is in Indonesian, because it is the story itself. Everything around the code is in English.

**Play it:** <https://log-perjalanan-game.vercel.app>

## Getting started

```bash
npm install
npm run dev      # http://localhost:5174
npm test         # writing-style check, map integrity, full playthrough simulation of every chapter
npm run build    # typecheck + production build to dist/
npm run assets   # regenerate sprites from assets-src/ (requires Python + Pillow)
```

## Controls

| Action | Keyboard | Phone / tablet |
|---|---|---|
| Move | Arrow keys / WASD | Analog stick: touch anywhere on the left side and drag |
| Talk, advance dialogue | E / Space / Enter | **OK** button (bottom right), or tap the screen |
| Pick an answer | Up / Down, then E | Tap one of the answer buttons above the dialogue box |
| Skip prologue | Esc | Tap "lewati >>" |
| Toggle sound | M | |
| Fullscreen | | `[ ]` button (top right, Android) |

### Mobile

The game picks its logical resolution from the screen so the zoom is always a whole number (at least 2x on phones) and the canvas fills the screen with no black bars: 422x195 on a 844x390 phone, 427x240 on a 1280x720 desktop. Holding a phone upright shows a "rotate your phone" screen. On iPhone, *Share → Add to Home Screen* opens the game fullscreen without Safari's bars.

## Chapters (v0.7)

The title screen lets you pick a chapter, or **Continue** where you left off. Progress is saved in the browser.

### Chapter 1 — Bandung (about 10 minutes)

1. Terminal-style prologue (`cat 001-masa-kecil.log`) and a chapter card.
2. **Bandung.** A noisy home, and Siti, the childhood friend whose house was always open.
3. **The internet café.** A CRT monitor showing an "online game": farm items, sell them to a regular, level up someone's account.
4. **The bus stop** to a holiday in Malang.
5. **Malang.** The grandparents' house, with Javanese etiquette lessons as choice-based quests. Wrong answers get a gentle scolding and the question comes back.

### Chapter 2 — Untuk Siti (*For Siti*, about 8 minutes)

A quiet chapter about loss, based on the second essay. The illness itself is never shown.

1. **Siti's living room.** PS2 on a CRT, fighting over the controller, then playing house whether you like it or not.
2. **"Then Siti got sick."** She walks with a walking frame, and she follows you. **You walk at her pace**: the player's speed drops to match hers.
3. **The wheelchair.** You take her to the PS rental, the way she used to take you in.
4. **After.** The music stops, Bandung goes dark, and you look for three faint shadows of Siti in the places you shared. Each holds one memory from the essay. The music comes back with the first one.

### Chapter 3 — Jalanan (*The Street*, about 8 minutes)

Based on the third essay, about the months after Siti's death.

1. **Three empty days.** Internet café, instant noodles, home. Push MMR, buy a stash of noodles, eat them dry out of the pack. Repeat until even the café gets boring.
2. **Wandering.** Sit by the road, move, sit again.
3. **Meeting them.** A group of street kids. At first you only end up in the same place, then you sit with them, then you talk.
4. **The rule.** Food arrives, but nobody eats until everyone is there. Go find the one who is missing and bring him back (he follows you).
5. **The secret.** When asked about home and parents, the story has you hide that you are not actually poor.
6. **Busking** for three people, then the ending.

The real names of the street kids are not known, so they go by descriptions: Si Ikat Kepala, Si Rambut Merah, Si Kupluk. Petty crime from the essay is mentioned only in the closing narration, never as a game mechanic.

### Chapter 4 — Keluarga (*Family*, about 8 minutes)

Based on the fourth essay, *Rumah yang Nggak Punya Atap* (*A Home Without a Roof*).

1. **Protected.** Si Ikat Kepala checks that nobody is bothering you, and a memory comes back of the day they stood up for you. It is told only as narration.
2. **Celebrated.** Win a tournament at the internet café, and the gang makes a fuss as if you had won something important.
3. **The report card.** Si Ikat Kepala walks off to collect your school report for you. Wait on the park bench until he comes back: top three, despite the skipped days.
4. **Game money.** Back at the café: farm enchant materials, sell them, enchant someone's weapon.
5. **Sharing.** They refuse the money; you insist until they take it. It becomes rice for everyone.
6. **Lembang at night.** A campfire in the woods. Sit alone under a tree; Si Kupluk sits next to you and asks nothing, then walks back to the fire with you.

## Architecture

The story is data, not code. Each map declares its layout, NPCs and interaction scripts built from a small set of actions:

| Action | Effect |
|---|---|
| `say` | Dialogue lines with typewriter effect |
| `choose` | Multiple-choice question, repeated until the correct answer is picked |
| `set` | Set a progress flag |
| `walk` | Move an NPC along a path (non-blocking) |
| `narrate` | Fade to black, play lines, fade back |
| `teleport` | Move the player |
| `goto` | Switch scene (internet café, travel card) |
| `end` | Closing narration and end of chapter |

NPCs appear and leave as the story flags change, without reloading the map. Maps can also declare per-state music (including silence), an ambience tint, warm light sources that glow through it, the player's walking speed, and NPCs that follow the player, carry a walking aid or wheelchair, or appear as translucent "shadows".

A new chapter means a new map file and a new story file. The engine (`WorldScene`) does not change.

```
src/story/      story text, action types, tests
src/maps/       one file per location: layout + NPCs + scripts
src/scenes/     Title (chapter select), Story (prologue/cards), World (engine), Warnet (café minigame, one text set per chapter)
src/systems/    GridMap, renderGridMap, DialogueBox, Flags, Music, Sfx
src/data/       config, Kenney tile indices, music tracks
assets-src/     source art (Kenney packs, CC0)
tools/          pack_assets.py
```

## Editing the story

| To change | Edit |
|---|---|
| Narration, prologue, ending text | `src/story/chapter1.ts` … `chapter4.ts` |
| NPC dialogue, quests, choices, objectives | `src/maps/*.ts` (one file per location) |
| Map layout | the `build*` function in the same file |
| Background music per location | `src/data/tracks.ts` |

The test suite enforces the series' writing style (no colons or em dashes in story text) and simulates every chapter from start to finish, so a broken quest chain fails the build instead of shipping.

## Credits

See [CREDITS.md](CREDITS.md). All third-party assets are CC0 or OFL.

## License

Code is MIT licensed (see [LICENSE](LICENSE)). The story text is © Zain Bagus, all rights reserved.
