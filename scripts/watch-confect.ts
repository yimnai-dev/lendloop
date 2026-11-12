/**
 * `convex dev` only re-pushes when files under `convex/` change, but our
 * function bodies live in `confect/` and `shared/`. This forwards those edits
 * by touching a generated Convex entry point (debounced).
 */
import { utimesSync, watch } from "node:fs";

const TARGET = "convex/schema.ts";
const WATCHED = ["confect", "shared"];
const DEBOUNCE_MS = 300;

let timer: ReturnType<typeof setTimeout> | undefined;

const touch = () => {
  const now = new Date();
  utimesSync(TARGET, now, now);
};

for (const dir of WATCHED) {
  watch(dir, { recursive: true }, (_event, file) => {
    if (file === null || file.includes("_generated") || file.endsWith(".test.ts")) return;
    clearTimeout(timer);
    timer = setTimeout(touch, DEBOUNCE_MS);
  });
}

console.log(`Forwarding changes in ${WATCHED.join(", ")} to ${TARGET}`);
