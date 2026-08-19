package com.ivogomes.tapscore.wear

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.AlertDialog
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.ChildButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text

// Remote-control screen: mirrors the phone's match and sends score/undo back to it.
@Composable
fun RemoteScreen(model: RemoteModel, onExit: () -> Unit) {
    when {
        !model.reachable -> Status("Open TapScore on your phone", onExit)
        !model.active -> Status("Start a match on your phone", onExit)
        model.over -> ResultMirror(model, onExit)
        else -> ScoringMirror(model, onExit)
    }
}

@Composable
private fun Status(msg: String, onExit: () -> Unit) {
    val scrollState = rememberScalingLazyListState()
    ScreenScaffold(scrollState = scrollState) { contentPadding ->
        ScalingLazyColumn(
            state = scrollState,
            contentPadding = contentPadding,
            modifier = Modifier.fillMaxSize(),
        ) {
            item { Text(msg, style = MaterialTheme.typography.bodyMedium) }
            item { ChildButton(onClick = onExit, label = { Text("Back") }) }
        }
    }
}

@Composable
private fun ResultMirror(model: RemoteModel, onExit: () -> Unit) {
    val tie = model.winner < 0
    val scrollState = rememberScalingLazyListState()
    ScreenScaffold(scrollState = scrollState) { contentPadding ->
        ScalingLazyColumn(
            state = scrollState,
            contentPadding = contentPadding,
            modifier = Modifier.fillMaxSize(),
        ) {
            item {
                Text(
                    if (tie) "It's a tie" else model.names[model.winner.coerceIn(0, 1)],
                    color = if (tie) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.tertiary,
                    style = MaterialTheme.typography.titleLarge,
                )
            }
            if (model.pill.isNotEmpty()) {
                item {
                    Text(
                        model.pill,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
            item { ChildButton(onClick = onExit, label = { Text("Back") }) }
        }
    }
}

// Full-bleed mirror of the phone's two-zone board — same rule as ScoringScreen: stays outside
// Material3 (the whole point is that each half of the screen IS the tap target). Only the pause
// menu below is a real Material3 dialog.
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ScoringMirror(model: RemoteModel, onExit: () -> Unit) {
    var showMenu by remember { mutableStateOf(false) }
    Box(Modifier.fillMaxSize().background(Theme.bg)) {
        Column(Modifier.fillMaxSize()) {
            half(Theme.sideA, Theme.sideAInk, "YOU", model.you, model.server == 0, true, Modifier.weight(1f),
                { model.score(0) }, { showMenu = true })
            half(Theme.sideB, Theme.sideBInk, "OPP", model.opp, model.server == 1, false, Modifier.weight(1f),
                { model.score(1) }, { showMenu = true })
        }
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Box(Modifier.clip(RoundedCornerShape(50)).background(Theme.bg).padding(horizontal = 10.dp, vertical = 4.dp)) {
                Text(
                    model.pill.ifEmpty { " " },
                    color = Color.White,
                    style = MaterialTheme.typography.labelMedium,
                )
            }
        }
        AlertDialog(
            visible = showMenu,
            onDismissRequest = { showMenu = false },
            title = { Text("Remote menu") },
        ) {
            item { Button(onClick = { model.undo(); showMenu = false }, label = { Text("Undo point") }) }
            item {
                Button(
                    onClick = { onExit() },
                    colors = ButtonDefaults.buttonColors(containerColor = Theme.danger, contentColor = Color.White),
                    label = { Text("Exit remote") },
                )
            }
            item { ChildButton(onClick = { showMenu = false }, label = { Text("Cancel") }) }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun half(color: Color, ink: Color, label: String, score: String, serving: Boolean, alignTop: Boolean,
                 modifier: Modifier, onScore: () -> Unit, onLong: () -> Unit) {
    Box(modifier.fillMaxWidth().background(color).combinedClickable(onClick = onScore, onLongClick = onLong)) {
        Text(
            score,
            modifier = Modifier.align(Alignment.Center),
            color = ink,
            style = MaterialTheme.typography.numeralExtraLarge,
        )
        Row(
            Modifier.align(if (alignTop) Alignment.TopStart else Alignment.BottomStart).padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(label, color = ink, style = MaterialTheme.typography.labelMedium)
            if (serving) { Spacer(Modifier.width(6.dp)); Box(Modifier.size(9.dp).clip(CircleShape).background(ink)) }
        }
    }
}
