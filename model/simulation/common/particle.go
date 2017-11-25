package common

import (
	"encoding/json"
	"fmt"
)

// Particle is interface for particle scored in detectors.
type Particle interface {
	json.Marshaler
}

// PredefinedParticle ...
type PredefinedParticle string

// HeavyIon ...
type HeavyIon struct {
	Charge        int64 `json:"charge"`
	NucleonsCount int64 `json:"nucleonsCount"`
}

// MarshalJSON json.Marshaller implementation.
func (g PredefinedParticle) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Type string `json:"type"`
	}{
		Type: string(g),
	})
}

// MarshalJSON json.Marshaller implementation.
func (g HeavyIon) MarshalJSON() ([]byte, error) {
	type Alias HeavyIon
	return json.Marshal(struct {
		Type string `json:"type"`
		Alias
	}{
		Type:  "heavy_ion",
		Alias: (Alias)(g),
	})
}

// UnmarshalParticle ...
func UnmarshalParticle(b json.RawMessage) (Particle, error) {
	var predefinedParticle struct {
		Type PredefinedParticle `json:"type"`
	}
	predefinedParticleErr := json.Unmarshal(b, &predefinedParticle)
	var heavyIon HeavyIon
	heavyIonErr := json.Unmarshal(b, &heavyIon)

	if predefinedParticleErr == nil && predefinedParticle.Type != "heavy_ion" {
		return predefinedParticle.Type, nil
	}
	if heavyIonErr == nil {
		return heavyIon, nil
	}
	return nil, fmt.Errorf("unknown particle type")
}
