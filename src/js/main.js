import { ReactionGame, STATES } from "./game.js";
import { Statistics } from "./statistics.js";
import { readBest, writeBest } from "./storage.js";
import { createScene } from "./scene.js";

const $ = (id) => document.getElementById(id);
const elements = {
  arena: $("arena"),
  eyebrow: $("eyebrow"),
  headline: $("headline"),
  caption: $("caption"),
  start: $("start"),
  stop: $("stop"),
  latest: $("latest"),
  fastest: $("fastest"),
  average: $("average"),
  attempts: $("attempts"),
  personalBest: $("personal-best"),
  history: $("history"),
  reset: $("reset"),
  renderNote: $("render-note"),
};

const copy = {
  [STATES.IDLE]: {
    eyebrow: "READY WHEN YOU ARE",
    headline: "How fast are your reflexes?",
    caption: "Press Start Game to begin.",
    button: "Start Game",
  },
  [STATES.WAITING]: {
    eyebrow: "GET READY",
    headline: "Wait for green…",
    caption: "Don't press yet. The signal can appear at any moment.",
    button: null,
  },
  [STATES.READY]: {
    eyebrow: "GO GO GO",
    headline: "CLICK NOW!",
    caption: "Tap, click, or press Space / Enter!",
    button: null,
  },
  [STATES.RESULT]: {
    eyebrow: "NICE REACTION",
    headline: "Your reaction time",
    caption: "Great run! Can you beat your best?",
    button: "Play Again",
  },
  [STATES.FALSE_START]: {
    eyebrow: "FALSE START",
    headline: "Too early!",
    caption: "Wait until the panel turns green. Try again.",
    button: "Try Again",
  },
};

const stats = new Statistics(readBest());
let scene = null;

function valueMarkup(value) {
  return value === null ? "—<span>ms</span>" : String(value) + "<span>ms</span>";
}

function renderStats(snapshot) {
  elements.latest.innerHTML = valueMarkup(snapshot.latest);
  elements.fastest.innerHTML = valueMarkup(snapshot.fastest);
  elements.average.innerHTML = valueMarkup(snapshot.average);
  elements.attempts.textContent = String(snapshot.attempts);
  elements.personalBest.innerHTML = valueMarkup(snapshot.personalBest);
  renderHistory(snapshot.history);
}

function renderHistory(history) {
  if (!history.length) {
    elements.history.innerHTML = '<p class="empty-history">Your completed attempts will appear here.</p>';
    return;
  }
  elements.history.replaceChildren();
  history.slice(-8).forEach((time, index, visible) => {
    const pill = document.createElement("span");
    pill.className = "history-pill";
    const number = history.length - visible.length + index + 1;
    pill.innerHTML = "<span>#" + number + "</span>" + time + " ms";
    elements.history.appendChild(pill);
  });
}

function renderGame({ state, lastTime }) {
  const content = copy[state] || copy[STATES.IDLE];
  elements.arena.dataset.state = state;
  elements.eyebrow.textContent = content.eyebrow;
  elements.headline.textContent = state === STATES.RESULT ? String(lastTime) + " ms" : content.headline;
  elements.headline.classList.toggle("result-time", state === STATES.RESULT);
  elements.caption.textContent = content.caption;
  elements.start.textContent = content.button || "Round in progress";
  elements.start.disabled = state === STATES.WAITING || state === STATES.READY;
  elements.stop.disabled = state !== STATES.WAITING && state !== STATES.READY;
  elements.arena.setAttribute("aria-label",
    state === STATES.WAITING ? "Wait for the green signal. Do not press yet." :
    state === STATES.READY ? "Green signal. React now." :
    state === STATES.FALSE_START ? "False start. Start another round." :
    state === STATES.RESULT ? "Reaction time " + lastTime + " milliseconds. Start another round." :
    "Start the reaction test");
  scene?.setState(state);
}

const game = new ReactionGame({
  onChange: renderGame,
  onResult(time) {
    const previousBest = stats.personalBest;
    stats.record(time);
    if (stats.personalBest !== previousBest) writeBest(stats.personalBest);
    renderStats(stats.snapshot);
  },
});

elements.start.addEventListener("click", () => game.start());
elements.arena.addEventListener("click", () => {
  if (game.state === STATES.IDLE || game.state === STATES.RESULT || game.state === STATES.FALSE_START) {
    game.start();
  } else {
    game.respond();
  }
});
elements.stop.addEventListener("click", () => game.stop());
elements.reset.addEventListener("click", () => {
  game.reset();
  stats.reset();
  renderStats(stats.snapshot);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) game.stop();
});
window.addEventListener("blur", () => game.stop());
window.addEventListener("pagehide", () => {
  game.dispose();
  scene?.dispose();
});

renderGame({ state: game.state, lastTime: null });
renderStats(stats.snapshot);
createScene($("three-scene")).then((createdScene) => {
  scene = createdScene;
  if (!scene) {
    elements.renderNote.hidden = false;
    return;
  }
  scene.setState(game.state);
});