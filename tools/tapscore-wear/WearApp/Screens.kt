package com.ivogomes.tapscore.wear

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.AlertDialog
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.ChildButton
import androidx.wear.compose.material3.CompactButton
import androidx.wear.compose.material3.EdgeButton
import androidx.wear.compose.material3.FilledTonalButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Picker
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.rememberPickerState
import com.ivogomes.tapscore.engine.ScoringEngine
import com.ivogomes.tapscore.engine.Settings

/** Routes between Home, Start (local setup), Scoring, and End based on match state. */
@Composable
fun RootScreen(model: MatchModel, onRemote: () -> Unit = {}) {
    var showLocalSetup by remember { mutableStateOf(false) }
    when {
        !model.active -> if (showLocalSetup) StartScreen(model, onBack = { showLocalSetup = false })
                         else HomeScreen(onLocalMatch = { showLocalSetup = true }, onRemote = onRemote)
        model.match.over -> EndScreen(model)
        else -> ScoringScreen(model)
    }
}

// MARK: - Scoring (two-zone main screen) — deliberately outside Material3: the whole point is that
// each half of the screen IS the tap target, which Material's button padding/touch-target rules
// would fight. Only the typography (score/label text) and the pause menu adopt Material3 below.

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ScoringScreen(model: MatchModel) {
    val m = model.match
    val labels = model.pointLabels
    var showMenu by remember { mutableStateOf(false) }
    val focus = remember { FocusRequester() }

    // Digital Crown / rotating bezel → undo on each upward-ish rotation.
    LaunchedEffect(Unit) { focus.requestFocus() }

    Box(
        Modifier
            .fillMaxSize()
            .background(Theme.bg)
            .onRotaryScrollEvent { event ->
                if (event.verticalScrollPixels < 0f) model.undo()
                true
            }
            .focusRequester(focus)
            .focusable()
    ) {
        // Full-bleed tappable halves, each with its own centered score + outer-edge label.
        // A = lime bg + dark-blue ink; B = dark-blue bg + lime ink.
        Column(Modifier.fillMaxSize()) {
            ScoreHalf(
                color = Theme.sideA, ink = Theme.sideAInk, label = "YOU", score = labels[0],
                serving = m.server == 0, alignTop = true,
                modifier = Modifier.weight(1f),
                onScore = { model.score(0) }, onLong = { showMenu = true }
            )
            ScoreHalf(
                color = Theme.sideB, ink = Theme.sideBInk, label = "OPP", score = labels[1],
                serving = m.server == 1, alignTop = false,
                modifier = Modifier.weight(1f),
                onScore = { model.score(1) }, onLong = { showMenu = true }
            )
        }

        // Scoreline / tie pill straddling the split (non-interactive → taps fall through).
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            val tie = m.tiebreak
            Box(
                Modifier
                    .clip(RoundedCornerShape(50))
                    .background(Theme.bg)
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = if (tie) "TIE-BREAK" else model.scorePill,
                    color = if (tie) Theme.lime else Color.White,
                    style = MaterialTheme.typography.labelMedium,
                )
            }
        }

        MatchMenu(model, visible = showMenu, onDismiss = { showMenu = false })
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ScoreHalf(
    color: Color, ink: Color, label: String, score: String, serving: Boolean, alignTop: Boolean,
    modifier: Modifier, onScore: () -> Unit, onLong: () -> Unit,
) {
    Box(
        modifier
            .fillMaxWidth()
            .background(color)
            .combinedClickable(onClick = onScore, onLongClick = onLong),
        contentAlignment = Alignment.Center
    ) {
        // Label + score stacked and centered within each half. On a ROUND watch the
        // top/bottom corners get clipped, so nothing is pinned to an edge — everything
        // lives in the vertical-center band (the widest, always-visible part of the arc).
        // Label sits on the outer side of the score (above for YOU, below for OPP).
        val labelRow: @Composable () -> Unit = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = label, color = ink, style = MaterialTheme.typography.labelMedium)
                if (serving) {
                    Spacer(Modifier.width(6.dp))
                    Box(Modifier.size(9.dp).clip(CircleShape).background(ink))
                }
            }
        }
        val scoreText: @Composable () -> Unit = {
            Text(
                text = score,
                color = ink,
                style = MaterialTheme.typography.numeralExtraLarge,
            )
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (alignTop) { labelRow(); Spacer(Modifier.height(2.dp)); scoreText() }
            else { scoreText(); Spacer(Modifier.height(2.dp)); labelRow() }
        }
    }
}

// The pause menu is the one piece of the scoring screen that IS a real Material3 dialog — it's
// ordinary chrome (a list of actions), not part of the tap-to-score board.
@Composable
private fun MatchMenu(model: MatchModel, visible: Boolean, onDismiss: () -> Unit) {
    AlertDialog(
        visible = visible,
        onDismissRequest = onDismiss,
        title = { Text("Match menu") },
    ) {
        if (model.canUndo) {
            item {
                Button(onClick = { model.undo(); onDismiss() }, label = { Text("Undo point") })
            }
        }
        item {
            Button(
                onClick = { model.endMatch(); onDismiss() },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Theme.danger, contentColor = Color.White,
                ),
                label = { Text("End match") },
            )
        }
        item {
            ChildButton(onClick = onDismiss, label = { Text("Cancel") })
        }
    }
}

// MARK: - Home (choose local match or remote control)

@Composable
fun HomeScreen(onLocalMatch: () -> Unit, onRemote: () -> Unit = {}) {
    val scrollState = rememberScalingLazyListState()
    ScreenScaffold(
        scrollState = scrollState,
        edgeButton = { EdgeButton(onClick = onLocalMatch) { Text("Local match") } },
    ) { contentPadding ->
        ScalingLazyColumn(
            state = scrollState,
            contentPadding = contentPadding,
            modifier = Modifier.fillMaxSize(),
        ) {
            item {
                Text(
                    "TapScore",
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.titleLarge,
                )
            }
            item {
                FilledTonalButton(onClick = onRemote, label = { Text("Control phone") })
            }
        }
    }
}

// MARK: - Start (local match setup)

@Composable
fun StartScreen(model: MatchModel, onBack: () -> Unit = {}) {
    val sports = listOf("tennis", "padel", "tabletennis", "pickleball", "squash", "badminton", "volleyball", "beachvolley")
    val sportNames = mapOf(
        "tennis" to "Tennis", "padel" to "Padel", "tabletennis" to "Table tennis",
        "pickleball" to "Pickleball", "squash" to "Squash", "badminton" to "Badminton",
        "volleyball" to "Volleyball", "beachvolley" to "Beach volley"
    )
    val formats = listOf(1 to "1 set", 3 to "Best of 3", 5 to "Best of 5")

    val saved = remember { model.loadSettings() }
    val sportState = rememberPickerState(
        initialNumberOfOptions = sports.size,
        initiallySelectedIndex = sports.indexOf(saved.sport).coerceAtLeast(0),
        shouldRepeatOptions = false,
    )
    val fmtState = rememberPickerState(
        initialNumberOfOptions = formats.size,
        initiallySelectedIndex = formats.indexOfFirst { it.first == (saved.bestOf ?: 3) }.coerceAtLeast(1),
        shouldRepeatOptions = false,
    )
    val scrollState = rememberScalingLazyListState()

    if (model.isPro) {
        ScreenScaffold(
            scrollState = scrollState,
            edgeButton = {
                EdgeButton(onClick = {
                    val sport = sports[sportState.selectedOptionIndex]
                    val s = Settings()
                    s.sport = sport
                    s.bestOf = formats[fmtState.selectedOptionIndex].first
                    if (ScoringEngine.isTargetSport(sport)) s.pointsTarget = 11
                    model.startMatch(s)
                }) { Text("Start") }
            },
        ) { contentPadding ->
            ScalingLazyColumn(
                state = scrollState,
                contentPadding = contentPadding,
                modifier = Modifier.fillMaxSize(),
            ) {
                item { CompactButton(onClick = onBack) { Text("‹") } }
                item {
                    Text(
                        "Local match",
                        color = MaterialTheme.colorScheme.primary,
                        style = MaterialTheme.typography.titleMedium,
                    )
                }
                item {
                    Picker(
                        state = sportState,
                        contentDescription = { "Sport: ${sportNames[sports[sportState.selectedOptionIndex]]}" },
                        modifier = Modifier.fillMaxWidth().height(72.dp),
                    ) { index -> Text(sportNames[sports[index]] ?: sports[index]) }
                }
                item {
                    Picker(
                        state = fmtState,
                        contentDescription = { "Format: ${formats[fmtState.selectedOptionIndex].second}" },
                        modifier = Modifier.fillMaxWidth().height(72.dp),
                    ) { index -> Text(formats[index].second) }
                }
            }
        }
    } else {
        ScreenScaffold(scrollState = scrollState) { contentPadding ->
            ScalingLazyColumn(
                state = scrollState,
                contentPadding = contentPadding,
                modifier = Modifier.fillMaxSize(),
            ) {
                item { CompactButton(onClick = onBack) { Text("‹") } }
                item {
                    Text(
                        "Local match",
                        color = MaterialTheme.colorScheme.primary,
                        style = MaterialTheme.typography.titleMedium,
                    )
                }
                item {
                    Text("Trial ended", style = MaterialTheme.typography.titleSmall, color = Color.White)
                }
                item {
                    Text(
                        "Unlock Pro on your phone to keep playing here.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

// MARK: - End (winner / tie)

@Composable
fun EndScreen(model: MatchModel) {
    val m = model.match
    val tie = m.winner == null
    val names = listOf("You", "Opponent")
    val setsLine = m.completedSets.joinToString("  ·  ") { "${it[0]}-${it[1]}" }
    val scrollState = rememberScalingLazyListState()

    ScreenScaffold(
        scrollState = scrollState,
        edgeButton = {
            EdgeButton(onClick = { if (model.isPro) model.rematch() else model.endMatch() }) {
                Text("New match")
            }
        },
    ) { contentPadding ->
        ScalingLazyColumn(
            state = scrollState,
            contentPadding = contentPadding,
            modifier = Modifier.fillMaxSize(),
        ) {
            item {
                Text(
                    text = if (tie) "It's a tie" else "${names[m.winner ?: 0]} win${if (m.winner == 0) "" else "s"}!",
                    color = Color.White,
                    style = MaterialTheme.typography.titleLarge,
                )
            }
            if (setsLine.isNotEmpty()) {
                item {
                    Text(
                        setsLine,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
            item { ChildButton(onClick = { model.endMatch() }, label = { Text("Home") }) }
        }
    }
}
