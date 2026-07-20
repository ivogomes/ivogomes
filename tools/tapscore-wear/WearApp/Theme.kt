package com.ivogomes.tapscore.wear

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily

/** Palette mirrors the phone/web app tokens; the watch is always dark. */
object Theme {
    val bg = Color(0xFF0B1220)      // dark blue (app bg + side B)
    val lime = Color(0xFFC9E64B)
    val ink = Color(0xFF0B1220)     // dark-blue text on lime
    val onLime = ink
    val gold = Color(0xFFF7C948)    // winner accent
    val danger = Color(0xFFF43F5E)  // destructive (End match)

    // Scoring sides mirror the phone: A = lime bg + dark-blue score; B = dark-blue bg + lime score.
    val sideA = lime
    val sideAInk = ink
    val sideB = bg
    val sideBInk = lime

    // Score font. Falls back to the system font until Outfit is bundled: drop outfit_bold.ttf /
    // outfit_extrabold.ttf into res/font/, then swap Default for the commented family below (see README).
    val scoreFont: FontFamily = FontFamily.Default
    // val scoreFont = FontFamily(
    //     Font(R.font.outfit_bold, FontWeight.Bold),
    //     Font(R.font.outfit_extrabold, FontWeight.ExtraBold),
    // )
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
