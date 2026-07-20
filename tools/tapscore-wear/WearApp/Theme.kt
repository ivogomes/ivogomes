package com.ivogomes.tapscore.wear

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.ui.graphics.Color

/** Palette mirrors the phone/web app tokens; the watch is always dark. */
object Theme {
    val bg = Color(0xFF0B1220)
    val azure = Color(0xFF0EA5E9)   // side 0 (YOU)
    val coral = Color(0xFFF43F5E)   // side 1 (OPP)
    val lime = Color(0xFFC9E64B)    // serve dot / accents
    val onLime = Color(0xFF0B1220)  // text on lime buttons
}

/**
 * Distinct haptic feedback per scoring event (parallels the Apple Watch `WKHapticType` set).
 * Wear devices vary in how faithfully they render predefined effects; this degrades gracefully.
 */
class Haptics(context: Context) {
    private val vibrator: Vibrator? = run {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val mgr = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            mgr?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    private fun predefined(effect: Int, fallbackMs: Long) {
        val v = vibrator ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            v.vibrate(VibrationEffect.createPredefined(effect))
        } else {
            @Suppress("DEPRECATION")
            v.vibrate(fallbackMs)
        }
    }

    fun point() = predefined(VibrationEffect.EFFECT_TICK, 15)
    fun game() = predefined(VibrationEffect.EFFECT_CLICK, 30)
    fun setWon() = predefined(VibrationEffect.EFFECT_HEAVY_CLICK, 60)
    fun matchWon() = predefined(VibrationEffect.EFFECT_DOUBLE_CLICK, 90)
    fun undo() = predefined(VibrationEffect.EFFECT_TICK, 15)
}
