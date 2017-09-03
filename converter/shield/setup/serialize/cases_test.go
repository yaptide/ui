package serialize

import (
	"errors"

	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/material"
)

type serializerTestCase struct {
	Setup         *setup.Setup
	Expected      map[string]string
	ExpectedError error
}

func newEmptySerializeTestCase() serializerTestCase {
	return serializerTestCase{
		Setup:         setup.NewEmptySetup(),
		Expected:      make(map[string]string),
		ExpectedError: nil,
	}
}

func materialPredefinedTrivial(id int64) *material.Material {
	materialID := material.ID(id)
	return &material.Material{ID: material.ID(materialID), Type: material.Predefined{
		PredefinedID: "urea",
	}}
}

func materialPredefinedFull(id int64) *material.Material {
	materialID := material.ID(id)
	return &material.Material{ID: material.ID(materialID), Type: material.Predefined{
		PredefinedID:              "methanol",
		StateOfMatter:             material.Liquid,
		Density:                   0.001,
		LoadExternalStoppingPower: false,
	}}
}

func materialCompoundTrivial(id int64) *material.Material {
	materialID := material.ID(id)
	return &material.Material{ID: material.ID(materialID), Type: material.Compound{
		Name:          "kot",
		Density:       99.9,
		StateOfMatter: material.Solid,
		Elements: []material.Element{
			material.Element{Isotope: "gd-*", RelativeStoichiometricFraction: 2, AtomicMass: 100.23},
			material.Element{Isotope: "u-235", RelativeStoichiometricFraction: 123, IValue: 555.34},
		},
		ExternalStoppingPowerFromPredefined: "water_vapor",
	}}
}

func createMaterialMap(materials ...*material.Material) setup.MaterialMap {
	res := setup.MaterialMap{}
	for _, m := range materials {
		res[m.ID] = m
	}
	return res
}
func successfullSerializationCase() serializerTestCase {
	matExpected :=
		`MEDIUM 1
ICRU 273
END

MEDIUM 2
STATE 2
RHO 0.001000
ICRU 198
END

MEDIUM 3
STATE 0
RHO 99.900000
NUCLID 64 2
AMASS 100.230000
NUCLID 103 123
IVALUE 555.340000
LOADDEDX 277
END`
	return serializerTestCase{
		Setup: &setup.Setup{
			Materials: createMaterialMap(
				materialPredefinedTrivial(1),
				materialCompoundTrivial(100),
				materialPredefinedFull(3),
			),
		},
		Expected:      map[string]string{"mat.dat": matExpected},
		ExpectedError: nil,
	}
}

func toManyMaterialsCase() serializerTestCase {
	const materialsN = 1000
	materials := setup.MaterialMap{}
	for i := int64(0); i < materialsN; i++ {
		materials[material.ID(i)] = materialPredefinedTrivial(i)
	}
	return serializerTestCase{
		Setup: &setup.Setup{
			Materials: materials,
		},
		Expected:      map[string]string{},
		ExpectedError: errors.New("[serializer] mat.dat: Only 100 distinct materials are permitted in shield (1000 > 100)"),
	}
}

func voxelMaterialNotImplementedCase() serializerTestCase {
	return serializerTestCase{
		Setup: &setup.Setup{
			Materials: setup.MaterialMap{
				material.ID(1): &material.Material{ID: 1, Type: material.Voxel{}},
			},
		},
		Expected:      map[string]string{},
		ExpectedError: errors.New("[serializer] Material{Id: 1} -> mat.dat: Voxel material serialization not implemented"),
	}
}

func materialMappingNotFoundCase() []serializerTestCase {
	const id = 1

	predefinedCase := newEmptySerializeTestCase()
	mat := materialPredefinedTrivial(id)
	predef := mat.Type.(material.Predefined)
	predef.PredefinedID = "predefNameNotDefined"
	mat.Type = predef
	predefinedCase.Setup.Materials[id] = mat
	predefinedCase.ExpectedError = errors.New(
		"[serializer] Material{Id: 1} -> mat.dat: \"predefNameNotDefined\" material mapping to shield format not found",
	)

	compoundIsotopeCase := newEmptySerializeTestCase()
	mat = materialCompoundTrivial(id)
	compound := mat.Type.(material.Compound)
	compound.Elements[0].Isotope = "isotopeNameNotDefined"
	mat.Type = compound
	compoundIsotopeCase.Setup.Materials[id] = mat
	compoundIsotopeCase.ExpectedError = errors.New(
		"[serializer] Material{Id: 1} -> mat.dat: \"isotopeNameNotDefined\" isotope mapping to shield format not found",
	)

	compoundESPFPCase := newEmptySerializeTestCase()
	mat = materialCompoundTrivial(id)
	compound = mat.Type.(material.Compound)
	compound.ExternalStoppingPowerFromPredefined = "espfpNameNotDefined"
	mat.Type = compound
	compoundESPFPCase.Setup.Materials[id] = mat
	compoundESPFPCase.ExpectedError = errors.New(
		"[serializer] Material{Id: 1} -> mat.dat: \"espfpNameNotDefined\" material mapping to shield format not found",
	)

	return []serializerTestCase{predefinedCase, compoundIsotopeCase, compoundESPFPCase}
}

func serializerTestCases() []serializerTestCase {
	return append(
		[]serializerTestCase{
			successfullSerializationCase(),
			toManyMaterialsCase(),
			voxelMaterialNotImplementedCase(),
		},
		materialMappingNotFoundCase()...,
	)
}
