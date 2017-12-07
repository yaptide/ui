package serialize

import (
	"fmt"
	"github.com/Palantir/palantir/model/simulation/common"
	"strconv"
	"strings"
)

func floatToFixedWidthString(n float64, w int) string {
	wStr := strconv.Itoa(w)
	s := fmt.Sprintf("%"+wStr+"."+wStr+"f", n)
	trimed := strings.TrimRight(s[:w], "0")
	return strings.Repeat(" ", w-len(trimed)) + trimed
}

func mapParticleToShieldParticleID(particle common.Particle) (int, error) {
	switch particle.(type) {
	case common.PredefinedParticle:
		number, ok := predefinedParticleToShieldMapping[particle.(common.PredefinedParticle)]
		if ok {
			return number, nil
		}
		return 0, fmt.Errorf("Unsuported particle type %T", particle)
	case common.HeavyIon:
		return 25, nil
	}
	return 0, fmt.Errorf("Unsuported particle type %T", particle)
}

var predefinedParticleToShieldMapping = map[common.PredefinedParticle]int{
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
