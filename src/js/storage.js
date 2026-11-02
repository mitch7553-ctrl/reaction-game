const BEST_KEY = "midnight-pulse-personal-best-v1";

export function readBest(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem(BEST_KEY);
    if (value === null || value === undefined || value.trim() === "") return null;
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : null;
  } catch {
    return null;
  }
}

export function writeBest(time, storage = globalThis.localStorage) {
  if (!Number.isSafeInteger(time) || time <= 0) return false;
  try {
    storage?.setItem(BEST_KEY, String(time));
    return true;
  } catch {
    return false;
  }
}