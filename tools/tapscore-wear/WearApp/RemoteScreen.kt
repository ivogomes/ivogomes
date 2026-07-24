package com.ivogomes.tapscore.wear

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.foundation.text.BasicText
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Remote-control screen: mirrors the phone's match and sends score/undo back to it.
@OptIn(ExperimentalFoundationApi::class)
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
    Column(
        Modifier.fillMaxSize().background(Theme.bg).padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically)
    ) {
        BasicText(msg, style = TextStyle(color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center))
        PillButton("Back", Color(0xFF243247), Color.White, onClick = onExit)
    }
}

@Composable
private fun ResultMirror(model: RemoteModel, onExit: () -> Unit) {
    val tie = model.winner < 0
    Column(
        Modifier.fillMaxSize().background(Theme.bg).padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically)
    ) {
        BasicText(
            if (tie) "It's a tie" else model.names[model.winner.coerceIn(0, 1)],
            style = TextStyle(color = if (tie) Theme.lime else Theme.gold, fontSize = 20.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
        )
        if (model.pill.isNotEmpty()) BasicText(model.pill, style = TextStyle(color = Color(0xFFB6C2D9), fontSize = 14.sp, fontWeight = FontWeight.SemiBold))
        PillButton("Back", Color(0xFF243247), Color.White, onClick = onExit)
    }
}

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
            Box(Modifier.clip(androidx.compose.foundation.shape.RoundedCornerShape(50)).background(Theme.bg).padding(horizontal = 10.dp, vertical = 4.dp)) {
                BasicText(model.pill.ifEmpty { " " }, style = TextStyle(color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center))
            }
        }
        if (showMenu) {
            Box(Modifier.fillMaxSize().background(Color(0xEE0B1220)).combinedClickable(onClick = { showMenu = false }, onLongClick = {}), contentAlignment = Alignment.Center) {
                Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    PillButton("Undo point", Theme.lime, Theme.onLime) { model.undo(); showMenu = false }
                    PillButton("Exit remote", Theme.danger, Color.White) { onExit() }
                    PillButton("Cancel", Color(0xFF243247), Color.White) { showMenu = false }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun half(color: Color, ink: Color, label: String, score: String, serving: Boolean, alignTop: Boolean,
                 modifier: Modifier, onScore: () -> Unit, onLong: () -> Unit) {
    Box(modifier.fillMaxWidth().background(color).combinedClickable(onClick = onScore, onLongClick = onLong)) {
        BasicText(score, modifier = Modifier.align(Alignment.Center),
            style = TextStyle(color = ink, fontSize = 60.sp, fontWeight = FontWeight.Black, fontFamily = Theme.scoreFont))
        Row(
            Modifier.align(if (alignTop) Alignment.TopStart else Alignment.BottomStart).padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            BasicText(label, style = TextStyle(color = ink, fontSize = 13.sp, fontWeight = FontWeight.Black))
            if (serving) { Spacer(Modifier.width(6.dp)); Box(Modifier.size(9.dp).clip(CircleShape).background(ink)) }
        }
    }
}
