import type { AppSettings } from "./model.ts";
export function elapsedSeconds(
  timer: AppSettings["guitarTimer"],
  now = Date.now(),
): number {
  if (!timer) return 0;
  return Math.min(
    timer.targetSeconds,
    timer.elapsedSeconds +
      (timer.startedAt !== undefined
        ? Math.max(0, (now - timer.startedAt) / 1000)
        : 0),
  );
}
