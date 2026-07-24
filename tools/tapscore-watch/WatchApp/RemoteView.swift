import SwiftUI

// Remote-control screen: mirrors the phone's live match and sends score/undo back to it.
struct RemoteView: View {
    var model: RemoteModel
    var onExit: () -> Void
    @State private var crown = 0.0
    @State private var lastCrown = 0.0
    @State private var showMenu = false

    var body: some View {
        Group {
            if !model.reachable {
                status("iphone.gen3.slash", "Open TapScore on your phone")
            } else if !model.active {
                status("iphone.gen3", "Start a match on your phone")
            } else if model.over {
                result
            } else {
                scoring
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.bg)
        .onAppear { model.requestSync() }
    }

    private func status(_ icon: String, _ msg: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 30)).foregroundStyle(Theme.lime)
            Text(msg).font(.system(size: 15, weight: .semibold)).multilineTextAlignment(.center)
                .foregroundStyle(.white).padding(.horizontal, 12)
            Button("Back") { onExit() }.font(.system(size: 14))
        }
    }

    private var result: some View {
        let tie = model.winner < 0
        return VStack(spacing: 8) {
            Image(systemName: tie ? "equal.circle.fill" : "trophy.fill")
                .font(.system(size: 30)).foregroundStyle(tie ? Theme.lime : Theme.gold)
            Text(tie ? "It's a tie" : model.names[max(0, model.winner)])
                .font(.system(size: 18, weight: .heavy)).foregroundStyle(.white)
            Text(model.pill).font(.system(size: 13, weight: .semibold)).foregroundStyle(.secondary)
            Button("Back") { onExit() }.font(.system(size: 14))
        }.padding(.horizontal, 10)
    }

    private var scoring: some View {
        ZStack {
            VStack(spacing: 0) {
                Theme.sideA.contentShape(Rectangle()).onTapGesture { model.score(0) }
                Theme.sideB.contentShape(Rectangle()).onTapGesture { model.score(1) }
            }
            .ignoresSafeArea()

            VStack(spacing: 0) { cell(model.you, Theme.sideAInk); cell(model.opp, Theme.sideBInk) }
                .ignoresSafeArea().allowsHitTesting(false)

            VStack(spacing: 0) {
                label("YOU", serving: model.server == 0, ink: Theme.sideAInk)
                Spacer(minLength: 0)
                label("OPP", serving: model.server == 1, ink: Theme.sideBInk)
            }
            .allowsHitTesting(false)

            Text(model.pill.isEmpty ? " " : model.pill)
                .font(.system(size: 13, weight: .bold, design: .rounded)).foregroundStyle(.white)
                .lineLimit(1).minimumScaleFactor(0.7)
                .padding(.horizontal, 10).padding(.vertical, 4)
                .background(Capsule().fill(Theme.bg)).overlay(Capsule().stroke(.white.opacity(0.25)))
                .allowsHitTesting(false)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.bg)
        .focusable(true)
        .digitalCrownRotation($crown, from: -1000, through: 1000, by: 1, sensitivity: .low, isContinuous: true, isHapticFeedbackEnabled: false)
        .onChange(of: crown) { _, v in if v < lastCrown - 0.5 { model.undo() }; lastCrown = v }
        .onLongPressGesture(minimumDuration: 0.4) { showMenu = true }
        .confirmationDialog("Remote", isPresented: $showMenu, titleVisibility: .hidden) {
            Button("Undo last point") { model.undo() }
            Button("Exit remote", role: .destructive) { onExit() }
            Button("Cancel", role: .cancel) {}
        }
    }

    private func cell(_ s: String, _ ink: Color) -> some View {
        Text(s).font(Theme.score(64)).foregroundStyle(ink)
            .minimumScaleFactor(0.5).lineLimit(1).frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    private func label(_ t: String, serving: Bool, ink: Color) -> some View {
        HStack(spacing: 6) {
            Text(t).font(.system(size: 13, weight: .heavy)).foregroundStyle(ink.opacity(0.95))
            if serving { Circle().fill(ink).frame(width: 9, height: 9) }
            Spacer()
        }
        .padding(.horizontal, 10)
    }
}
