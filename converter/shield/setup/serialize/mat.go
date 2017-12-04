package serialize

import (
	"bytes"
	"fmt"
	"io"

	"github.com/Palantir/palantir/converter/shield/setup/serialize/data"
)

func serializeMat(materials data.Materials) string {
	writer := &bytes.Buffer{}

	for _, predefined := range materials.Predefined {
		serializePredefined(writer, predefined)
	}
	for _, compound := range materials.Compound {
		serializeCompound(writer, compound)
	}

	return writer.String()
}

func serializePredefined(writer io.Writer, predef data.PredefinedMaterial) {
	fmt.Fprintf(writer, "MEDIUM %d\n", predef.ID)

	if predef.SerializeStateOfMatter() {
		fmt.Fprintf(writer, "STATE %d\n", predef.StateOfMatter)
	}

	if predef.SerializeDensity() {
		fmt.Fprintf(writer, "RHO %f\n", predef.Density)
	}

	fmt.Fprintf(writer, "ICRU %d\n", predef.ICRUNumber)

	if predef.LoadExternalStoppingPower {
		fmt.Fprintln(writer, "LOADDEDX")
	}

	fmt.Fprintln(writer, "END")
}

func serializeCompound(writer io.Writer, compound data.CompoundMaterial) {
	fmt.Fprintf(writer, "MEDIUM %d\n", compound.ID)
	fmt.Fprintf(writer, "STATE %d\n", compound.StateOfMatter)
	fmt.Fprintf(writer, "RHO %f\n", compound.Density)

	for _, element := range compound.Elements {
		fmt.Fprintf(writer, "NUCLID %d %d\n", element.ID, element.RelativeStoichiometricFraction)

		if element.SerializeAtomicMass() {
			fmt.Fprintf(writer, "AMASS %f\n", element.AtomicMass)
		}

		if element.SerializeIValue() {
			fmt.Fprintf(writer, "IVALUE %f\n", element.IValue)
		}
	}

	if compound.SerializeExternalStoppingPower() {
		fmt.Fprintf(writer, "LOADDEDX %d\n", compound.ExternalStoppingPowerFromMaterialICRU)
	}

	fmt.Fprintln(writer, "END")
}
