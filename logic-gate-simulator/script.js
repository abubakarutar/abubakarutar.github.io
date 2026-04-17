const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wrap = document.getElementById("canvas-wrap");

let gates = [];
let wires = [];
let nextId = 1;
let pendingPort = null; // {gateId, portType, portIdx}
let dragging = null; // {gateId, ox, oy}
let dragType = null; // from sidebar
let dropPreview = null;

const COLORS = {
  on: "#1D9E75",
  off: "#888780",
  bg: null, // set per draw
  stroke: null,
  text: null,
};

function isDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function themeColors() {
  const dark = isDark();
  COLORS.bg = dark ? "#1e1e1c" : "#f4f3ee";
  COLORS.gateBg = dark ? "#2c2c2a" : "#ffffff";
  COLORS.stroke = dark ? "#5a5a55" : "#888780";
  COLORS.text = dark ? "#c2c0b6" : "#2c2c2a";
  COLORS.border = dark ? "#3a3a37" : "#d3d1c7";
  COLORS.sel = dark ? "#1D9E75" : "#0F6E56";
  COLORS.pending = "#EF9F27";
}

function resize() {
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  draw();
}

window.addEventListener("resize", resize);
new ResizeObserver(resize).observe(wrap);

// ─── Gate geometry ─────────────────────────────────────────────────
const GW = 88,
  GH = 54;

function numInputs(type) {
  return type === "NOT" || type === "INPUT" || type === "OUTPUT" ? 1 : 2;
}

function portPos(gate, portType, idx) {
  const { x, y, type } = gate;
  if (portType === "out") return { x: x + GW, y: y + GH / 2 };
  const n = numInputs(type);
  if (type === "OUTPUT") return { x, y: y + GH / 2 };
  const gap = GH / (n + 1);
  return { x, y: y + gap * (idx + 1) };
}

function gateLogic(type, inputs) {
  const [a, b] = inputs;
  switch (type) {
    case "AND":
      return a && b;
    case "OR":
      return a || b;
    case "NOT":
      return !a;
    case "NAND":
      return !(a && b);
    case "NOR":
      return !(a || b);
    case "XOR":
      return a !== b;
    case "XNOR":
      return a === b;
    case "INPUT":
      return false; // value controlled by toggle
    case "OUTPUT":
      return a;
    default:
      return false;
  }
}

// ─── Simulation ─────────────────────────────────────────────────────
function simulate() {
  // topological sort + evaluate
  for (const g of gates) {
    g.computed = undefined;
    if (g.type === "INPUT") g.computed = !!g.value;
  }
  let changed = true,
    iter = 0;
  while (changed && iter++ < 50) {
    changed = false;
    for (const g of gates) {
      if (g.computed !== undefined) continue;
      const n = numInputs(g.type);
      const inputs = [];
      let ready = true;
      for (let i = 0; i < n; i++) {
        const wire = wires.find((w) => w.toId === g.id && w.toIdx === i);
        if (!wire) {
          inputs.push(false);
        } else {
          const src = gates.find((x) => x.id === wire.fromId);
          if (!src || src.computed === undefined) {
            ready = false;
            break;
          }
          inputs.push(src.computed);
        }
      }
      if (ready) {
        const val = gateLogic(g.type, inputs);
        g.computed = val;
        changed = true;
      }
    }
  }
  for (const g of gates) {
    if (g.computed === undefined) g.computed = false;
  }
}

// ─── Draw ───────────────────────────────────────────────────────────
function drawArrow(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  const cx = (x1 + x2) / 2;
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(cx, y1, cx, y2, x2, y2);
  ctx.stroke();
}

function drawGate(g) {
  const { x, y, type, computed } = g;
  const sig = computed ? COLORS.on : COLORS.off;

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 6;

  // Body
  ctx.beginPath();
  ctx.roundRect(x, y, GW, GH, 8);
  ctx.fillStyle = COLORS.gateBg;
  ctx.fill();
  ctx.strokeStyle = computed ? COLORS.on : COLORS.border;
  ctx.lineWidth = computed ? 1.5 : 0.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Label
  ctx.fillStyle = COLORS.text;
  ctx.font = "500 13px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (type === "INPUT") {
    ctx.fillStyle = computed ? COLORS.on : COLORS.off;
    ctx.font = "600 12px monospace";
    ctx.fillText(computed ? "1" : "0", x + GW / 2, y + GH / 2 - 7);
    ctx.font = "400 10px monospace";
    ctx.fillStyle = COLORS.stroke;
    ctx.fillText("INPUT", x + GW / 2, y + GH / 2 + 9);
  } else if (type === "OUTPUT") {
    ctx.fillStyle = computed ? COLORS.on : COLORS.off;
    ctx.font = "700 14px monospace";
    ctx.fillText(computed ? "1" : "0", x + GW / 2, y + GH / 2 - 7);
    ctx.font = "400 10px monospace";
    ctx.fillStyle = COLORS.stroke;
    ctx.fillText("OUTPUT", x + GW / 2, y + GH / 2 + 9);
  } else {
    ctx.fillStyle = COLORS.text;
    ctx.fillText(type, x + GW / 2, y + GH / 2);
  }

  // Ports
  const n = numInputs(type);
  if (type !== "INPUT") {
    for (let i = 0; i < n; i++) {
      const p = portPos(g, "in", i);
      const wire = wires.find((w) => w.toId === g.id && w.toIdx === i);
      const connected = !!wire;
      // Draw nub
      ctx.beginPath();
      ctx.moveTo(x, p.y);
      ctx.lineTo(x - 10, p.y);
      ctx.strokeStyle = connected ? COLORS.on : COLORS.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - 10, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle =
        pendingPort &&
        pendingPort.gateId === g.id &&
        pendingPort.portType === "in" &&
        pendingPort.portIdx === i
          ? COLORS.pending
          : connected
            ? COLORS.on
            : COLORS.stroke;
      ctx.fill();
    }
  }
  if (type !== "OUTPUT") {
    const p = portPos(g, "out", 0);
    const connected = wires.some((w) => w.fromId === g.id);
    ctx.beginPath();
    ctx.moveTo(x + GW, p.y);
    ctx.lineTo(x + GW + 10, p.y);
    ctx.strokeStyle = computed ? COLORS.on : COLORS.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + GW + 10, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle =
      pendingPort &&
      pendingPort.gateId === g.id &&
      pendingPort.portType === "out"
        ? COLORS.pending
        : connected
          ? COLORS.on
          : COLORS.stroke;
    ctx.fill();
  }
}

function draw() {
  themeColors();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  simulate();

  // Draw wires
  for (const w of wires) {
    const from = gates.find((g) => g.id === w.fromId);
    const to = gates.find((g) => g.id === w.toId);
    if (!from || !to) continue;
    const p1 = portPos(from, "out", 0);
    const p2 = portPos(to, "in", w.toIdx);
    drawArrow(
      p1.x + 10,
      p1.y,
      p2.x - 10,
      p2.y,
      from.computed ? COLORS.on : COLORS.off,
    );
  }

  // Preview wire
  if (pendingPort) {
    const g = gates.find((x) => x.id === pendingPort.gateId);
    if (g && mousePos) {
      const p = portPos(g, pendingPort.portType, pendingPort.portIdx);
      const sx = pendingPort.portType === "out" ? p.x + 10 : p.x - 10;
      drawArrow(sx, p.y, mousePos.x, mousePos.y, COLORS.pending);
    }
  }

  // Draw gates on top
  for (const g of gates) drawGate(g);

  // Drop preview
  if (dropPreview) {
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.roundRect(dropPreview.x - GW / 2, dropPreview.y - GH / 2, GW, GH, 8);
    ctx.fillStyle = COLORS.on;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(draw);
}

// ─── Port hit-test ──────────────────────────────────────────────────
function hitPort(mx, my) {
  for (const g of gates) {
    if (g.type !== "INPUT") {
      const n = numInputs(g.type);
      for (let i = 0; i < n; i++) {
        const p = portPos(g, "in", i);
        if (Math.hypot(mx - (p.x - 10), my - p.y) < 8)
          return { gateId: g.id, portType: "in", portIdx: i };
      }
    }
    if (g.type !== "OUTPUT") {
      const p = portPos(g, "out", 0);
      if (Math.hypot(mx - (p.x + 10), my - p.y) < 8)
        return { gateId: g.id, portType: "out", portIdx: 0 };
    }
  }
  return null;
}

function hitGate(mx, my) {
  for (let i = gates.length - 1; i >= 0; i--) {
    const g = gates[i];
    if (mx >= g.x && mx <= g.x + GW && my >= g.y && my <= g.y + GH) return g;
  }
  return null;
}

// ─── Mouse ──────────────────────────────────────────────────────────
let mousePos = null;

canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mousePos = { x: e.clientX - r.left, y: e.clientY - r.top };
  if (dragging) {
    const g = gates.find((x) => x.id === dragging.id);
    if (g) {
      g.x = mousePos.x - dragging.ox;
      g.y = mousePos.y - dragging.oy;
    }
  }
});

canvas.addEventListener("mousedown", (e) => {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left,
    my = e.clientY - r.top;

  // Port click
  const port = hitPort(mx, my);
  if (port) {
    if (!pendingPort) {
      pendingPort = port;
    } else {
      // Try to form a wire
      const a = pendingPort,
        b = port;
      if (a.gateId !== b.gateId) {
        let from, to, toIdx;
        if (a.portType === "out" && b.portType === "in") {
          from = a.gateId;
          to = b.gateId;
          toIdx = b.portIdx;
        } else if (a.portType === "in" && b.portType === "out") {
          from = b.gateId;
          to = a.gateId;
          toIdx = a.portIdx;
        }
        if (from !== undefined) {
          // Remove existing wire to that input
          wires = wires.filter((w) => !(w.toId === to && w.toIdx === toIdx));
          wires.push({ fromId: from, toId: to, toIdx });
        }
      }
      pendingPort = null;
    }
    return;
  }

  pendingPort = null;

  const g = hitGate(mx, my);
  if (g) {
    // Toggle INPUT
    if (g.type === "INPUT") {
      g.value = !g.value;
      return;
    }
    // Start drag
    dragging = { id: g.id, ox: mx - g.x, oy: my - g.y };
    // Bring to front
    const idx = gates.indexOf(g);
    gates.splice(idx, 1);
    gates.push(g);
  }
});

canvas.addEventListener("mouseup", () => {
  dragging = null;
});
canvas.addEventListener("mouseleave", () => {
  dragging = null;
  mousePos = null;
});

// Right-click removes gate/wire
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left,
    my = e.clientY - r.top;
  const g = hitGate(mx, my);
  if (g) {
    gates = gates.filter((x) => x.id !== g.id);
    wires = wires.filter((w) => w.fromId !== g.id && w.toId !== g.id);
    pendingPort = null;
  }
});

// ─── Sidebar drag & drop ─────────────────────────────────────────────
document.querySelectorAll(".gate-btn").forEach((btn) => {
  btn.addEventListener("dragstart", (e) => {
    dragType = e.currentTarget.dataset.type;
    e.dataTransfer.effectAllowed = "copy";
  });
});

wrap.addEventListener("dragover", (e) => {
  e.preventDefault();
  const r = wrap.getBoundingClientRect();
  dropPreview = { x: e.clientX - r.left, y: e.clientY - r.top };
});
wrap.addEventListener("dragleave", () => {
  dropPreview = null;
});
wrap.addEventListener("drop", (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left - GW / 2;
  const y = e.clientY - r.top - GH / 2;
  if (dragType) {
    gates.push({ id: nextId++, type: dragType, x, y, value: false });
    document.getElementById("hint").style.display = "none";
  }
  dragType = null;
  dropPreview = null;
});

// ─── Toolbar ────────────────────────────────────────────────────────
function clearAll() {
  gates = [];
  wires = [];
  pendingPort = null;
  document.getElementById("hint").style.display = "";
}

draw();
