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
    static let bg     = Color(red: 0x0b/255, green: 0x12/255, blue: 0x20/255)  // dark blue (app bg + side B)
    static let lime   = Color(red: 0xc9/255, green: 0xe6/255, blue: 0x4b/255)
    static let ink    = Color(red: 0x0b/255, green: 0x12/255, blue: 0x20/255)  // dark-blue text on lime
    static let onLime = ink
    static let gold   = Color(red: 0xf7/255, green: 0xc9/255, blue: 0x48/255)  // winner trophy

    // Scoring sides, mirroring the phone: A = lime bg + dark-blue score, B = dark-blue bg + lime score.
    static let sideA    = lime
    static let sideAInk = ink
    static let sideB    = bg
    static let sideBInk = lime

    /// Score font — Outfit if bundled, otherwise the system font (see README to add Outfit-*.ttf).
    static func score(_ size: CGFloat) -> Font { Font.custom("Outfit", size: size).weight(.heavy) }
}

// MARK: - Haptics (distinct feedback per scoring event)

enum Haptics {
    static func point()    { WKInterfaceDevice.current().play(.click) }
    static func game()     { WKInterfaceDevice.current().play(.directionUp) }
    static func setWon()   { WKInterfaceDevice.current().play(.success) }
    static func matchWon() { WKInterfaceDevice.current().play(.success) }
    static func undo()     { WKInterfaceDevice.current().play(.directionDown) }
}
