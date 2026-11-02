export const STATES = Object.freeze({
  IDLE: "idle",
  WAITING: "waiting",
  READY: "ready",
  RESULT: "result",
  FALSE_START: "falseStart",
});

export function randomDelay(random = Math.random) {
  return 1000 + Math.floor(random() * 4001);
}

export class ReactionGame {
  constructor({ onChange = () => {}, onResult = () => {}, clock = () => performance.now(), schedule = setTimeout, cancel = clearTimeout, random = Math.random } = {}) {
    this.onChange = onChange;
    this.onResult = onResult;
    this.clock = clock;
    this.schedule = schedule;
    this.cancel = cancel;
    this.random = random;
    this.state = STATES.IDLE;
    this.timer = null;
    this.signalAt = null;
    this.lastTime = null;
  }

  emit() {
    this.onChange({ state: this.state, lastTime: this.lastTime });
  }

  clearTimer() {
    if (this.timer !== null) {
      this.cancel(this.timer);
      this.timer = null;
    }
  }

  start() {
    if (![STATES.IDLE, STATES.RESULT, STATES.FALSE_START].includes(this.state)) return false;
    this.clearTimer();
    this.signalAt = null;
    this.lastTime = null;
    this.state = STATES.WAITING;
    this.emit();
    this.timer = this.schedule(() => {
      this.timer = null;
      if (this.state !== STATES.WAITING) return;
      this.state = STATES.READY;
      this.signalAt = this.clock();
      this.emit();
    }, randomDelay(this.random));
    return true;
  }

  respond() {
    if (this.state === STATES.WAITING) {
      this.clearTimer();
      this.signalAt = null;
      this.state = STATES.FALSE_START;
      this.emit();
      return { type: "falseStart" };
    }
    if (this.state === STATES.READY) {
      const elapsed = Math.max(0, Math.round(this.clock() - this.signalAt));
      this.signalAt = null;
      this.lastTime = elapsed;
      this.state = STATES.RESULT;
      this.onResult(elapsed);
      this.emit();
      return { type: "result", time: elapsed };
    }
    return { type: "ignored" };
  }

  stop() {
    if (![STATES.WAITING, STATES.READY].includes(this.state)) return false;
    this.clearTimer();
    this.signalAt = null;
    this.state = STATES.IDLE;
    this.emit();
    return true;
  }

  reset() {
    this.clearTimer();
    this.signalAt = null;
    this.lastTime = null;
    this.state = STATES.IDLE;
    this.emit();
  }

  dispose() {
    this.clearTimer();
    this.signalAt = null;
  }
}