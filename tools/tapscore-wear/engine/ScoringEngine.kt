package com.ivogomes.tapscore.engine

/**
 * TapScore scoring engine — a faithful Kotlin port of `tools/tapscore/scoring.js`.
 *
 * Single source of truth for the rules (points → games → sets → match) across every sport:
 * tennis/padel (deuce, advantage, golden point, tie-break, match-tie-break decider) and the
 * target/rally sports — table tennis, pickleball (rally + traditional side-out), squash,
 * badminton (29–29 → 30 cap), volleyball & beach (shorter deciding set).
 *
 * `ScoringEngine.scorePoint(state, side)` applies one rally win for side 0 or 1, mutating `state`
 * in place (a no-op once the match is over). The behaviour is locked by `ScoringEngineTest`, which
 * mirrors the web engine's spec (scoring.test.cjs) — keep JS ⇄ Swift ⇄ Kotlin in sync.
 *
 * No Android dependencies: this file is pure Kotlin and can live in a plain library module.
 */

data class Settings(
    var sport: String = "tennis",        // "tennis" | "padel" | target sports (tabletennis, pickleball, …)
    var mode: String = "singles",        // "singles" | "doubles"
    var bestOf: Int? = 3,                 // null = free play (∞)
    var advantages: Int? = null,          // null = unlimited (win by 2); 0 = golden point; 1, 2 = play N advs then golden
    var pointsTarget: Int = 11,           // target sports: points to win a game
    var decider: String = "set",          // "set" | "matchTB"
    var gamesPerSet: Int = 6,             // tennis/padel: 6 (standard) or 4 (short sets)
    var tbPoints: Int = 7,                // tennis/padel: points to win a set tie-break
    var winBy: Int = 2,                   // target sports: 2 or 1 (straight to target)
    var scoring: String = "rally",        // pickleball: "rally" | "sideout"
)

/**
 * Scoring-relevant match state. Mutated in place by [ScoringEngine.scorePoint]; use [deepCopy]
 * to snapshot for undo (the arrays/lists are copied, not aliased).
 */
class MatchState(var settings: Settings = Settings()) {
    var sets = intArrayOf(0, 0)
    var games = intArrayOf(0, 0)
    var points = intArrayOf(0, 0)
    var completedSets = mutableListOf<IntArray>()   // [gamesA, gamesB] (or [pointsA, pointsB] for target sports)
    var tiebreak = false
    var matchTB = false          // deciding set played as a match tie-break (first to 10)
    var over = false
    var winner: Int? = null      // 0/1, or null (undecided / tie)
    var server = 0
    var serverNum = 2            // pickleball side-out doubles: 1st or 2nd server
    var serveStart = 0           // table tennis: who served first this game
    var tbFirstServer = 0        // tennis/padel: who served the tie-break's first point
    var deuces = 0
    var breaks = intArrayOf(0, 0) // racket: games won by the returning side
    var tiebreaks = 0

    fun deepCopy(): MatchState {
        val c = MatchState(settings.copy())
        c.sets = sets.copyOf(); c.games = games.copyOf(); c.points = points.copyOf()
        c.completedSets = completedSets.mapTo(mutableListOf()) { it.copyOf() }
        c.tiebreak = tiebreak; c.matchTB = matchTB; c.over = over; c.winner = winner
        c.server = server; c.serverNum = serverNum; c.serveStart = serveStart
        c.tbFirstServer = tbFirstServer; c.deuces = deuces
        c.breaks = breaks.copyOf(); c.tiebreaks = tiebreaks
        return c
    }
}

object ScoringEngine {
    /** Sentinel for a free-play match (no set limit). */
    const val INFINITE = Int.MAX_VALUE

    // MARK: - Sport / settings helpers

    fun isTargetSport(sport: String): Boolean =
        sport in setOf("tabletennis", "pickleball", "squash", "badminton", "volleyball", "beachvolley")

    fun isSideOut(s: Settings): Boolean = s.sport == "pickleball" && s.scoring == "sideout"

    data class SportRules(
        val rallyServe: Boolean,   // rally winner serves next (vs a fixed rotation)
        val cap: Int,              // hard ceiling that wins outright (badminton 30); 0 = none
        val deciderTarget: Int,    // shorter target for the deciding set (volleyball 15); 0 = none
    )

    fun sportRules(sport: String): SportRules = SportRules(
        rallyServe = sport in setOf("squash", "badminton", "volleyball", "beachvolley"),
        cap = if (sport == "badminton") 30 else 0,
        deciderTarget = if (sport == "volleyball" || sport == "beachvolley") 15 else 0,
    )

    fun setsToWin(s: Settings): Int {
        val b = s.bestOf ?: return INFINITE
        return (b + 1) / 2   // ceil(b/2) for odd best-of
    }

    fun isDecidingSet(m: MatchState): Boolean {
        val need = setsToWin(m.settings)
        return need != INFINITE && need >= 2 && m.sets[0] == need - 1 && m.sets[1] == need - 1
    }

    fun currentTarget(m: MatchState): Int {
        val r = sportRules(m.settings.sport)
        if (r.deciderTarget != 0 && isDecidingSet(m)) return r.deciderTarget
        return if (m.settings.pointsTarget == 0) 11 else m.settings.pointsTarget
    }

    private fun goldenArmed(m: MatchState, a: Int, b: Int): Boolean {
        val adv = m.settings.advantages ?: return false   // unlimited
        if (minOf(a, b) < 3) return false
        val deuces = minOf(a, b) - 2
        return deuces >= adv + 1
    }

    /** When "deciding set = match tie-break" is on, open the final set as a first-to-10 tie-break. */
    fun maybeStartMatchTB(m: MatchState) {
        if (!isTargetSport(m.settings.sport) && m.settings.decider == "matchTB" && !m.over && !m.tiebreak &&
            isDecidingSet(m) && m.games[0] == 0 && m.games[1] == 0
        ) {
            m.tiebreak = true
            m.matchTB = true
            m.points = intArrayOf(0, 0)
            m.tbFirstServer = m.server
            m.tiebreaks++
        }
    }

    // MARK: - Transitions

    private fun winSet(m: MatchState, i: Int) {
        m.completedSets.add(intArrayOf(m.games[0], m.games[1]))
        m.sets[i]++
        m.games = intArrayOf(0, 0)
        if (m.sets[i] >= setsToWin(m.settings)) { m.over = true; m.winner = i }
        else maybeStartMatchTB(m)
    }

    private fun winGame(m: MatchState, i: Int) {
        val gameServer = m.server
        m.games[i]++
        m.points = intArrayOf(0, 0)
        m.server = 1 - m.server
        if (i != gameServer) m.breaks[i]++
        val g = if (m.settings.gamesPerSet == 0) 6 else m.settings.gamesPerSet
        if (m.games[0] == g && m.games[1] == g) {
            m.tiebreak = true
            m.tbFirstServer = m.server
            m.tiebreaks++
            return
        }
        if (m.games[i] >= g && (m.games[i] - m.games[1 - i]) >= 2) winSet(m, i)
    }

    private fun regularPoint(m: MatchState, i: Int) {
        m.points[i]++
        val a = m.points[0]; val b = m.points[1]
        if (a == b && a >= 3) m.deuces++
        val won = if (goldenArmed(m, a, b)) kotlin.math.abs(a - b) >= 1
                  else maxOf(a, b) >= 4 && kotlin.math.abs(a - b) >= 2
        if (won) winGame(m, if (a > b) 0 else 1)
    }

    private fun tiebreakPoint(m: MatchState, i: Int) {
        m.points[i]++
        val a = m.points[0]; val b = m.points[1]
        val target = if (m.matchTB) 10 else if (m.settings.tbPoints == 0) 7 else m.settings.tbPoints
        if (maxOf(a, b) >= target && kotlin.math.abs(a - b) >= 2) {
            val w = if (a > b) 0 else 1
            m.tiebreak = false
            if (m.matchTB) {
                m.matchTB = false
                m.completedSets.add(intArrayOf(a, b))
                m.sets[w]++
                m.points = intArrayOf(0, 0)
                if (m.sets[w] >= setsToWin(m.settings)) { m.over = true; m.winner = w }
                return
            }
            m.games[w]++
            m.points = intArrayOf(0, 0)
            m.server = 1 - m.tbFirstServer
            winSet(m, w)
            return
        }
        if (a == b && a >= target - 1) m.deuces++
        if ((a + b) % 2 == 1) m.server = 1 - m.server
    }

    private fun tableTennisPoint(m: MatchState, i: Int) {
        m.points[i]++
        val a = m.points[0]; val b = m.points[1]
        val rules = sportRules(m.settings.sport)
        val target = currentTarget(m)
        val winBy = if (m.settings.winBy == 0) 2 else m.settings.winBy
        val won = (maxOf(a, b) >= target && kotlin.math.abs(a - b) >= winBy) ||
                  (rules.cap != 0 && maxOf(a, b) >= rules.cap)
        if (won) {
            val w = if (a > b) 0 else 1
            m.completedSets.add(intArrayOf(a, b))
            m.sets[w]++
            m.points = intArrayOf(0, 0)
            if (rules.rallyServe) m.serveStart = w else m.serveStart = 1 - m.serveStart
            m.server = m.serveStart
            if (m.sets[w] >= setsToWin(m.settings)) { m.over = true; m.winner = w }
            return
        }
        if (a == b && a >= target - 1) m.deuces++
        if (rules.rallyServe) { m.server = i; return }
        val total = a + b
        val block = if (target >= 21) 5 else 2
        val deuce = a >= target - 1 && b >= target - 1
        if (deuce || total % block == 0) m.server = 1 - m.server
    }

    private fun pickleballSideOutPoint(m: MatchState, w: Int) {
        val target = if (m.settings.pointsTarget == 0) 11 else m.settings.pointsTarget
        val winBy = if (m.settings.winBy == 0) 2 else m.settings.winBy
        if (w == m.server) {
            m.points[w]++
            val a = m.points[0]; val b = m.points[1]
            if (maxOf(a, b) >= target && kotlin.math.abs(a - b) >= winBy) {
                val win = if (a > b) 0 else 1
                m.completedSets.add(intArrayOf(a, b))
                m.sets[win]++
                m.points = intArrayOf(0, 0)
                m.server = win
                m.serverNum = 2
                if (m.sets[win] >= setsToWin(m.settings)) { m.over = true; m.winner = win }
            }
            return
        }
        if (m.settings.mode == "doubles" && m.serverNum == 1) {
            m.serverNum = 2
        } else {
            m.server = w
            m.serverNum = 1
        }
    }

    // MARK: - Public API

    /** Apply one rally win for side [i] (0 or 1). Mutates [m]. No-op once the match is over. */
    fun scorePoint(m: MatchState, i: Int): MatchState {
        if (m.over) return m
        when {
            isSideOut(m.settings) -> pickleballSideOutPoint(m, i)
            isTargetSport(m.settings.sport) -> tableTennisPoint(m, i)
            m.tiebreak -> tiebreakPoint(m, i)
            else -> regularPoint(m, i)
        }
        return m
    }

    /** Display labels for the current point score ("0"/"15"/"30"/"40"/"Ad" for tennis, raw numbers otherwise). */
    fun pointDisplay(m: MatchState): List<String> {
        val labels = listOf("0", "15", "30", "40")
        if (isTargetSport(m.settings.sport) || m.tiebreak) {
            return listOf(m.points[0].toString(), m.points[1].toString())
        }
        val a = m.points[0]; val b = m.points[1]
        if (a >= 3 && b >= 3) {
            if (a == b) return listOf("40", "40")
            return if (a > b) listOf("Ad", "40") else listOf("40", "Ad")
        }
        return listOf(labels[a], labels[b])
    }
}
