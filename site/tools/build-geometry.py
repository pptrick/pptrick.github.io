#!/usr/bin/env python3
"""Build the hero's geometry as binary buffers for the web build.

The prototype inlined everything as base64 inside a JS file because the artifact
sandbox blocks fetch. The real site can fetch, so ship raw typed-array buffers
instead: smaller, gzip-friendly, and loadable after first paint so the hero text
is never blocked on geometry.

Run from site/:  python3 tools/build-geometry.py
"""
import hashlib
import json
import math
import pathlib
import sys

import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from decimate import load_obj, decimate  # noqa: E402

SRC = pathlib.Path('tools/stanford-bunny.obj')
OUT = pathlib.Path('public/geometry')
TARGET_FACES = 2600
GRID = 64


def normalize_transform(V):
    """Unit max-extent, centred in XZ, feet at y=0."""
    lo, hi = V.min(axis=0), V.max(axis=0)
    scale = 1.0 / (hi - lo).max()
    offset = np.array([-0.5 * (lo[0] + hi[0]), -lo[1], -0.5 * (lo[2] + hi[2])])
    return offset, scale


def voxelize(V, F, grid, vsize, origin):
    """Surface voxelization by barycentric sampling of every triangle."""
    occ = np.zeros((grid, grid, grid), dtype=bool)
    p0, p1, p2 = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    e_max = np.maximum.reduce([
        np.linalg.norm(p1 - p0, axis=1),
        np.linalg.norm(p2 - p1, axis=1),
        np.linalg.norm(p0 - p2, axis=1),
    ])
    steps = np.clip(np.ceil(e_max / (vsize * 0.5)).astype(np.int64), 1, 24)

    def mark(pts):
        ijk = np.floor((pts - origin) / vsize).astype(np.int64)
        np.clip(ijk, 0, grid - 1, out=ijk)
        occ[ijk[:, 0], ijk[:, 1], ijk[:, 2]] = True

    for s in np.unique(steps):
        sel = steps == s
        a, b, c = p0[sel], p1[sel], p2[sel]
        for i in range(s + 1):
            for j in range(s + 1 - i):
                u, v = i / s, j / s
                mark(a * u + b * v + c * (1.0 - u - v))
    return occ


def fill_holes(V, F):
    """Close the scan's open boundaries with a centroid fan per hole.

    The Stanford bunny is an incomplete scan — it sat on a turntable, so its
    base was never captured. Five boundary loops remain in the source mesh, and
    with front-face culling you see straight through them, which reads as
    missing triangles. Each loop is roughly planar, so a fan to its centroid
    closes it cleanly.
    """
    import collections
    edges = collections.Counter()
    for a, b, c in F:
        for e in ((a, b), (b, c), (c, a)):
            edges[tuple(sorted(e))] += 1
    boundary = [e for e, n in edges.items() if n == 1]
    if not boundary:
        return V, F

    # orient boundary edges as directed half-edges so each loop can be walked
    directed = {}
    for a, b, c in F:
        for u, v in ((a, b), (b, c), (c, a)):
            if edges[tuple(sorted((u, v)))] == 1:
                directed[u] = v

    V = list(map(list, V))
    F = list(map(list, F))
    filled = 0
    seen = set()
    for start in list(directed):
        if start in seen:
            continue
        loop, u = [], start
        while u not in seen:
            seen.add(u)
            loop.append(u)
            u = directed.get(u)
            if u is None:
                break
        if len(loop) < 3:
            continue
        cx = [sum(V[i][k] for i in loop) / len(loop) for k in range(3)]
        centre = len(V)
        V.append(cx)
        for i in range(len(loop)):
            # wind opposite to the boundary half-edges so normals stay outward
            F.append([loop[(i + 1) % len(loop)], loop[i], centre])
        filled += 1
    print(f'  filled {filled} hole(s) in the source scan', file=sys.stderr)
    return np.array(V), np.array(F, dtype=np.int64)


def smooth_normals(V, F):
    """Area-weighted vertex normals."""
    n = np.zeros_like(V)
    p0, p1, p2 = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    fn = np.cross(p1 - p0, p2 - p0)          # length encodes 2x area
    for k in range(3):
        np.add.at(n, F[:, k], fn)
    ln = np.linalg.norm(n, axis=1)
    ln[ln == 0] = 1.0
    return n / ln[:, None]


def main():
    if not SRC.exists():
        sys.exit(f'missing {SRC}')
    OUT.mkdir(parents=True, exist_ok=True)

    V, F = load_obj(str(SRC))
    V, F = fill_holes(V, F)
    offset, scale = normalize_transform(V)
    Vn = (V + offset) * scale
    print(f'source: {len(V)} verts / {len(F)} faces', file=sys.stderr)

    # ---- mesh: decimated, non-indexed so each triangle carries barycentrics --
    Vd, Fd = decimate(V, F, TARGET_FACES, verbose=False)
    Vd = (Vd + offset) * scale                   # same transform: all three register
    Nd = smooth_normals(Vd, Fd)

    # Ship INDEXED and expand in the browser. Non-indexed would triple these
    # buffers, and the barycentric attribute is just a tiled identity matrix —
    # both are a few lines of JS, so there is no reason to send them.
    tri = len(Fd)
    (OUT / 'mesh-pos.bin').write_bytes(Vd.astype('<f4').tobytes())
    (OUT / 'mesh-nor.bin').write_bytes(Nd.astype('<f4').tobytes())
    (OUT / 'mesh-idx.bin').write_bytes(Fd.astype('<u2').tobytes())
    assert len(Vd) < 65536, 'index buffer needs Uint32 above 65535 vertices'

    # ---- points: every raw scan vertex, shuffled so any prefix is uniform ----
    rng = np.random.default_rng(7)
    P = Vn[rng.permutation(len(Vn))]
    pmin = P.min(axis=0)
    pspan = P.max(axis=0) - pmin
    pspan[pspan == 0] = 1.0
    Q = np.round((P - pmin) / pspan * 65535.0).astype('<u2')
    (OUT / 'points.bin').write_bytes(Q.tobytes())

    # ---- voxels: 64^3 surface occupancy, one byte per axis ------------------
    lo, hi = Vn.min(axis=0), Vn.max(axis=0)
    vsize = (hi - lo).max() / GRID
    occ = voxelize(Vn, F, GRID, vsize, lo)
    ijk = np.argwhere(occ).astype(np.uint8)
    (OUT / 'voxels.bin').write_bytes(ijk.tobytes())

    manifest = {
        'source': {'verts': int(len(V)), 'faces': int(len(F))},
        'mesh': {'triangles': int(tri), 'vertices': int(len(Vd))},
        'points': {
            'count': int(len(P)),
            'min': [float(x) for x in pmin],
            'span': [float(x) for x in pspan],
        },
        'voxels': {
            'count': int(len(ijk)),
            'grid': GRID,
            'size': float(vsize),
            'origin': [float(x) for x in lo],
        },
        'height': float(hi[1] - lo[1]),
    }
    # Files in public/ are served under stable names with max-age=600, so a
    # changed mesh stays invisible to returning visitors until their cache
    # expires. The engine appends this hash as a query string; the manifest
    # itself is imported at build time into a content-hashed JS chunk, so a new
    # deploy always carries a new version.
    digest = hashlib.sha256()
    for name in sorted(p.name for p in OUT.iterdir() if p.suffix == '.bin'):
        digest.update((OUT / name).read_bytes())
    manifest['version'] = digest.hexdigest()[:12]

    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')

    total = 0
    for p in sorted(OUT.iterdir()):
        total += p.stat().st_size
        print(f'  {p.name:18s} {p.stat().st_size / 1024:8.1f} KB', file=sys.stderr)
    print(f'  {"TOTAL":18s} {total / 1024:8.1f} KB', file=sys.stderr)
    print(f'  mesh {tri} tris · points {len(P)} · voxels {len(ijk)} of {GRID}^3',
          file=sys.stderr)


if __name__ == '__main__':
    main()
