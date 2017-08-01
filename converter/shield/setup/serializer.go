package setup

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
)

const (
	beamDatFile      = "beam.dat"
	detectorsDatFile = "detect.dat"
	geometryDatFile  = "geo.dat"
	materialsDatFile = "mat.dat"
)

// ShieldSerializer serialize setup.Setup to shield.Config.
type ShieldSerializer struct {
	SerializeContext *shield.SerializeParseContext
	Files            map[string]string
	setup            *setup.Setup
}

// NewShieldSerializer constructor.
func NewShieldSerializer(setup *setup.Setup) *ShieldSerializer {
	return &ShieldSerializer{
		SerializeContext: shield.NewSerialaizeParseContext(),
		Files:            map[string]string{},
		setup:            setup,
	}
}

// Serialize setup.Setup to shield.Config.
// Return error, if any parser error occurs.
func (s *ShieldSerializer) Serialize() error {
	mat, err := s.serializeMat()
	if err != nil {
		return err
	}
	s.Files[materialsDatFile] = mat

	geo, err := s.serializeGeo()
	if err != nil {
		return err
	}
	s.Files[geometryDatFile] = geo

	beam, err := s.serializeBeam()
	if err != nil {
		return err
	}
	s.Files[beamDatFile] = beam

	detect, err := s.serializeDetect()
	if err != nil {
		return err
	}
	s.Files[detectorsDatFile] = detect

	return nil
}

func (s *ShieldSerializer) serializeMat() (string, error) {
	return "", nil
}

func (s *ShieldSerializer) serializeGeo() (string, error) {
	return "", nil
}

func (s *ShieldSerializer) serializeBeam() (string, error) {
	return "", nil
}

func (s *ShieldSerializer) serializeDetect() (string, error) {
	return "", nil
}
