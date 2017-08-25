// Package testing contains testing utils functions.
package testing

import (
	"testing"

	"github.com/sergi/go-diff/diffmatchpatch"
)

// PrettyDiff print pretty diff of expected and actual using t.Errorf().
func PrettyDiff(t *testing.T, expected, actual string) {
	dmp := diffmatchpatch.New()
	diffs := dmp.DiffMain(expected, actual, true)
	t.Errorf("\n%s", dmp.DiffPrettyText(diffs))
}
