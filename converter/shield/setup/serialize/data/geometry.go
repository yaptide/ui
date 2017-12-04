package data

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/material"
)

// Geometry represent ready to serialize data for geo.dat file.
type Geometry struct {
	Bodies              []Body
	Zones               []Zone
	ZoneToMaterialPairs []ZoneToMaterial
}

func convertSetupGeometry(bodyMap setup.BodyMap, zoneMap setup.ZoneMap, materialIDToShield map[material.ID]shield.MaterialID, simContext *shield.SimulationContext) (Geometry, error) {
	bodies, bodyIDToShield, err := convertSetupBodies(bodyMap, simContext)
	if err != nil {
		return Geometry{}, err
	}

	bodiesWithBlackhole, blackholeBodyID, err := appendBlackholeBody(bodies)
	if err != nil {
		return Geometry{}, err
	}

	zoneForest, err := convertSetupZonesToZoneTreeForest(zoneMap, materialIDToShield, bodyIDToShield)
	if err != nil {
		return Geometry{}, err
	}

	root := surroundZoneForestWithBlackholeZone(zoneForest, blackholeBodyID)

	zones, zoneToMaterialPairs, err := convertTreeToZones(root)
	if err != nil {
		return Geometry{}, err
	}

	return Geometry{
		Bodies:              bodiesWithBlackhole,
		Zones:               zones,
		ZoneToMaterialPairs: zoneToMaterialPairs,
	}, nil

}
