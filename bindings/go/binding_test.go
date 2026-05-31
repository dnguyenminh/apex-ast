package tree_sitter_apex_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_apex "github.com/dnguyenminh/apex-ast/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_apex.Language())
	if language == nil {
		t.Errorf("Error loading Apex grammar")
	}
}
