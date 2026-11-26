import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the output directory: prefer MAKEFUN_OUTPUT_DIR (writable),
// then MAKEFUN_BOT_DIR, then a local fallback.
function resolveOutputDir(): string {
  const fromEnv =
    process.env.MAKEFUN_OUTPUT_DIR || process.env.MAKEFUN_BOT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return join(dirname(fileURLToPath(import.meta.url)), "output");
}

const linePath = join(dirname(fileURLToPath(import.meta.url)), "line.txt");
const raw = readFileSync(linePath, "utf8");

// Validate: exactly one line, 1-200 characters, not only whitespace.
const line = raw.replace(/\r\n?/g, "\n");
if (line.includes("\n")) {
  throw new Error(
    `line.txt must contain a single line, but it contains ${line.split("\n").length} lines`,
  );
}
const trimmed = line.trim();
if (trimmed.length === 0) {
  throw new Error("line.txt must not be empty or whitespace-only");
}
if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
  throw new Error(
    "line.txt must not contain control characters; remove them before submitting",
  );
}
if (trimmed.length > 200) {
  throw new Error(
    `line is ${trimmed.length} characters, which exceeds the 200-character limit`,
  );
}

const outDir = resolveOutputDir();
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), trimmed, "utf8");
console.log(`Wrote ${trimmed.length}-character entry to ${join(outDir, "entry.txt")}`);
