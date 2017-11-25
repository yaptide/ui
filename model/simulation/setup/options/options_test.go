package options

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/common"
	"github.com/Palantir/palantir/model/test"
)

var testCases = test.MarshallingCases{
	{
		&SimulationOptions{
			AntyparticleCorrectionOn:       true,
			NuclearCorectionOn:             true,
			MeanEnergyLoss:                 common.Fraction(0.1),
			MinEnergyLoss:                  1.1,
			ScatteringType:                 GaussianScattering,
			EnergyStraggling:               VavilovStraggling,
			FastNeutronTransportOn:         true,
			LowEnergyNeutronCutOff:         0.1,
			RecordSecondaryNeutronCreation: true,
			NumberOfGeneratedParticles:     1000,
			NumberOfRecordedParticles:      1000,
		},
		`{
			"antyparticleCorrectionOn": true,
			"nuclearCorectionOn": true,
			"meanEnergyLoss": 0.1,
			"minEnergyLoss": 1.1,
			"scatteringType": "gaussian",
			"energyStraggling": "vavilov",
			"fastNeutronTransportOn": true,
			"lowEnergyNeutronCutOff": 0.1,
			"recordSecondaryNeutronCreation": true,
			"numberOfGeneratedParticles": 1000,
			"numberOfRecordedParticles": 1000
		}`,
	},
}

func TestSetupMarshal(t *testing.T) {
	test.Marshal(t, testCases)
}

func TestSetupUnmarshal(t *testing.T) {
	test.Unmarshal(t, testCases)
}

func TestSetupUnmarshalMarshalled(t *testing.T) {
	test.UnmarshalMarshalled(t, testCases)
}

func TestSetupMarshalUnmarshalled(t *testing.T) {
	test.MarshalUnmarshalled(t, testCases)
}
