package shield

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup"
)

var parserTestCases = []struct {
	input    *Config
	expected *setup.Setup
}{
	{
		&Config{Mat: "", Beam: "", Geo: "", Detect: ""},
		&setup.Setup{},
	},
}

func TestParser(t *testing.T) {

	for _, tc := range parserTestCases {
		parser := Parser{}
		_, err := parser.Parse(tc.input)

		if err != nil {
			t.Fatal(err.Error())
		}
		// TODO setup.Setup compare
	}

}
