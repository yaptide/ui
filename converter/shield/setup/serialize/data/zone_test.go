package data

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/zone"
	"github.com/stretchr/testify/assert"
)

func TestConvertTreeToZones(t *testing.T) {
	type testCase struct {
		Root *zoneTree

		ExpectedZones               []Zone
		ExpectedZoneToMaterialPairs []ZoneToMaterial
		ExpectedError               error
	}

	check := func(t *testing.T, tc testCase) {
		t.Helper()

		actualZones, actualZoneToMaterialPairs, actualErr := convertTreeToZones(tc.Root)

		assert.Equal(t, tc.ExpectedError, actualErr)
		assert.Equal(t, tc.ExpectedZones, actualZones)
		assert.Equal(t, tc.ExpectedZoneToMaterialPairs, actualZoneToMaterialPairs)
	}

	t.Run("SimpleOneZoneSurroundedByBlackhole", func(t *testing.T) {
		check(t, testCase{
			Root: &zoneTree{
				childrens: []*zoneTree{
					&zoneTree{
						childrens:  []*zoneTree{},
						baseBodyID: 1,
						operations: []operation{},
						materialID: 1,
					},
				},
				baseBodyID: 2,
				operations: []operation{},
				materialID: 2,
			},
			ExpectedError: nil,
			ExpectedZones: []Zone{
				Zone{
					ID: 1,
					Constructions: []Construction{
						Construction{
							Operation: Intersection,
							Sign:      Plus,
							BodyID:    1,
						},
					},
				},
				Zone{
					ID: 2,
					Constructions: []Construction{
						Construction{
							Operation: Intersection,
							Sign:      Plus,
							BodyID:    2,
						},
						Construction{
							Operation: Intersection,
							Sign:      Minus,
							BodyID:    1,
						},
					},
				},
			},
			ExpectedZoneToMaterialPairs: []ZoneToMaterial{
				ZoneToMaterial{ZoneID: 1, MaterialID: 1},
				ZoneToMaterial{ZoneID: 2, MaterialID: 2},
			},
		})
	})

	t.Run("Complicated", func(t *testing.T) {
		check(t, testCase{
			Root: &zoneTree{
				childrens: []*zoneTree{
					&zoneTree{
						childrens:  []*zoneTree{},
						baseBodyID: 1,
						operations: []operation{
							operation{BodyID: 2, Type: zone.Union},
							operation{BodyID: 3, Type: zone.Intersect},
							operation{BodyID: 4, Type: zone.Subtract},
						},
						materialID: 1,
					},
					&zoneTree{
						childrens:  []*zoneTree{},
						baseBodyID: 5,
						operations: []operation{
							operation{BodyID: 6, Type: zone.Union},
						},
						materialID: 1,
					},
				},
				baseBodyID: 7,
				operations: []operation{
					operation{BodyID: 8, Type: zone.Subtract},
				},
				materialID: 2,
			},

			ExpectedError: nil,
			ExpectedZones: []Zone{
				Zone{
					ID: 1,
					Constructions: []Construction{
						Construction{Operation: Intersection, Sign: Plus, BodyID: 1},
						Construction{Operation: Intersection, Sign: Plus, BodyID: 3},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 4},
						Construction{Operation: Union, Sign: Plus, BodyID: 2},
						Construction{Operation: Intersection, Sign: Plus, BodyID: 3},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 4},
					},
				},
				Zone{
					ID: 2,
					Constructions: []Construction{
						Construction{Operation: Intersection, Sign: Plus, BodyID: 5},
						Construction{Operation: Union, Sign: Plus, BodyID: 6},
					},
				},
				Zone{
					ID: 3,
					Constructions: []Construction{
						Construction{Operation: Intersection, Sign: Plus, BodyID: 7},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 8},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 1},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 2},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 5},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 6},

						Construction{Operation: Union, Sign: Plus, BodyID: 7},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 8},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 3},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 5},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 6},

						Construction{Operation: Union, Sign: Plus, BodyID: 7},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 8},
						Construction{Operation: Intersection, Sign: Plus, BodyID: 4},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 5},
						Construction{Operation: Intersection, Sign: Minus, BodyID: 6},
					},
				},
			},
			ExpectedZoneToMaterialPairs: []ZoneToMaterial{
				ZoneToMaterial{ZoneID: 1, MaterialID: 1},
				ZoneToMaterial{ZoneID: 2, MaterialID: 1},
				ZoneToMaterial{ZoneID: 3, MaterialID: 2},
			},
		})
	})
}
