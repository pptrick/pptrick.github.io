#!/usr/bin/env python3
"""Resize board game cover images into public/boardgames/covers/.

Drop full-size files (photos or downloaded box art) into a folder, named after
the game `id` in games.json -- e.g. `sanguosha.jpg` -- then:

    python3 tools/pack-covers.py ~/Desktop/incoming

Writes <id>.webp at 800px on the long edge, and reports which games in
games.json still have no cover. Lives in tools/ rather than public/ so it is
never shipped to the site: only public/ and the Next build output are exported.
"""
import json
import sys
from pathlib import Path

from PIL import Image

MAX_EDGE = 800
QUALITY = 82
# Matches --card in index.html. Transparent pixels are flattened onto this
# rather than white, so the corners left over around an angled 3D box render
# disappear into the card instead of sitting on it as a pale rectangle.
CARD_BG = (253, 243, 224)
SITE = Path(__file__).resolve().parent.parent
GAMES = SITE / "public/boardgames/games.json"
COVERS = SITE / "public/boardgames/covers"
SOURCE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".tif", ".tiff"}


def trim_margin(im: Image.Image) -> Image.Image:
    """Crop a near-white border off a product render.

    Box art scraped from a shop is often a 3D render floating on a white
    square -- one source was only 49% content -- which reads as a hole in the
    waterfall next to tightly-cropped covers. Anything already filling its
    frame is returned untouched.
    """
    from PIL import ImageChops

    white = Image.new("RGB", im.convert("RGB").size, (255, 255, 255))
    mask = ImageChops.difference(im.convert("RGB"), white).convert("L").point(lambda p: 255 if p > 11 else 0)
    box = mask.getbbox()
    if not box:
        return im
    w, h = im.size
    filled = ((box[2] - box[0]) * (box[3] - box[1])) / float(w * h)
    if filled > 0.92:
        return im
    pad = round(max(w, h) * 0.015)
    return im.crop((max(0, box[0] - pad), max(0, box[1] - pad),
                    min(w, box[2] + pad), min(h, box[3] + pad)))


def pack(src: Path, dest: Path) -> str:
    im = Image.open(src)
    # Phone photos carry rotation in EXIF; without this they land sideways.
    try:
        from PIL import ImageOps

        im = ImageOps.exif_transpose(im)
    except Exception:
        pass
    # A publisher PNG is usually the box on transparency. Alpha gives the exact
    # bounds, so crop from it before flattening -- far more accurate than
    # guessing the subject back out of a flattened background afterwards.
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        alpha_box = im.split()[-1].getbbox()
        if alpha_box:
            im = im.crop(alpha_box)
        flat = Image.new("RGB", im.size, CARD_BG)
        flat.paste(im, mask=im.split()[-1])
        im = flat
    else:
        im = im.convert("RGB")
        im = trim_margin(im)

    w, h = im.size
    if max(w, h) > MAX_EDGE:
        scale = MAX_EDGE / max(w, h)
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=QUALITY, method=6)
    return f"{im.width}x{im.height}  {dest.stat().st_size // 1024}KB"


def main() -> int:
    ids = {g["id"] for g in json.loads(GAMES.read_text("utf-8"))["games"]}

    if len(sys.argv) > 1:
        incoming = Path(sys.argv[1]).expanduser()
        if not incoming.is_dir():
            print(f"not a directory: {incoming}")
            return 1
        for src in sorted(incoming.iterdir()):
            if src.suffix.lower() not in SOURCE_SUFFIXES:
                continue
            if src.stem not in ids:
                print(f"  skip {src.name} -- no game with id '{src.stem}'")
                continue
            print(f"  {src.stem:<22} {pack(src, COVERS / f'{src.stem}.webp')}")

    absent = sorted(i for i in ids if not (COVERS / f"{i}.webp").exists())
    total = sum(p.stat().st_size for p in COVERS.glob("*.webp")) // 1024
    print(f"\n{len(ids) - len(absent)}/{len(ids)} covers present, {total}KB total")
    if absent:
        print("still missing: " + ", ".join(absent))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
