package shield

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup"
)

var parserTestCases = []struct {
	input    *Config
	expected *setup.Object
}{
	{
		&Config{Mat: "", Beam: "", Geo: "", Detect: ""},
		&setup.Object{},
	},
}

func TestParser(t *testing.T) {

	for _, tc := range parserTestCases {
		parser := Parser{}
		_, err := parser.Parse(tc.input)

		if err != nil {
			t.Fatal(err.Error())
		}
		// TODO setup.Object compare
	}

}
