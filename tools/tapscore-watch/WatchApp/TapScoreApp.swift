import SwiftUI
import WatchKit

// App entry + shared theme/haptics for the TapScore Watch app.
// Add these WatchApp/*.swift files to a watchOS App target and depend on the local
// TapScoreEngine package (see README).

@main
struct TapScoreApp: App {
    @State private var model = MatchModel()   // @Observable model is owned with @State
    var body: some Scene {
        WindowGroup {
            RootView(model: model)
        }
    }
}

/// Routes between Start and Scoring based on whether a match is active.
struct RootView: View {
    var model: MatchModel   // @Observable: plain property; reads in body auto-track
    var body: some View {
        if model.active {
            ScoringView(model: model)
        } else {
            StartView(model: model)
        }
    }
}

// MARK: - Theme (mirrors the phone app's tokens; the watch is always dark)

enum Theme {
    static let bg    = Color(red: 0x0b/255, green: 0x12/255, blue: 0x20/255)
    static let azure = Color(red: 0x0e/255, green: 0xa5/255, blue: 0xe9/255)
    static let coral = Color(red: 0xf4/255, green: 0x3f/255, blue: 0x5e/255)
    static let lime  = Color(red: 0xc9/255, green: 0xe6/255, blue: 0x4b/255)
    static let onLime = Color(red: 0x0b/255, green: 0x12/255, blue: 0x20/255)
}

// MARK: - Haptics (distinct feedback per scoring event)

enum Haptics {
    static func point()    { WKInterfaceDevice.current().play(.click) }
    static func game()     { WKInterfaceDevice.current().play(.directionUp) }
    static func setWon()   { WKInterfaceDevice.current().play(.success) }
    static func matchWon() { WKInterfaceDevice.current().play(.success) }
    static func undo()     { WKInterfaceDevice.current().play(.retract) }
}
