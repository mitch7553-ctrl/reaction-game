import { ReactionGame, STATES } from "./game.js";
import { Statistics } from "./statistics.js";
import { readBest, writeBest } from "./storage.js";
import { createScene } from "./scene.js";
import { rateReaction } from "./rating.js";

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
  welcome: $("welcome-instructions"),
  ratingDetails: $("rating-details"),
  ratingTitle: $("rating-title"),
  ratingDescription: $("rating-description"),
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
let hasStarted = false;

function scheduleSignal(callback, delay) {
  const startedAt = performance.now();
  let frame;
  const tick = (now) => {
    if (now - startedAt >= delay) {
      callback();
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return frame;
}

function cancelSignal(frame) {
  cancelAnimationFrame(frame);
}

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
  if (state === STATES.WAITING) hasStarted = true;
  elements.welcome.hidden = hasStarted;
  elements.arena.dataset.intro = String(!hasStarted);
  elements.ratingDetails.hidden = state !== STATES.RESULT;
  if (state === STATES.RESULT && lastTime !== null) {
    const rating = rateReaction(lastTime);
    elements.ratingTitle.textContent = rating.label;
    elements.ratingTitle.dataset.rating = rating.key;
    elements.ratingDescription.textContent = rating.explanation;
  }
  elements.arena.dataset.state = state;
  elements.arena.classList.toggle("is-ready", state === STATES.READY);
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
    !hasStarted ? "How to play. Click this stage or press Space to start. Wait until the signal turns green, then react immediately." :
    "Click or press Space to start the reaction test");
  scene?.setState(state);
}

const game = new ReactionGame({
  schedule: scheduleSignal,
  cancel: cancelSignal,
  onChange: renderGame,
  onResult(time) {
    const previousBest = stats.personalBest;
    stats.record(time);
    if (stats.personalBest !== previousBest) writeBest(stats.personalBest);
    renderStats(stats.snapshot);
  },
});

function activateStage() {
  if ([STATES.IDLE, STATES.RESULT, STATES.FALSE_START].includes(game.state)) {
    game.start();
  } else {
    game.respond();
  }
}

elements.start.addEventListener("click", () => game.start());
elements.arena.addEventListener("click", activateStage);

// Space works even when the stage isn't focused. Preserve native keyboard
// behavior on other buttons and form controls, and ignore key auto-repeat.
function isTypingTarget(target) {
  return target instanceof Element &&
    Boolean(target.closest("input, textarea, select, [contenteditable], [role='textbox']"));
}
function isOtherButton(target) {
  return target instanceof Element &&
    Boolean(target.closest("button, a, [role='button']")) &&
    !elements.arena.contains(target);
}
document.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.repeat ||
      event.altKey || event.ctrlKey || event.metaKey ||
      isTypingTarget(event.target) || isOtherButton(event.target)) return;
  event.preventDefault(); // Prevent scrolling and the arena's synthetic button click.
  activateStage();
});
document.addEventListener("keyup", (event) => {
  if (event.code === "Space" && !event.altKey && !event.ctrlKey && !event.metaKey &&
      !isTypingTarget(event.target) && !isOtherButton(event.target)) {
    event.preventDefault();
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
