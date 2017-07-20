package result

import (
	"testing"

	"github.com/Palantir/palantir/model/test"
)

var testCases test.MarshallingCases = test.MarshallingCases{
	{
		&Result{
			Errors: map[string]string{
				"error": "some_error",
			},
		},
		`{
			"errors": {
				"error": "some_error"
			}
		}`,
	},
}

func TestSetupMarshal(t *testing.T) {
	test.Marshal(t, testCases)
}

func TestSetupUnmarshal(t *testing.T) {
	test.Unmarshal(t, testCases)
}

func TestSetupUnmarshalMarshalled(t *testing.T) {
	test.UnmarshalMarshalled(t, testCases)
}

func TestSetupMarshalUnmarshalled(t *testing.T) {
	test.MarshalUnmarshalled(t, testCases)
}
