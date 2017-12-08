package serialize

import (
	"strconv"
	"testing"

	"github.com/Palantir/palantir/converter/shield/setup/serialize/data"
	"github.com/stretchr/testify/assert"
)

const detectTc1Expected = `CYL               0.      -10.       -1.       10.       20.       30.
                  10       200      1000        -1ENERGY    ala_ma_psa0`

const detectTc2Expected = `PLANE             1.        2.        3.       -1.       -2.       -3.
                                                25LETFLU    trzy_trzy_trzy0
                  20        10       100                              
CYL               0.      -10.      -20.       10.       20.       30.
                  10       200      1000        -1ENERGY    dwa_dwa_dwa1
MSH              -5.       -5.        0.        5.        5.       30.
                   1         1       300        25COUNTER   raz_raz_raz2
                  20        10                                        `

func TestSerializeDetect(t *testing.T) {
	type testCase struct {
		Input    []data.Detector
		Expected string
	}

	testCases := []testCase{
		testCase{
			Input: []data.Detector{
				data.Detector{
					ScoringType: "CYL",
					Arguments: []interface{}{
						0.0, -10.0, -1.0, 10.0, 20.0, 30.0, int64(10), int64(200), int64(1000), int64(-1), "ENERGY", "ala_ma_psa0",
					},
				}},
			Expected: detectTc1Expected,
		},
		testCase{
			Input: []data.Detector{
				data.Detector{
					ScoringType: "PLANE",
					Arguments: []interface{}{
						1.0, 2.0, 3.0, -1.0, -2.0, -3.0,
						"", "", "", int64(25), "LETFLU", "trzy_trzy_trzy0",
						int64(20), int64(10), int64(100), "", "", "",
					},
				},
				data.Detector{
					ScoringType: "CYL",
					Arguments: []interface{}{
						0.0, -10.0, -20.0, 10.0, 20.0, 30.0,
						int64(10), int64(200), int64(1000), int64(-1), "ENERGY", "dwa_dwa_dwa1",
					},
				},
				data.Detector{
					ScoringType: "MSH",
					Arguments: []interface{}{
						-5.0, -5.0, 0.0, 5.0, 5.0, 30.0,
						int64(1), int64(1), int64(300), int64(25), "COUNTER", "raz_raz_raz2",
						int64(20), int64(10), "", "", "", "",
					},
				},
			},
			Expected: detectTc2Expected,
		},
	}

	for n, tc := range testCases {
		t.Run(strconv.Itoa(n), func(t *testing.T) {
			actual := serializeDetect(tc.Input)
			assert.Equal(t, tc.Expected, actual)
		})
	}

}
