// Package testing contains testing utils functions.
package testing

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/sergi/go-diff/diffmatchpatch"
)

// PrettyDiff print pretty diff of expected and actual using t.Errorf().
func PrettyDiff(t *testing.T, expected, actual string) {
	t.Helper()
	dmp := diffmatchpatch.New()
	diffs := dmp.DiffMain(expected, actual, true)
	t.Errorf("\n%s", dmp.DiffPrettyText(diffs))
}

// PrettyMarshal return prettified json representation of the argument.
// Return empty string, if argument can not be represented as json.
func PrettyMarshal(toMarshall interface{}) string {
	marshalled, err := json.Marshal(toMarshall)
	if err != nil {
		return ""
	}
	var out bytes.Buffer
	err = json.Indent(&out, marshalled, "", "  ")
	if err != nil {
		return ""
	}
	return out.String()
}
