package serialize

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/Palantir/palantir/converter/shield/setup/serialize/data"
	"github.com/Palantir/palantir/model/simulation/common"
	setup_beam "github.com/Palantir/palantir/model/simulation/setup/beam"
	setup_options "github.com/Palantir/palantir/model/simulation/setup/options"
	"github.com/Palantir/palantir/utils/log"
)

type beamCardSerializerFunc func(setup_beam.Beam, setup_options.SimulationOptions) string

var beamCardSerializers = map[string]beamCardSerializerFunc{
	"APCORR": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		if options.AntyparticleCorrectionOn {
			return fmt.Sprintf("%8d", 1)
		}
		return fmt.Sprintf("%8d", 0)
	},
	"BEAMDIR": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return floatToFixedWidthString(beam.Direction.Theta, 8) + floatToFixedWidthString(beam.Direction.Phi, 8)
	},
	"BEAMDIV": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"BEAMPOS": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return floatToFixedWidthString(beam.Direction.Position.X, 8) +
			floatToFixedWidthString(beam.Direction.Position.Y, 8) +
			floatToFixedWidthString(beam.Direction.Position.Z, 8)
	},
	"BEAMSIGMA": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return floatToFixedWidthString(beam.Divergence.SigmaX, 8) +
			floatToFixedWidthString(beam.Divergence.SigmaY, 8)
	},
	"BMODMC": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"BMODTRANS": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"DELTAE": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return floatToFixedWidthString(float64(options.MeanEnergyLoss), 8)
	},
	"DEMIN": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return floatToFixedWidthString(options.MinEnergyLoss, 8)
	},
	"EMTRANS": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"EXTSPEC": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"HIPROJ": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		particle, ok := beam.ParticleType.(common.HeavyIon)
		if ok {
			return fmt.Sprintf("%8d", particle.NucleonsCount) + fmt.Sprintf("%8d", particle.Charge)
		}
		return ""
	},
	"JPART0": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		number, _ := data.MapParticleToShieldParticleID(beam.ParticleType)
		return fmt.Sprintf("%8d", number)
	},
	"MAKELN": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"MSCAT": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		if options.ScatteringType == setup_options.MoliereScattering {
			return fmt.Sprintf("%8d", 2)
		}
		return fmt.Sprintf("%8d", 1)
	},
	"NEUTRFAST": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		if options.FastNeutronTransportOn {
			return fmt.Sprintf("%8d", 1)
		}
		return fmt.Sprintf("%8d", 0)
	},
	"NEUTRLCUT": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return floatToFixedWidthString(options.LowEnergyNeutronCutOff, 8)
	},
	"NSTAT": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return fmt.Sprintf("%8d", options.NumberOfGeneratedParticles) +
			fmt.Sprintf("%8d", options.NumberOfRecordedParticles)
	},
	"NUCRE": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		if options.NuclearReactionsOn {
			return fmt.Sprintf("%8d", 1)
		}
		return fmt.Sprintf("%8d", 0)
	},
	"RNDSEED": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"STRAGG": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		if options.EnergyStraggling == setup_options.VavilovStraggling {
			return fmt.Sprintf("%8d", 2)
		}
		return fmt.Sprintf("%8d", 1)
	},
	"TMAX0": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return floatToFixedWidthString(beam.InitialBaseEnergy, 8) +
			floatToFixedWidthString(beam.InitialEnergySigma, 8)
	},
	"USEBMOD": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"USECBEAM": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
	"USEPARLEV": func(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
		return ""
	},
}

var beamCardOrder = []string{
	"APCORR", "BEAMDIR", "BEAMDIV", "BEAMPOS", "BEAMSIGMA", "BMODMC", "BMODTRANS",
	"DELTAE", "DEMIN", "EMTRANS", "EXTSPEC", "HIPROJ", "JPART0", "MAKELN", "MSCAT",
	"NEUTRFAST", "NEUTRLCUT", "NSTAT", "NUCRE", "RNDSEED", "STRAGG", "TMAX0", "USEBMOD",
	"USECBEAM", "USEPARLEV",
}

func serializeBeam(beam setup_beam.Beam, options setup_options.SimulationOptions) string {
	writer := &bytes.Buffer{}
	log.Debug("[Serializer][beam] start")

	for _, cardName := range beamCardOrder {
		cardSerializer := beamCardSerializers[cardName]
		cardContent := cardSerializer(beam, options)
		if cardContent == "" {
			continue
		}

		log.Debug("[Serializer][beam] write card %s with content \n%s", cardName, cardContent)
		writer.Write([]byte(serializeBeamCardName(cardName)))
		writer.Write([]byte(cardContent))
		writer.Write([]byte("\n"))
	}

	return writer.String()
}

func serializeBeamCardName(name string) string {
	return (name + strings.Repeat(" ", 16))[0:16]
}
