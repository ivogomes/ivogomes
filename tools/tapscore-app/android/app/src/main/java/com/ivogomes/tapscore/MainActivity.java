package com.ivogomes.tapscore;

import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.PointerIcon;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Volume-rocker handling for camera-shutter clickers (which send VOLUME_UP/DOWN — Android
    // swallows those for volume before the WebView sees any keydown).
    //   "off"   — leave the volume buttons alone
    //   "learn" — (setup open) intercept any volume key and remember which INPUT DEVICE sent it
    //   "play"  — intercept volume ONLY from the learned clicker device, so the phone's own volume
    //             buttons keep working during a match
    private volatile String volumeMode = "off";
    private volatile String clickerDescriptor = null;   // stable id of the clicker device (survives reconnects)
    private static final String PREFS = "tapscore", KEY_DESC = "clickerVolumeDevice";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        clickerDescriptor = getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_DESC, null);
        enableFullscreen();
        hidePointer();
        installNativeBridge();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Re-hide the bars after they're transiently revealed (swipe) or after returning to the app.
        if (hasFocus) { enableFullscreen(); hidePointer(); }
    }

    // Expose a tiny JS bridge so the web app can set the volume-capture mode.
    private void installNativeBridge() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        getBridge().getWebView().addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void setVolumeMode(String mode) { volumeMode = (mode == null) ? "off" : mode; }
        }, "TapScoreNative");
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int code = event.getKeyCode();
        if ((code == KeyEvent.KEYCODE_VOLUME_UP || code == KeyEvent.KEYCODE_VOLUME_DOWN)
                && !"off".equals(volumeMode)) {
            InputDevice dev = event.getDevice();
            String desc = (dev != null) ? dev.getDescriptor() : null;

            boolean intercept;
            if ("learn".equals(volumeMode)) {
                intercept = true;   // grab any volume key while mapping
                if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0 && desc != null) {
                    if (!desc.equals(clickerDescriptor)) {
                        clickerDescriptor = desc;   // this device is the clicker
                        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEY_DESC, desc).apply();
                    }
                }
            } else {   // "play" — only the learned clicker device; phone's own volume passes through
                intercept = (clickerDescriptor != null && clickerDescriptor.equals(desc));
            }

            if (!intercept) return super.dispatchKeyEvent(event);

            if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
                final String name = (code == KeyEvent.KEYCODE_VOLUME_UP) ? "AudioVolumeUp" : "AudioVolumeDown";
                final WebView wv = (getBridge() != null) ? getBridge().getWebView() : null;
                if (wv != null) {
                    wv.post(() -> wv.evaluateJavascript("window.__tsKey && window.__tsKey('" + name + "')", null));
                }
            }
            return true;   // swallow both down and up so the volume overlay never shows
        }
        return super.dispatchKeyEvent(event);
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
