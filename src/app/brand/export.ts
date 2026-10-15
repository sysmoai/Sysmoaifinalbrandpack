// ============================================================================
// SYSmoAI — shared export pipeline (PNG / JPEG / SVG / ICO / ZIP)
// ============================================================================
import { WORDMARK, logoSVG, type LogoVariant } from "./logo";

export type RasterFormat = "png" | "jpeg";

export type Layer =
  | { kind: "svg"; svg: string; x: number; y: number; w: number; h: number }
  | { kind: "wordmark"; x: number; y: number; size: number; color: string; align?: "left" | "center" }
  | {
      kind: "text"; text: string; x: number; y: number; size: number; color: string;
      weight?: number; family?: string; align?: CanvasTextAlign; tracking?: number;
    }
  | { kind: "rect"; x: number; y: number; w: number; h: number; color: string; r?: number }
  | { kind: "glow"; x: number; y: number; r: number; color: string };

let fontsReady: Promise<unknown> | null = null;
/** Make sure Inter weights used by the wordmark are loaded before canvas draws. */
export function ensureFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all([
      document.fonts.load("700 48px Inter"),
      document.fonts.load("400 48px Inter"),
      document.fonts.load("500 48px Inter"),
      document.fonts.load("500 48px 'JetBrains Mono'"),
    ]).then(() => document.fonts.ready).catch(() => undefined);
  }
  return fontsReady;
}

function loadSVG(svg: string): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/** Measure the locked wordmark at a given size. */
export function measureWordmark(ctx: CanvasRenderingContext2D, size: number) {
  let w = 0;
  for (const p of WORDMARK.parts) {
    ctx.font = `${p.weight} ${size}px Inter, system-ui, sans-serif`;
    w += ctx.measureText(p.text).width + p.tracking * size * p.text.length;
  }
  return w;
}

function drawWordmark(ctx: CanvasRenderingContext2D, l: Extract<Layer, { kind: "wordmark" }>) {
  let x = l.align === "center" ? l.x - measureWordmark(ctx, l.size) / 2 : l.x;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  for (const p of WORDMARK.parts) {
    ctx.font = `${p.weight} ${l.size}px Inter, system-ui, sans-serif`;
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = l.color;
    for (const ch of p.text) {
      ctx.fillText(ch, x, l.y);
      x += ctx.measureText(ch).width + p.tracking * l.size;
    }
  }
  ctx.globalAlpha = 1;
}

export async function renderCanvas(width: number, height: number, bg: string | null, layers: Layer[], scale = 1) {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height); }
  for (const l of layers) {
    if (l.kind === "svg") {
      ctx.drawImage(await loadSVG(l.svg), l.x, l.y, l.w, l.h);
    } else if (l.kind === "wordmark") {
      drawWordmark(ctx, l);
    } else if (l.kind === "text") {
      ctx.font = `${l.weight ?? 400} ${l.size}px ${l.family ?? "Inter, system-ui, sans-serif"}`;
      ctx.fillStyle = l.color;
      ctx.textAlign = l.align ?? "left";
      ctx.textBaseline = "alphabetic";
      if ("letterSpacing" in ctx && l.tracking) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${l.tracking}px`;
      ctx.fillText(l.text, l.x, l.y);
      if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    } else if (l.kind === "rect") {
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.roundRect(l.x, l.y, l.w, l.h, l.r ?? 0);
      ctx.fill();
    } else if (l.kind === "glow") {
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      g.addColorStop(0, l.color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
    }
  }
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: RasterFormat = "png"): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      format === "jpeg" ? "image/jpeg" : "image/png", format === "jpeg" ? 0.95 : undefined),
  );
}

export async function renderBlob(
  width: number, height: number, bg: string | null, layers: Layer[],
  opts: { format?: RasterFormat; scale?: number } = {},
) {
  const format = opts.format ?? "png";
  // JPEG has no alpha — force a background
  const canvas = await renderCanvas(width, height, bg ?? (format === "jpeg" ? "#FFFFFF" : null), layers, opts.scale ?? 1);
  return canvasToBlob(canvas, format);
}

/** Mark-only raster at exact pixel size. */
export function renderMark(variant: LogoVariant, size: number, opts: { tile?: string; padding?: number; format?: RasterFormat; radius?: number } = {}) {
  const pad = opts.padding ?? 0;
  const inner = size * (1 - pad * 2);
  const off = size * pad;
  const layers: Layer[] = [];
  if (opts.tile) layers.push({ kind: "rect", x: 0, y: 0, w: size, h: size, color: opts.tile, r: (opts.radius ?? 0.18) * size });
  layers.push({ kind: "svg", svg: logoSVG(variant, size), x: off, y: off, w: inner, h: inner });
  return renderBlob(size, size, null, layers, { format: opts.format });
}

export function textBlob(text: string, mime = "text/plain") {
  return new Blob([text], { type: `${mime};charset=utf-8` });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Canonical filename: sysmoai_{category}_{variant}_{w}x{h}[@2x].{ext} */
export function assetName(category: string, variant: string, w: number, h: number, ext: string, scale = 1) {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `sysmoai_${slug(category)}_${slug(variant)}_${w}x${h}${scale > 1 ? `@${scale}x` : ""}.${ext}`;
}

// ---------------------------------------------------------------------------
// ICO writer (PNG-in-ICO, supported by all modern browsers & Windows Vista+)
// ---------------------------------------------------------------------------
export async function buildICO(variant: LogoVariant, sizes = [16, 32, 48], tile = "#08090D") {
  const pngs = await Promise.all(
    sizes.map(async (s) => new Uint8Array(await (await renderMark(variant, s, { tile, padding: 0.06 })).arrayBuffer())),
  );
  const header = 6 + 16 * sizes.length;
  const total = header + pngs.reduce((a, p) => a + p.length, 0);
  const buf = new Uint8Array(total);
  const dv = new DataView(buf.buffer);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, sizes.length, true);
  let offset = header;
  sizes.forEach((s, i) => {
    const e = 6 + i * 16;
    buf[e] = s >= 256 ? 0 : s;
    buf[e + 1] = s >= 256 ? 0 : s;
    dv.setUint16(e + 4, 1, true);
    dv.setUint16(e + 6, 32, true);
    dv.setUint32(e + 8, pngs[i].length, true);
    dv.setUint32(e + 12, offset, true);
    buf.set(pngs[i], offset);
    offset += pngs[i].length;
  });
  return new Blob([buf], { type: "image/x-icon" });
}

// ---------------------------------------------------------------------------
// Minimal ZIP writer (STORE method, no dependency). PNG/JPEG are already
// compressed, so deflate would gain little.
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(data: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export class ZipBuilder {
  private files: { name: Uint8Array; data: Uint8Array; crc: number }[] = [];
  private enc = new TextEncoder();
  get count() { return this.files.length; }

  async add(path: string, content: Blob | string) {
    const data = typeof content === "string"
      ? this.enc.encode(content)
      : new Uint8Array(await content.arrayBuffer());
    this.files.push({ name: this.enc.encode(path), data, crc: crc32(data) });
  }

  build(): Blob {
    const parts: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    for (const f of this.files) {
      const local = new Uint8Array(30 + f.name.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true); // UTF-8 names
      lv.setUint32(14, f.crc, true);
      lv.setUint32(18, f.data.length, true);
      lv.setUint32(22, f.data.length, true);
      lv.setUint16(26, f.name.length, true);
      local.set(f.name, 30);

      const cen = new Uint8Array(46 + f.name.length);
      const cv = new DataView(cen.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint32(16, f.crc, true);
      cv.setUint32(20, f.data.length, true);
      cv.setUint32(24, f.data.length, true);
      cv.setUint16(28, f.name.length, true);
      cv.setUint32(42, offset, true);
      cen.set(f.name, 46);

      parts.push(local, f.data);
      central.push(cen);
      offset += local.length + f.data.length;
    }
    const cenSize = central.reduce((a, c) => a + c.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, this.files.length, true);
    ev.setUint16(10, this.files.length, true);
    ev.setUint32(12, cenSize, true);
    ev.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end] as BlobPart[], { type: "application/zip" });
  }
}

/** Clipboard write with execCommand fallback (iframes / insecure contexts). Resolves true on success. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
