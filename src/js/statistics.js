export class Statistics {
  constructor(personalBest = null) {
    this.results = [];
    this.personalBest = Number.isFinite(personalBest) && personalBest > 0 ? personalBest : null;
  }

  record(time) {
    if (!Number.isFinite(time) || time < 0) return false;
    this.results.push(time);
    if (this.personalBest === null || time < this.personalBest) {
      this.personalBest = time;
    }
    return true;
  }

  get snapshot() {
    const count = this.results.length;
    return {
      latest: count ? this.results[count - 1] : null,
      fastest: count ? Math.min(...this.results) : null,
      average: count ? Math.round(this.results.reduce((sum, value) => sum + value, 0) / count) : null,
      attempts: count,
      personalBest: this.personalBest,
      history: [...this.results],
    };
  }

  reset() {
    this.results = [];
  }
}