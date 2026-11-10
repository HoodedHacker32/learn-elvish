"""Centre-line strokes for every tengwa, taken from the Alcarin Tengwar font the app shows, so the guide a
learner traces is exactly the letter they read.

Each glyph is drawn large, thinned to a one-pixel skeleton, and split into strokes at its junctions (a stem
that runs through a junction stays one stroke). Strokes are then put in the order Måns Björkman's Amanyë
Tenceli gives for Tolkien's hand: left to right, a stem from top to bottom, a bow from the end nearest the top.
Output: src/tengwar/strokes.js (a module, so Node and the browser both load it), coordinates in font units (x-height 400, baseline 0, y up).

    python scripts/tengwar-strokes.py [--sheet out.png]
"""
import json
import math
import os
import sys

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont
from skimage.morphology import skeletonize

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(ROOT, '..', 'LoTR Elvish Translator', 'src', 'assets', 'fonts', 'AlcarinTengwar-Regular.woff2')
OUT = os.path.join(ROOT, 'src', 'tengwar', 'strokes.js')

LETTERS = {  # name: code point (ConScript registry)
    'tinco': 0xE000, 'parma': 0xE001, 'calma': 0xE002, 'quesse': 0xE003,
    'ando': 0xE004, 'umbar': 0xE005, 'anga': 0xE006, 'ungwe': 0xE007,
    'thule': 0xE008, 'formen': 0xE009, 'harma': 0xE00A, 'hwesta': 0xE00B,
    'anto': 0xE00C, 'ampa': 0xE00D, 'anca': 0xE00E, 'unque': 0xE00F,
    'numen': 0xE010, 'malta': 0xE011, 'noldo': 0xE012, 'nwalme': 0xE013,
    'ore': 0xE014, 'vala': 0xE015, 'anna': 0xE016, 'vilya': 0xE017,
    'romen': 0xE020, 'arda': 0xE021, 'lambe': 0xE022, 'alda': 0xE023,
    'silme': 0xE024, 'silmeNuquerna': 0xE025, 'esse': 0xE026, 'esseNuquerna': 0xE027,
    'hyarmen': 0xE028, 'hwestaSindarinwa': 0xE029, 'yanta': 0xE02A, 'ure': 0xE02B,
    'longCarrier': 0xE02C, 'shortCarrier': 0xE02E,
}
MARKS = {  # vowel signs and bars, drawn over (or under) a short carrier
    'threeDots': 0xE040, 'acute': 0xE046, 'dot': 0xE044, 'rightCurl': 0xE04A, 'leftCurl': 0xE04C,
    'twoDots': 0xE042, 'dotBelow': 0xE045, 'nasalizer': 0xE050, 'doubler': 0xE051,
}

S = 0.36           # pixels per font unit
PAD = 160          # font units of margin
TOP, BOTTOM = 780, -360


def render(ttf, chars):
    size = int(1000 * S)
    font = ImageFont.truetype(ttf, size)
    w = int((1400 + 2 * PAD) * S)
    h = int((TOP - BOTTOM) * S)
    im = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(im)
    d.text((PAD * S, TOP * S), chars, fill=255, font=font, anchor='ls')
    return np.array(im) > 128


def to_units(px, py):
    return round(px / S - PAD), round(TOP - py / S)


N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def segments(sk):
    """The skeleton as a graph: junction pixels that touch are one junction, and each run between junctions
    or ends is a segment, ending at its junction's centre."""
    pts = set(zip(*np.nonzero(sk)))
    nb = {p: [(p[0] + dy, p[1] + dx) for dy, dx in N8 if (p[0] + dy, p[1] + dx) in pts] for p in pts}
    nodes = {p for p in pts if len(nb[p]) != 2}
    # group touching junction pixels
    cluster, centre = {}, {}
    for n in nodes:
        if n in cluster or len(nb[n]) == 1:
            continue
        stack, members = [n], []
        cluster[n] = n
        while stack:
            c = stack.pop(); members.append(c)
            for r in nb[c]:
                if r in nodes and len(nb[r]) != 1 and r not in cluster:
                    cluster[r] = n; stack.append(r)
        cy = sum(m[0] for m in members) / len(members); cx = sum(m[1] for m in members) / len(members)
        centre[n] = (round(cy), round(cx))
    key = lambda p: cluster.get(p, p)
    seen, segs = set(), []
    for n in nodes:
        for q in nb[n]:
            if q in cluster and key(q) == key(n):
                continue
            if (n, q) in seen:
                continue
            path = [n, q]
            seen.add((n, q)); seen.add((q, n))
            prev, cur = n, q
            while cur not in nodes:
                nxt = [r for r in nb[cur] if r != prev]
                if not nxt:
                    break
                prev, cur = cur, nxt[0]
                seen.add((prev, cur)); seen.add((cur, prev))
                path.append(cur)
            # snap ends to their junction's centre, so pieces meeting there share one end point
            if path[0] in cluster: path[0] = centre[key(path[0])]
            if path[-1] in cluster: path[-1] = centre[key(path[-1])]
            if len(path) > 2 or path[0] != path[-1]:
                segs.append(path)
    rest = pts - {p for s_ in segs for p in s_} - set(cluster)
    while rest:
        start = rest.pop()
        path, prev, cur = [start], None, start
        while True:
            nxt = [r for r in nb[cur] if r != prev and r in rest]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
            rest.discard(cur)
            path.append(cur)
        if len(path) > 8:
            path.append(start)
            segs.append(path)
    # one segment per pair of ends and route
    uniq, out = set(), []
    for x in segs:
        k = (min(x[0], x[-1]), max(x[0], x[-1]), len(x))
        if k not in uniq:
            uniq.add(k); out.append(x)
    return out


def simplify(points, eps):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1
    dmax, idx = 0, 0
    for i in range(1, len(points) - 1):
        x, y = points[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L if (dx or dy) else math.hypot(x - x1, y - y1)
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return simplify(points[:idx + 1], eps)[:-1] + simplify(points[idx:], eps)
    return [points[0], points[-1]]


def direction(seg, at_start=True, n=6):
    a = seg[0] if at_start else seg[-1]
    b = seg[min(n, len(seg) - 1)] if at_start else seg[max(-n - 1, -len(seg))]
    return (b[0] - a[0], b[1] - a[1])


def merge_through(segs, sk_px_segs):
    """At a junction, join the two segments that continue most straight, so a stem stays one stroke."""
    segs = [list(s) for s in segs]
    changed = True
    while changed:
        changed = False
        ends = {}
        for i, s in enumerate(segs):
            ends.setdefault(s[0], []).append((i, True))
            ends.setdefault(s[-1], []).append((i, False))
        for node, lst in ends.items():
            if len(lst) < 3:
                continue
            best = None
            for a in range(len(lst)):
                for b in range(a + 1, len(lst)):
                    (i, ia), (j, ja) = lst[a], lst[b]
                    if i == j:
                        continue
                    va = direction(segs[i], ia)
                    vb = direction(segs[j], ja)
                    na, nb_ = math.hypot(*va) or 1, math.hypot(*vb) or 1
                    cos = (va[0] * vb[0] + va[1] * vb[1]) / (na * nb_)
                    if cos < -0.85 and (best is None or cos < best[0]):
                        best = (cos, i, ia, j, ja)
            if best:
                _, i, ia, j, ja = best
                si = segs[i] if not ia else list(reversed(segs[i]))
                sj = segs[j] if ja else list(reversed(segs[j]))
                joined = si + sj[1:]
                segs = [s for k, s in enumerate(segs) if k not in (i, j)] + [joined]
                changed = True
                break
    return segs


def seg_len(seg):
    return sum(math.hypot(seg[k + 1][0] - seg[k][0], seg[k + 1][1] - seg[k][1]) for k in range(len(seg) - 1))


def clean(segs, spur=26, straight=-0.45):
    """Prune serif stubs and spurs, then join pieces that run on smoothly; sharp corners stay separate strokes."""
    segs = [list(x) for x in segs if len(x) > 1]
    for _ in range(40):
        deg = {}
        for x in segs:
            for e in (x[0], x[-1]):
                deg[e] = deg.get(e, 0) + 1
        # a short piece hanging off a junction is a serif or a thinning artefact
        pruned = [x for x in segs if not (seg_len(x) < spur and (deg[x[0]] == 1) != (deg[x[-1]] == 1))]
        if len(pruned) != len(segs):
            segs = pruned
            continue
        # where exactly two pieces meet, join them if the line runs on
        joined = False
        for node, d in deg.items():
            if d != 2:
                continue
            idx = [(i, x[0] == node) for i, x in enumerate(segs) if x[0] == node or x[-1] == node]
            if len(idx) != 2 or idx[0][0] == idx[1][0]:
                continue
            (i, ia), (j, ja) = idx
            va, vb = direction(segs[i], ia), direction(segs[j], ja)
            na, nb_ = math.hypot(*va) or 1, math.hypot(*vb) or 1
            if (va[0] * vb[0] + va[1] * vb[1]) / (na * nb_) < straight:
                si = segs[i] if not ia else list(reversed(segs[i]))
                sj = segs[j] if ja else list(reversed(segs[j]))
                segs = [x for k, x in enumerate(segs) if k not in (i, j)] + [si + sj[1:]]
                joined = True
                break
        if joined:
            continue
        merged = merge_through(segs, None)
        if len(merged) == len(segs):
            break
        segs = merged
    return segs


def strokes_for(ttf, chars):
    from skimage.measure import label, regionprops
    img = render(ttf, chars)
    out = []
    for region in regionprops(label(img)):
        y0, x0, y1, x1 = region.bbox
        if max(y1 - y0, x1 - x0) < 100 * S:          # a dot: one tap
            cy, cx = region.centroid
            px, py = to_units(cx, cy)
            out.append([[px, py], [px + 1, py]])
            continue
        mask = np.zeros_like(img)
        mask[region.coords[:, 0], region.coords[:, 1]] = True
        segs = [x for x in segments(skeletonize(mask)) if len(x) > 2]
        for x in clean(segs):
            pts = simplify([to_units(px, py) for (py, px) in x], 6)
            if len(pts) >= 2 and seg_len([tuple(p) for p in pts]) > 40:
                out.append([list(p) for p in pts])
    return order(out)


def order(strokes):
    """Björkman's order: left to right; a stem top to bottom; a bow from its top end."""
    def is_stem(s):
        xs = [p[0] for p in s]; ys = [p[1] for p in s]
        return (max(xs) - min(xs)) < 0.25 * (max(ys) - min(ys) + 1) and (max(ys) - min(ys)) > 250
    fixed = []
    for s in strokes:
        if s[0] == s[-1] and len(s) > 3:   # a closed ring: start at its top
            k = max(range(len(s) - 1), key=lambda i: s[i][1])
            s = s[k:-1] + s[:k + 1]
        elif s[0][1] < s[-1][1] or (abs(s[0][1] - s[-1][1]) < 40 and s[0][0] > s[-1][0]):
            s = list(reversed(s))
        fixed.append(s)
    return sorted(fixed, key=lambda s: (min(p[0] for p in s) // 60, 0 if is_stem(s) else 1, -max(p[1] for p in s)))


def main():
    ttf = os.path.join(os.environ.get('TEMP', '.'), 'alcarin-strokes.ttf')
    f = TTFont(FONT); f.flavor = None; f.save(ttf)
    data = {'unitsPerEm': 1000, 'xHeight': 400, 'letters': {}, 'marks': {}}
    for name, cp in LETTERS.items():
        data['letters'][name] = strokes_for(ttf, chr(cp))
    carrier = chr(0xE02E)
    base = strokes_for(ttf, carrier)
    def near(a, t):
        return all(min(math.hypot(p[0] - q[0], p[1] - q[1]) for q in t) < 30 for p in a)
    for name, cp in MARKS.items():
        drawn = [x for x in strokes_for(ttf, carrier + chr(cp)) if not any(near(x, b) for b in base)]
        # simple text drawing places marks off to the side, so each is centred on x = 0 here and the app puts
        # it over the middle of whatever letter carries it (as the font itself does)
        if drawn:
            xs = [p[0] for x in drawn for p in x]
            mid = (min(xs) + max(xs)) / 2
            drawn = [[[round(p[0] - mid), p[1]] for p in x] for x in drawn]
        data['marks'][name] = drawn
    # the dots, as taps, placed as Alcarin places them (over the x-height, or under the baseline)
    tap = lambda x, y: [[x, y], [x + 1, y]]
    data['marks'].update({
        'threeDots': [tap(-40, 470), tap(40, 470), tap(0, 545)],
        'dot': [tap(0, 490)],
        'twoDots': [tap(-32, 490), tap(32, 490)],
        'dotBelow': [tap(0, -110)],
    })
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('// Generated by scripts/tengwar-strokes.py from Alcarin Tengwar (Toshi Omagari, SIL OFL). Do not edit by hand.' + chr(10))
        fh.write('// Stroke order after Måns Björkman, Amanyë Tenceli. Font units: x-height 400, baseline 0, y up.' + chr(10))
        fh.write('export default ' + json.dumps(data, separators=(',', ':')) + chr(10))
    print('strokes.js', {k: len(v) for k, v in data['letters'].items()})
    print('marks', {k: len(v) for k, v in data['marks'].items()})
    if '--sheet' in sys.argv:
        sheet(ttf, data, sys.argv[sys.argv.index('--sheet') + 1])


def sheet(ttf, data, path):
    items = list(data['letters'].items()) + [('mark:' + k, v) for k, v in data['marks'].items()]
    cols, cw, ch, sc = 8, 230, 270, 0.2
    im = Image.new('RGB', (cols * cw, ((len(items) + cols - 1) // cols) * ch), 'white')
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype(ttf, int(1000 * sc))
    small = ImageFont.truetype('arial.ttf', 13)
    colours = ['#d00', '#06c', '#090', '#c60', '#909', '#088']
    for i, (name, strokes) in enumerate(items):
        ox, oy = (i % cols) * cw + 40, (i // cols) * ch + 180
        d.text((ox - 30, oy - 170), name, fill='black', font=small)
        cp = LETTERS.get(name) or (MARKS.get(name[5:]) if name.startswith('mark:') else None)
        txt = chr(cp) if not name.startswith('mark:') else chr(0xE02E) + chr(cp)
        d.text((ox, oy), txt, fill='#ddd', font=font, anchor='ls')
        for k, s in enumerate(strokes):
            c = colours[k % len(colours)]
            P = [(ox + x * sc, oy - y * sc) for x, y in s]
            d.line(P, fill=c, width=2)
            d.ellipse([P[0][0] - 4, P[0][1] - 4, P[0][0] + 4, P[0][1] + 4], fill=c)
            d.text((P[0][0] + 5, P[0][1] - 14), str(k + 1), fill=c, font=small)
    im.save(path)


if __name__ == '__main__':
    main()
