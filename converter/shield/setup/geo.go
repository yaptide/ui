package setup

import (
	"bytes"
	"fmt"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
)

func serializeGeo(shieldSerializer *ShieldSerializer) (string, error) {
	serializer := geoSerializer{
		context: shieldSerializer.Context,
		setup:   shieldSerializer.setup,
	}
	return serializer.serialize()
}

type geoSerializer struct {
	context *shield.SerializeParseContext
	setup   *setup.Setup
}

func (s *geoSerializer) serialize() (string, error) {
	geoBuff := &bytes.Buffer{}

	s.serializeTitle(geoBuff)
	err := s.serializeBodies(geoBuff)
	if err != nil {
		return "", err
	}

	err = s.serializeZones(geoBuff)
	if err != nil {
		return "", err
	}

	err = s.serializeMedia(geoBuff)
	if err != nil {
		return "", err
	}

	return geoBuff.String(), nil
}

func (s *geoSerializer) serializeTitle(geoBuff *bytes.Buffer) {
	const (
		// JDBG1 selects whether the file for017 containing the
		// geometry debugging information should be kept
		// (0) or deleted (1) after the geometry parser was initialized.
		jdbg1 = 0

		//JDBG2 describes the lower cutoff value of transportation
		// step size in powers of 10, i.e. 10e−|JDBG2|.
		jdbg2 = 0

		// empty value necessary in some cases.
		empty = ""
	)
	var (
		geoName = "Geometry TODO: why we need this field?"
	)
	writeSectionNameComment(geoBuff, "Title")

	writeColumnsIndicators(geoBuff, []int{5, 5, 10, 50})
	fmt.Fprintf(geoBuff, "%5d%5d%10s%-60s\n", jdbg1, jdbg2, empty, geoName)
}

func (s *geoSerializer) serializeBodies(geoBuff *bytes.Buffer) error {
	const empty = ""

	writeSectionNameComment(geoBuff, "Bodies")
	for _, body := range s.setup.Bodies {
		err := s.serializeBody(geoBuff, body)
		if err != nil {
			return err
		}
	}
	fmt.Fprintf(geoBuff, "  END%65s\n", empty)
	return nil
}

func (s *geoSerializer) serializeZones(geoBuff *bytes.Buffer) error {
	writeSectionNameComment(geoBuff, "Zones")
	return nil
}

func (s *geoSerializer) serializeMedia(geoBuff *bytes.Buffer) error {
	writeSectionNameComment(geoBuff, "Media")
	return nil
}

func cuboidMinAndMaxInAxis(center float64, size float64) (min float64, max float64) {
	min = center - size/2
	max = center + size/2
	return
}

func cuboidToShieldDesc(c body.Cuboid) []float64 {
	minX, maxX := cuboidMinAndMaxInAxis(c.Center.X, c.Size.X)
	minY, maxY := cuboidMinAndMaxInAxis(c.Center.Y, c.Size.Y)
	minZ, maxZ := cuboidMinAndMaxInAxis(c.Center.Z, c.Size.Z)

	return []float64{
		minX, maxX,
		minY, maxY,
		minZ, maxZ,
	}
}

func (s *geoSerializer) serializeBody(geoBuff *bytes.Buffer, setupBody *body.Body) error {
	const (
		empty = ""
	)

	type bodyEntry struct {
		Name   string
		Number shield.BodyID
		Desc   []float64
	}

	shieldID := s.context.MapBodyID[setupBody.ID]
	entry := bodyEntry{Number: shieldID}

	switch b := setupBody.Geometry.(type) {
	case body.Sphere:
		entry.Name = "SPH" // Sphere
		entry.Desc = []float64{b.Center.X, b.Center.Y, b.Center.Z, b.Radius}
	case body.Cuboid:
		entry.Name = "RPP" // Rectangular parallelepiped
		entry.Desc = cuboidToShieldDesc(b)
	case body.Cylinder:
		entry.Name = "RCC" // Right elliptical cylinder
		entry.Desc = []float64{9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0}

	default:
		return fmt.Errorf("Geometry type %T serializing not implemented", setupBody.Geometry)
	}

	writeColumnsIndicators(geoBuff, []int{2, 3, 1, 4, 10, 10, 10, 10, 10, 10})
	fmt.Fprintf(geoBuff,
		"%2s%3s%1s%4d",
		empty,
		entry.Name,
		empty,
		entry.Number,
	)

	const maxArgumentsNumberInRow = 6
	for argOffset := 0; argOffset < len(entry.Desc); argOffset += maxArgumentsNumberInRow {
		if argOffset > 0 {
			writeColumnsIndicators(geoBuff, []int{10, 10, 10, 10, 10, 10, 10})
			fmt.Fprintf(geoBuff, "%10s", empty)
		}
		for i := 0; i < maxArgumentsNumberInRow; i++ {
			if argOffset+i < len(entry.Desc) {
				fmt.Fprintf(geoBuff, "%10f", entry.Desc[argOffset+i])
			} else {
				fmt.Fprintf(geoBuff, "%10s", empty)
			}
		}
		fmt.Fprint(geoBuff, "\n")
	}

	return nil
}
