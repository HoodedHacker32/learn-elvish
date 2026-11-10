// Smooth curves through a stroke's points, for drawing only (recognition still uses the points).
// Each point keeps its place and the line bends through it along the direction from the point
// before to the point after. Each handle is a third of its own segment, so a long straight stem
// next to a tight hook never bulges past either end.
const f = (n) => Math.round(n * 10) / 10

// The traced strokes wobble a little (they come from thinning the font's outline). Before drawing,
// space the points evenly, then let each point drift a little towards its neighbours: wobbles
// iron out and sharp turns round off, while the ends stay put and long straight runs stay straight.
export function soften(pts, step = 14, passes = 4) {
  if (pts.length < 3) return pts
  const out = [pts[0]]
  let carry = 0
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], len = Math.hypot(bx - ax, by - ay)
    let t = step - carry
    while (t <= len) { out.push([ax + ((bx - ax) * t) / len, ay + ((by - ay) * t) / len]); t += step }
    carry = len - (t - step)
  }
  const end = pts[pts.length - 1], last = out[out.length - 1]
  if (Math.hypot(end[0] - last[0], end[1] - last[1]) > step / 3) out.push(end)
  else out[out.length - 1] = end
  let P = out
  for (let k = 0; k < passes; k++) {
    P = P.map((p, i) => (i === 0 || i === P.length - 1 ? p
      : [0.25 * P[i - 1][0] + 0.5 * p[0] + 0.25 * P[i + 1][0], 0.25 * P[i - 1][1] + 0.5 * p[1] + 0.25 * P[i + 1][1]]))
  }
  // thin them out again so the path stays short; the curves below fill in between
  return P.filter((_, i) => i === 0 || i === P.length - 1 || i % 3 === 0)
}

// an SVG path; font units are y-up, so y is flipped unless told otherwise
export function smoothD(raw, flip = true) {
  const P = soften(raw).map(([x, y]) => [x, flip ? -y : y])
  if (!P.length) return ''
  if (P.length === 1) return `M${f(P[0][0])} ${f(P[0][1])}h0.1`
  if (P.length === 2) return `M${f(P[0][0])} ${f(P[0][1])}L${f(P[1][0])} ${f(P[1][1])}`
  const tan = (i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1
    return [dx / l, dy / l]
  }
  let d = `M${f(P[0][0])} ${f(P[0][1])}`
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) / 3
    const ta = tan(i), tb = tan(i + 1)
    d += `C${f(a[0] + ta[0] * L)} ${f(a[1] + ta[1] * L)} ${f(b[0] - tb[0] * L)} ${f(b[1] - tb[1] * L)} ${f(b[0])} ${f(b[1])}`
  }
  return d
}

// the same idea on a canvas, for ink already in pixels: curves through the midpoints
export function smoothInk(ctx, px) {
  ctx.beginPath()
  ctx.moveTo(px[0][0], px[0][1])
  if (px.length === 1) ctx.lineTo(px[0][0] + 0.1, px[0][1])
  else if (px.length === 2) ctx.lineTo(px[1][0], px[1][1])
  else {
    for (let i = 1; i < px.length - 1; i++) {
      const [x, y] = px[i], [nx, ny] = px[i + 1]
      ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2)
    }
    const last = px[px.length - 1]
    ctx.lineTo(last[0], last[1])
  }
  ctx.stroke()
}
