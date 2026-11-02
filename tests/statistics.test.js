import test from "node:test";
import assert from "node:assert/strict";
import { Statistics } from "../src/js/statistics.js";

test("records valid reaction times and calculates session metrics", () => {
  const stats = new Statistics();
  stats.record(240);
  stats.record(190);
  stats.record(210);
  assert.deepEqual(stats.snapshot, {
    latest: 210,
    fastest: 190,
    average: 213,
    attempts: 3,
    personalBest: 190,
    history: [240, 190, 210],
  });
});

test("ignores invalid values", () => {
  const stats = new Statistics();
  assert.equal(stats.record(-1), false);
  assert.equal(stats.record(Number.NaN), false);
  assert.equal(stats.snapshot.attempts, 0);
});

test("retains a faster personal best and resets only the current session", () => {
  const stats = new Statistics(175);
  stats.record(210);
  stats.record(160);
  assert.equal(stats.snapshot.personalBest, 160);
  stats.reset();
  assert.equal(stats.snapshot.attempts, 0);
  assert.equal(stats.snapshot.personalBest, 160);
});

test("accepts a stored personal best only when it is positive and finite", () => {
  assert.equal(new Statistics(0).snapshot.personalBest, null);
  assert.equal(new Statistics(125).snapshot.personalBest, 125);
});