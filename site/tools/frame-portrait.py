#!/usr/bin/env python3
"""Re-frame the headshot so a circular crop has breathing room.

The source is a tight studio headshot: the shoulders run off the bottom edge and
the sides clear by ~30px, so an inscribed circle cuts about 15% of the subject
and the result reads as over-zoomed.

Padding uniformly is wrong — it would leave a hard horizontal cut across the
torso with white beneath it. Instead pad the sides and the top and let the torso
keep running off the bottom, which is how the photo was shot, then place the
head so it sits slightly above the circle's centre.

Run from site/:  python3 tools/frame-portrait.py
"""
import pathlib
import sys

import numpy as np
from PIL import Image

SRC = pathlib.Path('public/images/profile-source.jpg')
DST = pathlib.Path('public/images/profile.jpg')
OUT_SIZE = 900
# where the eyeline should land as a fraction of frame height; portraits read
# best with the eyes a little above centre
EYELINE = 0.44


def subject_mask(im: Image.Image) -> np.ndarray:
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    mn, mx = a.min(axis=2), a.max(axis=2)
    return ~((mn > 0.90) & ((mx - mn) < 0.07))


def main() -> None:
    if not SRC.exists():
        sys.exit(f'missing {SRC}')
    im = Image.open(SRC).convert('RGB')
    W, H = im.size
    m = subject_mask(im)

    rows = m.sum(axis=1)
    ys = np.where(rows > 0)[0]
    top = int(ys.min())

    # The head is the narrow upper part; the shoulders are much wider. Take the
    # shoulder line as the first row whose width passes 62% of the maximum.
    # (A first-derivative threshold does not work here: noise at the hairline
    # trips it within a dozen rows and collapses the head to nothing.)
    widths = rows.astype(float)
    w_max = widths.max()
    wide = np.where(widths > 0.62 * w_max)[0]
    neck = int(wide[0]) if len(wide) else int(H * 0.55)
    head_h = neck - top
    if head_h < H * 0.15:
        sys.exit(f'head detection looks wrong (h={head_h}); check the source')
    # eyeline sits roughly 45% down the head for a front-facing portrait
    eye_y = top + head_h * 0.45

    print(f'  source {W}x{H}: head {top}..{neck} (h={head_h}), eyeline ~y={eye_y:.0f}')

    # Solve the placement: scale 1 (no resampling of the subject), pad sides and
    # top so the eyeline lands at EYELINE and the torso still exits the bottom.
    off_y = int(round(OUT_SIZE * EYELINE - eye_y))
    off_x = (OUT_SIZE - W) // 2
    # never pad the top by more than the side padding plus a little, or the head
    # ends up small and low in the circle
    off_y = max(0, min(off_y, int((OUT_SIZE - W) * 1.2)))
    canvas = Image.new('RGB', (OUT_SIZE, OUT_SIZE), (255, 255, 255))
    canvas.paste(im, (off_x, off_y))

    # If the torso no longer reaches the bottom, stretch its last row down so no
    # hard edge appears inside the circle.
    filled_to = off_y + H
    if filled_to < OUT_SIZE:
        strip = canvas.crop((0, filled_to - 1, OUT_SIZE, filled_to))
        for y in range(filled_to, OUT_SIZE):
            canvas.paste(strip, (0, y))

    canvas.save(DST, 'JPEG', quality=92, optimize=True, progressive=True)

    # report how much the circle now clips
    m2 = subject_mask(canvas)
    yy, xx = np.mgrid[0:OUT_SIZE, 0:OUT_SIZE]
    r = OUT_SIZE / 2
    inside = (xx - r) ** 2 + (yy - r) ** 2 <= r * r
    clipped = m2 & ~inside
    print(f'  wrote {DST} at {OUT_SIZE}x{OUT_SIZE} '
          f'({DST.stat().st_size / 1024:.1f} KB)')
    print(f'  offsets: x+{off_x} y+{off_y}')
    print(f'  subject outside the circle: {100 * clipped.sum() / m2.sum():.1f}% '
          f'(was 15.1%)')


if __name__ == '__main__':
    main()
