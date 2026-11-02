# Reaction Timer — Midnight Pulse

A responsive browser-based reaction timer game built with semantic HTML, modern CSS, and vanilla JavaScript. Three.js powers the animated 3D geometry in the reaction arena.

## Features

- Random 1–5 second signal delay to prevent timing patterns
- Green reaction signal and false-start feedback
- Millisecond timing with the monotonic \`performance.now()\` clock
- Animated Three.js icosahedron, wireframe shell, and orbital rings
- Color and motion changes for waiting, ready, result, and false-start states
- Latest, fastest, average, attempt count, and recent session history
- Personal best saved locally in the browser
- Keyboard and pointer input, responsive layout, and reduced-motion support
- Graceful 2D fallback if WebGL or the Three.js CDN is unavailable
- Automated tests for session statistics

## Run locally

This is a static ES-module project. Use a local web server rather than opening \`index.html\` directly.

\`\`\`bash
git clone https://github.com/mitch7553-ctrl/reaction-game.git
cd reaction-game
python -m http.server 8000
\`\`\`

Open [http://localhost:8000](http://localhost:8000).

Three.js is loaded as an ES module from jsDelivr, so an internet connection is required for the 3D scene. The game remains playable without it.

## Tests

Node.js 20 or newer is recommended.

\`\`\`bash
npm test
\`\`\`

## Deploy

The project is static and can be hosted by GitHub Pages. The included GitHub Actions workflow runs the test suite and deploys the repository root to Pages when changes are pushed to \`master\`.

In the repository, enable GitHub Pages with **GitHub Actions** as the build and deployment source.

## Project structure

\`\`\`text
reaction-game/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── game.js
│       ├── main.js
│       ├── scene.js
│       ├── statistics.js
│       └── storage.js
├── tests/
│   └── statistics.test.js
├── index.html
├── package.json
└── README.md
\`\`\`

## Timing note

Browser reaction times are useful for personal comparison, not laboratory measurement. Display refresh, browser scheduling, operating-system load, and input-device latency all affect the result. Compare attempts on the same device and setup.