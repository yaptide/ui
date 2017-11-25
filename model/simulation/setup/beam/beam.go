// Package beam implement beam model.
package beam

import (
	"encoding/json"
	"github.com/Palantir/palantir/model/simulation/common"
)

// Beam ...
type Beam struct {
	// Direction ...
	// SHIELD doc: BEAMDIR, BEAMPOS
	Direction Direction `json:"direction"`
	// Divergance ...
	// SHIELD doc: BEAMDIV
	Divergence Divergence `json:"divergence"`

	// ParticleType ...
	// SHIELD doc: HIPROJ, JPART0
	ParticleType common.Particle `json:"particleType"`

	// InitialBaseEnergy ...
	// SHIELD doc: TMAX0
	InitialBaseEnergy float64 `json:"initialBaseEnergy"`
	// InitialEnergySigma ...
	// SHIELD doc: TMAX0
	InitialEnergySigma float64 `json:"initialEnergySigma"`
}

// Default represents default beam configuration.
var Default = Beam{
	Direction: Direction{
		Phi: 0, Theta: 0, Position: common.Point{X: 0, Y: 0, Z: 0},
	},
	Divergence: Divergence{
		SigmaX:       1,
		SigmaY:       1,
		Distribution: common.GaussianDistribution,
	},
	ParticleType:       common.PredefinedParticle("proton"),
	InitialBaseEnergy:  0,
	InitialEnergySigma: 0,
}

// UnmarshalJSON custom Unmarshal function.
func (d *Beam) UnmarshalJSON(b []byte) error {
	type rawBeam struct {
		Direction          Direction       `json:"direction"`
		Divergence         Divergence      `json:"divergence"`
		ParticleType       json.RawMessage `json:"particleType"`
		InitialBaseEnergy  float64         `json:"initialBaseEnergy"`
		InitialEnergySigma float64         `json:"initialEnergySigma"`
	}
	var raw rawBeam
	err := json.Unmarshal(b, &raw)
	if err != nil {
		return nil
	}
	d.Direction = raw.Direction
	d.Divergence = raw.Divergence
	particleType, err := common.UnmarshalParticle(raw.ParticleType)
	if err != nil {
		return err
	}
	d.ParticleType = particleType
	d.InitialBaseEnergy = raw.InitialBaseEnergy
	d.InitialEnergySigma = raw.InitialEnergySigma
	return nil
}

// Direction ...
type Direction struct {
	// Phi is angle between positive x axis and direction after cast on xy plane.
	Phi float64 `json:"phi"`
	// Theta is angle between z axis and direction.
	Theta    float64      `json:"theta"`
	Position common.Point `json:"position"`
}

// Divergence ...
type Divergence struct {
	SigmaX       float64             `json:"sigmaX"`
	SigmaY       float64             `json:"sigmaY"`
	Distribution common.Distribution `json:"distribution"`
}
