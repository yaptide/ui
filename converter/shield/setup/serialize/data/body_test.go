package data

import (
	"testing"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/common"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/stretchr/testify/assert"
)

func TestSuccessfullBodiesConvert(t *testing.T) {
	type testCase struct {
		Input    setup.BodyMap
		Expected []Body
	}

	check := func(t *testing.T, tc testCase) {
		t.Helper()

		simContext := shield.NewSimulationContext()
		actual, _, actualErr := convertSetupBodies(tc.Input, simContext)

		assert.Equal(t, nil, actualErr)
		assert.Equal(t, tc.Expected, actual)
	}

	t.Run("Sphere", func(t *testing.T) {
		check(t, testCase{
			Input: createBodyMap(&body.Body{
				ID: 1,
				Geometry: body.Sphere{
					Center: common.Point{X: 20.0, Y: 31.0, Z: 0.99},
					Radius: 0.01,
				},
			}),
			Expected: []Body{Body{ID: 1, Identifier: "SPH", Arguments: []float64{20.0, 31.0, 0.99, 0.01}}},
		})
	})

	t.Run("Cuboid", func(t *testing.T) {
		check(t, testCase{
			Input: createBodyMap(&body.Body{
				ID: 1,
				Geometry: body.Cuboid{
					Center: common.Point{X: 10.0, Y: 20.0, Z: 30.0},
					Size:   common.Vec3D{X: 100.0, Y: 200.0, Z: 30.5},
				},
			}),
			Expected: []Body{Body{ID: 1, Identifier: "RPP", Arguments: []float64{-40.0, 60.0, -80.0, 120.0, 14.75, 45.25}}},
		})
	})

	t.Run("Cylinder", func(t *testing.T) {
		check(t, testCase{
			Input: createBodyMap(&body.Body{
				ID: 1,
				Geometry: body.Cylinder{
					Center: common.Point{X: 10.1, Y: 20.2, Z: 30.3},
					Height: 24.4,
					Radius: 99.5,
				},
			}),
			Expected: []Body{Body{ID: 1, Identifier: "RCC", Arguments: []float64{10.1, 20.2, 30.3, 0.0, 24.4, 0.0, 99.5}}},
		})
	})

	t.Run("ManyMixed", func(t *testing.T) {
		check(t, testCase{
			Input: createBodyMap(
				&body.Body{
					ID: 3,
					Geometry: body.Cylinder{Center: common.Point{X: 10.1, Y: 20.2, Z: 30.3},
						Height: 24.4,
						Radius: 99.5,
					},
				},
				&body.Body{
					ID: 4,
					Geometry: body.Sphere{
						Center: common.Point{X: 20.0, Y: 31.0, Z: 0.99},
						Radius: 0.01,
					},
				},
				&body.Body{
					ID: 1,
					Geometry: body.Cylinder{
						Center: common.Point{X: 0.0, Y: 1.0, Z: 2.0},
						Height: 3.0,
						Radius: 4.0,
					},
				},
				&body.Body{
					ID: 2,
					Geometry: body.Cuboid{
						Center: common.Point{X: 10.0, Y: 20.0, Z: 30.0},
						Size:   common.Vec3D{X: 100.0, Y: 200.0, Z: 30.5},
					},
				},
			),
			Expected: []Body{
				Body{ID: 1, Identifier: "RCC", Arguments: []float64{0.0, 1.0, 2.0, 0.0, 3.0, 0.0, 4.0}},
				Body{ID: 2, Identifier: "RPP", Arguments: []float64{-40.0, 60.0, -80.0, 120, 14.75, 45.25}},
				Body{ID: 3, Identifier: "RCC", Arguments: []float64{10.1, 20.2, 30.3, 0.0, 24.4, 0.0, 99.5}},
				Body{ID: 4, Identifier: "SPH", Arguments: []float64{20.0, 31.0, 0.99, 0.01}},
			},
		},
		)
	})
}

func TestAppendBlackholeBody(t *testing.T) {

	inputBodies := []Body{
		Body{ID: 1, Identifier: "RCC", Arguments: []float64{0.0, 1.0, 2.0, 0.0, 3.0, 0.0, 4.0}},
		Body{ID: 2, Identifier: "RPP", Arguments: []float64{-40.0, 60.0, -80.0, 120, 14.75, 45.25}},
		Body{ID: 3, Identifier: "RCC", Arguments: []float64{10.1, 20.2, 30.3, 0.0, 24.4, 0.0, 99.5}},
		Body{ID: 4, Identifier: "SPH", Arguments: []float64{20.0, 31.0, 0.99, 0.01}}}

	const expectedBlackholeBodyID shield.BodyID = 5

	expectedBodiesAfterAppend := []Body{
		Body{ID: 1, Identifier: "RCC", Arguments: []float64{0.0, 1.0, 2.0, 0.0, 3.0, 0.0, 4.0}},
		Body{ID: 2, Identifier: "RPP", Arguments: []float64{-40.0, 60.0, -80.0, 120, 14.75, 45.25}},
		Body{ID: 3, Identifier: "RCC", Arguments: []float64{10.1, 20.2, 30.3, 0.0, 24.4, 0.0, 99.5}},
		Body{ID: 4, Identifier: "SPH", Arguments: []float64{20.0, 31.0, 0.99, 0.01}},
		Body{ID: expectedBlackholeBodyID, Identifier: "RPP", Arguments: []float64{-250.0, 250.0, -250.0, 250.0, -250.0, 250.0}}}

	bodiesAfterAppend, blackholeBodyID, err := appendBlackholeBody(inputBodies)

	assert.Equal(t, nil, err)
	assert.Equal(t, expectedBodiesAfterAppend, bodiesAfterAppend)
	assert.Equal(t, expectedBlackholeBodyID, blackholeBodyID)
}

func createBodyMap(bodies ...*body.Body) setup.BodyMap {
	res := setup.BodyMap{}
	for _, b := range bodies {
		res[b.ID] = b
	}
	return res
}
