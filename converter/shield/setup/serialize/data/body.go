package data

import (
	"fmt"
	"sort"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/common"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
)

// Body represent setup.Body,
type Body struct {
	ID         shield.BodyID
	Identifier string
	Arguments  []float64
}

func convertSetupBodies(bodyMap setup.BodyMap, simContext *shield.SimulationContext) ([]Body, map[body.ID]shield.BodyID, error) {
	result := []Body{}
	bodyIDToShield := map[body.ID]shield.BodyID{}

	bodyIds := []body.ID{}
	for k := range bodyMap {
		bodyIds = append(bodyIds, k)
	}
	sort.SliceStable(bodyIds, func(i, j int) bool { return bodyIds[i] < bodyIds[j] })

	for i, id := range bodyIds {
		nextShieldID := shield.BodyID(i + 1)
		bodyIDToShield[id] = nextShieldID
		simContext.MapBodyID[nextShieldID] = id

		body, err := convertBody(bodyMap[id])
		if err != nil {
			return nil, nil, newBodyIDError(id, err.Error())
		}
		body.ID = nextShieldID
		result = append(result, body)
	}
	return result, bodyIDToShield, nil
}

func appendBlackholeBody(bodies []Body) ([]Body, shield.BodyID, error) {
	newID := bodies[len(bodies)-1].ID + 1

	blackholeBody, err := convertCuboid(body.Cuboid{
		Center: common.Point{
			X: 0.0,
			Y: 0.0,
			Z: 0.0,
		},
		Size: common.Vec3D{
			X: 500.0,
			Y: 500.0,
			Z: 500.0,
		},
	})

	if err != nil {
		return nil, 0, err
	}

	blackholeBody.ID = newID
	return append(bodies, blackholeBody), newID, nil

}

func convertBody(b *body.Body) (Body, error) {
	switch g := b.Geometry.(type) {
	case body.Sphere:
		return convertSphere(g)
	case body.Cuboid:
		return convertCuboid(g)
	case body.Cylinder:
		return convertCylinder(g)

	default:
		return Body{}, fmt.Errorf("geometry type %T serializing not implemented", b.Geometry)
	}
}

func convertSphere(sphere body.Sphere) (Body, error) {
	if sphere.Radius <= 0.0 {
		return Body{}, fmt.Errorf("sphere radius cannot be <= 0.0")
	}

	return Body{
		Identifier: "SPH",
		Arguments:  []float64{sphere.Center.X, sphere.Center.Y, sphere.Center.Z, sphere.Radius},
	}, nil
}

func convertCuboid(cuboid body.Cuboid) (Body, error) {
	for axis, size := range map[string]float64{
		"x": cuboid.Size.X,
		"y": cuboid.Size.Y,
		"z": cuboid.Size.Z,
	} {
		if size <= 0.0 {
			return Body{}, fmt.Errorf("cuboid size in %s axis cannot be <= 0.0", axis)
		}
	}

	centerAndSizeToMinAndMax := func(center, size float64) (min, max float64) {
		min = center - size/2
		max = center + size/2
		return
	}

	minX, maxX := centerAndSizeToMinAndMax(cuboid.Center.X, cuboid.Size.X)
	minY, maxY := centerAndSizeToMinAndMax(cuboid.Center.Y, cuboid.Size.Y)
	minZ, maxZ := centerAndSizeToMinAndMax(cuboid.Center.Z, cuboid.Size.Z)

	return Body{
		Identifier: "RPP",
		Arguments:  []float64{minX, maxX, minY, maxY, minZ, maxZ},
	}, nil
}

func convertCylinder(cylinder body.Cylinder) (Body, error) {
	if cylinder.Height <= 0.0 {
		return Body{}, fmt.Errorf("cylinder height cannot be <= 0.0")
	}

	if cylinder.Radius <= 0.0 {
		return Body{}, fmt.Errorf("cylinder radius cannot be <= 0.0")
	}

	// TODO: support cylinders, which vector from the center to the opposite end of the cylinder are not parallel to [0, 1, 0].
	return Body{
		Identifier: "RCC",
		Arguments: []float64{
			cylinder.Center.X,
			cylinder.Center.Y,
			cylinder.Center.Z,
			0,
			cylinder.Height, 0,
			cylinder.Radius,
		},
	}, nil
}
