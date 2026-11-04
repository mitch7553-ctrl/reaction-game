import test from "node:test";
import assert from "node:assert/strict";
import { readBest, writeBest, clearBest } from "../src/js/storage.js";

function fakeStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); }
  };
}

test("Reset Stats removes persisted all-time best", () => {
  const storage = fakeStorage();
  assert.equal(writeBest(179, storage), true);
  assert.equal(readBest(storage), 179);
  assert.equal(clearBest(storage), true);
  assert.equal(readBest(storage), null);
});

test("Reset Stats tolerates storage access restrictions", () => {
  const storage = { removeItem() { throw new Error("storage blocked"); } };
  assert.equal(clearBest(storage), false);
});
