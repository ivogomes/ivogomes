package com.ivogomes.tapscore.wear

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.Wearable
import com.ivogomes.tapscore.engine.MatchState
import com.ivogomes.tapscore.engine.ScoringEngine
import com.ivogomes.tapscore.engine.Settings
import org.json.JSONObject

/**
 * Owns the live match, drives the shared engine, plays haptics, and remembers the last format.
 * Scoring rules are NOT here — they live in ScoringEngine (single source of truth).
 *
 * Holds Compose state directly (`mutableStateOf`), so views recompose when `match`/`active` change.
 * Each score/undo swaps in a fresh MatchState instance so recomposition triggers reliably.
 */
class MatchModel(context: Context) {
    companion object { const val TRIAL_LIMIT = 3 }

    private val prefs = context.applicationContext.getSharedPreferences("tapscore", Context.MODE_PRIVATE)
    private val haptics = Haptics(context)

    var match by mutableStateOf(MatchState(loadSettings()))
        private set
    var active by mutableStateOf(false)          // false = Start screen; true = scoring
        private set

    private val history = ArrayDeque<MatchState>()   // undo stack (snapshots)

    // MARK: Pro / trial (independent of the phone's own trial — the phone's genuine purchase is
    // mirrored here over WatchLink; see the message listener below).

    /** Computed, not cached: the listener below writes this key directly on a phone push, so every
     * read must see that write immediately rather than risk a stale in-memory copy. */
    val proOwned: Boolean get() = prefs.getBoolean("pro", false)
    var trialUsed by mutableStateOf(prefs.getInt("trialGames", 0))
        private set
    val isPro: Boolean get() = proOwned || trialUsed < TRIAL_LIMIT

    init {
        // Registered unconditionally (unlike RemoteModel's listener, which only runs in "Control
        // phone" mode) so a purchase reaches this watch while it's just being played standalone —
        // Android allows multiple independent listeners on the same MessageClient, so this coexists
        // safely with RemoteModel's own listener.
        Wearable.getMessageClient(context.applicationContext).addListener(
            MessageClient.OnMessageReceivedListener { e ->
                if (e.path != "/tapscore") return@OnMessageReceivedListener
                runCatching { JSONObject(String(e.data)) }.getOrNull()?.let { o ->
                    // Sticky: only ever write true — a later false (trial-only, no purchase yet)
                    // must never un-grant an earlier purchase.
                    if (o.optBoolean("proOwned", false)) prefs.edit().putBoolean("pro", true).apply()
                }
            }
        )
    }

    /** Every completed standalone match counts toward this watch's own 3-game trial. */
    private fun consumeTrialGame() {
        if (proOwned || trialUsed >= TRIAL_LIMIT) return
        trialUsed += 1
        prefs.edit().putInt("trialGames", trialUsed).apply()
    }

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
            next.over -> { haptics.matchWon(); consumeTrialGame() }
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
