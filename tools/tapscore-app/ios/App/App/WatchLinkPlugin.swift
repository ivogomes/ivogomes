import Foundation
import Capacitor
import WatchConnectivity

// Bridges the paired Apple Watch and the web app.
//   • JS → watch:  Capacitor.Plugins.WatchLink.send({ json })  → sent over WCSession
//   • watch → JS:  incoming WCSession messages → window.__wcCommand(<json>)
// Register it from a CAPBridgeViewController subclass (see MainViewController.swift).
@objc(WatchLinkPlugin)
public class WatchLinkPlugin: CAPPlugin, CAPBridgedPlugin, WCSessionDelegate {
    public let identifier = "WatchLinkPlugin"
    public let jsName = "WatchLink"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "send", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        if WCSession.isSupported() {
            let s = WCSession.default
            s.delegate = self
            s.activate()
        }
    }

    // JS → watch. sendMessage delivers instantly when the watch app is reachable; otherwise we stash
    // the latest state in the application context so the watch has it as soon as it opens.
    @objc func send(_ call: CAPPluginCall) {
        let json = call.getString("json") ?? ""
        if WCSession.isSupported() {
            let s = WCSession.default
            if s.activationState == .activated {
                if s.isReachable {
                    s.sendMessage(["json": json], replyHandler: nil, errorHandler: nil)
                }
                try? s.updateApplicationContext(["json": json])
            }
        }
        call.resolve()
    }

    // Passive reachability read for the "Test connection" flow in Settings. `reachable` is true only
    // when the watch app is in the foreground and linked (WCSession.isReachable); paired/installed let
    // the UI tell "no watch" apart from "watch app not open".
    @objc func getStatus(_ call: CAPPluginCall) {
        var supported = false, reachable = false, paired = false, installed = false
        if WCSession.isSupported() {
            supported = true
            let s = WCSession.default
            if s.activationState == .activated {
                reachable = s.isReachable
                paired = s.isPaired
                installed = s.isWatchAppInstalled
            }
        }
        call.resolve(["supported": supported, "reachable": reachable, "paired": paired, "installed": installed])
    }

    // watch → JS. base64 keeps the payload safe inside the evaluated JS string literal.
    private func forward(_ json: String) {
        let b64 = Data(json.utf8).base64EncodedString()
        DispatchQueue.main.async {
            self.bridge?.webView?.evaluateJavaScript(
                "window.__wcCommand && window.__wcCommand(atob('\(b64)'))", completionHandler: nil)
        }
    }

    // MARK: WCSessionDelegate
    public func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        if let json = message["json"] as? String { forward(json) }
    }
    public func session(_ session: WCSession, didReceiveApplicationContext ctx: [String: Any]) {
        if let json = ctx["json"] as? String { forward(json) }
    }
    public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}
    public func sessionDidBecomeInactive(_ session: WCSession) {}
    public func sessionDidDeactivate(_ session: WCSession) { session.activate() }
}
