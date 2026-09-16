#!/usr/bin/env python3
"""Render the favicon and Open Graph card from the actual hero geometry.

The site's identity is the Stanford bunny reconstruction, so the icon and the
share card are drawn from the same mesh rather than being unrelated artwork.
Run from site/:  python3 tools/gen-brand-assets.py
"""
import json
import math
import pathlib
import sys

from PIL import Image, ImageDraw, ImageFont

BG = (7, 7, 10)
ACCENT = (103, 232, 249)
FG = (237, 237, 242)
MUTED = (133, 133, 143)
LINE = (35, 35, 46)

MESH = pathlib.Path('public/geometry')   # binary buffers from build-geometry.py
OUT = pathlib.Path('app')

MONO = '/System/Library/Fonts/Menlo.ttc'
SANS = '/System/Library/Fonts/HelveticaNeue.ttc'


def load_mesh():
    """Read the same binary buffers the site ships, so the icon always matches
    the mesh actually on the page."""
    import array
    pos = array.array('f'); pos.frombytes((MESH / 'mesh-pos.bin').read_bytes())
    idx = array.array('H'); idx.frombytes((MESH / 'mesh-idx.bin').read_bytes())
    V = [(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]) for i in range(len(pos) // 3)]
    F = [(idx[i], idx[i + 1], idx[i + 2]) for i in range(0, len(idx), 3)]
    return V, F


def project(V, yaw, size, margin, flip_y=True):
    """Rotate about Y, drop Z, fit to a square of `size` with `margin` padding."""
    c, s = math.cos(yaw), math.sin(yaw)
    pts = [(x * c + z * s, y) for (x, y, z) in V]

    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    lo_x, hi_x, lo_y, hi_y = min(xs), max(xs), min(ys), max(ys)
    span = max(hi_x - lo_x, hi_y - lo_y)
    scale = (size - 2 * margin) / span

    cx = 0.5 * (lo_x + hi_x)
    cy = 0.5 * (lo_y + hi_y)
    out = []
    for x, y in pts:
        px = size / 2 + (x - cx) * scale
        py = size / 2 - (y - cy) * scale if flip_y else size / 2 + (y - cy) * scale
        out.append((px, py))
    return out


def silhouette(V, F, size, margin, fill, bg, radius=None):
    """Union of all projected triangles — a solid bunny, legible at 16px."""
    SS = 4  # supersample, then downscale for clean edges
    big = size * SS
    img = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts = project(V, 1.9, big, margin * SS)
    for a, b, c in F:
        d.polygon([pts[a], pts[b], pts[c]], fill=fill)
    img = img.resize((size, size), Image.LANCZOS)

    card = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    if bg is not None:
        plate = Image.new('RGBA', (size, size), bg + (255,))
        if radius:
            mask = Image.new('L', (size * SS, size * SS), 0)
            ImageDraw.Draw(mask).rounded_rectangle(
                (0, 0, size * SS - 1, size * SS - 1), radius=radius * SS, fill=255)
            plate.putalpha(mask.resize((size, size), Image.LANCZOS))
        card.alpha_composite(plate)
    card.alpha_composite(img)
    return card


def wireframe(V, F, w, h, yaw, scale_px, cx, cy, colour, width=1):
    """Edge render, for the OG card. Dedupes edges so lines aren't drawn twice."""
    SS = 2
    img = Image.new('RGBA', (w * SS, h * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    c, s = math.cos(yaw), math.sin(yaw)
    pts = []
    for (x, y, z) in V:
        rx = x * c + z * s
        pts.append((cx * SS + rx * scale_px * SS, cy * SS - y * scale_px * SS))

    seen = set()
    for a, b, cc in F:
        for i, j in ((a, b), (b, cc), (cc, a)):
            key = (i, j) if i < j else (j, i)
            if key in seen:
                continue
            seen.add(key)
            d.line([pts[i], pts[j]], fill=colour, width=width * SS)
    return img.resize((w, h), Image.LANCZOS)


def font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        return ImageFont.load_default()


def main():
    if not (MESH / 'mesh-pos.bin').exists():
        sys.exit(f'missing {MESH}/mesh-pos.bin — run tools/build-geometry.py first')
    V, F = load_mesh()

    # ---- favicon: solid bunny on a dark rounded plate -------------------
    icon = silhouette(V, F, 512, margin=54, fill=ACCENT + (255,), bg=BG, radius=96)
    icon.save(OUT / 'icon.png', 'PNG', optimize=True)
    # apple-touch wants no transparency and a bit more padding
    apple = silhouette(V, F, 180, margin=26, fill=ACCENT + (255,), bg=BG, radius=0)
    apple.save(OUT / 'apple-icon.png', 'PNG', optimize=True)

    # ---- Open Graph card ------------------------------------------------
    W, H = 1200, 630
    card = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(card)

    wire = wireframe(V, F, W, H, yaw=1.9, scale_px=330, cx=915, cy=340,
                     colour=ACCENT + (150,))
    card.paste(wire, (0, 0), wire)

    d.line([(80, 214), (150, 214)], fill=ACCENT, width=2)

    f_eyebrow = font(MONO, 21)
    f_name = font(MONO, 82, index=1)      # Menlo Bold
    f_role = font(MONO, 25)
    f_tag = font(SANS, 27)

    d.text((80, 250), '3D AI / GRAPHICS / VISION', font=f_eyebrow, fill=ACCENT)
    d.text((80, 296), 'Chuanyu Pan', font=f_name, fill=FG)
    d.text((80, 402), 'Research Tech Lead · Meshy', font=f_role, fill=MUTED)
    d.text((80, 462), 'Reconstructing and generating', font=f_tag, fill=FG)
    d.text((80, 500), '3D worlds.', font=f_tag, fill=FG)

    d.line([(0, H - 4), (W, H - 4)], fill=LINE, width=8)
    card.save(OUT / 'opengraph-image.png', 'PNG', optimize=True)
    (OUT / 'opengraph-image.alt.txt').write_text(
        'Chuanyu Pan, Research Tech Lead at Meshy, beside a wireframe Stanford bunny.\n')

    for name in ('icon.png', 'apple-icon.png', 'opengraph-image.png'):
        p = OUT / name
        print(f'  {name:24s} {p.stat().st_size / 1024:6.0f}K  {Image.open(p).size}')


if __name__ == '__main__':
    main()
