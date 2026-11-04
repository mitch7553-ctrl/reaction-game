import test from "node:test";
import assert from "node:assert/strict";
import { rateReaction } from "../src/js/rating.js";

test("classifies each reaction time band at its boundaries", () => {
  const examples = [
    [120, "Amazing"], [149, "Amazing"],
    [150, "Very good"], [199, "Very good"],
    [200, "Good"], [249, "Good"],
    [250, "Average"], [349, "Average"],
    [350, "Below average"], [800, "Below average"]
  ];
  for (const [time, expected] of examples) {
    assert.equal(rateReaction(time).label, expected, time + " ms");
  }
});

test("does not accept negative, infinite or NaN measurements", () => {
  for (const time of [-1, Infinity, NaN]) {
    assert.throws(() => rateReaction(time), RangeError);
  }
});
