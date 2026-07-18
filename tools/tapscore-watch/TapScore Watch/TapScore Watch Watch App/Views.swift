import SwiftUI
import TapScoreEngine

// MARK: - Scoring (the two-zone main screen)

struct ScoringView: View {
    var model: MatchModel   // @Observable: reads auto-track
    @State private var crown = 0.0
    @State private var lastCrown = 0.0
    @State private var showMenu = false

    var body: some View {
        if model.match.over {
            EndView(model: model)
        } else {
            scoring
        }
    }

    private var scoring: some View {
        let m = model.match
        let labels = model.pointLabels
        return ZStack {
            // Full-bleed tappable color halves (they own the taps).
            VStack(spacing: 0) {
                Theme.azure.contentShape(Rectangle()).onTapGesture { model.score(0) }
                Theme.coral.contentShape(Rectangle()).onTapGesture { model.score(1) }
            }
            .ignoresSafeArea()

            // Scores: full-bleed halves that match the colors exactly, so each number is
            // dead-center of its blue/red area.
            VStack(spacing: 0) {
                scoreCell(labels[0])
                scoreCell(labels[1])
            }
            .ignoresSafeArea()
            .allowsHitTesting(false)

            // Labels + serve dots stay inside the safe area (clear of the clock and bezel).
            VStack(spacing: 0) {
                labelRow("YOU", serving: m.server == 0)
                Spacer(minLength: 0)
                labelRow("OPP", serving: m.server == 1)
            }
            .allowsHitTesting(false)

            // Scoreline / tie pill sits on the split line.
            Text(m.tiebreak ? "TIE-BREAK" : model.scorePill)
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundStyle(m.tiebreak ? Theme.lime : .white)
                .lineLimit(1).minimumScaleFactor(0.7)
                .padding(.horizontal, 10).padding(.vertical, 4)
                .background(Capsule().fill(Theme.bg))
                .overlay(Capsule().stroke(m.tiebreak ? Theme.lime.opacity(0.6) : .white.opacity(0.25)))
                .allowsHitTesting(false)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.bg)
        .focusable(true)
        // Digital Crown → undo (each downward notch). Sensitivity may need on-device tuning.
        .digitalCrownRotation($crown, from: -1000, through: 1000, by: 1,
                              sensitivity: .low, isContinuous: true, isHapticFeedbackEnabled: false)
        .onChange(of: crown) { _, newValue in
            if newValue < lastCrown - 0.5 { model.undo() }
            lastCrown = newValue
        }
        .onLongPressGesture(minimumDuration: 0.4) { showMenu = true }
        .confirmationDialog("Match", isPresented: $showMenu, titleVisibility: .hidden) {
            if model.canUndo { Button("Undo last point") { model.undo() } }
            Button("End match", role: .destructive) { model.endMatch() }
            Button("Cancel", role: .cancel) {}
        }
    }

    /// A large score centered in one full-bleed half.
    private func scoreCell(_ score: String) -> some View {
        Text(score)
            .font(.system(size: 64, weight: .heavy, design: .rounded))
            .foregroundStyle(.white).minimumScaleFactor(0.5).lineLimit(1)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func labelRow(_ label: String, serving: Bool) -> some View {
        HStack(spacing: 6) {
            Text(label).font(.system(size: 13, weight: .heavy)).foregroundStyle(.white.opacity(0.95))
            if serving { Circle().fill(Theme.lime).frame(width: 9, height: 9) }
            Spacer()
        }
    }
}

// MARK: - Start (standalone quick launch)

struct StartView: View {
    var model: MatchModel   // @Observable: reads auto-track
    private let sports = ["tennis", "padel", "tabletennis", "pickleball", "squash", "badminton", "volleyball", "beachvolley"]
    private let sportNames = ["tennis": "Tennis", "padel": "Padel", "tabletennis": "Table tennis",
                              "pickleball": "Pickleball", "squash": "Squash", "badminton": "Badminton",
                              "volleyball": "Volleyball", "beachvolley": "Beach volley"]
    @State private var sport = MatchModel.loadSettings().sport
    @State private var bestOf = MatchModel.loadSettings().bestOf ?? 3

    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                Text("TapScore").font(.system(size: 22, weight: .heavy)).foregroundStyle(Theme.lime)
                Picker("Sport", selection: $sport) {
                    ForEach(sports, id: \.self) { Text(sportNames[$0] ?? $0).tag($0) }
                }.frame(height: 60)
                Picker("Format", selection: $bestOf) {
                    Text("1 set").tag(1); Text("Best of 3").tag(3); Text("Best of 5").tag(5)
                }.frame(height: 60)
                Button {
                    var s = Settings()
                    s.sport = sport
                    s.bestOf = bestOf
                    s.pointsTarget = ScoringEngine.isTargetSport(sport) ? 11 : s.pointsTarget
                    model.startMatch(s)
                } label: {
                    Text("Start").font(.system(size: 17, weight: .bold)).frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent).tint(Theme.lime).foregroundStyle(Theme.onLime)
            }
            .padding(.horizontal, 6)
        }
    }
}

// MARK: - End (winner / tie)

struct EndView: View {
    var model: MatchModel   // @Observable: reads auto-track
    var body: some View {
        let m = model.match
        let tie = (m.winner == nil)
        let names = ["You", "Opponent"]
        return ScrollView {
            VStack(spacing: 8) {
                Image(systemName: tie ? "equal.circle.fill" : "trophy.fill")
                    .font(.system(size: 34)).foregroundStyle(Theme.lime)
                Text(tie ? "It's a tie" : "\(names[m.winner ?? 0]) win\(m.winner == 0 ? "" : "s")!")
                    .font(.system(size: 20, weight: .heavy)).foregroundStyle(.white)
                Text(m.completedSets.map { "\($0[0])-\($0[1])" }.joined(separator: " · "))
                    .font(.system(size: 15, weight: .semibold)).foregroundStyle(.secondary)
                Button { model.rematch() } label: {
                    Text("New match").font(.system(size: 15, weight: .bold)).frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent).tint(Theme.lime).foregroundStyle(Theme.onLime)
                Button("Home") { model.endMatch() }.font(.system(size: 14))
            }
            .padding(.horizontal, 8).padding(.top, 6)
        }
    }
}
