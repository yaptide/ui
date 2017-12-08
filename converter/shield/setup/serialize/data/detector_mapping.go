package data

import (
	"fmt"

	"github.com/Palantir/palantir/model/simulation/common"
	"github.com/Palantir/palantir/model/simulation/setup/detector"
)

// MapParticleToShieldParticleID map Particle to shield format.
func MapParticleToShieldParticleID(particle common.Particle) (int64, error) {
	switch particle.(type) {
	case common.PredefinedParticle:
		if number, ok := predefinedParticleToShieldMapping[particle.(common.PredefinedParticle)]; ok {
			return number, nil
		}
		return int64(0), fmt.Errorf("Unsuported particle type %T", particle)
	case common.HeavyIon:
		return int64(25), nil
	}
	return int64(0), fmt.Errorf("Unsuported particle type %T", particle)
}

var predefinedParticleToShieldMapping = map[common.PredefinedParticle]int64{
	"all":              -1,
	"neutron":          1,
	"proton":           2,
	"pion_pi_minus":    3,
	"pion_pi_plus":     4,
	"pion_pi_zero":     5,
	"anti_neutron":     6,
	"anti_proton":      7,
	"kaon_minus":       8,
	"kaon_plus":        9,
	"kaon_zero":        10,
	"kaon_anti":        11,
	"gamma":            12,
	"electron":         13,
	"positron":         14,
	"muon_minus":       15,
	"muon_plus":        16,
	"e_neutrino":       17,
	"e_anti_neutrino":  18,
	"mi_neutrino":      19,
	"mi_anti_neutrino": 20,
	"deuteron":         21,
	"triton":           22,
	"he_3":             23,
	"he_4":             24,
}

func mapScoringToShield(scoringType detector.ScoringType) (string, error) {
	switch scoring := scoringType.(type) {
	case detector.PredefinedScoring:
		name, found := scoringToShield[string(scoring)]
		if !found {
			return "", fmt.Errorf("Unsuported scoring type %s", scoring)
		}
		return name, nil
	case detector.LetTypeScoring:
		name, found := scoringToShield[scoring.Type]
		if !found {
			return "", fmt.Errorf("Unsuported scoring type %s", scoring.Type)
		}
		return name, nil
	}
	return "", fmt.Errorf("Unsuported scoring type %T", scoringType)
}

var scoringToShield = map[string]string{
	"energy":     "ENERGY",
	"fluence":    "FLUENCE",
	"crossflu":   "CROSSFLU",
	"dose":       "DOSE",
	"letflu":     "LETFLU",
	"dlet":       "DLET",
	"tlet":       "TLET",
	"avg_energy": "AVG-ENERGY",
	"avg_beta":   "AVG-BETA",
	"ddd":        "DDD",
	"spc":        "SPC",
	"alanine":    "ALANINE",
	"counter":    "COUNTER",
}
