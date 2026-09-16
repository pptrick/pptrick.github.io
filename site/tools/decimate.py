#!/usr/bin/env python3
"""Quadric error metric (Garland-Heckbert) edge-collapse decimation.

Reads an OBJ, collapses edges until the target face count is reached, writes
a compact JSON payload (positions + indices) for embedding in a web page.
"""
import sys, json, heapq, math
import numpy as np


def load_obj(path):
    verts, faces = [], []
    with open(path) as fh:
        for line in fh:
            if line.startswith('v '):
                verts.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('f '):
                idx = [int(tok.split('/')[0]) - 1 for tok in line.split()[1:]]
                # fan-triangulate anything with more than 3 corners
                for k in range(1, len(idx) - 1):
                    faces.append([idx[0], idx[k], idx[k + 1]])
    return np.array(verts, dtype=np.float64), np.array(faces, dtype=np.int64)


def face_quadrics(V, F):
    """4x4 fundamental error quadric per face, area-weighted."""
    p0, p1, p2 = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    n = np.cross(p1 - p0, p2 - p0)
    area = 0.5 * np.linalg.norm(n, axis=1)
    ln = np.linalg.norm(n, axis=1)
    ln[ln == 0] = 1.0
    n = n / ln[:, None]
    d = -np.einsum('ij,ij->i', n, p0)
    plane = np.concatenate([n, d[:, None]], axis=1)          # (m,4)
    Q = plane[:, :, None] * plane[:, None, :]                 # outer product
    return Q * area[:, None, None]


def decimate(V, F, target_faces, verbose=True):
    nv = len(V)
    V = V.copy()

    # ---- per-vertex quadrics ----
    Qf = face_quadrics(V, F)
    Q = np.zeros((nv, 4, 4))
    for k in range(3):
        np.add.at(Q, F[:, k], Qf)

    # ---- adjacency ----
    vfaces = [set() for _ in range(nv)]
    for fi, tri in enumerate(F):
        for v in tri:
            vfaces[v].add(fi)

    faces = [list(t) for t in F]
    alive_face = [True] * len(faces)
    alive_vert = [True] * nv
    # union-find style redirection for collapsed vertices
    remap = list(range(nv))

    def root(i):
        while remap[i] != i:
            remap[i] = remap[remap[i]]
            i = remap[i]
        return i

    def edges_of(fi):
        a, b, c = faces[fi]
        return ((a, b), (b, c), (c, a))

    def optimal(v1, v2):
        """Best collapse position and its quadric cost."""
        Qs = Q[v1] + Q[v2]
        A = Qs.copy()
        A[3, :] = [0.0, 0.0, 0.0, 1.0]
        try:
            p = np.linalg.solve(A, np.array([0.0, 0.0, 0.0, 1.0]))
            pos = p[:3]
            if not np.all(np.isfinite(pos)):
                raise np.linalg.LinAlgError
        except np.linalg.LinAlgError:
            # fall back to the best of endpoints / midpoint
            best, bestc = None, None
            for cand in (V[v1], V[v2], 0.5 * (V[v1] + V[v2])):
                h = np.append(cand, 1.0)
                c = float(h @ Qs @ h)
                if bestc is None or c < bestc:
                    best, bestc = cand, c
            return best, max(bestc, 0.0)
        h = np.append(pos, 1.0)
        return pos, max(float(h @ Qs @ h), 0.0)

    # ---- initial heap ----
    heap = []
    seen = set()
    for fi in range(len(faces)):
        for a, b in edges_of(fi):
            key = (a, b) if a < b else (b, a)
            if key in seen:
                continue
            seen.add(key)
            pos, cost = optimal(key[0], key[1])
            heap.append((cost, key[0], key[1], pos))
    heapq.heapify(heap)

    live_faces = len(faces)
    version = [0] * nv          # bump on edit; stale heap entries get dropped
    stamp = {}
    for cost, a, b, pos in heap:
        stamp[(a, b)] = (version[a], version[b])

    while live_faces > target_faces and heap:
        cost, v1, v2, pos = heapq.heappop(heap)
        if not (alive_vert[v1] and alive_vert[v2]):
            continue
        r1, r2 = root(v1), root(v2)
        if r1 == r2:
            continue
        # stale?
        st = stamp.get((v1, v2))
        if st is None or st != (version[v1], version[v2]):
            continue

        shared = vfaces[v1] & vfaces[v2]
        shared = {f for f in shared if alive_face[f]}
        # only collapse simple interior/boundary edges
        if len(shared) > 2:
            continue

        # Link condition. Collapsing is topology-preserving only if the vertices
        # adjacent to BOTH endpoints are exactly the apexes of the shared faces.
        # Without this, two surface sheets can be welded together and the result
        # has non-manifold edges — 22 of them, before this check existed.
        def ring(v):
            out = set()
            for f in vfaces[v]:
                if alive_face[f]:
                    out.update(faces[f])
            out.discard(v)
            return out

        apexes = set()
        for f in shared:
            apexes.update(x for x in faces[f] if x != v1 and x != v2)
        if ring(v1) & ring(v2) != apexes:
            continue

        # ---- perform the collapse: v2 -> v1 ----
        V[v1] = pos
        Q[v1] = Q[v1] + Q[v2]
        alive_vert[v2] = False
        remap[v2] = v1

        for f in shared:
            alive_face[f] = False
            live_faces -= 1
            for v in faces[f]:
                vfaces[v].discard(f)

        for f in list(vfaces[v2]):
            if not alive_face[f]:
                vfaces[v2].discard(f)
                continue
            faces[f] = [v1 if x == v2 else x for x in faces[f]]
            vfaces[v1].add(f)
            vfaces[v2].discard(f)
        # drop any face that degenerated
        for f in list(vfaces[v1]):
            if not alive_face[f]:
                continue
            a, b, c = faces[f]
            if a == b or b == c or a == c:
                alive_face[f] = False
                live_faces -= 1
                for v in faces[f]:
                    vfaces[v].discard(f)

        version[v1] += 1

        # ---- re-price the new one-ring ----
        nbrs = set()
        for f in vfaces[v1]:
            if alive_face[f]:
                nbrs.update(faces[f])
        nbrs.discard(v1)
        for nb in nbrs:
            if not alive_vert[nb]:
                continue
            key = (v1, nb) if v1 < nb else (nb, v1)
            npos, ncost = optimal(key[0], key[1])
            stamp[key] = (version[key[0]], version[key[1]])
            heapq.heappush(heap, (ncost, key[0], key[1], npos))

        if verbose and live_faces % 5000 == 0:
            print(f'  faces: {live_faces}', file=sys.stderr)

    # ---- compact: keep only vertices a surviving face actually references ----
    tris = []
    for fi, ok in enumerate(alive_face):
        if not ok:
            continue
        a, b, c = (root(x) for x in faces[fi])
        if a == b or b == c or a == c:
            continue
        tris.append((a, b, c))

    used = sorted({v for t in tris for v in t})
    newidx = {v: i for i, v in enumerate(used)}
    outV = V[used]
    outF = np.array([[newidx[a], newidx[b], newidx[c]] for a, b, c in tris],
                    dtype=np.int64)
    return outV, outF


def normalize(V):
    """Center on the origin, scale to unit height, sit the feet on y=0."""
    lo, hi = V.min(axis=0), V.max(axis=0)
    center = 0.5 * (lo + hi)
    V = V - center
    scale = 1.0 / (hi - lo).max()
    V = V * scale
    V[:, 1] -= V[:, 1].min()          # feet at y = 0
    return V


if __name__ == '__main__':
    src = sys.argv[1]
    target = int(sys.argv[2])
    out = sys.argv[3]

    V, F = load_obj(src)
    print(f'loaded {len(V)} verts / {len(F)} faces', file=sys.stderr)
    V2, F2 = decimate(V, F, target)
    print(f'decimated to {len(V2)} verts / {len(F2)} faces', file=sys.stderr)
    V2 = normalize(V2)

    # quantize lightly to keep the payload small
    pos = [round(float(x), 4) for x in V2.reshape(-1)]
    idx = [int(x) for x in F2.reshape(-1)]
    with open(out, 'w') as fh:
        json.dump({'position': pos, 'index': idx}, fh, separators=(',', ':'))
    print(f'wrote {out}', file=sys.stderr)
