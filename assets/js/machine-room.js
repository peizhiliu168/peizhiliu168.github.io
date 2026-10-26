(() => {
  const W = 28, H = 18;
  // Stops, in the order the chips list them. Several room objects can belong to one stop.
  const POIS = [
    { id: "desk", name: "Badge desk" },
    { id: "compute", name: "Compute nodes" },
    { id: "fabric", name: "Interconnect" },
    { id: "archive", name: "Publications archive" },
    { id: "sched", name: "Scheduler" },
    { id: "blackboard", name: "Blackboard" },
    { id: "nsf", name: "Plaque" },
    { id: "cv", name: "CV cabinet" },
    { id: "contact", name: "Contact terminal" },
  ];
  const STOP = Object.fromEntries(POIS.map(s => [s.id, s]));
  // Room objects in tile coordinates; `stop` links an object to the card it opens, `marker` puts the stop's marker on it.
  const OBJS = [
    { stop: "desk", kind: "desk", x: 1, y: 12, w: 3, h: 1, marker: true },
    { stop: "compute", kind: "rack", x: 5, y: 3, w: 7, h: 1, led: "#58a9ff", label: "COMPUTE · CPU", marker: true },
    { stop: "compute", kind: "rack", x: 14, y: 3, w: 7, h: 1, led: "#58a9ff", label: "COMPUTE · CPU" },
    { stop: "compute", kind: "rack", x: 5, y: 11, w: 7, h: 1, led: "#86e26f", label: "COMPUTE · GPU" },
    { stop: "compute", kind: "rack", x: 14, y: 11, w: 7, h: 1, led: "#86e26f", label: "COMPUTE · GPU" },
    { stop: "sched", kind: "console", x: 1, y: 5, w: 2, h: 1, label: "SLURM", marker: true },
    { stop: "fabric", kind: "switch", x: 9, y: 7, w: 8, h: 1, label: "INTERCONNECT", marker: true },
    { stop: "archive", kind: "tape", x: 10, y: 15, w: 6, h: 1, label: "ARCHIVE", marker: true },
    { stop: "blackboard", kind: "blackboard", x: 22, y: 1, w: 4, h: 1, marker: true, markerAt: [26.45, .7] },
    { stop: "nsf", kind: "plaque", x: 26, y: 5, w: 1, h: 1, marker: true },
    { stop: "cv", kind: "cabinet", x: 26, y: 9, w: 1, h: 2, marker: true },
    { stop: "contact", kind: "terminal", x: 23, y: 14, w: 3, h: 1, marker: true },
  ];
  const partsOf = id => OBJS.filter(o => o.stop === id);
  const find = kind => OBJS.find(o => o.kind === kind);
  const solid = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => x === 0 || y === 0 || x === W - 1 || y === H - 1));
  OBJS.forEach(o => { for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) solid[y][x] = true; });
  const objAt = Array.from({ length: H }, () => Array(W).fill(null));
  OBJS.forEach(o => { for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) objAt[y][x] = o; });
  const walkable = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !solid[y][x];

  const R = 0.3;
  const clearAt = (px, py) => {
    for (let y = Math.floor(py - R); y <= Math.floor(py + R); y++)
      for (let x = Math.floor(px - R); x <= Math.floor(px + R); x++) if (!walkable(x, y)) return false;
    return true;
  };
  const distToObj = (px, py, o) => {
    const dx = Math.max(o.x - px, 0, px - (o.x + o.w)), dy = Math.max(o.y - py, 0, py - (o.y + o.h));
    return Math.hypot(dx, dy);
  };
  const distToStop = (px, py, s) => Math.min(...partsOf(s.id).map(o => distToObj(px, py, o)));

  // Dijkstra on an 8-connected grid (no corner cutting); stops at the first tile that passes `goal`.
  function search(sx, sy, goal) {
    const N = W * H, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N);
    const s = sy * W + sx; dist[s] = 0;
    const open = [s];
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
      const u = open.splice(bi, 1)[0]; if (done[u]) continue; done[u] = 1;
      const ux = u % W, uy = (u / W) | 0;
      if (goal(ux, uy)) { const path = []; for (let v = u; v !== -1; v = prev[v]) path.unshift([v % W + .5, ((v / W) | 0) + .5]); return path; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = ux + dx, ny = uy + dy;
        if (!walkable(nx, ny)) continue;
        if (dx && dy && (!walkable(ux + dx, uy) || !walkable(ux, uy + dy))) continue;
        const v = ny * W + nx, nd = dist[u] + (dx && dy ? Math.SQRT2 : 1);
        if (nd < dist[v]) { dist[v] = nd; prev[v] = u; open.push(v); }
      }
    }
    return null;
  }
  const los = (a, b) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / 0.1);
    for (let i = 1; i <= n; i++) if (!clearAt(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n)) return false;
    return true;
  };
  function smooth(pts) {
    const out = [pts[0]]; let i = 0;
    while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !los(pts[i], pts[j])) j--; out.push(pts[j]); i = j; }
    return out;
  }

  // --- state ---
  const P = { x: 2.5, y: 13.5, face: 1, walk: 0, moving: false };
  // A small orange cat roams the room on its own and gets into trouble.
  const K = { x: 6.5, y: 14.5, face: 1, walk: 0, moving: false, path: [], speed: 3, state: "idle", timer: 1.5, pose: "sit", arrive: null, emote: "", emoteUntil: 0, nextChat: 0 };
  const drops = [];
  let path = [], target = null, near = null, shown = null, hover = null;
  const seen = new Set();
  const keys = new Set();

  function goTo(goal, mark) {
    const sx = Math.floor(P.x), sy = Math.floor(P.y);
    const raw = search(sx, sy, goal);
    if (!raw) return;
    raw[0] = [P.x, P.y];
    path = smooth(raw).slice(1);
    target = mark ? { x: mark[0], y: mark[1], t: performance.now() } : null;
  }
  // The exit door is in the bottom wall; stepping onto the mat in front of it leaves the room.
  const DOOR = { x0: 1, x1: 3, y: H - 1 }, MAT = [2.5, H - 1.5];
  const onDoor = (tx, ty) => ty === DOOR.y && tx >= DOOR.x0 && tx <= DOOR.x1;
  function goToTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return;
    if (onDoor(tx, ty)) return goTo((x, y) => x === Math.floor(MAT[0]) && y === Math.floor(MAT[1]), MAT);
    const o = objAt[ty][tx];
    if (o && o.stop) return goToStop(STOP[o.stop]);
    if (walkable(tx, ty)) return goTo((x, y) => x === tx && y === ty, [tx + .5, ty + .5]);
    goTo((x, y) => Math.abs(x - tx) <= 1 && Math.abs(y - ty) <= 1, [tx + .5, ty + .5]);
  }
  function goToStop(s) {
    goTo((x, y) => distToStop(x + .5, y + .5, s) <= 0.75, null);
  }

  // --- dialogue ---
  const dialog = document.getElementById("dialog"), count = document.getElementById("count");
  const articles = Object.fromEntries([...document.querySelectorAll("#stops article")].map(a => [a.dataset.poi, a]));
  // The notes at the bottom fill in as stops are found, in the order you find them.
  // Without JavaScript every note stays visible.
  const notes = document.getElementById("stops"), locked = document.getElementById("locked");
  Object.values(articles).forEach(a => { a.hidden = true; });
  function reveal(id, quiet) {
    const a = articles[id];
    a.hidden = false; notes.appendChild(a);
    if (!quiet) { a.classList.remove("found"); void a.offsetWidth; a.classList.add("found"); }
    const left = POIS.length - seen.size;
    locked.hidden = !left;
    locked.textContent = `${left} more stop${left > 1 ? "s" : ""} to find. Walk up to anything with a yellow marker.`;
  }
  const chips = document.getElementById("chips");
  const chipEls = {};
  POIS.forEach(o => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = o.name;
    b.addEventListener("click", () => { goToStop(o); cv.focus({ preventScroll: true }); });
    chips.appendChild(b); chipEls[o.id] = b;
  });
  function showStop(o) {
    shown = o;
    const a = articles[o.id];
    const left = POIS.length - seen.size;
    dialog.innerHTML = a.innerHTML + `<p class="hint">${left ? `${left} stop${left > 1 ? "s" : ""} left. Look for the yellow markers.` : "You found every stop. Thanks for visiting."}</p>`;
    dialog.classList.remove("fresh"); void dialog.offsetWidth; dialog.classList.add("fresh");
  }
  function updateCount() {
    count.textContent = `${seen.size}/${POIS.length}`;
    POIS.forEach(o => chipEls[o.id].classList.toggle("seen", seen.has(o.id)));
  }

  // --- canvas ---
  const stage = document.getElementById("stage"), cv = document.getElementById("cv"), ctx = cv.getContext("2d");
  let T = 32, dpr = 1;
  // Size the canvas to the stage's inner box (inside its border) at the screen's full pixel
  // density, and pin its CSS size to exactly that many device pixels so the browser never
  // rescales the picture.
  function resize() {
    dpr = window.devicePixelRatio || 1;
    const w = stage.clientWidth, h = stage.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = cv.width / dpr + "px"; cv.style.height = cv.height / dpr + "px";
    T = cv.width / dpr / W;
  }
  new ResizeObserver(resize).observe(stage); resize();

  const tileFromEvent = e => {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
  };
  let dragging = false, lastRetarget = 0;
  cv.addEventListener("pointerdown", e => {
    dragging = true; cv.setPointerCapture(e.pointerId);
    const [x, y] = tileFromEvent(e); goToTile(Math.floor(x), Math.floor(y)); lastRetarget = performance.now();
  });
  cv.addEventListener("pointermove", e => {
    const [x, y] = tileFromEvent(e), tx = Math.floor(x), ty = Math.floor(y);
    const o = tx >= 0 && ty >= 0 && tx < W && ty < H ? objAt[ty][tx] : null;
    hover = o && o.stop ? STOP[o.stop] : null;
    cv.classList.toggle("over", !!hover || onDoor(tx, ty));
    if (dragging && performance.now() - lastRetarget > 110) { goToTile(tx, ty); lastRetarget = performance.now(); }
  });
  const stopDrag = () => { dragging = false; };
  cv.addEventListener("pointerup", stopDrag); cv.addEventListener("pointercancel", stopDrag);
  cv.addEventListener("pointerleave", () => { hover = null; cv.classList.remove("over"); });
  const KEYMAP = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
  cv.addEventListener("keydown", e => { if (KEYMAP[e.code]) { e.preventDefault(); keys.add(e.code); path = []; target = null; } });
  cv.addEventListener("keyup", e => keys.delete(e.code));
  cv.addEventListener("blur", () => keys.clear());

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hash = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

  // drawing helpers (tile units)
  // Fill a rectangle with its edges snapped to whole device pixels, so pixel-art edges stay
  // sharp. Works under translate/scale (including the cats' mirrored sprites); anything
  // rotated falls back to a normal fill.
  const rect = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    const m = ctx.getTransform();
    if (m.b || m.c) { ctx.fillRect(x, y, w, h); return; }
    let x0 = Math.round(m.a * x + m.e), x1 = Math.round(m.a * (x + w) + m.e);
    let y0 = Math.round(m.d * y + m.f), y1 = Math.round(m.d * (y + h) + m.f);
    if (x1 < x0) [x0, x1] = [x1, x0];
    if (y1 < y0) [y0, y1] = [y1, y0];
    if (x1 === x0 && w) x1 = x0 + 1;
    if (y1 === y0 && h) y1 = y0 + 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.setTransform(m);
  };
  // Text is drawn at whole device pixels. Silkscreen is a pixel font, so it is sized in
  // multiples of 4 device pixels, where its strokes line up with the pixel grid.
  function fontPx(size, font) {
    const px = Math.max(8, size * T) * dpr;
    return font === "Silkscreen" ? Math.max(8, Math.round(px / 4) * 4) : Math.round(px);
  }
  function text(str, x, y, size, color, font = "Silkscreen", align = "center") {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = `${fontPx(size, font)}px "${font}", monospace`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "middle";
    ctx.fillText(str, Math.round(x * T * dpr), Math.round(y * T * dpr)); ctx.restore();
  }
  const px = 1 / 32;

  function drawFloor() {
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const office = x >= 22;
      rect(x, y, 1, 1, office ? "#bfc4d0" : "#cfd4da");
      if (!office) {
        const cold = y >= 4 && y <= 6 || y >= 8 && y <= 10;
        if (cold) rect(x, y, 1, 1, "rgba(70,130,215,.10)");
        if (y === 5 || y === 9 || y === 13) for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) rect(x + .17 + i * .2, y + .17 + j * .2, 2 * px, 2 * px, "#a7b0ba");
        rect(x, y, 1, px, "#b7bec7"); rect(x, y, px, 1, "#b7bec7");
      } else if ((x + y) % 2 === 0) rect(x + .45, y + .45, 2 * px, 2 * px, "#acb2c0");
    }
    // walls
    rect(0, 0, W, 1, "#3b414a"); rect(0, H - 1, W, 1, "#3b414a"); rect(0, 0, 1, H, "#3b414a"); rect(W - 1, 0, 1, H, "#3b414a");
    rect(0, .8, W, .2, "#2b3037");
    // door + exit sign
    rect(1.6, H - 1, 1.8, 1, "#5b6774"); rect(1.6, H - 1, 1.8, 3 * px, "#86e26f");
    text("EXIT", 2.5, H - .5, .34, "#86e26f");
    text("NORTHWESTERN · MUDD HALL MACHINE ROOM", 10, .45, .32, "#c9ced6");
  }

  function drawRack(o, t) {
    const sw = o.kind === "switch";
    for (let i = 0; i < o.w; i++) {
      const x = o.x + i, y = o.y;
      rect(x + 2 * px, y - .25, 1 - 4 * px, 1.2, "#20242a");
      rect(x + 3 * px, y - .22, 1 - 6 * px, .3, "#363c45");
      rect(x + 4 * px, y + .12, 1 - 8 * px, .76, "#2b3038");
      for (let r = 0; r < 5; r++) rect(x + 5 * px, y + .16 + r * .15, 1 - 10 * px, px, "#3a414b");
      const rows = sw ? 6 : 4, cols = sw ? 4 : 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const k = reduce ? 0 : Math.floor(t * (sw ? 6 : 2.2) + hash(i, r, c) * 9);
        const on = hash(o.x * 31 + i, r * 7 + c, k) > (sw ? .45 : .3);
        const lx = sw ? x + .18 + c * .19 : x + .62 + c * .14, ly = y + .2 + r * (sw ? .12 : .16);
        rect(lx, ly, 2.5 * px, 2.5 * px, on ? (o.led || "#f2b440") : "#3d444e");
      }
      if (!sw) { rect(x + .16, y + .2, .34, .58, "#22262c"); rect(x + .2, y + .24, .26, 2 * px, "#4a525d"); }
    }
    plate(o.label, o.x + o.w / 2, o.y - .55);
  }
  function drawTape(o, t) {
    for (let i = 0; i < o.w; i++) {
      const x = o.x + i, y = o.y;
      rect(x + 2 * px, y - .25, 1 - 4 * px, 1.2, "#20242a");
      rect(x + 3 * px, y - .22, 1 - 6 * px, .3, "#363c45");
      rect(x + 4 * px, y + .12, 1 - 8 * px, .76, "#1a1e23");
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
        const tint = ["#e7e9ec", "#c9ced5", "#58a9ff", "#f2b440", "#86e26f"][Math.floor(hash(x, r, c) * 5)];
        rect(x + .1 + c * .165, y + .17 + r * .17, .12, .12, hash(x, c, r) > .18 ? tint : "#1a1e23");
      }
    }
    // robot picker sliding along the library
    const k = reduce ? .3 : (Math.sin(t * .7) + 1) / 2, rx = o.x + .2 + k * (o.w - .6);
    rect(o.x + .1, o.y + .9, o.w - .2, 2 * px, "#8a929c");
    rect(rx, o.y + .78, .22, .2, "#f2b440");
    plate(o.label, o.x + o.w / 2, o.y - .55);
  }
  function plate(label, cx, cy) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = `${fontPx(.3, "Silkscreen")}px "Silkscreen", monospace`;
    const w = ctx.measureText(label).width / (T * dpr) + .3; ctx.restore();
    rect(cx - w / 2, cy - .2, w, .4, "#f3f4f6"); rect(cx - w / 2, cy + .2, w, px * 1.5, "#8a929c");
    text(label, cx, cy + .01, .3, "#1d232a");
  }
  // Cables fan out from the interconnect up to the CPU racks and down to the GPU racks.
  const CABLES = [];
  [6.5, 9.5, 15.5, 18.5].forEach((ex, i) => {
    const sx = 9.6 + i * 2.2;
    CABLES.push({ c: ["#58a9ff", "#f2b440", "#d27cff", "#58a9ff"][i], p: [[sx, 6.78], [sx, 5.4], [ex, 5.2], [ex, 3.95]] });
    CABLES.push({ c: ["#86e26f", "#f2b440", "#d27cff", "#86e26f"][i], p: [[sx + .5, 7.95], [sx + .5, 9.3], [ex, 9.5], [ex, 10.75]] });
  });
  const bez = (p, k) => { const u = 1 - k; return [0, 1].map(d => u * u * u * p[0][d] + 3 * u * u * k * p[1][d] + 3 * u * k * k * p[2][d] + k * k * k * p[3][d]); };
  function drawCables(t) {
    ctx.lineWidth = 2.2 * px; ctx.lineCap = "round"; ctx.globalAlpha = .6;
    CABLES.forEach(({ c, p }) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(...p[0]); ctx.bezierCurveTo(...p[1], ...p[2], ...p[3]); ctx.stroke(); });
    ctx.globalAlpha = 1;
    // packets riding the cables, staggered
    if (!reduce) CABLES.forEach(({ p }, i) => {
      const k = (t * .45 + i * .37) % 1, [bx, by] = bez(p, i % 2 ? k : 1 - k);
      rect(bx - 2 * px, by - 2 * px, 4 * px, 4 * px, "#fff7d6");
    });
  }
  function drawProps(t) {
    // badge desk
    let o = OBJS[0]; rect(o.x + .05, o.y - .1, o.w - .1, 1.05, "#7a5c43"); rect(o.x + .05, o.y - .1, o.w - .1, .18, "#946f50");
    rect(o.x + .4, o.y + .25, .5, .35, "#e8ecf0"); rect(o.x + .45, o.y + .3, .4, .08, "#4e2a84");
    rect(o.x + 1.8, o.y + .1, .7, .45, "#1d232a"); rect(o.x + 1.85, o.y + .14, .6, .36, "#3f7ad6");
    // scheduler console
    o = find("console"); rect(o.x + .05, o.y - .1, o.w - .1, 1.05, "#4a515b");
    rect(o.x + .25, o.y, o.w - .5, .62, "#14181d");
    for (let i = 0; i < 4; i++) rect(o.x + .35, o.y + .1 + i * .12, (i === 3 ? .7 : 1.1) - (i % 2) * .3, 1.5 * px, i === 3 ? "#f2b440" : "#86e26f");
    if (!reduce && Math.floor(t * 2) % 2) rect(o.x + 1.12, o.y + .44, .08, .08, "#86e26f");
    plate(o.label, o.x + o.w / 2, o.y - .55);
    // blackboard: wood frame, green slate, chalk tray, recursive-doubling sketch
    o = find("blackboard");
    const bx = o.x - .14, bw = o.w + .28, chalk = "#eef2ea", yellow = "#f3d36b";
    rect(bx, .06, bw, 1.1, "#6e4a2b"); rect(bx, .06, bw, .04, "#8d6140");
    rect(o.x, .15, o.w, .9, "#2a4a3a");
    rect(o.x + .35, .32, 1.1, .22, "rgba(255,255,255,.05)"); rect(o.x + 2.3, .62, 1, .3, "rgba(255,255,255,.04)");
    rect(bx - .06, 1.1, bw + .12, .11, "#8d6140"); rect(bx - .06, 1.21, bw + .12, 1.5 * px, "#4d331e");
    rect(o.x + .3, 1.07, .24, .05, chalk); rect(o.x + .64, 1.07, .16, .05, yellow);
    rect(o.x + o.w - .8, 1.02, .46, .09, "#3a2b1f"); rect(o.x + o.w - .8, 1.1, .46, .03, "#cfc6b2");
    if (T >= 20) text("recursive doubling", o.x + .14, .3, .21, chalk, "Caveat", "left");
    if (T >= 20) text("log₂ p steps", o.x + o.w - .14, .3, .19, yellow, "Caveat", "right");
    const xs = [0, 1, 2, 3].map(i => o.x + .6 + i * (o.w - 1.2) / 3), base = .9;
    ctx.lineWidth = 1.8 * px; ctx.lineCap = "round"; ctx.globalAlpha = .92;
    const arc = (a, b, h, c) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(xs[a], base - .04); ctx.quadraticCurveTo((xs[a] + xs[b]) / 2, base - .04 - h * 2, xs[b], base - .04); ctx.stroke(); };
    arc(0, 1, .11, chalk); arc(2, 3, .11, chalk); arc(0, 2, .22, yellow); arc(1, 3, .22, yellow);
    xs.forEach(x => { ctx.strokeStyle = chalk; ctx.beginPath(); ctx.arc(x, base, .06, 0, 7); ctx.stroke(); });
    ctx.globalAlpha = 1;
    // plaque
    o = find("plaque"); rect(o.x + .2, o.y + .05, .75, .9, "#6b4f22"); rect(o.x + .28, o.y + .13, .59, .74, "#d8b25a");
    text("NSF", o.x + .575, o.y + .5, .22, "#4a3712");
    // filing cabinet
    o = find("cabinet"); rect(o.x + .1, o.y, .85, o.h, "#7d8591");
    for (let i = 0; i < 4; i++) { rect(o.x + .15, o.y + .08 + i * .48, .75, .42, "#949ca8"); rect(o.x + .4, o.y + .25 + i * .48, .25, .06, "#5b626c"); }
    text("CV", o.x + .52, o.y + 2.35 - 2.15, .2, "#1d232a");
    // contact terminal
    o = find("terminal"); rect(o.x + .05, o.y - .1, o.w - .1, 1.05, "#5a616c"); rect(o.x + .05, o.y - .1, o.w - .1, .16, "#6c7480");
    rect(o.x + .9, o.y + .05, 1.2, .62, "#14181d"); rect(o.x + .96, o.y + .1, 1.08, .5, "#24364d");
    text("@", o.x + 1.5, o.y + .36, .34, "#86e26f", "JetBrains Mono");
    rect(o.x + .25, o.y + .2, .45, .45, "#d8dce2"); rect(o.x + .25, o.y + .2, .45, .14, "#c2412d");
  }
  function drawMarkers(t) {
    OBJS.filter(o => o.marker).forEach(o => {
      const cx = o.markerAt ? o.markerAt[0] : o.x + o.w / 2, top = o.markerAt ? o.markerAt[1] : (o.kind === "rack" || o.kind === "switch" || o.kind === "console" || o.kind === "tape") ? o.y - 1.15 : o.y - .45;
      const bob = reduce ? 0 : Math.sin(t * 3 + o.x) * .08;
      if (seen.has(o.stop)) {
        ctx.fillStyle = "rgba(78,42,132,.9)"; ctx.beginPath(); ctx.arc(cx, top + .05, .16, 0, 7); ctx.fill();
        text("✓", cx, top + .06, .22, "#ffffff", "Atkinson Hyperlegible");
      } else {
        ctx.fillStyle = "#f2b440"; ctx.beginPath(); ctx.moveTo(cx, top - .28 + bob); ctx.lineTo(cx + .22, top + bob); ctx.lineTo(cx, top + .28 + bob); ctx.lineTo(cx - .22, top + bob); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#5a3e00"; ctx.lineWidth = 1.5 * px; ctx.stroke();
        text("!", cx, top + bob + .02, .3, "#3a2800", "Pixelify Sans");
      }
    });
  }
  function drawHighlight(s, color) {
    if (!s) return;
    ctx.strokeStyle = color; ctx.lineWidth = 2.5 * px; ctx.setLineDash([.15, .1]);
    partsOf(s.id).forEach(o => ctx.strokeRect(o.x - .08, o.y - .3, o.w + .16, o.h + .38)); ctx.setLineDash([]);
  }
  // The player is a black-and-white cat in a purple sweater: black cap over the ears, black rump patch and tail, amber eyes.
  function drawPlayer(t) {
    const step = P.moving && !reduce ? Math.sin(P.walk * 12) : 0;
    const sway = reduce ? 0 : Math.sin(t * (P.moving ? 9 : 2.2)) * .04;
    const bob = Math.abs(step) * .025;
    const WH = "#f5f5f2", BK = "#1c1c1f", PINK = "#e9a3ad", EYE = "#e2b13c", LINE = "#2b2e35", KNIT = "#4e2a84", RIB = "#7651b3";
    ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(P.x, P.y + .2, .34, .09, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(P.x, P.y - bob); ctx.scale(P.face, 1);
    // [x, y, w, h, color, outlined]
    const parts = [
      [-.36, -.17, .1, .07, BK, true], [-.45, -.32 + sway, .08, .17, BK, true], [-.42, -.42 + sway * 1.4, .08, .1, BK, true],
      [-.27, .02, .08, .13 + step * .03, WH, true], [-.13, .02, .08, .13 - step * .03, WH, true],
      [.07, .02, .08, .13 - step * .03, WH, true], [.19, .02, .08, .13 + step * .03, WH, true],
      [-.3, -.3, .56, .34, WH, true],
      [-.3, -.22, .1, .13, BK, false],
      // sweater: body, ribbed hem, a knit stripe, sleeves over the front legs
      [-.2, -.31, .48, .33, KNIT, false], [-.2, -.03, .48, .05, RIB, false], [-.16, -.17, .4, .03, RIB, false],
      [.07, .02, .08, .05, KNIT, false], [.19, .02, .08, .05, KNIT, false],
      [.1, -.66, .09, .11, BK, true], [.33, -.66, .09, .11, BK, true],
      [.1, -.56, .32, .3, WH, true],
      [.1, -.56, .32, .11, BK, false], [.1, -.46, .07, .08, BK, false],
      [.125, -.63, .04, .06, PINK, false], [.355, -.63, .04, .06, PINK, false],
      [.18, -.39, .05, .05, EYE, false], [.31, -.39, .05, .05, EYE, false],
      [.205, -.385, .02, .04, BK, false], [.335, -.385, .02, .04, BK, false],
      [.27, -.32, .04, .03, PINK, false],
      [.12, -.29, .28, .05, RIB, false],
    ];
    const o = 1.5 * px;
    parts.forEach(([x, y, w, h, c, line]) => { if (line) rect(x - o, y - o, w + 2 * o, h + 2 * o, LINE); });
    parts.forEach(([x, y, w, h, c]) => rect(x, y, w, h, c));
    ctx.restore();
  }
  // --- the orange kitten ---
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function say(text, secs, t) { K.emote = text; K.emoteUntil = t + secs; }
  function kittenGo(goal, speed, arrive) {
    const raw = search(Math.floor(K.x), Math.floor(K.y), goal);
    if (!raw || raw.length < 2) { K.state = "idle"; K.timer = rnd(.6, 1.4); return false; }
    raw[0] = [K.x, K.y];
    K.path = smooth(raw).slice(1); K.speed = speed; K.state = "move"; K.arrive = arrive; K.pose = "walk";
    return true;
  }
  function randomTile(far) {
    for (let n = 0; n < 200; n++) {
      const x = 1 + Math.floor(Math.random() * (W - 2)), y = 1 + Math.floor(Math.random() * (H - 2));
      if (walkable(x, y) && (!far || Math.hypot(x + .5 - K.x, y + .5 - K.y) > 8)) return [x, y];
    }
    return [Math.floor(K.x), Math.floor(K.y)];
  }
  const tileGoal = ([tx, ty]) => (x, y) => x === tx && y === ty;
  const nearObj = o => (x, y) => distToObj(x + .5, y + .5, o) <= .75;
  // Things it likes to knock over, and what falls off each one.
  const TARGETS = [
    { o: find("desk"), drop: "paper", line: "*swat*" },
    { o: find("blackboard"), drop: "chalk", line: "*swat*" },
    { o: find("cabinet"), drop: "paper", line: "*swat*" },
    { o: find("terminal"), drop: "note", line: "*swat*" },
    { o: find("tape"), drop: "tape", line: "*bat bat*" },
  ];
  function zoomies(t) { say(pick(["!", "!!"]), .8, t); kittenGo(tileGoal(randomTile(true)), 7.5, () => rest(t)); }
  function rest(t) { K.state = "idle"; K.pose = "sit"; K.timer = rnd(1, 2.5); }
  function decide(t) {
    const r = Math.random();
    if (r < .26) return kittenGo(tileGoal(randomTile(false)), 2.6, () => rest(t));
    if (r < .40) return zoomies(t);
    if (r < .64) {
      const g = pick(TARGETS);
      return kittenGo(nearObj(g.o), 3.4, () => { K.state = "swat"; K.pose = "swat"; K.timer = 1.3; K.face = Math.sign(g.o.x + g.o.w / 2 - K.x) || 1; K.target = g; say(g.line, 1.2, performance.now() / 1000); });
    }
    if (r < .74) {
      return kittenGo(nearObj(find("console")), 3.4, () => { K.state = "type"; K.pose = "sit"; K.timer = 3; say(pick(["asdfjkl;", "scancel -u all", "rm -rf ~/thesis", "sbatch --gres=gpu:9001"]), 3, performance.now() / 1000); });
    }
    if (r < .86) {
      return kittenGo((x, y) => (y === 12 || y === 10) && x >= 5 && x <= 20 && walkable(x, y), 2.6, () => { K.state = "nap"; K.pose = "sleep"; K.timer = rnd(5, 8); });
    }
    return kittenGo((x, y) => Math.hypot(x + .5 - P.x, y + .5 - P.y) <= 1.2, 4.2, () => { K.state = "tease"; K.pose = "sit"; K.timer = .9; K.face = Math.sign(P.x - K.x) || 1; say(pick(["mrrp?", "mew", "*sniff*"]), 1.1, performance.now() / 1000); });
  }
  function updateKitten(dt, t) {
    if (reduce) { K.pose = "sleep"; return; } // reduced motion: it just naps
    const dP = Math.hypot(P.x - K.x, P.y - K.y);
    K.moving = false;
    if (K.state === "move") {
      if (K.path.length) {
        const [tx, ty] = K.path[0], dx = tx - K.x, dy = ty - K.y, d = Math.hypot(dx, dy), s = K.speed * dt;
        if (Math.abs(dx) > .01) K.face = Math.sign(dx);
        if (d <= s) { K.x = tx; K.y = ty; K.path.shift(); } else { K.x += dx / d * s; K.y += dy / d * s; }
        K.moving = true; K.walk += dt * K.speed / 3;
      }
      if (!K.path.length) { const f = K.arrive; K.arrive = null; K.state = "idle"; K.timer = 1; f && f(); }
      return;
    }
    K.timer -= dt;
    if (K.state === "nap") {
      if (t > K.emoteUntil - .2) say(Math.floor(t) % 2 ? "z" : "zZ", .9, t);
      if (dP < 1.3) { say("!", .8, t); return zoomies(t); }
    }
    if (K.state === "swat" && K.timer <= 0) {
      const g = K.target, side = Math.sign(g.o.x + g.o.w / 2 - K.x) || 1;
      drops.push({ x: K.x + side * .35 + rnd(-.15, .15), y: K.y + rnd(.05, .25), kind: g.drop, t, r: rnd(-.5, .5) });
      if (drops.length > 7) drops.shift();
      say(pick(["oops", ">:3", "..."]), 1, t);
      K.state = "idle"; K.pose = "sit"; K.timer = .7; K.after = "flee";
      return;
    }
    if (K.state === "idle" && dP < .8 && t > K.nextChat) { K.nextChat = t + 6; say(pick(["hiss!", "mew", "!"]), .9, t); return zoomies(t); }
    if (K.timer <= 0) {
      if (K.after === "flee") { K.after = null; return zoomies(t); }
      if (K.state === "tease") return zoomies(t);
      decide(t);
    }
  }

  function drawDrops(t) {
    drops.forEach(d => {
      const age = t - d.t; if (age > 40) return;
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.r); ctx.globalAlpha = age > 34 ? (40 - age) / 6 : 1;
      if (d.kind === "paper") { rect(-.13, -.09, .26, .18, "#f6f6f2"); rect(-.09, -.05, .16, 1.2 * px, "#9aa1ab"); rect(-.09, 0, .12, 1.2 * px, "#9aa1ab"); }
      else if (d.kind === "chalk") { rect(-.09, -.025, .18, .05, "#eef2ea"); rect(.02, .04, .1, .04, "#f3d36b"); }
      else if (d.kind === "note") rect(-.08, -.08, .16, .16, "#f6e27a");
      else { rect(-.09, -.07, .18, .14, "#58a9ff"); rect(-.05, -.03, .1, .06, "#1a1e23"); }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }
  function drawEmote(t) {
    if (!K.emote || t > K.emoteUntil) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const size = fontPx(.24, "Silkscreen"); ctx.font = `${size}px "Silkscreen", monospace`;
    const w = Math.round(ctx.measureText(K.emote).width + size * .8), h = Math.round(size * 1.5);
    const cx = Math.round(K.x * T * dpr), cy = Math.round((K.y - (K.pose === "sleep" ? .55 : .78)) * T * dpr - h / 2);
    const tip = Math.round(4 * dpr);
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#4a2a12"; ctx.lineWidth = Math.max(1, Math.round(1.5 * dpr));
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 4 * dpr) : ctx.rect(cx - w / 2, cy - h / 2, w, h); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - tip, cy + h / 2); ctx.lineTo(cx, cy + h / 2 + tip + 1); ctx.lineTo(cx + tip, cy + h / 2); ctx.fill();
    ctx.fillStyle = "#4a2a12"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(K.emote, cx, cy + Math.round(dpr));
    ctx.restore();
  }

  // Smaller orange tabby: ginger coat, darker stripes, cream chest and paws, green eyes.
  function drawKitten(t) {
    const pose = K.moving ? "walk" : K.pose;
    const step = K.moving && !reduce ? Math.sin(K.walk * 15) : 0;
    const sway = reduce ? 0 : Math.sin(t * (K.moving ? 10 : pose === "sleep" ? .8 : 1.6) + 1) * .05;
    const bob = Math.abs(step) * .025;
    const swat = pose === "swat" && !reduce ? Math.sin(t * 16) : 0;
    const OR = "#f0a24a", ST = "#c66d1f", CR = "#fbe8cc", PINK = "#e9a3ad", EYE = "#7cc86a", BK = "#1c1c1f", LINE = "#4a2a12";
    ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.beginPath(); ctx.ellipse(K.x, K.y + .13, .22, .06, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(K.x, K.y - bob); ctx.scale(K.face * .65, .65);
    let parts;
    if (pose === "sleep") {
      // curled up loaf: body low, head resting, eyes shut, tail wrapped round the front
      parts = [
        [-.32, -.22, .6, .3, OR, true], [-.2, -.22, .06, .1, ST, false], [-.06, -.22, .06, .1, ST, false],
        [.08, -.5, .09, .1, OR, true], [.31, -.5, .09, .1, OR, true],
        [.08, -.42, .32, .3, OR, true], [.15, -.42, .04, .07, ST, false], [.29, -.42, .04, .07, ST, false],
        [.15, -.27, .07, 1.5 * px / .65, BK, false], [.28, -.27, .07, 1.5 * px / .65, BK, false],
        [.2, -.2, .16, .06, CR, false],
        [-.34, .02, .66, .07, OR, true], [.22, .02, .1, .07, ST, false],
      ];
    } else {
      const sit = pose !== "walk";
      parts = [
        [-.36, -.17, .1, .07, OR, true], [-.45, -.32 + sway, .08, .17, OR, true], [-.42, -.42 + sway * 1.4, .08, .1, ST, true],
        [-.27, .02, .08, sit ? .08 : .13 + step * .03, CR, true], [-.13, .02, .08, sit ? .08 : .13 - step * .03, CR, true],
        [.07, .02, .08, .13 - step * .03, CR, true],
        pose === "swat" ? [.26 + swat * .05, -.14 - Math.abs(swat) * .08, .08, .14, CR, true] : [.19, .02, .08, .13 + step * .03, CR, true],
        [-.3, sit ? -.24 : -.3, .56, sit ? .28 : .34, OR, true],
        [-.2, sit ? -.24 : -.3, .06, .14, ST, false], [-.06, sit ? -.24 : -.3, .06, .14, ST, false], [.08, sit ? -.24 : -.3, .06, .12, ST, false],
        [.12, -.2, .14, .2, CR, false],
        [.1, -.66, .09, .11, OR, true], [.33, -.66, .09, .11, OR, true],
        [.1, -.56, .32, .3, OR, true],
        [.17, -.56, .04, .08, ST, false], [.24, -.56, .04, .1, ST, false], [.31, -.56, .04, .08, ST, false],
        [.125, -.63, .04, .06, PINK, false], [.355, -.63, .04, .06, PINK, false],
        [.18, -.39, .05, .05, EYE, false], [.31, -.39, .05, .05, EYE, false],
        [.205, -.385, .02, .04, BK, false], [.335, -.385, .02, .04, BK, false],
        [.2, -.32, .16, .06, CR, false], [.27, -.32, .04, .03, PINK, false],
      ];
    }
    const o = 1.5 * px / .65;
    parts.forEach(([x, y, w, h, c, line]) => { if (line) rect(x - o, y - o, w + 2 * o, h + 2 * o, LINE); });
    parts.forEach(([x, y, w, h, c]) => rect(x, y, w, h, c));
    ctx.restore();
  }

  function drawTarget(now) {
    if (!target) return;
    const k = ((now - target.t) / 700) % 1;
    ctx.strokeStyle = `rgba(242,180,64,${1 - k})`; ctx.lineWidth = 2 * px;
    ctx.beginPath(); ctx.ellipse(target.x, target.y, .15 + k * .25, (.15 + k * .25) * .6, 0, 0, 7); ctx.stroke();
  }

  // Leaving: only once the cat has walked onto the mat this visit, so a visitor whose saved
  // position is on the mat isn't sent away the moment the page loads.
  let exitArmed = false, leaving = false;
  function checkExit() {
    const onMat = Math.hypot(P.x - MAT[0], P.y - MAT[1]) < .4;
    if (!onMat) { exitArmed = true; return; }
    if (!exitArmed || leaving) return;
    leaving = true; path = []; target = null; keys.clear();
    const go = () => { saveState(); location.href = stage.dataset.exit || "/"; };
    if (reduce) return go();
    document.body.classList.add("leaving");
    setTimeout(go, 450);
  }
  // a back/forward-cache restore after leaving shows the room again
  window.addEventListener("pageshow", e => { if (e.persisted) { leaving = false; exitArmed = false; document.body.classList.remove("leaving"); } });

  // --- loop ---
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const speed = 4.6;
    let mx = 0, my = 0;
    keys.forEach(k => { mx += KEYMAP[k][0]; my += KEYMAP[k][1]; });
    P.moving = false;
    if (mx || my) {
      const l = Math.hypot(mx, my), nx = P.x + mx / l * speed * dt, ny = P.y + my / l * speed * dt;
      if (clearAt(nx, P.y)) P.x = nx; if (clearAt(P.x, ny)) P.y = ny;
      if (mx) P.face = Math.sign(mx); P.moving = true;
    } else if (path.length) {
      const [tx, ty] = path[0], dx = tx - P.x, dy = ty - P.y, d = Math.hypot(dx, dy), s = speed * dt;
      if (Math.abs(dx) > .01) P.face = Math.sign(dx);
      if (d <= s) { P.x = tx; P.y = ty; path.shift(); if (!path.length) target = null; }
      else { P.x += dx / d * s; P.y += dy / d * s; }
      P.moving = true;
    }
    if (P.moving) P.walk += dt;
    updateKitten(dt, now / 1000);

    checkExit();
    let best = null, bd = .95;
    POIS.forEach(o => { const d = distToStop(P.x, P.y, o); if (d < bd) { bd = d; best = o; } });
    if (best !== near) {
      near = best;
      if (near) { const isNew = !seen.has(near.id); seen.add(near.id); updateCount(); if (isNew) { reveal(near.id); saveProgress(); } if (isNew || shown !== near) showStop(near); }
    }

    const t = now / 1000;
    ctx.setTransform(T * dpr, 0, 0, T * dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawFloor();
    OBJS.filter(o => o.kind === "rack" || o.kind === "switch").forEach(o => drawRack(o, t));
    drawTape(find("tape"), t);
    drawProps(t);
    drawCables(t);
    drawHighlight(hover && hover !== near ? hover : null, "rgba(78,42,132,.85)");
    drawHighlight(near, "#f2b440");
    drawTarget(now);
    drawMarkers(t);
    // draw whichever cat is further back first
    drawDrops(t);
    if (K.y < P.y) { drawKitten(t); drawPlayer(t); } else { drawPlayer(t); drawKitten(t); }
    drawEmote(t);
    requestAnimationFrame(frame);
  }

  // Progress is kept in this browser, so returning visitors keep the stops they found.
  const SAVE_KEY = "machine-room:found";
  function saveProgress() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify([...seen])); } catch (e) {}
  }
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
    if (Array.isArray(saved)) saved.forEach(id => { if (STOP[id] && !seen.has(id)) { seen.add(id); reveal(id, true); } });
  } catch (e) {}
  // The rest of the room (where both cats are, what's on the floor, which card is open) is saved too,
  // so a reload picks up exactly where the visitor left off.
  const STATE_KEY = "machine-room:state";
  let resetting = false;
  function saveState() {
    if (resetting) return;
    if (leaving) { P.x = MAT[0]; P.y = MAT[1] - 1; } // come back just inside the door
    const t = performance.now() / 1000;
    const state = {
      player: [P.x, P.y, P.face],
      kitten: [K.x, K.y, K.face, K.state === "nap" ? Math.max(K.timer, 0) : 0],
      shown: shown && shown.id,
      drops: drops.map(d => ({ x: d.x, y: d.y, kind: d.kind, r: d.r, age: t - d.t })).filter(d => d.age < 40),
    };
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  let firstStop = POIS[0];
  try {
    const st = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (st) {
      const t = performance.now() / 1000;
      const [px, py, pf] = st.player || [];
      if (isFinite(px) && isFinite(py) && clearAt(px, py)) { P.x = px; P.y = py; P.face = pf === -1 ? -1 : 1; }
      const [kx, ky, kf, nap] = st.kitten || [];
      if (isFinite(kx) && isFinite(ky) && walkable(Math.floor(kx), Math.floor(ky))) {
        K.x = kx; K.y = ky; K.face = kf === -1 ? -1 : 1;
        if (nap > 0) { K.state = "nap"; K.pose = "sleep"; K.timer = nap; }
      }
      (st.drops || []).forEach(d => { if (isFinite(d.x) && isFinite(d.y) && d.age < 40) drops.push({ x: d.x, y: d.y, kind: d.kind, r: d.r || 0, t: t - d.age }); });
      if (STOP[st.shown] && seen.has(st.shown)) firstStop = STOP[st.shown];
    }
  } catch (e) {}
  setInterval(saveState, 1000);
  window.addEventListener("pagehide", saveState);
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveState(); });

  document.getElementById("reset").addEventListener("click", () => {
    try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(STATE_KEY); } catch (e) {}
    resetting = true;
    location.reload();
  });

  updateCount();
  showStop(firstStop);
  requestAnimationFrame(frame);
})();
