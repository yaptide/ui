package data

import (
	"testing"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/material"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
	"github.com/stretchr/testify/assert"
)

func TestConvertSetupZonesToZoneTreeForest(t *testing.T) {
	type testCase struct {
		ZoneMap            setup.ZoneMap
		MaterialIDToShield map[material.ID]shield.MaterialID
		BodyIDToShield     map[body.ID]shield.BodyID

		Expected      []*zoneTree
		ExpectedError error
	}

	check := func(t *testing.T, tc testCase) {
		t.Helper()

		actual, actualErr := convertSetupZonesToZoneTreeForest(tc.ZoneMap, tc.MaterialIDToShield, tc.BodyIDToShield)

		assert.Equal(t, tc.ExpectedError, actualErr)
		assert.Equal(t, tc.Expected, actual)
	}

	t.Run("SimpleOneZone", func(t *testing.T) {
		check(t, testCase{
			ZoneMap: createZoneMap(&zone.Zone{
				ID:         zone.ID(1),
				ParentID:   zone.ID(0),
				BaseID:     body.ID(1),
				MaterialID: material.ID(2),
				Construction: []*zone.Operation{
					&zone.Operation{Type: zone.Intersect, BodyID: body.ID(100)},
				},
			}),
			BodyIDToShield:     map[body.ID]shield.BodyID{1: 1, 100: 2},
			MaterialIDToShield: map[material.ID]shield.MaterialID{2: 200},
			Expected: []*zoneTree{
				&zoneTree{
					childrens:  []*zoneTree{},
					baseBodyID: 1,
					operations: []operation{operation{
						BodyID: 2,
						Type:   zone.Intersect,
					}},
					materialID: 200,
				},
			},
			ExpectedError: nil,
		})
	})

	t.Run("ManyZones", func(t *testing.T) {
		check(t, testCase{
			ZoneMap: createZoneMap(
				&zone.Zone{
					ID:         zone.ID(1),
					ParentID:   zone.ID(0),
					BaseID:     body.ID(1),
					MaterialID: material.ID(2),
					Construction: []*zone.Operation{
						&zone.Operation{Type: zone.Intersect, BodyID: body.ID(100)},
					},
				},
				&zone.Zone{
					ID:         zone.ID(2),
					ParentID:   zone.ID(1),
					BaseID:     body.ID(300),
					MaterialID: material.ID(300),
				},
			),
			BodyIDToShield:     map[body.ID]shield.BodyID{1: 1, 100: 2, 300: 3},
			MaterialIDToShield: map[material.ID]shield.MaterialID{2: 200, 300: 1},
			Expected: []*zoneTree{
				&zoneTree{
					childrens: []*zoneTree{
						&zoneTree{
							childrens:  []*zoneTree{},
							baseBodyID: 3,
							operations: []operation{},
							materialID: 1,
						},
					},
					baseBodyID: 1,
					operations: []operation{operation{
						BodyID: 2,
						Type:   zone.Intersect,
					}},
					materialID: 200,
				},
			},
			ExpectedError: nil,
		})
	})
}

func createZoneMap(zones ...*zone.Zone) setup.ZoneMap {
	res := setup.ZoneMap{}
	for _, z := range zones {
		res[z.ID] = z
	}
	return res
}
