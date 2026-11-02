const BEST_KEY = "midnight-pulse-personal-best-v1";

export function readBest(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const value = target?.getItem(BEST_KEY);
    if (value === null || value === undefined || value.trim() === "") return null;
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : null;
  } catch {
    return null;
  }
}

export function writeBest(time, storage) {
  if (!Number.isSafeInteger(time) || time <= 0) return false;
  try {
    const target = storage ?? globalThis.localStorage;
    target?.setItem(BEST_KEY, String(time));
    return true;
  } catch {
    return false;
  }
}