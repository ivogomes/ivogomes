package com.ivogomes.tapscore.wear

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.ivogomes.tapscore.engine.MatchState
import com.ivogomes.tapscore.engine.ScoringEngine
import com.ivogomes.tapscore.engine.Settings

/**
 * Owns the live match, drives the shared engine, plays haptics, and remembers the last format.
 * Scoring rules are NOT here — they live in ScoringEngine (single source of truth).
 *
 * Holds Compose state directly (`mutableStateOf`), so views recompose when `match`/`active` change.
 * Each score/undo swaps in a fresh MatchState instance so recomposition triggers reliably.
 */
class MatchModel(context: Context) {
    private val prefs = context.applicationContext.getSharedPreferences("tapscore", Context.MODE_PRIVATE)
    private val haptics = Haptics(context)

    var match by mutableStateOf(MatchState(loadSettings()))
        private set
    var active by mutableStateOf(false)          // false = Start screen; true = scoring
        private set

    private val history = ArrayDeque<MatchState>()   // undo stack (snapshots)

    val pointLabels: List<String> get() = ScoringEngine.pointDisplay(match)
    val canUndo: Boolean get() = history.isNotEmpty()

    /** Full scoreline for the center pill (completed sets + current games), like the phone board. */
    val scorePill: String
        get() {
            val m = match
            val parts = m.completedSets.map { "${it[0]}-${it[1]}" }.toMutableList()
            if (!ScoringEngine.isTargetSport(m.settings.sport)) {
                parts.add("${m.games[0]}-${m.games[1]}")   // current set's games
            }
            if (parts.isEmpty()) parts.add("0-0")
            return parts.joinToString("  ")
        }

    // MARK: actions

    fun score(side: Int) {
        if (match.over) return
        history.addLast(match)                   // snapshot current (never mutated again)
        val before = match
        val next = match.deepCopy()
        ScoringEngine.scorePoint(next, side)
        when {
            next.over -> haptics.matchWon()
            setsTotal(next) > setsTotal(before) -> haptics.setWon()
            gamesTotal(next) > gamesTotal(before) -> haptics.game()
            else -> haptics.point()
        }
        match = next
    }

    fun undo() {
        val prev = history.removeLastOrNull() ?: return
        match = prev
        haptics.undo()
    }

    fun startMatch(settings: Settings) {
        saveSettings(settings)
        match = MatchState(settings)
        history.clear()
        active = true
    }

    /** Leave the current match, back to Start (no result kept). */
    fun endMatch() { active = false }

    /** Fresh match with the same settings (from the winner screen). */
    fun rematch() = startMatch(match.settings)

    private fun setsTotal(m: MatchState) = m.sets[0] + m.sets[1]
    private fun gamesTotal(m: MatchState) = m.games[0] + m.games[1]

    // MARK: persistence (remember last-used format for instant standalone start)

    fun loadSettings(): Settings {
        val sport = prefs.getString("sport", "tennis") ?: "tennis"
        val bestOf = prefs.getInt("bestOf", 3)
        val s = Settings()
        s.sport = sport
        s.bestOf = bestOf
        if (ScoringEngine.isTargetSport(sport)) s.pointsTarget = 11
        return s
    }

    private fun saveSettings(s: Settings) {
        prefs.edit()
            .putString("sport", s.sport)
            .putInt("bestOf", s.bestOf ?: 3)
            .apply()
    }
}
