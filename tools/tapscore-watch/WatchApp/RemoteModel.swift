import Foundation
import Observation
import WatchConnectivity

// "Remote" mode: the watch controls the match running on the phone. It sends score/undo/sync
// commands and mirrors the state the phone broadcasts. The phone stays the source of truth.
@Observable
final class RemoteModel: NSObject, WCSessionDelegate {
    var reachable = false          // phone app is in the foreground and reachable
    var active = false             // phone has a match on-screen to control
    var over = false
    var winner = -1                // 0/1, or -1 tie
    var you = "0"
    var opp = "0"
    var pill = ""
    var server = 0
    var names: [String] = ["You", "Opp"]

    override init() {
        super.init()
        if WCSession.isSupported() {
            let s = WCSession.default
            s.delegate = self
            s.activate()
        }
    }

    // MARK: commands (watch → phone)
    private func send(_ dict: [String: Any]) {
        guard WCSession.isSupported() else { return }
        let s = WCSession.default
        if s.isReachable { s.sendMessage(dict, replyHandler: nil, errorHandler: nil) }
    }
    private func cmd(_ o: [String: Any]) -> [String: Any] {
        let json = (try? JSONSerialization.data(withJSONObject: o)).flatMap { String(data: $0, encoding: .utf8) } ?? "{}"
        return ["json": json]
    }
    func score(_ side: Int) { Haptics.point(); send(cmd(["t": "score", "side": side])) }
    func undo() { Haptics.undo(); send(cmd(["t": "undo"])) }
    func requestSync() { send(cmd(["t": "sync"])) }

    // MARK: state (phone → watch)
    private func apply(_ json: String) {
        guard let d = json.data(using: .utf8),
              let o = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else { return }
        DispatchQueue.main.async {
            self.active = o["active"] as? Bool ?? false
            self.over = o["over"] as? Bool ?? false
            self.winner = o["winner"] as? Int ?? -1
            self.you = o["you"] as? String ?? "0"
            self.opp = o["opp"] as? String ?? "0"
            self.pill = o["pill"] as? String ?? ""
            self.server = o["server"] as? Int ?? 0
            if let n = o["names"] as? [String], n.count == 2 { self.names = n }
        }
    }

    // MARK: WCSessionDelegate
    func session(_ s: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async { self.reachable = (state == .activated && s.isReachable) }
        if state == .activated { requestSync() }
    }
    func sessionReachabilityDidChange(_ s: WCSession) {
        DispatchQueue.main.async { self.reachable = s.isReachable }
        if s.isReachable { requestSync() }
    }
    func session(_ s: WCSession, didReceiveMessage message: [String: Any]) {
        if let j = message["json"] as? String { apply(j) }
    }
    func session(_ s: WCSession, didReceiveApplicationContext ctx: [String: Any]) {
        if let j = ctx["json"] as? String { apply(j) }
    }
}
