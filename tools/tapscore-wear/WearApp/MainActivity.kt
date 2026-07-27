package com.ivogomes.tapscore.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext

/**
 * Entry point for the TapScore Wear OS app. A Wear app is inherently full-screen;
 * the scoring UI paints edge-to-edge behind the system time.
 *
 * Two modes: standalone ([MatchModel] owns the match, scored by the shared engine) and
 * remote ([RemoteModel] drives the match on the phone over the Wearable Data Layer).
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Swaps MainActivityTheme.Starting for its postSplashScreenTheme; must run before setContent.
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContent {
            val context = LocalContext.current
            val model = remember { MatchModel(context) }
            val remote = remember { RemoteModel(context) }
            var remoteMode by remember { mutableStateOf(false) }
            DisposableEffect(remoteMode) {
                if (remoteMode) remote.start()
                onDispose { if (remoteMode) remote.stop() }
            }
            if (remoteMode) RemoteScreen(remote, onExit = { remoteMode = false })
            else RootScreen(model, onRemote = { remoteMode = true })
        }
    }
}
