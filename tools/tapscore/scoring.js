/* TapScore scoring engine — framework-agnostic. No DOM, no I/O, no i18n, no globals.
 *
 * Single source of truth for the scoring rules (points → games → sets → match) across every sport:
 * tennis/padel (deuce, advantage, golden point, tie-break, match-tie-break decider), and the
 * target/rally sports — table tennis, pickleball (rally + traditional side-out), squash, badminton
 * (29–29 → 30 cap), volleyball & beach volley (shorter deciding set).
 *
 * The web app loads this as a <script> (window.TapScore); Node loads it via require() for the test
 * suite (scoring.test.cjs), which doubles as the canonical spec for native (Apple Watch / Wear OS) ports.
 *
 * State shape (the scoring-relevant fields; the app layers stats/timers/names on top):
 *   { sets:[a,b], games:[a,b], points:[a,b], completedSets:[[a,b]…],
 *     tiebreak, matchTB, over, winner, server, serverNum, serveStart, tbFirstServer,
 *     deuces, breaks:[a,b], tiebreaks, settings }
 *
 * scorePoint(state, side) applies one rally win for side 0 or 1, MUTATING state in place (the app
 * snapshots JSON for undo). It's a no-op once the match is over.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;   // Node / tests
  if (root) root.TapScore = api;                                               // browser global
})(typeof self !== "undefined" ? self : (typeof globalThis !== "undefined" ? globalThis : this), function () {
  "use strict";

  const POINT_LABELS = ["0", "15", "30", "40"];

  function defaultSettings() {
    return {
      sport: "tennis", mode: "singles", bestOf: 3, advantages: "unlimited",
      pointsTarget: 11, decider: "set", gamesPerSet: 6, tbPoints: 7, winBy: 2, scoring: "rally",
    };
  }

  // sport: tennis/padel (points→games→sets, deuce/adv) vs target sports (rally to a points target).
  // advantages: "unlimited" (win by two) | 0 (golden at 1st deuce) | 1 | 2 (play N advs, then golden).
  function normalizeSettings(s) {
    s = s || {};
    if (s.advantages === undefined) s.advantages = s.golden ? 0 : "unlimited";
    if (s.bestOf === undefined) s.bestOf = 3;
    if (s.sport === undefined) s.sport = "tennis";
    if (s.mode === undefined) s.mode = "singles";
    if (s.pointsTarget === undefined) s.pointsTarget = 11;
    if (s.decider === undefined) s.decider = "set";
    if (s.gamesPerSet === undefined) s.gamesPerSet = 6;
    if (s.tbPoints === undefined) s.tbPoints = 7;
    if (s.winBy === undefined) s.winBy = 2;
    if (s.scoring === undefined) s.scoring = "rally";
    delete s.golden;
    return s;
  }

  // Target/rally sports: score every rally to a points target, win by 2, best-of games (no games/sets/deuce).
  function isTargetSport(sport) {
    return sport === "tabletennis" || sport === "pickleball" || sport === "squash"
        || sport === "badminton" || sport === "volleyball" || sport === "beachvolley";
  }
  // Pickleball only: traditional side-out scoring (only the serving side can score).
  function isSideOut(settings) {
    return settings.sport === "pickleball" && settings.scoring === "sideout";
  }
  // Per-sport rule quirks for the target engine:
  //  rallyServe    – rally winner serves next (squash/badminton/volley) vs a fixed rotation (table tennis)
  //  cap           – hard ceiling where the next point wins outright, ignoring win-by-2 (badminton 29–29 → 30)
  //  deciderTarget – a shorter target for the deciding set (volleyball final set to 15)
  function sportRules(sport) {
    return {
      rallyServe: sport === "squash" || sport === "badminton" || sport === "volleyball" || sport === "beachvolley",
      cap: sport === "badminton" ? 30 : 0,
      deciderTarget: (sport === "volleyball" || sport === "beachvolley") ? 15 : 0,
    };
  }
  function setsToWin(settings) {
    const b = settings.bestOf;
    return b === "inf" ? Infinity : Math.ceil(b / 2);
  }
  // Deciding set = both sides one set from winning (only meaningful in a best-of-3/5).
  function isDecidingSet(m) {
    const need = setsToWin(m.settings);
    return need !== Infinity && need >= 2 && m.sets[0] === need - 1 && m.sets[1] === need - 1;
  }
  // The points target for the set currently in play (honours volleyball's shorter deciding set).
  function currentTarget(m) {
    const r = sportRules(m.settings.sport);
    if (r.deciderTarget && isDecidingSet(m)) return r.deciderTarget;
    return m.settings.pointsTarget || 11;
  }
  function parseBestOf(raw) { return raw === "inf" ? "inf" : Number(raw); }

  function createState(settings) {
    return {
      sets: [0, 0], games: [0, 0], points: [0, 0],
      completedSets: [],   // array of [gamesA, gamesB] (or [pointsA, pointsB] for target sports)
      tiebreak: false,
      matchTB: false,      // deciding set played as a match tie-break (first to 10)
      over: false,
      winner: null,
      server: 0,           // side currently serving (0 or 1)
      serverNum: 2,        // pickleball side-out doubles: 1st or 2nd server (opener starts on #2)
      serveStart: 0,       // table tennis: who served first in the current game
      tbFirstServer: 0,    // tennis/padel: who served the tie-break's first point
      deuces: 0,           // times a game reached deuce
      breaks: [0, 0],      // racket: games won by the returning side
      tiebreaks: 0,        // tie-breaks played
      settings: settings || defaultSettings(),
    };
  }

  // When "deciding set = match tie-break" is on, open that final set as a first-to-10 tie-break.
  function maybeStartMatchTB(m) {
    if (!isTargetSport(m.settings.sport) && m.settings.decider === "matchTB" && !m.over && !m.tiebreak
        && isDecidingSet(m) && m.games[0] === 0 && m.games[1] === 0) {
      m.tiebreak = true;
      m.matchTB = true;
      m.points = [0, 0];
      m.tbFirstServer = m.server;
      m.tiebreaks++;
    }
  }

  // Sudden death armed once deuces reached exceeds the advantages allowed.
  // 3-3 is deuce #1, 4-4 deuce #2, … adv=0 arms at deuce #1, adv=1 at deuce #2, etc.
  function goldenArmed(m, a, b) {
    const adv = m.settings.advantages;
    if (adv === "unlimited" || adv == null) return false;
    if (Math.min(a, b) < 3) return false;
    const deuces = Math.min(a, b) - 2;
    return deuces >= adv + 1;
  }

  function winSet(m, i) {
    m.completedSets.push([m.games[0], m.games[1]]);
    m.sets[i]++;
    m.games = [0, 0];
    if (m.sets[i] >= setsToWin(m.settings)) { m.over = true; m.winner = i; }
    else maybeStartMatchTB(m);   // the next set may be a match-tie-break decider
  }

  function winGame(m, i) {
    const gameServer = m.server;   // who served this game (serve passes below)
    m.games[i]++;
    m.points = [0, 0];
    m.server = 1 - m.server;       // serve passes to the other side each game
    if (i !== gameServer) m.breaks[i]++;   // returning side won → break of serve
    const G = m.settings.gamesPerSet || 6;
    if (m.games[0] === G && m.games[1] === G) {
      m.tiebreak = true;
      m.tbFirstServer = m.server;   // whoever is up next serves the tie-break's first point
      m.tiebreaks++;
      return;
    }
    if (m.games[i] >= G && (m.games[i] - m.games[1 - i]) >= 2) winSet(m, i);
  }

  function regularPoint(m, i) {
    m.points[i]++;
    const a = m.points[0], b = m.points[1];
    const max = Math.max(a, b), diff = Math.abs(a - b);
    if (a === b && a >= 3) m.deuces++;   // reached deuce
    const won = goldenArmed(m, a, b) ? (diff >= 1) : (max >= 4 && diff >= 2);
    if (won) winGame(m, a > b ? 0 : 1);
  }

  function tiebreakPoint(m, i) {
    m.points[i]++;
    const a = m.points[0], b = m.points[1];
    const target = m.matchTB ? 10 : (m.settings.tbPoints || 7);   // match tie-break is always to 10
    if (Math.max(a, b) >= target && Math.abs(a - b) >= 2) {
      const w = a > b ? 0 : 1;
      m.tiebreak = false;
      if (m.matchTB) {
        // a match tie-break decides the set (and the match); record its points as the set score
        m.matchTB = false;
        m.completedSets.push([a, b]);
        m.sets[w]++;
        m.points = [0, 0];
        if (m.sets[w] >= setsToWin(m.settings)) { m.over = true; m.winner = w; }
        return;
      }
      m.games[w]++;            // 7-6
      m.points = [0, 0];
      m.server = 1 - m.tbFirstServer;  // next set opens with the tie-break's first receiver
      winSet(m, w);
      return;
    }
    if (a === b && a >= target - 1) m.deuces++;   // tie-break deuce
    if ((a + b) % 2 === 1) m.server = 1 - m.server;  // serve after the 1st point, then every 2
  }

  // Rally-scored sports: every rally is a point to the target, win by `winBy` (badminton cap wins outright).
  function tableTennisPoint(m, i) {
    m.points[i]++;
    const a = m.points[0], b = m.points[1];
    const rules = sportRules(m.settings.sport);
    const target = currentTarget(m);
    const winBy = m.settings.winBy || 2;
    const max = Math.max(a, b), diff = Math.abs(a - b);
    const won = (max >= target && diff >= winBy) || (rules.cap && max >= rules.cap);
    if (won) {
      const w = a > b ? 0 : 1;
      m.completedSets.push([a, b]);
      m.sets[w]++;
      m.points = [0, 0];
      if (rules.rallyServe) m.serveStart = w;                 // winner serves next game
      else m.serveStart = 1 - m.serveStart;                   // table tennis: previous receiver serves first
      m.server = m.serveStart;
      if (m.sets[w] >= setsToWin(m.settings)) { m.over = true; m.winner = w; }
      return;
    }
    if (a === b && a >= target - 1) m.deuces++;   // reached deuce (both at target-1)
    if (rules.rallyServe) { m.server = i; return; }   // rally winner serves next
    // table tennis: serve changes every `block` points (5 at 21-point, else 2); every point once at deuce
    const total = a + b;
    const block = target >= 21 ? 5 : 2;
    const deuce = a >= target - 1 && b >= target - 1;
    if (deuce || total % block === 0) m.server = 1 - m.server;
  }

  // Pickleball traditional (side-out): only the serving side scores. `w` = side that won the rally.
  // Doubles has two servers per turn; the game opener gets only one (starts on server #2 → "0-0-2").
  function pickleballSideOutPoint(m, w) {
    const target = m.settings.pointsTarget || 11;
    const winBy = m.settings.winBy || 2;
    if (w === m.server) {                       // serving side won the rally → a point
      m.points[w]++;
      const a = m.points[0], b = m.points[1];
      if (Math.max(a, b) >= target && Math.abs(a - b) >= winBy) {
        const win = a > b ? 0 : 1;
        m.completedSets.push([a, b]);
        m.sets[win]++;
        m.points = [0, 0];
        m.server = win;                         // winner serves the next game…
        m.serverNum = 2;                        // …as the lone opening server
        if (m.sets[win] >= setsToWin(m.settings)) { m.over = true; m.winner = win; }
      }
      return;
    }
    // receiving side won → fault for the server
    if (m.settings.mode === "doubles" && m.serverNum === 1) {
      m.serverNum = 2;                          // second server of the same team
    } else {
      m.server = w;                             // side-out: serve passes to the other side
      m.serverNum = 1;
    }
  }

  // Apply one rally win for side `i` (0 or 1). Mutates and returns `m`. No-op once the match is over.
  function scorePoint(m, i) {
    if (m.over) return m;
    if (isSideOut(m.settings)) pickleballSideOutPoint(m, i);
    else if (isTargetSport(m.settings.sport)) tableTennisPoint(m, i);
    else if (m.tiebreak) tiebreakPoint(m, i);
    else regularPoint(m, i);
    return m;
  }

  // Display labels for the current point score: ["0"/"15"/"30"/"40"/"Ad"] for tennis, raw numbers otherwise.
  function pointDisplay(m) {
    if (isTargetSport(m.settings.sport) || m.tiebreak) return [String(m.points[0]), String(m.points[1])];
    const a = m.points[0], b = m.points[1];
    if (a >= 3 && b >= 3) {
      if (a === b) return ["40", "40"];
      return a > b ? ["Ad", "40"] : ["40", "Ad"];
    }
    return [POINT_LABELS[a], POINT_LABELS[b]];
  }

  return {
    POINT_LABELS, defaultSettings, normalizeSettings,
    isTargetSport, isSideOut, sportRules, setsToWin, isDecidingSet, currentTarget,
    parseBestOf, createState, maybeStartMatchTB, goldenArmed, scorePoint, pointDisplay,
  };
});
