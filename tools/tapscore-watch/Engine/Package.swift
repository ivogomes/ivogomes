// swift-tools-version:5.9
import PackageDescription

// Pure scoring engine for TapScore — no watchOS/UIKit deps, so it builds & tests on macOS via `swift test`.
// The watchOS app depends on this local package; the tests mirror ../../tapscore/scoring.test.cjs.
let package = Package(
    name: "TapScoreEngine",
    products: [
        .library(name: "TapScoreEngine", targets: ["TapScoreEngine"]),
    ],
    targets: [
        .target(name: "TapScoreEngine"),
        .testTarget(name: "TapScoreEngineTests", dependencies: ["TapScoreEngine"]),
    ]
)
