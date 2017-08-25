package serialize

import (
	"bytes"
	"strings"
	"testing"

	u "github.com/Palantir/palantir/utils/testing"
)

func TestWriteColumnsIndicators(t *testing.T) {
	testCases := []struct {
		columns  []int
		expected string
	}{
		{
			[]int{5, 5, 10, 50},
			"*---><---><--------><------------------------------------------------>\n",
		},
		{
			[]int{10, 10, 10, 10, 10, 10, 10},
			"*--------><--------><--------><--------><--------><--------><-------->\n",
		},
	}

	for _, tc := range testCases {
		resBuff := &bytes.Buffer{}
		writeColumnsIndicators(resBuff, tc.columns)
		if resBuff.String() != tc.expected {
			t.Errorf("\nExpected:\n%s\nActual:\n%s", tc.expected, resBuff.String())
		}
	}
}

func removeShieldComments(input string) string {
	var resultLines []string
	for _, line := range strings.Split(strings.TrimSuffix(input, "\n"), "\n") {
		if line == "" {
			continue
		}
		if !strings.HasPrefix(line, "*") {
			resultLines = append(resultLines, line)
		}
	}
	return strings.Join(resultLines, "\n")
}

func TestSerializer(t *testing.T) {
	for _, tc := range serializerTestCases() {
		res, err := Serialize(tc.Setup)
		expectedErr := tc.ExpectedError

		bothEmpty := expectedErr == nil && err == nil
		bothNotEmpty := expectedErr != nil && err != nil
		const noErrorMessage = "not error expected"
		const expectedActualFmt = "\nExpected:\n%s\nActual:\n%s"
		switch {
		case bothEmpty:
		case bothNotEmpty:
			if expectedErr.Error() != err.Error() {
				t.Errorf(expectedActualFmt, expectedErr.Error(), err.Error())
			}
		case expectedErr == nil:
			t.Errorf(expectedActualFmt, noErrorMessage, err.Error())
		case err == nil:
			t.Errorf(expectedActualFmt, expectedErr.Error(), noErrorMessage)
		}

		for fileName, content := range res.Files {
			// TODO remove this
			if fileName == "geo.dat" {
				continue
			}

			expected := tc.Expected[fileName]
			actual := content
			if removeShieldComments(expected) != removeShieldComments(actual) {
				t.Errorf("\nFile \"%s\"\n", fileName)
				u.PrettyDiff(t, expected, actual)
			}
		}
	}
}
