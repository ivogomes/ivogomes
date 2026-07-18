import Foundation
import Observation
import TapScoreEngine

/// Owns the live match, drives the shared engine, plays haptics, and remembers the last format.
/// Scoring rules are NOT here — they live in TapScoreEngine (single source of truth).
/// Uses the @Observable macro (watchOS 10+) — views observe reads automatically, no Combine.
@Observable
final class MatchModel {
    private(set) var match: MatchState
    var active: Bool = false                      // false = show Start screen; true = scoring

    @ObservationIgnored private var history: [MatchState] = []   // undo stack (snapshots); not observed
    private static let settingsKey = "tapscore.lastSettings"

    init() {
        match = MatchState(settings: MatchModel.loadSettings())
    }

    // MARK: derived (for views)

    var pointLabels: [String] { ScoringEngine.pointDisplay(match) }
    var canUndo: Bool { !history.isEmpty }

    /// Compact set line, e.g. "SET 1-0" (racket) or "GAME 1-0" (target sports).
    var setsLine: String {
        let noun = ScoringEngine.isTargetSport(match.settings.sport) ? "GAME" : "SET"
        return "\(noun) \(match.sets[0])-\(match.sets[1])"
    }

    // MARK: actions

    func score(_ side: Int) {
        guard !match.over else { return }
        history.append(match)
        let before = match
        ScoringEngine.scorePoint(&match, side)
        if match.over {
            Haptics.matchWon()
        } else if setsTotal(match) > setsTotal(before) {
            Haptics.setWon()
        } else if gamesTotal(match) > gamesTotal(before) {
            Haptics.game()
        } else {
            Haptics.point()
        }
    }

    func undo() {
        guard let prev = history.popLast() else { return }
        match = prev
        Haptics.undo()
    }

    func startMatch(_ settings: Settings) {
        MatchModel.saveSettings(settings)
        match = MatchState(settings: settings)
        history = []
        active = true
    }

    /// Leave the current match and return to Start (no result kept).
    func endMatch() {
        active = false
    }

    /// Start a fresh match with the same settings (used from the winner screen).
    func rematch() { startMatch(match.settings) }

    // MARK: helpers

    private func setsTotal(_ m: MatchState) -> Int { m.sets[0] + m.sets[1] }
    private func gamesTotal(_ m: MatchState) -> Int { m.games[0] + m.games[1] }

    // MARK: persistence (remember the last-used format for instant standalone start)

    static func loadSettings() -> Settings {
        if let data = UserDefaults.standard.data(forKey: settingsKey),
           let s = try? JSONDecoder().decode(Settings.self, from: data) {
            return s
        }
        return Settings()   // tennis, best of 3
    }

    static func saveSettings(_ s: Settings) {
        if let data = try? JSONEncoder().encode(s) {
            UserDefaults.standard.set(data, forKey: settingsKey)
        }
    }
}
