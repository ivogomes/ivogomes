package com.ivogomes.tapscore;

import android.util.Base64;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.Node;
import com.google.android.gms.wearable.Wearable;

import java.nio.charset.StandardCharsets;

// Bridges a paired Wear OS watch and the web app over the Wearable Data Layer.
//   • JS → watch:  Capacitor.Plugins.WatchLink.send({ json })  → MessageClient.sendMessage
//   • watch → JS:  incoming messages on PATH → window.__wcCommand(<json>)
// Registered from MainActivity (registerPlugin before super.onCreate). A foreground MessageClient
// listener is enough — the phone app must be open to relay into the WebView anyway.
@CapacitorPlugin(name = "WatchLink")
public class WatchLinkPlugin extends Plugin implements MessageClient.OnMessageReceivedListener {
    private static final String PATH = "/tapscore";

    @Override
    public void load() {
        Wearable.getMessageClient(getContext()).addListener(this);
    }

    @Override
    protected void handleOnDestroy() {
        try { Wearable.getMessageClient(getContext()).removeListener(this); } catch (Exception e) {}
    }

    @PluginMethod
    public void send(PluginCall call) {
        final byte[] data = (call.getString("json", "")).getBytes(StandardCharsets.UTF_8);
        Wearable.getNodeClient(getContext()).getConnectedNodes().addOnSuccessListener(nodes -> {
            MessageClient mc = Wearable.getMessageClient(getContext());
            for (Node n : nodes) mc.sendMessage(n.getId(), PATH, data);
        });
        call.resolve();
    }

    @Override
    public void onMessageReceived(MessageEvent event) {
        if (!PATH.equals(event.getPath())) return;
        final String b64 = Base64.encodeToString(event.getData(), Base64.NO_WRAP);
        if (getActivity() == null || bridge == null || bridge.getWebView() == null) return;
        getActivity().runOnUiThread(() ->
            bridge.getWebView().evaluateJavascript("window.__wcCommand && window.__wcCommand(atob('" + b64 + "'))", null));
    }
}
