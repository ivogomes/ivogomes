/* Behaviour spec for the TapScore scoring engine. Run: node scoring.test.cjs
 * These tests lock the rules and are the reference for native (watch) ports. */
const assert = require("assert");
// scoring.js is a classic browser script (sets globalThis.TapScore); the repo is type:module,
// so requiring it runs the file but exports nothing — read the global it defines.
require("./scoring.js");
const T = globalThis.TapScore;

let passed = 0;
function test(name, fn) { fn(); passed++; console.log("  ok  " + name); }

// helpers
function mk(overrides) { return T.createState(T.normalizeSettings(Object.assign({}, overrides))); }
function play(m, sides) { for (const s of sides) T.scorePoint(m, s); return m; }
function pts(m, side, n) { for (let k = 0; k < n; k++) T.scorePoint(m, side); return m; }

console.log("tennis");
test("a love game: 4 straight points wins the game, serve passes", () => {
  const m = mk({ sport: "tennis" });
  assert.strictEqual(m.server, 0);
  pts(m, 0, 4);
  assert.deepStrictEqual(m.games, [1, 0]);
  assert.deepStrictEqual(m.points, [0, 0]);
  assert.strictEqual(m.server, 1);          // serve passed
});
test("deuce → advantage → win by two", () => {
  const m = mk({ sport: "tennis" });
  play(m, [0, 0, 0, 1, 1, 1]);              // 40-40
  assert.deepStrictEqual(T.pointDisplay(m), ["40", "40"]);
  T.scorePoint(m, 0);                        // advantage side 0
  assert.deepStrictEqual(T.pointDisplay(m), ["Ad", "40"]);
  T.scorePoint(m, 1);                        // back to deuce
  assert.deepStrictEqual(T.pointDisplay(m), ["40", "40"]);
  T.scorePoint(m, 1); T.scorePoint(m, 1);    // side 1 takes it
  assert.deepStrictEqual(m.games, [0, 1]);
  assert.ok(m.deuces >= 2);
});
test("golden point (advantages=0) ends deuce on the next point", () => {
  const m = mk({ sport: "tennis", advantages: 0 });
  play(m, [0, 0, 0, 1, 1, 1]);              // 40-40, golden armed
  T.scorePoint(m, 1);                        // sudden death → game to side 1
  assert.deepStrictEqual(m.games, [0, 1]);
});
test("win a set 6-4", () => {
  const m = mk({ sport: "tennis" });
  for (let g = 0; g < 4; g++) { pts(m, 0, 4); pts(m, 1, 4); } // 4-4
  pts(m, 0, 4); pts(m, 0, 4);               // 6-4
  assert.deepStrictEqual(m.sets, [1, 0]);
  assert.deepStrictEqual(m.completedSets[0], [6, 4]);
});
test("tie-break at 6-6, first to 7 win-by-2 → set 7-6", () => {
  const m = mk({ sport: "tennis" });
  for (let g = 0; g < 6; g++) { pts(m, 0, 4); pts(m, 1, 4); } // 6-6
  assert.strictEqual(m.tiebreak, true);
  pts(m, 0, 7);                              // 7-0 tie-break
  assert.deepStrictEqual(m.sets, [1, 0]);
  assert.deepStrictEqual(m.completedSets[0], [7, 6]);
  assert.strictEqual(m.tiebreak, false);
});
test("best-of-3 match ends at 2 sets", () => {
  const m = mk({ sport: "tennis", bestOf: 3 });
  const setFor = (w) => { for (let g = 0; g < 6; g++) pts(m, w, 4); };
  setFor(0); setFor(0);
  assert.strictEqual(m.over, true);
  assert.strictEqual(m.winner, 0);
  assert.deepStrictEqual(m.sets, [2, 0]);
});
test("match tie-break decider: at 1-1 the final set opens as a first-to-10 TB", () => {
  const m = mk({ sport: "tennis", bestOf: 3, decider: "matchTB" });
  const setFor = (w) => { for (let g = 0; g < 6; g++) pts(m, w, 4); };
  setFor(0); setFor(1);                      // 1-1 sets → decider
  assert.strictEqual(m.tiebreak, true);
  assert.strictEqual(m.matchTB, true);
  pts(m, 0, 10);                             // first to 10
  assert.strictEqual(m.over, true);
  assert.strictEqual(m.winner, 0);
  assert.deepStrictEqual(m.completedSets[m.completedSets.length - 1], [10, 0]);
});

console.log("table tennis");
test("first to 11, win by 2", () => {
  const m = mk({ sport: "tabletennis", pointsTarget: 11, bestOf: 1 });
  pts(m, 0, 11);
  assert.strictEqual(m.over, true);
  assert.deepStrictEqual(m.completedSets[0], [11, 0]);
});
test("deuce at 10-10 needs two clear points → 12-10", () => {
  const m = mk({ sport: "tabletennis", pointsTarget: 11, bestOf: 1 });
  pts(m, 0, 10); pts(m, 1, 10);             // 10-10
  T.scorePoint(m, 0);                        // 11-10, not won
  assert.strictEqual(m.over, false);
  T.scorePoint(m, 0);                        // 12-10
  assert.strictEqual(m.over, true);
  assert.deepStrictEqual(m.completedSets[0], [12, 10]);
});

console.log("badminton cap");
test("29-29 → next point wins outright (30)", () => {
  const m = mk({ sport: "badminton", pointsTarget: 21, bestOf: 1 });
  for (let k = 0; k < 29; k++) { T.scorePoint(m, 0); T.scorePoint(m, 1); }  // alternate to 29-29
  assert.deepStrictEqual(m.points, [29, 29]);
  assert.strictEqual(m.over, false);
  T.scorePoint(m, 0);                        // 30 wins despite win-by-2
  assert.strictEqual(m.over, true);
  assert.deepStrictEqual(m.completedSets[0], [30, 29]);
});

console.log("volleyball");
test("deciding set uses the shorter target (15)", () => {
  const m = mk({ sport: "volleyball", pointsTarget: 25, bestOf: 3 });
  pts(m, 0, 25); pts(m, 1, 25);             // 1-1 sets → deciding set
  assert.strictEqual(T.currentTarget(m), 15);
  pts(m, 0, 15);
  assert.strictEqual(m.over, true);
  assert.strictEqual(m.winner, 0);
});

console.log("pickleball side-out");
test("only the serving side scores; a receiver win is a side-out (singles)", () => {
  const m = mk({ sport: "pickleball", scoring: "sideout", mode: "singles", pointsTarget: 11, bestOf: 1 });
  const server0 = m.server;
  T.scorePoint(m, 1 - server0);             // receiver wins → side-out, no point
  assert.deepStrictEqual(m.points, [0, 0]);
  assert.strictEqual(m.server, 1 - server0);
  T.scorePoint(m, m.server);                // new server scores
  assert.strictEqual(m.points[m.server], 1);
});
test("doubles: first server's fault passes to the 2nd server, not a side-out", () => {
  const m = mk({ sport: "pickleball", scoring: "sideout", mode: "doubles", pointsTarget: 11, bestOf: 1 });
  const s = m.server;
  assert.strictEqual(m.serverNum, 2);        // opener starts on server #2
  // make it server #1 by taking a side-out first
  T.scorePoint(m, 1 - s);                     // side-out → other side serves as #1
  const s2 = m.server;
  assert.strictEqual(m.serverNum, 1);
  T.scorePoint(m, 1 - s2);                    // fault → goes to 2nd server (same side keeps serve)
  assert.strictEqual(m.server, s2);
  assert.strictEqual(m.serverNum, 2);
});

console.log("guards");
test("scorePoint is a no-op once the match is over", () => {
  const m = mk({ sport: "tabletennis", pointsTarget: 11, bestOf: 1 });
  pts(m, 0, 11);
  const snap = JSON.stringify(m);
  T.scorePoint(m, 1);
  assert.strictEqual(JSON.stringify(m), snap);
});
test("free play (bestOf inf) never auto-ends", () => {
  const m = mk({ sport: "tennis", bestOf: "inf" });
  for (let s = 0; s < 10; s++) for (let g = 0; g < 6; g++) pts(m, 0, 4);
  assert.strictEqual(m.over, false);
  assert.ok(m.sets[0] >= 10);
});

console.log("\n" + passed + " tests passed");
