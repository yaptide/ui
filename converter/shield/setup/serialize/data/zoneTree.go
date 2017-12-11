package data

import (
	"fmt"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/material"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
)

type operation struct {
	BodyID shield.BodyID
	Type   zone.OperationType
}

type zoneTree struct {
	childrens []*zoneTree

	baseBodyID shield.BodyID
	operations []operation

	materialID shield.MaterialID
}

func convertSetupZonesToZoneTreeForest(
	zoneMap setup.ZoneMap,
	materialIDToShield map[material.ID]shield.MaterialID,
	bodyIDToShield map[body.ID]shield.BodyID) ([]*zoneTree, error) {

	converter := zoneConverter{
		zoneMap:            zoneMap,
		materialIDToShield: materialIDToShield,
		bodyIDToShield:     bodyIDToShield,
	}
	return converter.convertSetupZonesToZoneTreeForest()
}

type zoneConverter struct {
	zoneMap            setup.ZoneMap
	materialIDToShield map[material.ID]shield.MaterialID
	bodyIDToShield     map[body.ID]shield.BodyID
}

func (z *zoneConverter) convertSetupZonesToZoneTreeForest() ([]*zoneTree, error) {
	forest := []*zoneTree{}

	for _, zoneModel := range z.zoneMap {
		if zoneModel.ParentID == zone.RootID {
			newZoneTree, err := z.createZoneTree(zoneModel)
			if err != nil {
				return nil, err
			}
			forest = append(forest, newZoneTree)
		}
	}
	return forest, nil
}

func (z *zoneConverter) createZoneTree(zoneModel *zone.Zone) (*zoneTree, error) {
	baseBodyID, found := z.bodyIDToShield[zoneModel.BaseID]
	if !found {
		return nil, newZoneIDError(zoneModel.ID, "Cannot find body: %d", zoneModel.BaseID)
	}

	operations, err := z.convertSetupOperations(zoneModel.Construction)
	if err != nil {
		return nil, newZoneIDError(zoneModel.ID, "%s", err.Error)
	}

	materialID, found := z.materialIDToShield[zoneModel.MaterialID]
	if !found {
		return nil, newZoneIDError(zoneModel.ID, "Cannot find material: %d", zoneModel.MaterialID)
	}

	childModelIDs := []zone.ID{}
	for _, zone := range z.zoneMap {
		if zone.ParentID == zoneModel.ID {
			childModelIDs = append(childModelIDs, zone.ID)
		}
	}

	childrens := []*zoneTree{}
	for _, childModelID := range childModelIDs {
		childModel, found := z.zoneMap[childModelID]
		if !found {
			return nil, newZoneIDError(zoneModel.ID, "Can not find Children {ID: %d}", childModelID)
		}

		child, err := z.createZoneTree(childModel)
		if err != nil {
			return nil, err
		}

		childrens = append(childrens, child)
	}

	return &zoneTree{
		childrens:  childrens,
		baseBodyID: baseBodyID,
		operations: operations,
		materialID: materialID,
	}, nil
}

func (z *zoneConverter) convertSetupOperations(setupOperations []*zone.Operation) ([]operation, error) {
	operations := []operation{}
	for _, o := range setupOperations {
		bodyID, found := z.bodyIDToShield[o.BodyID]
		if !found {
			return nil, fmt.Errorf("Cannot find body: %d", o.BodyID)
		}
		operations = append(operations, operation{
			BodyID: bodyID,
			Type:   o.Type,
		})
	}
	return operations, nil
}

func surroundZoneForestWithBlackholeZone(zoneForest []*zoneTree, blackholeBodyID shield.BodyID) *zoneTree {
	return &zoneTree{
		childrens:  zoneForest,
		baseBodyID: blackholeBodyID,
		operations: []operation{},
	}
}
