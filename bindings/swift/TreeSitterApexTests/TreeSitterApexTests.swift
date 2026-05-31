import XCTest
import SwiftTreeSitter
import TreeSitterApex

final class TreeSitterApexTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_apex())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Apex grammar")
    }
}
