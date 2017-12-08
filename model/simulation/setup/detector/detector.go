package detector

import (
	"encoding/json"
	"fmt"

	"github.com/Palantir/palantir/model/simulation/common"
)

// ID is a key type in detector map.
type ID int64

// Detector describes where and what values are scored during simulation.
type Detector struct {
	ID               ID              `json:"id"`
	Name             string          `json:"name"`
	DetectorGeometry Geometry        `json:"detectorGeometry"`
	ScoredParticle   common.Particle `json:"particle"`
	ScoringType      ScoringType     `json:"scoring"`
}

// UnmarshalJSON custom Unmarshal function.
// detector.Type is recognized by detector/type in json.
func (m *Detector) UnmarshalJSON(b []byte) error {
	type rawBody struct {
		ID          ID              `json:"id"`
		Name        string          `json:"name"`
		GeometryRaw json.RawMessage `json:"detectorGeometry"`
		ParticleRaw json.RawMessage `json:"particle"`
		ScoringType json.RawMessage `json:"scoring"`
	}

	var raw rawBody
	err := json.Unmarshal(b, &raw)
	if err != nil {
		return err
	}
	m.ID = raw.ID
	m.Name = raw.Name

	matType, err := unmarshalDetectorGeometry(raw.GeometryRaw)
	if err != nil {
		return err
	}
	m.DetectorGeometry = matType

	scoredParticle, err := common.UnmarshalParticle(raw.ParticleRaw)
	if err != nil {
		return err
	}
	m.ScoredParticle = scoredParticle

	scoringType, err := unmarshalScoringType(raw.ScoringType)
	if err != nil {
		return err
	}
	m.ScoringType = scoringType

	return nil
}

func unmarshalDetectorGeometry(b json.RawMessage) (Geometry, error) {
	var detType detectorType
	err := json.Unmarshal(b, &detType)
	if err != nil {
		return nil, err
	}

	switch detType {
	case geomapDetector:
		geomap := Geomap{}
		err = json.Unmarshal(b, &geomap)
		if err != nil {
			return nil, err
		}
		return geomap, nil
	case zoneScoringDetector:
		zone := Zone{}
		err = json.Unmarshal(b, &zone)
		if err != nil {
			return nil, err
		}
		return zone, nil
	case meshScoringDetector:
		mesh := Mesh{}
		err = json.Unmarshal(b, &mesh)
		if err != nil {
			return nil, err
		}
		return mesh, nil
	case cylindricalScoringDetector:
		cylinder := Cylinder{}
		err = json.Unmarshal(b, &cylinder)
		if err != nil {
			return nil, err
		}
		return cylinder, nil
	case planeScoringDetector:
		plane := Plane{}
		err = json.Unmarshal(b, &plane)
		if err != nil {
			return nil, err
		}
		return plane, nil
	default:
		return nil, fmt.Errorf("Can not Unmarshal \"%s\" detector.Type", detType.DetectorType)
	}
}

// Geometry is interface for detector type.
// It must implement json.Marshaler to marshal detector Type
// dependant on detector Type implementation type.
type Geometry interface {
	json.Marshaler
}

// ScoringType is interface for scoring particles.
type ScoringType interface {
	json.Marshaler
}

type detectorType struct {
	DetectorType string `json:"type"`
}

var (
	geomapDetector             = detectorType{"geomap"}
	zoneScoringDetector        = detectorType{"zone"}
	cylindricalScoringDetector = detectorType{"cylinder"}
	meshScoringDetector        = detectorType{"mesh"}
	planeScoringDetector       = detectorType{"plane"}
)
