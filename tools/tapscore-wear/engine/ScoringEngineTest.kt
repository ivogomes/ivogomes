package com.ivogomes.tapscore.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Behaviour spec for the Kotlin scoring engine — mirrors `tools/tapscore/scoring.test.cjs`.
 * If these pass, the Kotlin port matches the web engine (and the Swift port). Keep all three in sync:
 * change scoring.js first, keep scoring.test.cjs green, then mirror here and in the Swift tests.
 */
class ScoringEngineTest {

    // helpers (mirror the JS test harness)
    private fun mk(build: Settings.() -> Unit = {}): MatchState =
        MatchState(Settings().apply(build))

    private fun play(m: MatchState, sides: List<Int>): MatchState {
        for (s in sides) ScoringEngine.scorePoint(m, s); return m
    }

    private fun pts(m: MatchState, side: Int, n: Int): MatchState {
        repeat(n) { ScoringEngine.scorePoint(m, side) }; return m
    }

    // ---- tennis ----

    @Test fun `love game wins and serve passes`() {
        val m = mk { sport = "tennis" }
        assertEquals(0, m.server)
        pts(m, 0, 4)
        assertArrayEquals2(intArrayOf(1, 0), m.games)
        assertArrayEquals2(intArrayOf(0, 0), m.points)
        assertEquals(1, m.server)   // serve passed
    }

    @Test fun `deuce advantage win by two`() {
        val m = mk { sport = "tennis" }
        play(m, listOf(0, 0, 0, 1, 1, 1))               // 40-40
        assertEquals(listOf("40", "40"), ScoringEngine.pointDisplay(m))
        ScoringEngine.scorePoint(m, 0)                   // advantage side 0
        assertEquals(listOf("Ad", "40"), ScoringEngine.pointDisplay(m))
        ScoringEngine.scorePoint(m, 1)                   // back to deuce
        assertEquals(listOf("40", "40"), ScoringEngine.pointDisplay(m))
        ScoringEngine.scorePoint(m, 1); ScoringEngine.scorePoint(m, 1)  // side 1 takes it
        assertArrayEquals2(intArrayOf(0, 1), m.games)
        assertTrue(m.deuces >= 2)
    }

    @Test fun `golden point ends deuce on next point`() {
        val m = mk { sport = "tennis"; advantages = 0 }
        play(m, listOf(0, 0, 0, 1, 1, 1))               // 40-40, golden armed
        ScoringEngine.scorePoint(m, 1)                   // sudden death → game to side 1
        assertArrayEquals2(intArrayOf(0, 1), m.games)
    }

    @Test fun `win a set 6-4`() {
        val m = mk { sport = "tennis" }
        repeat(4) { pts(m, 0, 4); pts(m, 1, 4) }         // 4-4
        pts(m, 0, 4); pts(m, 0, 4)                       // 6-4
        assertArrayEquals2(intArrayOf(1, 0), m.sets)
        assertArrayEquals2(intArrayOf(6, 4), m.completedSets[0])
    }

    @Test fun `tie-break at 6-6 first to 7 win by 2`() {
        val m = mk { sport = "tennis" }
        repeat(6) { pts(m, 0, 4); pts(m, 1, 4) }         // 6-6
        assertTrue(m.tiebreak)
        pts(m, 0, 7)                                     // 7-0 tie-break
        assertArrayEquals2(intArrayOf(1, 0), m.sets)
        assertArrayEquals2(intArrayOf(7, 6), m.completedSets[0])
        assertFalse(m.tiebreak)
    }

    @Test fun `best-of-3 ends at 2 sets`() {
        val m = mk { sport = "tennis"; bestOf = 3 }
        fun setFor(w: Int) { repeat(6) { pts(m, w, 4) } }
        setFor(0); setFor(0)
        assertTrue(m.over)
        assertEquals(0, m.winner)
        assertArrayEquals2(intArrayOf(2, 0), m.sets)
    }

    @Test fun `match tie-break decider opens final set as first-to-10`() {
        val m = mk { sport = "tennis"; bestOf = 3; decider = "matchTB" }
        fun setFor(w: Int) { repeat(6) { pts(m, w, 4) } }
        setFor(0); setFor(1)                             // 1-1 sets → decider
        assertTrue(m.tiebreak)
        assertTrue(m.matchTB)
        pts(m, 0, 10)                                    // first to 10
        assertTrue(m.over)
        assertEquals(0, m.winner)
        assertArrayEquals2(intArrayOf(10, 0), m.completedSets.last())
    }

    // ---- table tennis ----

    @Test fun `first to 11 win by 2`() {
        val m = mk { sport = "tabletennis"; pointsTarget = 11; bestOf = 1 }
        pts(m, 0, 11)
        assertTrue(m.over)
        assertArrayEquals2(intArrayOf(11, 0), m.completedSets[0])
    }

    @Test fun `deuce at 10-10 needs two clear points`() {
        val m = mk { sport = "tabletennis"; pointsTarget = 11; bestOf = 1 }
        pts(m, 0, 10); pts(m, 1, 10)                     // 10-10
        ScoringEngine.scorePoint(m, 0)                   // 11-10, not won
        assertFalse(m.over)
        ScoringEngine.scorePoint(m, 0)                   // 12-10
        assertTrue(m.over)
        assertArrayEquals2(intArrayOf(12, 10), m.completedSets[0])
    }

    // ---- badminton cap ----

    @Test fun `29-29 next point wins outright`() {
        val m = mk { sport = "badminton"; pointsTarget = 21; bestOf = 1 }
        repeat(29) { ScoringEngine.scorePoint(m, 0); ScoringEngine.scorePoint(m, 1) }  // 29-29
        assertArrayEquals2(intArrayOf(29, 29), m.points)
        assertFalse(m.over)
        ScoringEngine.scorePoint(m, 0)                   // 30 wins despite win-by-2
        assertTrue(m.over)
        assertArrayEquals2(intArrayOf(30, 29), m.completedSets[0])
    }

    // ---- volleyball ----

    @Test fun `deciding set uses shorter target 15`() {
        val m = mk { sport = "volleyball"; pointsTarget = 25; bestOf = 3 }
        pts(m, 0, 25); pts(m, 1, 25)                     // 1-1 sets → deciding set
        assertEquals(15, ScoringEngine.currentTarget(m))
        pts(m, 0, 15)
        assertTrue(m.over)
        assertEquals(0, m.winner)
    }

    // ---- pickleball side-out ----

    @Test fun `only serving side scores singles`() {
        val m = mk { sport = "pickleball"; scoring = "sideout"; mode = "singles"; pointsTarget = 11; bestOf = 1 }
        val server0 = m.server
        ScoringEngine.scorePoint(m, 1 - server0)         // receiver wins → side-out, no point
        assertArrayEquals2(intArrayOf(0, 0), m.points)
        assertEquals(1 - server0, m.server)
        ScoringEngine.scorePoint(m, m.server)            // new server scores
        assertEquals(1, m.points[m.server])
    }

    @Test fun `doubles first server fault passes to second server`() {
        val m = mk { sport = "pickleball"; scoring = "sideout"; mode = "doubles"; pointsTarget = 11; bestOf = 1 }
        val s = m.server
        assertEquals(2, m.serverNum)                     // opener starts on server #2
        ScoringEngine.scorePoint(m, 1 - s)               // side-out → other side serves as #1
        val s2 = m.server
        assertEquals(1, m.serverNum)
        ScoringEngine.scorePoint(m, 1 - s2)              // fault → 2nd server (same side keeps serve)
        assertEquals(s2, m.server)
        assertEquals(2, m.serverNum)
    }

    // ---- guards ----

    @Test fun `scorePoint is a no-op once over`() {
        val m = mk { sport = "tabletennis"; pointsTarget = 11; bestOf = 1 }
        pts(m, 0, 11)
        val snapSets = m.sets.copyOf(); val snapPoints = m.points.copyOf()
        val snapCompleted = m.completedSets.size
        ScoringEngine.scorePoint(m, 1)
        assertArrayEquals2(snapSets, m.sets)
        assertArrayEquals2(snapPoints, m.points)
        assertEquals(snapCompleted, m.completedSets.size)
    }

    @Test fun `free play never auto-ends`() {
        val m = mk { sport = "tennis"; bestOf = null }   // null = inf
        repeat(10) { repeat(6) { pts(m, 0, 4) } }
        assertFalse(m.over)
        assertTrue(m.sets[0] >= 10)
    }

    // small array assert helper
    private fun assertArrayEquals2(expected: IntArray, actual: IntArray) {
        assertEquals(expected.toList(), actual.toList())
    }
}
