package shield

import "github.com/Palantir/palantir/model/simulation/setup"

// Serializer serialize setup.Setup to shield.Config.
type Serializer struct {
	setup *setup.Setup
}

// Serialize setup.Setup to shield.Config.
// Return error, if any parser error occurs
func (s *Serializer) Serialize(setup *setup.Setup) (*Config, error) {
	s.setup = setup
	mat, err := s.serializeMat()
	if err != nil {
		return nil, err
	}

	geo, err := s.serializeGeo()
	if err != nil {
		return nil, err
	}

	beam, err := s.serializeBeam()
	if err != nil {
		return nil, err
	}

	detect, err := s.serializeDetect()
	if err != nil {
		return nil, err
	}

	return &Config{
			Mat:    mat,
			Geo:    geo,
			Beam:   beam,
			Detect: detect},
		nil

}

func (s *Serializer) serializeMat() (string, error) {
	return "", nil
}

func (s *Serializer) serializeGeo() (string, error) {
	return "", nil
}

func (s *Serializer) serializeBeam() (string, error) {
	return "", nil
}

func (s *Serializer) serializeDetect() (string, error) {
	return "", nil
}
