package serialize

import (
	"github.com/Palantir/palantir/model/simulation/common"
	"github.com/Palantir/palantir/model/simulation/setup/beam"
	"github.com/Palantir/palantir/model/simulation/setup/options"
	"github.com/Palantir/palantir/utils/log"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSuccessfullDeafultBeamSerialization(t *testing.T) {
	serialized := serializeBeam(beam.Default, options.Default)
	log.Warning("\n" + serialized)

	assert.Equal(t, expectedTest1, serialized)
}

const expectedTest1 = `APCORR                 0
BEAMDIR               0.      0.
BEAMPOS               0.      0.      0.
BEAMSIGMA             1.      1.
DELTAE              0.05
DEMIN              0.025
JPART0                 2
MSCAT                  1
NEUTRFAST              1
NEUTRLCUT             0.
NSTAT               1000    1000
NUCRE                  1
STRAGG                 1
TMAX0               100.      0.
`

func TestSuccessfullBeamSerialization(t *testing.T) {
	serialized := serializeBeam(beamTest2, optionsTest2)
	log.Warning("\n" + serialized)

	assert.Equal(t, expectedTest2, serialized)
}

var beamTest2 = beam.Beam{
	Direction: beam.Direction{
		Phi: 1, Theta: 1, Position: common.Point{X: 110, Y: 1.2220, Z: 0.001},
	},
	Divergence: beam.Divergence{
		SigmaX:       0,
		SigmaY:       0,
		Distribution: common.GaussianDistribution,
	},
	ParticleType: common.HeavyIon{
		NucleonsCount: 111,
		Charge:        10,
	},
	InitialBaseEnergy:  100,
	InitialEnergySigma: 1,
}

var optionsTest2 = options.SimulationOptions{
	AntyparticleCorrectionOn:       true,
	NuclearReactionsOn:             false,
	MeanEnergyLoss:                 0.9,
	MinEnergyLoss:                  0.112,
	ScatteringType:                 options.MoliereScattering,
	EnergyStraggling:               options.VavilovStraggling,
	FastNeutronTransportOn:         false,
	LowEnergyNeutronCutOff:         11.11,
	RecordSecondaryNeutronCreation: true,
	NumberOfGeneratedParticles:     0,
	NumberOfRecordedParticles:      0,
}

const expectedTest2 = `APCORR                 1
BEAMDIR               1.      1.
BEAMPOS             110.   1.222   0.001
BEAMSIGMA             0.      0.
DELTAE               0.9
DEMIN              0.112
HIPROJ               111      10
JPART0                25
MSCAT                  2
NEUTRFAST              0
NEUTRLCUT          11.11
NSTAT                  0       0
NUCRE                  0
STRAGG                 2
TMAX0               100.      1.
`
