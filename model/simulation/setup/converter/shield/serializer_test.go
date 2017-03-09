package shield

import (
	"encoding/json"
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup"
)

var serializerTestCases = []struct {
	input    *setup.Object
	expected *Config
}{
	{
		&setup.Object{},
		&Config{Mat: "", Beam: "", Geo: "", Detect: ""},
	},
}

func TestSerializer(t *testing.T) {
	for _, tc := range serializerTestCases {
		serializer := Serializer{}
		res, err := serializer.Serialize(tc.input)

		if err != nil {
			t.Fatal(err.Error())
		}

		if *res != *tc.expected {
			tmp, _ := json.Marshal(*tc.expected)
			expected := string(tmp)
			tmp, _ = json.Marshal(*res)
			sres := string(tmp)
			t.Errorf("serializer.Serialize(): expected: %s, actual: %s", expected, sres)
		}
	}

}
