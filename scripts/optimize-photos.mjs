import { readdir, mkdir, writeFile, unlink, access } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";
import exifr from "exifr";
import { manifest } from "../data/photos.manifest.mjs";

// The manifest is the gatekeeper. For each file listed there we emit a web-ready
// .webp in public/images/photos/ and a row of generated data (the webp src with
// a content-hash query, dimensions, a tiny blur data URL, and a whitelist of
// EXIF — never GPS) into data/photos.generated.json. Anything NOT in the
// manifest is left in the (gitignored) source folder and its stray webp, if any,
// is pruned — so public/ always mirrors the list. data/photos.ts merges the
// generated map with the manifest's hand-typed fields.
const SRC = "_resources/seed-images-for-photo-wall";
const OUT = "public/images/photos";
const DATA_OUT = "data/photos.generated.json";
const MAX = 2400; // long-edge cap; Next delivers responsive sizes from here

async function collect(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await collect(p)));
    else if (/\.(jpe?g|png|webp|tiff?|heic)$/i.test(e.name)) out.push(p);
  }
  return out;
}

// Google appends suffixes like ".PORTRAIT.ORIGINAL"; the webp + map key use the
// part before the first dot so the manifest's `file` lines up with both.
const baseName = (file) => parse(file).name.split(".")[0];

const fmtAperture = (n) => (n ? `f/${Math.round(n * 10) / 10}` : undefined);
const fmtShutter = (et) =>
  !et ? undefined : et >= 1 ? `${Math.round(et * 10) / 10}s` : `1/${Math.round(1 / et)}s`;
const fmtFocal = (f35, f) => {
  const f0 = f35 || f;
  return f0 ? `${Math.round(f0)}mm` : undefined;
};
const fmtDate = (d) => {
  // EXIF DateTimeOriginal is local-with-no-zone; build YYYY-MM-DD from local
  // components so it never shifts a day across time zones.
  const dt = d instanceof Date ? d : d ? new Date(d) : null;
  if (!dt || isNaN(dt)) return undefined;
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
};

try {
  await access(SRC);
} catch {
  console.error(`No source folder at ${SRC}/ — create it and add images.`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

// index every source file by its base name (first match wins on the sorted list)
const sources = new Map();
for (const file of (await collect(SRC)).sort()) {
  const base = baseName(file);
  if (!sources.has(base)) sources.set(base, file);
}

// process the manifest in order; a listed file with no source is a hard error
const out = {};
const missing = [];
for (const { file: base } of manifest) {
  const file = sources.get(base);
  if (!file) {
    missing.push(base);
    continue;
  }

  // main webp (strips EXIF by default — keep public files EXIF-free) + its dims
  const { data, info } = await sharp(file)
    .rotate() // bake in EXIF orientation so portraits aren't sideways
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(join(OUT, `${base}.webp`), data);

  // tiny blur placeholder as a data URL (replaces the static-import placeholder)
  const blur = await sharp(file)
    .rotate()
    .resize({ width: 16, height: 16, fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blur.toString("base64")}`;

  // whitelist EXIF only — NEVER GPS — read from the original (webp has none)
  const t = await exifr
    .parse(file, {
      pick: [
        "Model",
        "FNumber",
        "ExposureTime",
        "ISO",
        "FocalLength",
        "FocalLengthIn35mmFormat",
        "FocalLengthIn35mmFilm",
        "DateTimeOriginal",
      ],
    })
    .catch(() => null);

  const entry = {
    // unique date-stamped filename is the cache key; Next hashes the optimized
    // asset itself, so no extra query is needed (and next/image rejects one).
    src: `/images/photos/${base}.webp`,
    width: info.width,
    height: info.height,
    blurDataURL,
  };
  if (t) {
    const set = (k, v) => {
      if (v !== undefined && v !== null && v !== "") entry[k] = v;
    };
    set("camera", t.Model);
    set("aperture", fmtAperture(t.FNumber));
    set("shutter", fmtShutter(t.ExposureTime));
    set("iso", t.ISO);
    set("focal", fmtFocal(t.FocalLengthIn35mmFormat ?? t.FocalLengthIn35mmFilm, t.FocalLength));
    set("date", fmtDate(t.DateTimeOriginal));
  }
  out[base] = entry;
  console.log(`✓ ${base}.webp`);
}

if (missing.length) {
  console.error(
    `\nMissing source files for ${missing.length} manifest entr${missing.length === 1 ? "y" : "ies"}:`,
  );
  for (const b of missing) console.error(`  · ${b} — add it to ${SRC}/`);
  process.exit(1);
}

// prune: any webp in OUT not in the manifest is stale — public/ mirrors the list
const wanted = new Set(manifest.map((m) => m.file));
for (const e of await readdir(OUT)) {
  if (!e.endsWith(".webp")) continue;
  if (!wanted.has(parse(e).name)) {
    await unlink(join(OUT, e));
    console.log(`✗ pruned ${e}`);
  }
}

await writeFile(DATA_OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`✓ wrote ${DATA_OUT} (${Object.keys(out).length} entries)`);
