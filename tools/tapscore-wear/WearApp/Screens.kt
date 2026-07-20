package com.ivogomes.tapscore.wear

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ivogomes.tapscore.engine.ScoringEngine
import com.ivogomes.tapscore.engine.Settings

/** Routes between Start, Scoring, and End based on match state. */
@Composable
fun RootScreen(model: MatchModel) {
    when {
        !model.active -> StartScreen(model)
        model.match.over -> EndScreen(model)
        else -> ScoringScreen(model)
    }
}

// MARK: - Scoring (two-zone main screen)

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
        Column(Modifier.fillMaxSize()) {
            ScoreHalf(
                color = Theme.azure, label = "YOU", score = labels[0],
                serving = m.server == 0, alignTop = true,
                modifier = Modifier.weight(1f),
                onScore = { model.score(0) }, onLong = { showMenu = true }
            )
            ScoreHalf(
                color = Theme.coral, label = "OPP", score = labels[1],
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
                BasicText(
                    text = if (tie) "TIE-BREAK" else model.scorePill,
                    style = TextStyle(
                        color = if (tie) Theme.lime else Color.White,
                        fontSize = 13.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center
                    )
                )
            }
        }

        if (showMenu) MatchMenu(model, onDismiss = { showMenu = false })
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ScoreHalf(
    color: Color, label: String, score: String, serving: Boolean, alignTop: Boolean,
    modifier: Modifier, onScore: () -> Unit, onLong: () -> Unit,
) {
    Box(
        modifier
            .fillMaxWidth()
            .background(color)
            .combinedClickable(onClick = onScore, onLongClick = onLong)
    ) {
        // Big score dead-center of the half.
        BasicText(
            text = score,
            modifier = Modifier.align(Alignment.Center),
            style = TextStyle(color = Color.White, fontSize = 60.sp, fontWeight = FontWeight.Black)
        )
        // Label + serve dot pinned to the outer edge (top for YOU, bottom for OPP).
        Row(
            Modifier
                .align(if (alignTop) Alignment.TopStart else Alignment.BottomStart)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            BasicText(text = label, style = TextStyle(color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Black))
            if (serving) {
                Spacer(Modifier.width(6.dp))
                Box(Modifier.size(9.dp).clip(CircleShape).background(Theme.lime))
            }
        }
    }
}

@Composable
private fun MatchMenu(model: MatchModel, onDismiss: () -> Unit) {
    Box(
        Modifier
            .fillMaxSize()
            .background(Color(0xEE0B1220))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.Center
    ) {
        Column(
            Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (model.canUndo) {
                PillButton("Undo point", Theme.azure, Color.White) { model.undo(); onDismiss() }
            }
            PillButton("End match", Theme.coral, Color.White) { model.endMatch(); onDismiss() }
            PillButton("Cancel", Color(0xFF243247), Color.White, onClick = onDismiss)
        }
    }
}

// MARK: - Start (standalone quick launch)

@Composable
fun StartScreen(model: MatchModel) {
    val sports = listOf("tennis", "padel", "tabletennis", "pickleball", "squash", "badminton", "volleyball", "beachvolley")
    val sportNames = mapOf(
        "tennis" to "Tennis", "padel" to "Padel", "tabletennis" to "Table tennis",
        "pickleball" to "Pickleball", "squash" to "Squash", "badminton" to "Badminton",
        "volleyball" to "Volleyball", "beachvolley" to "Beach volley"
    )
    val formats = listOf(1 to "1 set", 3 to "Best of 3", 5 to "Best of 5")

    val saved = remember { model.loadSettings() }
    var sportIdx by remember { mutableStateOf(sports.indexOf(saved.sport).coerceAtLeast(0)) }
    var fmtIdx by remember { mutableStateOf(formats.indexOfFirst { it.first == (saved.bestOf ?: 3) }.coerceAtLeast(1)) }

    Column(
        Modifier
            .fillMaxSize()
            .background(Theme.bg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 12.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        BasicText("TapScore", style = TextStyle(color = Theme.lime, fontSize = 22.sp, fontWeight = FontWeight.Black))
        // Tap to cycle sport / format (compact, Wear-friendly — no fiddly pickers).
        PillButton(sportNames[sports[sportIdx]] ?: sports[sportIdx], Color(0xFF243247), Color.White) {
            sportIdx = (sportIdx + 1) % sports.size
        }
        PillButton(formats[fmtIdx].second, Color(0xFF243247), Color.White) {
            fmtIdx = (fmtIdx + 1) % formats.size
        }
        PillButton("Start", Theme.lime, Theme.onLime) {
            val sport = sports[sportIdx]
            val s = Settings()
            s.sport = sport
            s.bestOf = formats[fmtIdx].first
            if (ScoringEngine.isTargetSport(sport)) s.pointsTarget = 11
            model.startMatch(s)
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

    Column(
        Modifier
            .fillMaxSize()
            .background(Theme.bg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 14.dp, vertical = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        BasicText(
            text = if (tie) "It's a tie" else "${names[m.winner ?: 0]} win${if (m.winner == 0) "" else "s"}!",
            style = TextStyle(color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
        )
        if (setsLine.isNotEmpty()) {
            BasicText(setsLine, style = TextStyle(color = Color(0xFFB6C2D9), fontSize = 15.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center))
        }
        PillButton("New match", Theme.lime, Theme.onLime) { model.rematch() }
        PillButton("Home", Color(0xFF243247), Color.White) { model.endMatch() }
    }
}

// MARK: - Shared button

@Composable
private fun PillButton(text: String, bg: Color, fg: Color, onClick: () -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(bg)
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        BasicText(text, style = TextStyle(color = fg, fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center))
    }
}
