package setup

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/body"
)

const (
	//beamDatFile      = "beam.dat"
	//detectorsDatFile = "detect.dat"
	geometryDatFile = "geo.dat"
	//materialsDatFile = "mat.dat"
)

// ShieldSerializer serialize setup.Setup to shield.Config.
type ShieldSerializer struct {
	Context     *shield.SerializeParseContext
	ResultFiles map[string]string

	setup *setup.Setup
}

// NewShieldSerializer constructor.
func NewShieldSerializer(setup *setup.Setup) *ShieldSerializer {
	return &ShieldSerializer{
		Context:     createSerializeContext(setup),
		ResultFiles: make(map[string]string),
		setup:       setup,
	}
}

func createSerializeContext(setup *setup.Setup) *shield.SerializeParseContext {
	Context := &shield.SerializeParseContext{}

	Context.MapBodyID = make(map[body.ID]shield.BodyID)

	for id := range setup.Bodies {
		Context.MapBodyID[id] = shield.BodyID(len(Context.MapBodyID) + 1)
	}

	return Context
}

// Serialize setup.Setup to s.ResultFiles map, where key: file name, value: file content.
// Return error, if any serializer error occurs.
func (s *ShieldSerializer) Serialize() error {
	geo, err := serializeGeo(s)
	if err != nil {
		return err
	}
	s.ResultFiles[geometryDatFile] = geo

	return nil
}
