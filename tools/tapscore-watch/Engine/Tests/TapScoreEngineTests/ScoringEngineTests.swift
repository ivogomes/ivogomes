import XCTest
@testable import TapScoreEngine

/// Mirrors tools/tapscore/scoring.test.cjs — the shared behaviour spec. Keep the two in lockstep.
final class ScoringEngineTests: XCTestCase {

    // helpers
    func mk(_ s: Settings) -> MatchState { MatchState(settings: s) }
    func play(_ m: inout MatchState, _ sides: [Int]) { for s in sides { ScoringEngine.scorePoint(&m, s) } }
    func pts(_ m: inout MatchState, _ side: Int, _ n: Int) { for _ in 0..<n { ScoringEngine.scorePoint(&m, side) } }

    // MARK: tennis

    func testLoveGame() {
        var m = mk(Settings(sport: "tennis"))
        XCTAssertEqual(m.server, 0)
        pts(&m, 0, 4)
        XCTAssertEqual(m.games, [1, 0])
        XCTAssertEqual(m.points, [0, 0])
        XCTAssertEqual(m.server, 1)   // serve passed
    }

    func testDeuceAdvantageWinByTwo() {
        var m = mk(Settings(sport: "tennis"))
        play(&m, [0, 0, 0, 1, 1, 1])            // 40-40
        XCTAssertEqual(ScoringEngine.pointDisplay(m), ["40", "40"])
        ScoringEngine.scorePoint(&m, 0)          // advantage 0
        XCTAssertEqual(ScoringEngine.pointDisplay(m), ["Ad", "40"])
        ScoringEngine.scorePoint(&m, 1)          // back to deuce
        XCTAssertEqual(ScoringEngine.pointDisplay(m), ["40", "40"])
        ScoringEngine.scorePoint(&m, 1); ScoringEngine.scorePoint(&m, 1)
        XCTAssertEqual(m.games, [0, 1])
        XCTAssertGreaterThanOrEqual(m.deuces, 2)
    }

    func testGoldenPoint() {
        var m = mk(Settings(sport: "tennis", advantages: 0))
        play(&m, [0, 0, 0, 1, 1, 1])            // 40-40, golden armed
        ScoringEngine.scorePoint(&m, 1)          // sudden death
        XCTAssertEqual(m.games, [0, 1])
    }

    func testWinSet6to4() {
        var m = mk(Settings(sport: "tennis"))
        for _ in 0..<4 { pts(&m, 0, 4); pts(&m, 1, 4) }  // 4-4
        pts(&m, 0, 4); pts(&m, 0, 4)                     // 6-4
        XCTAssertEqual(m.sets, [1, 0])
        XCTAssertEqual(m.completedSets[0], [6, 4])
    }

    func testTieBreak() {
        var m = mk(Settings(sport: "tennis"))
        for _ in 0..<6 { pts(&m, 0, 4); pts(&m, 1, 4) }  // 6-6
        XCTAssertTrue(m.tiebreak)
        pts(&m, 0, 7)
        XCTAssertEqual(m.sets, [1, 0])
        XCTAssertEqual(m.completedSets[0], [7, 6])
        XCTAssertFalse(m.tiebreak)
    }

    func testBestOf3EndsAtTwoSets() {
        var m = mk(Settings(sport: "tennis", bestOf: 3))
        func setFor(_ w: Int) { for _ in 0..<6 { pts(&m, w, 4) } }
        setFor(0); setFor(0)
        XCTAssertTrue(m.over)
        XCTAssertEqual(m.winner, 0)
        XCTAssertEqual(m.sets, [2, 0])
    }

    func testMatchTieBreakDecider() {
        var m = mk(Settings(sport: "tennis", bestOf: 3, decider: "matchTB"))
        func setFor(_ w: Int) { for _ in 0..<6 { pts(&m, w, 4) } }
        setFor(0); setFor(1)                     // 1-1 → decider
        XCTAssertTrue(m.tiebreak)
        XCTAssertTrue(m.matchTB)
        pts(&m, 0, 10)
        XCTAssertTrue(m.over)
        XCTAssertEqual(m.winner, 0)
        XCTAssertEqual(m.completedSets.last, [10, 0])
    }

    // MARK: table tennis

    func testTableTennisWinByTwo() {
        var m = mk(Settings(sport: "tabletennis", bestOf: 1, pointsTarget: 11))
        pts(&m, 0, 11)
        XCTAssertTrue(m.over)
        XCTAssertEqual(m.completedSets[0], [11, 0])
    }

    func testTableTennisDeuce() {
        var m = mk(Settings(sport: "tabletennis", bestOf: 1, pointsTarget: 11))
        pts(&m, 0, 10); pts(&m, 1, 10)           // 10-10
        ScoringEngine.scorePoint(&m, 0)           // 11-10, not won
        XCTAssertFalse(m.over)
        ScoringEngine.scorePoint(&m, 0)           // 12-10
        XCTAssertTrue(m.over)
        XCTAssertEqual(m.completedSets[0], [12, 10])
    }

    // MARK: badminton cap

    func testBadmintonCap() {
        var m = mk(Settings(sport: "badminton", bestOf: 1, pointsTarget: 21))
        for _ in 0..<29 { ScoringEngine.scorePoint(&m, 0); ScoringEngine.scorePoint(&m, 1) }  // 29-29
        XCTAssertEqual(m.points, [29, 29])
        XCTAssertFalse(m.over)
        ScoringEngine.scorePoint(&m, 0)           // 30 wins outright
        XCTAssertTrue(m.over)
        XCTAssertEqual(m.completedSets[0], [30, 29])
    }

    // MARK: volleyball

    func testVolleyballDecidingSet() {
        var m = mk(Settings(sport: "volleyball", bestOf: 3, pointsTarget: 25))
        pts(&m, 0, 25); pts(&m, 1, 25)           // 1-1 → deciding set
        XCTAssertEqual(ScoringEngine.currentTarget(m), 15)
        pts(&m, 0, 15)
        XCTAssertTrue(m.over)
        XCTAssertEqual(m.winner, 0)
    }

    // MARK: pickleball side-out

    func testSideOutSingles() {
        var m = mk(Settings(sport: "pickleball", mode: "singles", bestOf: 1, pointsTarget: 11, scoring: "sideout"))
        let server0 = m.server
        ScoringEngine.scorePoint(&m, 1 - server0)   // receiver wins → side-out, no point
        XCTAssertEqual(m.points, [0, 0])
        XCTAssertEqual(m.server, 1 - server0)
        ScoringEngine.scorePoint(&m, m.server)      // new server scores
        XCTAssertEqual(m.points[m.server], 1)
    }

    func testSideOutDoublesSecondServer() {
        var m = mk(Settings(sport: "pickleball", mode: "doubles", bestOf: 1, pointsTarget: 11, scoring: "sideout"))
        let s = m.server
        XCTAssertEqual(m.serverNum, 2)
        ScoringEngine.scorePoint(&m, 1 - s)         // side-out → other side serves as #1
        let s2 = m.server
        XCTAssertEqual(m.serverNum, 1)
        ScoringEngine.scorePoint(&m, 1 - s2)        // fault → 2nd server (same side keeps serve)
        XCTAssertEqual(m.server, s2)
        XCTAssertEqual(m.serverNum, 2)
    }

    // MARK: guards

    func testNoOpWhenOver() {
        var m = mk(Settings(sport: "tabletennis", bestOf: 1, pointsTarget: 11))
        pts(&m, 0, 11)
        let snap = m
        ScoringEngine.scorePoint(&m, 1)
        XCTAssertEqual(m, snap)
    }

    func testFreePlayNeverEnds() {
        var m = mk(Settings(sport: "tennis", bestOf: nil))
        for _ in 0..<10 { for _ in 0..<6 { pts(&m, 0, 4) } }
        XCTAssertFalse(m.over)
        XCTAssertGreaterThanOrEqual(m.sets[0], 10)
    }
}
