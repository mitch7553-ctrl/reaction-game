import test from "node:test";
import assert from "node:assert/strict";
import { ReactionGame, randomDelay, STATES } from "../src/js/game.js";

function createHarness() {
  let now = 1000;
  let callback;
  let cancelled = false;
  const events = [];
  const results = [];
  const game = new ReactionGame({
    clock: () => now,
    schedule: (fn, delay) => { callback = fn; return { delay }; },
    cancel: () => { cancelled = true; },
    random: () => 0,
    onChange: (event) => events.push(event),
    onResult: (time) => results.push(time),
  });
  return {
    game, events, results,
    advance(ms) { now += ms; },
    fire() { callback?.(); },
    wasCancelled() { return cancelled; },
  };
}

test("random signal delay stays within the one-to-five-second range", () => {
  assert.equal(randomDelay(() => 0), 1000);
  assert.equal(randomDelay(() => 0.5), 3000);
  assert.equal(randomDelay(() => 0.999), 4996);
});

test("a response before the signal is recorded as a false start", () => {
  const harness = createHarness();
  harness.game.start();
  assert.equal(harness.game.state, STATES.WAITING);
  assert.deepEqual(harness.game.respond(), { type: "falseStart" });
  assert.equal(harness.game.state, STATES.FALSE_START);
  assert.equal(harness.wasCancelled(), true);
  assert.equal(harness.results.length, 0);
});

test("a response after the signal returns a millisecond reaction time", () => {
  const harness = createHarness();
  harness.game.start();
  harness.fire();
  assert.equal(harness.game.state, STATES.READY);
  harness.advance(247);
  assert.deepEqual(harness.game.respond(), { type: "result", time: 247 });
  assert.equal(harness.game.state, STATES.RESULT);
  assert.deepEqual(harness.results, [247]);
});

test("stop cancels a pending round and returns to idle", () => {
  const harness = createHarness();
  harness.game.start();
  assert.equal(harness.game.stop(), true);
  assert.equal(harness.game.state, STATES.IDLE);
  assert.equal(harness.wasCancelled(), true);
});
