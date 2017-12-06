package setup

import (
	"testing"

	"github.com/Palantir/palantir/model/simulation/setup/beam"
	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/detector"
	"github.com/Palantir/palantir/model/simulation/setup/material"
	"github.com/Palantir/palantir/model/simulation/setup/options"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
	"github.com/Palantir/palantir/model/test"
)

var testCases = test.MarshallingCases{
	{
		&Setup{
			Materials: MaterialMap{material.ID(40): nil, material.ID(34): nil},
			Bodies:    BodyMap{body.ID(1): nil, body.ID(2): nil},
			Zones:     ZoneMap{zone.ID(100): nil, zone.ID(200): nil},
			Detectors: DetectorMap{detector.ID(1): nil, detector.ID(2): nil},
			Beam:      beam.Default,
			Options:   options.SimulationOptions{},
		},
		`{
			"materials": {
				"34": null,
				"40": null
			},
			"bodies": {
				"1": null,
				"2": null
			},
			"zones": {
				"100": null,
				"200": null
			},
			"detectors": {
				"1": null,
				"2": null
			},
			"beam": {
				"direction": {
					"phi": 0,
					"theta": 0,
					"position": {
						"x": 0,
						"y": 0,
						"z": 0
					}
				},
				"divergence": {
					"sigmaX": 1,
					"sigmaY": 1,
					"distribution": "gaussian"
				},
				"particleType": {
					"type": "proton"
				},
				"initialBaseEnergy": 100,
				"initialEnergySigma": 0
			},
			"options": {
				"antyparticleCorrectionOn": false,
				"nuclearCorectionOn": false,
				"meanEnergyLoss": 0,
				"minEnergyLoss": 0,
				"scatteringType": "",
				"energyStraggling": "",
				"fastNeutronTransportOn": false,
				"lowEnergyNeutronCutOff": 0,
				"recordSecondaryNeutronCreation": false,
				"numberOfGeneratedParticles": 0,
				"numberOfRecordedParticles": 0
			}

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
