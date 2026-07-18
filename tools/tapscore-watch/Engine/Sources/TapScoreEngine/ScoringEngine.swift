import Foundation

/// TapScore scoring engine — a faithful Swift port of `tools/tapscore/scoring.js`.
///
/// Single source of truth for the rules (points → games → sets → match) across every sport:
/// tennis/padel (deuce, advantage, golden point, tie-break, match-tie-break decider) and the
/// target/rally sports — table tennis, pickleball (rally + traditional side-out), squash,
/// badminton (29–29 → 30 cap), volleyball & beach (shorter deciding set).
///
/// `ScoringEngine.scorePoint(&state, side)` applies one rally win for side 0 or 1, mutating `state`
/// in place (a no-op once the match is over). The behaviour is locked by `ScoringEngineTests`, which
/// mirrors the web engine's spec (scoring.test.cjs) — keep the two in sync.

public struct Settings: Equatable, Codable {
    public var sport: String        // "tennis" | "padel" | target sports (tabletennis, pickleball, …)
    public var mode: String         // "singles" | "doubles"
    public var bestOf: Int?         // nil = free play (∞)
    public var advantages: Int?     // nil = unlimited (win by 2); 0 = golden point; 1, 2 = play N advs then golden
    public var pointsTarget: Int    // target sports: points to win a game
    public var decider: String      // "set" | "matchTB"
    public var gamesPerSet: Int     // tennis/padel: 6 (standard) or 4 (short sets)
    public var tbPoints: Int        // tennis/padel: points to win a set tie-break
    public var winBy: Int           // target sports: 2 or 1 (straight to target)
    public var scoring: String      // pickleball: "rally" | "sideout"

    public init(sport: String = "tennis", mode: String = "singles", bestOf: Int? = 3,
                advantages: Int? = nil, pointsTarget: Int = 11, decider: String = "set",
                gamesPerSet: Int = 6, tbPoints: Int = 7, winBy: Int = 2, scoring: String = "rally") {
        self.sport = sport; self.mode = mode; self.bestOf = bestOf; self.advantages = advantages
        self.pointsTarget = pointsTarget; self.decider = decider; self.gamesPerSet = gamesPerSet
        self.tbPoints = tbPoints; self.winBy = winBy; self.scoring = scoring
    }
}

public struct MatchState: Equatable, Codable {
    public var sets: [Int] = [0, 0]
    public var games: [Int] = [0, 0]
    public var points: [Int] = [0, 0]
    public var completedSets: [[Int]] = []   // [gamesA, gamesB] (or [pointsA, pointsB] for target sports)
    public var tiebreak: Bool = false
    public var matchTB: Bool = false         // deciding set played as a match tie-break (first to 10)
    public var over: Bool = false
    public var winner: Int? = nil            // 0/1, or nil (undecided / tie)
    public var server: Int = 0
    public var serverNum: Int = 2            // pickleball side-out doubles: 1st or 2nd server
    public var serveStart: Int = 0           // table tennis: who served first this game
    public var tbFirstServer: Int = 0        // tennis/padel: who served the tie-break's first point
    public var deuces: Int = 0
    public var breaks: [Int] = [0, 0]        // racket: games won by the returning side
    public var tiebreaks: Int = 0
    public var settings: Settings

    public init(settings: Settings = Settings()) { self.settings = settings }
}

public enum ScoringEngine {
    /// Sentinel for a free-play match (no set limit).
    public static let infinite = Int.max

    // MARK: - Sport / settings helpers

    public static func isTargetSport(_ sport: String) -> Bool {
        ["tabletennis", "pickleball", "squash", "badminton", "volleyball", "beachvolley"].contains(sport)
    }

    public static func isSideOut(_ s: Settings) -> Bool {
        s.sport == "pickleball" && s.scoring == "sideout"
    }

    public struct SportRules {
        public var rallyServe: Bool   // rally winner serves next (vs a fixed rotation)
        public var cap: Int           // hard ceiling that wins outright (badminton 30); 0 = none
        public var deciderTarget: Int // shorter target for the deciding set (volleyball 15); 0 = none
    }

    public static func sportRules(_ sport: String) -> SportRules {
        SportRules(
            rallyServe: ["squash", "badminton", "volleyball", "beachvolley"].contains(sport),
            cap: sport == "badminton" ? 30 : 0,
            deciderTarget: (sport == "volleyball" || sport == "beachvolley") ? 15 : 0
        )
    }

    public static func setsToWin(_ s: Settings) -> Int {
        guard let b = s.bestOf else { return infinite }
        return (b + 1) / 2   // ceil(b/2) for odd best-of
    }

    public static func isDecidingSet(_ m: MatchState) -> Bool {
        let need = setsToWin(m.settings)
        return need != infinite && need >= 2 && m.sets[0] == need - 1 && m.sets[1] == need - 1
    }

    public static func currentTarget(_ m: MatchState) -> Int {
        let r = sportRules(m.settings.sport)
        if r.deciderTarget != 0 && isDecidingSet(m) { return r.deciderTarget }
        return m.settings.pointsTarget == 0 ? 11 : m.settings.pointsTarget
    }

    static func goldenArmed(_ m: MatchState, _ a: Int, _ b: Int) -> Bool {
        guard let adv = m.settings.advantages else { return false }   // unlimited
        if min(a, b) < 3 { return false }
        let deuces = min(a, b) - 2
        return deuces >= adv + 1
    }

    /// When "deciding set = match tie-break" is on, open the final set as a first-to-10 tie-break.
    public static func maybeStartMatchTB(_ m: inout MatchState) {
        if !isTargetSport(m.settings.sport) && m.settings.decider == "matchTB" && !m.over && !m.tiebreak
            && isDecidingSet(m) && m.games[0] == 0 && m.games[1] == 0 {
            m.tiebreak = true
            m.matchTB = true
            m.points = [0, 0]
            m.tbFirstServer = m.server
            m.tiebreaks += 1
        }
    }

    // MARK: - Transitions

    static func winSet(_ m: inout MatchState, _ i: Int) {
        m.completedSets.append([m.games[0], m.games[1]])
        m.sets[i] += 1
        m.games = [0, 0]
        if m.sets[i] >= setsToWin(m.settings) { m.over = true; m.winner = i }
        else { maybeStartMatchTB(&m) }
    }

    static func winGame(_ m: inout MatchState, _ i: Int) {
        let gameServer = m.server
        m.games[i] += 1
        m.points = [0, 0]
        m.server = 1 - m.server
        if i != gameServer { m.breaks[i] += 1 }
        let G = m.settings.gamesPerSet == 0 ? 6 : m.settings.gamesPerSet
        if m.games[0] == G && m.games[1] == G {
            m.tiebreak = true
            m.tbFirstServer = m.server
            m.tiebreaks += 1
            return
        }
        if m.games[i] >= G && (m.games[i] - m.games[1 - i]) >= 2 { winSet(&m, i) }
    }

    static func regularPoint(_ m: inout MatchState, _ i: Int) {
        m.points[i] += 1
        let a = m.points[0], b = m.points[1]
        if a == b && a >= 3 { m.deuces += 1 }
        let won = goldenArmed(m, a, b) ? (abs(a - b) >= 1) : (max(a, b) >= 4 && abs(a - b) >= 2)
        if won { winGame(&m, a > b ? 0 : 1) }
    }

    static func tiebreakPoint(_ m: inout MatchState, _ i: Int) {
        m.points[i] += 1
        let a = m.points[0], b = m.points[1]
        let target = m.matchTB ? 10 : (m.settings.tbPoints == 0 ? 7 : m.settings.tbPoints)
        if max(a, b) >= target && abs(a - b) >= 2 {
            let w = a > b ? 0 : 1
            m.tiebreak = false
            if m.matchTB {
                m.matchTB = false
                m.completedSets.append([a, b])
                m.sets[w] += 1
                m.points = [0, 0]
                if m.sets[w] >= setsToWin(m.settings) { m.over = true; m.winner = w }
                return
            }
            m.games[w] += 1
            m.points = [0, 0]
            m.server = 1 - m.tbFirstServer
            winSet(&m, w)
            return
        }
        if a == b && a >= target - 1 { m.deuces += 1 }
        if (a + b) % 2 == 1 { m.server = 1 - m.server }
    }

    static func tableTennisPoint(_ m: inout MatchState, _ i: Int) {
        m.points[i] += 1
        let a = m.points[0], b = m.points[1]
        let rules = sportRules(m.settings.sport)
        let target = currentTarget(m)
        let winBy = m.settings.winBy == 0 ? 2 : m.settings.winBy
        let won = (max(a, b) >= target && abs(a - b) >= winBy) || (rules.cap != 0 && max(a, b) >= rules.cap)
        if won {
            let w = a > b ? 0 : 1
            m.completedSets.append([a, b])
            m.sets[w] += 1
            m.points = [0, 0]
            if rules.rallyServe { m.serveStart = w } else { m.serveStart = 1 - m.serveStart }
            m.server = m.serveStart
            if m.sets[w] >= setsToWin(m.settings) { m.over = true; m.winner = w }
            return
        }
        if a == b && a >= target - 1 { m.deuces += 1 }
        if rules.rallyServe { m.server = i; return }
        let total = a + b
        let block = target >= 21 ? 5 : 2
        let deuce = a >= target - 1 && b >= target - 1
        if deuce || total % block == 0 { m.server = 1 - m.server }
    }

    static func pickleballSideOutPoint(_ m: inout MatchState, _ w: Int) {
        let target = m.settings.pointsTarget == 0 ? 11 : m.settings.pointsTarget
        let winBy = m.settings.winBy == 0 ? 2 : m.settings.winBy
        if w == m.server {
            m.points[w] += 1
            let a = m.points[0], b = m.points[1]
            if max(a, b) >= target && abs(a - b) >= winBy {
                let win = a > b ? 0 : 1
                m.completedSets.append([a, b])
                m.sets[win] += 1
                m.points = [0, 0]
                m.server = win
                m.serverNum = 2
                if m.sets[win] >= setsToWin(m.settings) { m.over = true; m.winner = win }
            }
            return
        }
        if m.settings.mode == "doubles" && m.serverNum == 1 {
            m.serverNum = 2
        } else {
            m.server = w
            m.serverNum = 1
        }
    }

    // MARK: - Public API

    /// Apply one rally win for side `i` (0 or 1). Mutates `m`. No-op once the match is over.
    @discardableResult
    public static func scorePoint(_ m: inout MatchState, _ i: Int) -> MatchState {
        if m.over { return m }
        if isSideOut(m.settings) { pickleballSideOutPoint(&m, i) }
        else if isTargetSport(m.settings.sport) { tableTennisPoint(&m, i) }
        else if m.tiebreak { tiebreakPoint(&m, i) }
        else { regularPoint(&m, i) }
        return m
    }

    /// Display labels for the current point score ("0"/"15"/"30"/"40"/"Ad" for tennis, raw numbers otherwise).
    public static func pointDisplay(_ m: MatchState) -> [String] {
        let labels = ["0", "15", "30", "40"]
        if isTargetSport(m.settings.sport) || m.tiebreak {
            return [String(m.points[0]), String(m.points[1])]
        }
        let a = m.points[0], b = m.points[1]
        if a >= 3 && b >= 3 {
            if a == b { return ["40", "40"] }
            return a > b ? ["Ad", "40"] : ["40", "Ad"]
        }
        return [labels[a], labels[b]]
    }
}
