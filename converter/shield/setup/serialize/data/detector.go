package data

import (
	"bytes"
	"fmt"
	"sort"
	"unicode"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/common"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/detector"
	"github.com/Palantir/palantir/model/simulation/setup/material"
)

// Detector represent setup.Detector,
type Detector struct {
	ScoringType string

	// Argument can be int64, float64 or string.
	Arguments []interface{}
}

func convertSetupDetectors(detectorsMap setup.DetectorMap, materialIDToShield map[material.ID]shield.MaterialID, simContext *shield.SimulationContext) ([]Detector, error) {
	result := []Detector{}
	detectIds := []detector.ID{}
	for k := range detectorsMap {
		detectIds = append(detectIds, k)
	}
	sort.SliceStable(detectIds, func(i, j int) bool { return detectIds[i] < detectIds[j] })

	detectorConverter := detectorConverter{materialIDToShield}

	uniqNameSet := map[string]detector.ID{}
	for n, id := range detectIds {
		setupDetector := detectorsMap[id]

		duplicateID, foundDuplicate := uniqNameSet[setupDetector.Name]
		if foundDuplicate {
			return nil,
				newGeneralDetectorError("Found name duplicates: \"%s\" for detector Ids: %d and %d", setupDetector.Name, id, duplicateID)
		}
		uniqNameSet[setupDetector.Name] = setupDetector.ID

		filename := createDetectorFileName(setupDetector.Name, n)
		simContext.MapFilenameToDetectorID[filename] = setupDetector.ID

		detector, err := detectorConverter.convertDetector(setupDetector, filename)
		if err != nil {
			return nil, err
		}

		result = append(result, detector)
	}
	return result, nil
}

type detectorConverter struct {
	materialIDToShield map[material.ID]shield.MaterialID
}

func (d detectorConverter) convertDetector(detect *detector.Detector, filename string) (Detector, error) {
	switch geo := detect.DetectorGeometry.(type) {
	case detector.Geomap:
		return Detector{}, newGeneralDetectorError("Geomap detector serialization not implemented")
	case detector.Zone:
		return Detector{}, newGeneralDetectorError("Zone detector serialization not implemented")

	case detector.Cylinder:
		return d.convertStandardGeometryDetector(detect, filename)
	case detector.Mesh:
		return d.convertStandardGeometryDetector(detect, filename)
	case detector.Plane:
		return d.convertStandardGeometryDetector(detect, filename)

	default:
		return Detector{}, newDetectorIDError(detect.ID, "Unkown detector type: %T", geo)
	}
}

func (d detectorConverter) convertStandardGeometryDetector(detect *detector.Detector, filename string) (Detector, error) {
	var newDetector Detector

	switch geo := detect.DetectorGeometry.(type) {
	case detector.Cylinder:
		newDetector = Detector{
			ScoringType: "CYL",
			Arguments: []interface{}{
				geo.Radius.Min,
				geo.Angle.Min,
				geo.ZValue.Min,
				geo.Radius.Max,
				geo.Angle.Max,
				geo.ZValue.Max,

				geo.Slices.Radius,
				geo.Slices.Angle,
				geo.Slices.Z,
			},
		}
	case detector.Mesh:
		xMin, xMax := centerAndSizeToMinAndMax(geo.Center.X, geo.Size.Y)
		yMin, yMax := centerAndSizeToMinAndMax(geo.Center.Y, geo.Size.Y)
		zMin, zMax := centerAndSizeToMinAndMax(geo.Center.Z, geo.Size.Z)
		newDetector = Detector{
			ScoringType: "MSH",
			Arguments: []interface{}{
				xMin,
				yMin,
				zMin,
				xMax,
				yMax,
				zMax,

				geo.Slices.X,
				geo.Slices.Y,
				geo.Slices.Z,
			},
		}
	case detector.Plane:
		newDetector = Detector{
			ScoringType: "PLANE",
			Arguments: []interface{}{
				geo.Point.X,
				geo.Point.Y,
				geo.Point.Z,
				geo.Normal.X,
				geo.Normal.Y,
				geo.Normal.Z,
				"",
				"",
				"",
			},
		}

	}

	particleInShieldFormat, err := MapParticleToShieldParticleID(detect.ScoredParticle)
	if err != nil {
		return Detector{}, newDetectorIDError(detect.ID, "%s", err.Error())
	}

	scoringInShield, err := mapScoringToShield(detect.ScoringType)
	if err != nil {
		return Detector{}, newDetectorIDError(detect.ID, "%s", err.Error())
	}

	newDetector.Arguments = append(newDetector.Arguments,
		particleInShieldFormat,
		scoringInShield,
		filename,
	)

	newDetector.Arguments, err = d.appendHeavyIonOrLetfluCard(newDetector.Arguments, detect.ScoredParticle, detect.ScoringType)
	if err != nil {
		return Detector{}, newDetectorIDError(detect.ID, "%s", err.Error())
	}
	return newDetector, nil
}

// TODO: we need A and Z if partile is not HeavyIon and scoring is LetTypeScoring
func (d detectorConverter) appendHeavyIonOrLetfluCard(arguments []interface{}, particle common.Particle, scoringType detector.ScoringType) ([]interface{}, error) {
	switch part := particle.(type) {
	case common.HeavyIon:
		arguments = append(arguments, part.NucleonsCount, part.Charge)
		switch scoring := scoringType.(type) {
		case detector.LetTypeScoring:
			material, found := d.materialIDToShield[scoring.Material]
			if !found {
				return nil, fmt.Errorf("Can not found Material{ID: %d} for LetTypeScoring", scoring.Material)
			}
			arguments = append(arguments, int64(material))
		default:
			arguments = append(arguments, "")
		}
		return append(arguments, "", "", ""), nil
	default:
		return arguments, nil
	}
}

func createDetectorFileName(name string, detectorN int) string {
	buff := &bytes.Buffer{}

	for _, c := range name {
		switch {
		case unicode.IsDigit(c):
			buff.WriteRune(c)
		case c <= unicode.MaxASCII && unicode.IsLetter(c):
			buff.WriteRune(unicode.ToLower(c))
		default:
			buff.WriteString("_")
		}
	}

	fmt.Fprintf(buff, "%d", detectorN)
	return buff.String()
}
