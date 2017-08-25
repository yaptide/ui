package serialize

import (
	"bytes"
	"fmt"
	"io"
	"sort"

	"github.com/Palantir/palantir/converter/shield"
	mat_model "github.com/Palantir/palantir/model/simulation/setup/material"
)

type matSerializer struct {
	*shieldSerializer
}

func serializeMat(shieldSerializer *shieldSerializer) (string, error) {
	serializer := matSerializer{
		shieldSerializer: shieldSerializer,
	}
	return serializer.serialize()
}

func (s *matSerializer) serialize() (string, error) {
	const (
		maxMaterialsNumber = 100
	)

	writer := &bytes.Buffer{}
	if len(s.setup.Materials) > maxMaterialsNumber {
		return "", newGeneralMatError(
			"Only %d distinct materials are permitted in shield (%d > %d)",
			maxMaterialsNumber,
			len(s.setup.Materials),
			maxMaterialsNumber,
		)
	}

	ids := materialIDSlice{}
	for id := range s.setup.Materials {
		ids = append(ids, id)
	}
	sort.Sort(ids)

	for i, materialID := range ids {
		nextShieldID := shield.MaterialID(i + 1)
		s.serializerContext.materialIDToShield[materialID] = nextShieldID
		s.simulationContext.MapMaterialID[nextShieldID] = materialID

		err := s.serializeMaterial(writer, s.setup.Materials[materialID])
		if err != nil {
			return "", err
		}
	}

	return writer.String(), nil
}

func (s *matSerializer) serializeMaterial(writer io.Writer, mat *mat_model.Material) error {
	shieldID := s.materialIDToShield[mat.ID]

	fmt.Fprintf(writer, "MEDIUM %d\n", shieldID)

	var err error
	switch material := mat.Type.(type) {
	case mat_model.Predefined:
		err = s.serializePredefined(writer, mat.ID, &material)
	case mat_model.Compound:
		err = s.serializeCompound(writer, mat.ID, &material)
	case mat_model.Voxel:
		err = newMaterialIDError(mat.ID, "Voxel material serialization not implemented")
	}
	if err != nil {
		return err
	}

	fmt.Fprintf(writer, "END\n\n")
	return nil
}

func (s *matSerializer) serializePredefined(writer io.Writer, id mat_model.ID, predef *mat_model.Predefined) error {
	if predef.StateOfMatter != mat_model.NonDefined {
		fmt.Fprintf(writer, "STATE %d\n", stateOfMatterToShield[predef.StateOfMatter])
	}

	if predef.Density > 0.0 {
		fmt.Fprintf(writer, "RHO %f\n", predef.Density)
	}

	materialICRUNumber, found := predefinedMaterialsToShieldICRU[predef.Name]
	if !found {
		return newMaterialIDError(id, "\"%s\" material mapping to shield format not found", predef.Name)
	}
	fmt.Fprintf(writer, "ICRU %d\n", materialICRUNumber)

	if predef.LoadExternalStoppingPower {
		fmt.Fprintln(writer, "LOADDEDX")
	}
	return nil
}

func (s *matSerializer) serializeCompound(writer io.Writer, id mat_model.ID, compound *mat_model.Compound) error {
	const (
		maxElementsNumber = 13
	)

	if compound.StateOfMatter == mat_model.NonDefined {
		return newMaterialIDError(id, "StateOfMatter must be defined for Compound material")
	}
	fmt.Fprintf(writer, "STATE %d\n", stateOfMatterToShield[compound.StateOfMatter])

	if compound.Density <= 0.0 {
		return newMaterialIDError(id, "Density must be specified for Compund material")
	}
	fmt.Fprintf(writer, "RHO %f\n", compound.Density)

	if len(compound.Elements) > maxElementsNumber {
		return newMaterialIDError(id, "Only %d elements for Compound are permitted in shield (%d > %d)",
			maxElementsNumber, len(compound.Elements), maxElementsNumber)
	}

	for _, element := range compound.Elements {
		isotopeNUCLID, found := isotopesToShieldNUCLID[element.Isotope]
		if !found {
			return newMaterialIDError(id, "\"%s\" isotope mapping to shield format not found", element.Isotope)
		}

		fmt.Fprintf(writer, "NUCLID %d %d\n", isotopeNUCLID, element.RelativeStoichiometricFraction)

		if element.AtomicMass > 0.0 {
			fmt.Fprintf(writer, "AMASS %f\n", element.AtomicMass)
		}

		if element.IValue > 0.0 {
			fmt.Fprintf(writer, "IVALUE %f\n", element.IValue)
		}
	}

	if compound.ExternalStoppingPowerFromPredefined != "" {
		materialICRUNumber, found := predefinedMaterialsToShieldICRU[compound.ExternalStoppingPowerFromPredefined]
		if !found {
			return newMaterialIDError(id, "\"%s\" material mapping to shield format not found", compound.ExternalStoppingPowerFromPredefined)
		}
		fmt.Fprintf(writer, "LOADDEDX %d\n", materialICRUNumber)
	}

	return nil
}
