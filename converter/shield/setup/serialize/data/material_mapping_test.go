package data

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/material"
)

func TestPredefinedMaterialsToShieldICRUMapping(t *testing.T) {
	for _, predefinedMaterial := range material.PredefinedMaterials() {
		_, found := predefinedMaterialsToShieldICRU[predefinedMaterial.Value]
		if !found {
			t.Errorf("PredefinedMaterial mapping to Shield ICRU for \"%s\" not found", predefinedMaterial.Value)
		}
	}
}

func TestIsotopeToShieldNUCLIDMapping(t *testing.T) {
	for _, isotope := range material.Isotopes() {
		_, found := isotopesToShieldNUCLID[isotope.Value]
		if !found {
			t.Errorf("Isotope mapping to Shield NUCLID for \"%s\" not found", isotope.Value)
		}
	}
}
