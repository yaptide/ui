package serialize

import (
	"fmt"
	"strconv"
	"testing"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/converter/shield/setup/serialize/data"
	"github.com/stretchr/testify/assert"
)

func genZoneToMaterials(n int) []data.ZoneToMaterial {
	res := []data.ZoneToMaterial{}
	for i := 0; i < n; i++ {
		res = append(res, data.ZoneToMaterial{
			ZoneID:     shield.ZoneID(i),
			MaterialID: shield.MaterialID(i),
		})
	}
	return res
}

const geoTc1Expected = `    0    0          xxxxxxxxxxxxxxxxxxxxxxxxxxxxNAMExxxxxxxxxxxxxxxxxxxxxxxxxxxx
  RCC    1        0.        1.        2.        0.        3.        0.
                  4.                                                  
  RPP    2      -40.       60.      -80.      120.     14.75     45.25
  RCC    3      10.1      20.2      30.3        0.      24.4        0.
             99999.5                                                  
  SPH    4       20.       31.      0.99      0.01                    
  END
  AAA    1  +1      +3      -4    OR+2      +3      -4    
  BAA    2  +5    OR+6    
  CAA    3  +7      -8      -1      -2      -5      -6    OR+7      -8      -3    
         3  -5      -6    OR+7      -8      +4      -5      -6    
  END
    0    1    2    3    4    5    6    7    8    9   10   11   12   13
   14   15   16   17   18   19
    0    1    2    3    4    5    6    7    8    9   10   11   12   13
   14   15   16   17   18   19`

func TestSerializeGeo(t *testing.T) {
	type testCase struct {
		Input    data.Geometry
		Expected string
	}

	testCases := []testCase{
		testCase{
			Input: data.Geometry{
				Bodies: []data.Body{
					data.Body{ID: 1, Identifier: "RCC", Arguments: []float64{0.0, 1.0, 2.0, 0.0, 3.0, 0.0, 4.0}},
					data.Body{ID: 2, Identifier: "RPP", Arguments: []float64{-40.0, 60.0, -80.0, 120, 14.75, 45.25}},
					data.Body{ID: 3, Identifier: "RCC", Arguments: []float64{10.1, 20.2, 30.3, 0.0, 24.4, 0.0, 99999.5}},
					data.Body{ID: 4, Identifier: "SPH", Arguments: []float64{20.0, 31.0, 0.99, 0.01}},
				},

				Zones: []data.Zone{
					data.Zone{
						ID: 1,
						Constructions: []data.Construction{
							data.Construction{Operation: data.Intersection, Sign: data.Plus, BodyID: 1},
							data.Construction{Operation: data.Intersection, Sign: data.Plus, BodyID: 3},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 4},
							data.Construction{Operation: data.Union, Sign: data.Plus, BodyID: 2},
							data.Construction{Operation: data.Intersection, Sign: data.Plus, BodyID: 3},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 4},
						},
					},
					data.Zone{
						ID: 2,
						Constructions: []data.Construction{
							data.Construction{Operation: data.Intersection, Sign: data.Plus, BodyID: 5},
							data.Construction{Operation: data.Union, Sign: data.Plus, BodyID: 6},
						},
					},
					data.Zone{
						ID: 3,
						Constructions: []data.Construction{
							data.Construction{Operation: data.Intersection, Sign: data.Plus, BodyID: 7},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 8},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 1},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 2},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 5},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 6},

							data.Construction{Operation: data.Union, Sign: data.Plus, BodyID: 7},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 8},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 3},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 5},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 6},

							data.Construction{Operation: data.Union, Sign: data.Plus, BodyID: 7},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 8},
							data.Construction{Operation: data.Intersection, Sign: data.Plus, BodyID: 4},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 5},
							data.Construction{Operation: data.Intersection, Sign: data.Minus, BodyID: 6},
						},
					},
				},
				ZoneToMaterialPairs: genZoneToMaterials(20),
			},
			Expected: geoTc1Expected,
		},
	}

	for n, tc := range testCases {
		t.Run(strconv.Itoa(n), func(t *testing.T) {
			actual := serializeGeo(tc.Input)
			fmt.Println(actual)
			assert.Equal(t, tc.Expected, actual)
		})
	}

}
