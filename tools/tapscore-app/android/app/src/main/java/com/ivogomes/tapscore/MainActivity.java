package com.ivogomes.tapscore;

import android.os.Build;
import android.os.Bundle;
import android.view.PointerIcon;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        enableFullscreen();
        hidePointer();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Re-hide the bars after they're transiently revealed (swipe) or after returning to the app.
        if (hasFocus) { enableFullscreen(); hidePointer(); }
    }

    // A Bluetooth clicker enumerates as a mouse and draws a system cursor over the WebView.
    // CSS `cursor: none` doesn't suppress Android's OS pointer, so hide it natively (API 24+).
    private void hidePointer() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N
            && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setPointerIcon(PointerIcon.getSystemIcon(this, PointerIcon.TYPE_NULL));
        }
    }

    private void enableFullscreen() {
        // Draw the WebView edge-to-edge, behind the system bars (matches the PWA's display:fullscreen).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Extend content into the display cutout (camera notch) so there's no letterbox in landscape.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R)
                    ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                    : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        // Hide the status + navigation bars; a swipe from the edge reveals them transiently.
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
