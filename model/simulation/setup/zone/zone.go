// Package zone implement Zone model.
package zone

import (
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/material"
)

// ID is key type in Zone map.
type ID int64

// RootID indicate that zone with the given number is a root.
const RootID = 0

// Zone is composed from list of bodies.
// Every Zone have Base body. Zone 3D model is created by using an pseudo algorithm:
// 	currentResult := zone.Base
// 	for _, construction := range(zone.Construction) {
//		currentResult = construction.Type(currentResult, construction.Body)
//	}
// Operations order is determined by Constructions array order.
//
// Eg: Base{cuboid}, Construction[{sphere, union}] is zone made from union of cuboid and sphere.
//
// Eg: Base{sphere}. Construction{{sphere, union}, {cuboid, intersect}] is zone made from
// intersection of cuboid and union of 2 spheres.
//
// Zones are structured as forest of B-trees.
// Parent <-> Children relationship means that children is contained entirely in parent.
// Zone is a tree root, if ID == RootID.
//
// TODO: intersections other than children <-> one parent like beetween childrens of same parent are not allowed.
type Zone struct {
	ID ID `json:"id"`

	// ID of parent. If ID == RootID then Zone is a root.
	ParentID ID `json:"parentId"`

	Childrens []ID `json:"children,omitempty"`

	Name         string       `json:"name"`
	BaseID       body.ID      `json:"baseId"`
	MaterialID   material.ID  `json:"materialId"`
	Construction []*Operation `json:"construction"`
}
