package data

import (
	"errors"
	"testing"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup"
	"github.com/Palantir/palantir/model/simulation/setup/material"
	"github.com/stretchr/testify/assert"
)

func TestSuccessfullMaterialsConvert(t *testing.T) {
	type testCase struct {
		Input    setup.MaterialMap
		Expected Materials
	}

	check := func(t *testing.T, tc testCase) {
		t.Helper()

		simContext := shield.NewSimulationContext()
		actual, _, actualErr := convertSetupMaterials(tc.Input, simContext)

		assert.Equal(t, nil, actualErr)
		assert.Equal(t, tc.Expected, actual)
	}

	convertedSimplePredefined := PredefinedMaterial{ICRUNumber: MaterialICRU(273), StateOfMatter: stateNonDefined}

	convertedFullPredefined := PredefinedMaterial{
		ICRUNumber:                MaterialICRU(198),
		StateOfMatter:             stateLiquid,
		Density:                   123.45,
		LoadExternalStoppingPower: true,
	}

	convertedCompound := CompoundMaterial{
		StateOfMatter: stateSolid,
		Density:       99.9,
		ExternalStoppingPowerFromMaterialICRU: 277,
		Elements: []Element{
			Element{
				ID: 64,
				RelativeStoichiometricFraction: 2,
				AtomicMass:                     100.23,
				IValue:                         0.0,
			},
			Element{
				ID: 103,
				RelativeStoichiometricFraction: 123,
				AtomicMass:                     0.0,
				IValue:                         555.34,
			},
		},
		serializeExternalStoppingPower: true,
	}

	convertedAnotherCompound := CompoundMaterial{
		StateOfMatter: stateGas,
		Density:       0.999,
		ExternalStoppingPowerFromMaterialICRU: 277,
		Elements: []Element{
			Element{
				ID: 6,
				RelativeStoichiometricFraction: 4,
				AtomicMass:                     0.01,
				IValue:                         0.0,
			},
			Element{
				ID: 14,
				RelativeStoichiometricFraction: 1,
				AtomicMass:                     0.0,
				IValue:                         0.34,
			},
			Element{
				ID: 11,
				RelativeStoichiometricFraction: 11111,
				AtomicMass:                     987.654,
				IValue:                         0.123,
			},
		},
		serializeExternalStoppingPower: true,
	}

	t.Run("OnePredefined", func(t *testing.T) {
		check(t,
			testCase{
				Input: createMaterialMap(genSetupSimplePredefined(1)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{setPredefinedID(convertedSimplePredefined, 1)},
					Compound:   []CompoundMaterial{}},
			})

		check(t,
			testCase{
				Input: createMaterialMap(genSetupFullPredefined(6)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{setPredefinedID(convertedFullPredefined, 1)},
					Compound:   []CompoundMaterial{}},
			})
	})

	t.Run("OneCompound", func(t *testing.T) {
		check(t,
			testCase{
				Input: createMaterialMap(genSetupCompound(1001)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{},
					Compound:   []CompoundMaterial{setCompoundID(convertedCompound, 1)},
				}})

		check(t,
			testCase{
				Input: createMaterialMap(genSetupAnotherCompound(4000)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{},
					Compound:   []CompoundMaterial{setCompoundID(convertedAnotherCompound, 1)},
				}})
	})

	t.Run("FewPredefined", func(t *testing.T) {
		check(t,
			testCase{
				Input: createMaterialMap(
					genSetupSimplePredefined(1),
					genSetupFullPredefined(2)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{
						setPredefinedID(convertedSimplePredefined, 1),
						setPredefinedID(convertedFullPredefined, 2),
					},
					Compound: []CompoundMaterial{},
				}})

		check(t,
			testCase{
				Input: createMaterialMap(
					genSetupSimplePredefined(2),
					genSetupFullPredefined(1)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{
						setPredefinedID(convertedFullPredefined, 1),
						setPredefinedID(convertedSimplePredefined, 2),
					},
					Compound: []CompoundMaterial{},
				}})
	})

	t.Run("FewCompound", func(t *testing.T) {
		check(t,
			testCase{
				Input: createMaterialMap(
					genSetupCompound(1),
					genSetupAnotherCompound(2)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{},
					Compound: []CompoundMaterial{
						setCompoundID(convertedCompound, 1),
						setCompoundID(convertedAnotherCompound, 2),
					},
				}})
		check(t,
			testCase{
				Input: createMaterialMap(
					genSetupCompound(2),
					genSetupAnotherCompound(1)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{},
					Compound: []CompoundMaterial{
						setCompoundID(convertedAnotherCompound, 1),
						setCompoundID(convertedCompound, 2),
					},
				}})

	})

	t.Run("Mixed", func(t *testing.T) {
		check(t,
			testCase{
				Input: createMaterialMap(
					genSetupSimplePredefined(1),
					genSetupFullPredefined(2),
					genSetupCompound(3),
					genSetupAnotherCompound(4)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{
						setPredefinedID(convertedSimplePredefined, 1),
						setPredefinedID(convertedFullPredefined, 2),
					},
					Compound: []CompoundMaterial{
						setCompoundID(convertedCompound, 3),
						setCompoundID(convertedAnotherCompound, 4),
					},
				}})

		check(t,
			testCase{
				Input: createMaterialMap(
					genSetupSimplePredefined(9),
					genSetupFullPredefined(2),
					genSetupCompound(100),
					genSetupAnotherCompound(3),
					genSetupSimplePredefined(1),
				),
				Expected: Materials{
					Predefined: []PredefinedMaterial{
						setPredefinedID(convertedSimplePredefined, 1),
						setPredefinedID(convertedFullPredefined, 2),
						setPredefinedID(convertedSimplePredefined, 3),
					},
					Compound: []CompoundMaterial{
						setCompoundID(convertedAnotherCompound, 4),
						setCompoundID(convertedCompound, 5),
					},
				}})
	})

	t.Run("VacuumShouldBeNotSerialized", func(t *testing.T) {
		check(t,
			testCase{
				Input: createMaterialMap(genVacuum(1)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{},
					Compound:   []CompoundMaterial{},
				}})

		check(t,
			testCase{
				Input: createMaterialMap(
					genSetupSimplePredefined(1),
					genVacuum(2),
					genSetupAnotherCompound(3)),
				Expected: Materials{
					Predefined: []PredefinedMaterial{
						setPredefinedID(convertedSimplePredefined, 1),
					},
					Compound: []CompoundMaterial{
						setCompoundID(convertedAnotherCompound, 2),
					},
				}})

	})

}

func TestBadInputMaterialsConvert(t *testing.T) {
	type testCase struct {
		Input         setup.MaterialMap
		ExpectedError error
	}

	check := func(t *testing.T, tc testCase) {
		t.Helper()

		simContext := shield.NewSimulationContext()
		actual, _, actualErr := convertSetupMaterials(tc.Input, simContext)

		assert.Equal(t, Materials{}, actual)
		assert.Equal(t, tc.ExpectedError, actualErr)
	}

	t.Run("ToManyMaterials", func(t *testing.T) {
		const materialsN = 1000
		materials := setup.MaterialMap{}
		for i := int64(0); i < materialsN; i++ {
			materials[material.ID(i)] = genSetupSimplePredefined(i)
		}

		check(t, testCase{
			Input:         materials,
			ExpectedError: errors.New("[serializer] mat.dat: Only 100 distinct materials are permitted in shield (1000 > 100)"),
		})
	})

	t.Run("VoxelNotImplemented", func(t *testing.T) {
		const materialsN = 1000
		materials := setup.MaterialMap{}
		for i := int64(0); i < materialsN; i++ {
			materials[material.ID(i)] = genSetupSimplePredefined(i)
		}

		check(t, testCase{
			Input:         createMaterialMap(&material.Material{ID: 1, Type: material.Voxel{}}),
			ExpectedError: errors.New("[serializer] Material{Id: 1} -> mat.dat: Voxel material serialization not implemented"),
		})
	})

	t.Run("PredefinedMappingNotFound", func(t *testing.T) {
		const id = 1
		mat := genSetupSimplePredefined(id)
		predef := mat.Type.(material.Predefined)
		predef.PredefinedID = "predefNameNotDefined"
		mat.Type = predef

		check(t, testCase{
			Input:         createMaterialMap(mat),
			ExpectedError: errors.New(`[serializer] Material{Id: 1} -> mat.dat: "predefNameNotDefined" material mapping to shield format not found`),
		})
	})

	t.Run("IsotopeMappingNotFound", func(t *testing.T) {
		const id = 1
		mat := genSetupCompound(id)
		compound := mat.Type.(material.Compound)
		compound.Elements[0].Isotope = "isotopeNameNotDefined"
		mat.Type = compound

		check(t, testCase{
			Input:         createMaterialMap(mat),
			ExpectedError: errors.New(`[serializer] Material{Id: 1} -> mat.dat: "isotopeNameNotDefined" isotope mapping to shield format not found`),
		})
	})

	t.Run("ExternalStoppingPowerFromPredefinedMaterialMappingNotFound", func(t *testing.T) {
		const id = 1
		mat := genSetupCompound(id)
		compound := mat.Type.(material.Compound)
		compound.ExternalStoppingPowerFromPredefined = "espfpNameNotDefined"
		mat.Type = compound
		check(t, testCase{
			Input:         createMaterialMap(mat),
			ExpectedError: errors.New(`[serializer] Material{Id: 1} -> mat.dat: "espfpNameNotDefined" material mapping to shield format not found`),
		})
	})

}

func genSetupSimplePredefined(id int64) *material.Material {
	return &material.Material{ID: material.ID(id), Type: material.Predefined{
		PredefinedID: "urea",
	}}
}

func genSetupFullPredefined(id int64) *material.Material {
	return &material.Material{ID: material.ID(id), Type: material.Predefined{
		PredefinedID:              "methanol",
		StateOfMatter:             material.Liquid,
		Density:                   123.45,
		LoadExternalStoppingPower: true,
	}}
}

func genSetupCompound(id int64) *material.Material {
	return &material.Material{ID: material.ID(id), Type: material.Compound{
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

func genSetupAnotherCompound(id int64) *material.Material {
	return &material.Material{ID: material.ID(id), Type: material.Compound{
		Name:          "pies",
		Density:       0.999,
		StateOfMatter: material.Gas,
		Elements: []material.Element{
			material.Element{Isotope: "c-*", RelativeStoichiometricFraction: 4, AtomicMass: 0.01},
			material.Element{Isotope: "si-*", RelativeStoichiometricFraction: 1, IValue: 0.34},
			material.Element{Isotope: "na-23", RelativeStoichiometricFraction: 11111, IValue: 0.123, AtomicMass: 987.654},
		},
		ExternalStoppingPowerFromPredefined: "water_vapor",
	}}
}

func genVacuum(id int64) *material.Material {
	return &material.Material{ID: material.ID(id), Type: material.Predefined{
		PredefinedID: "vacuum",
	}}
}

func createMaterialMap(materials ...*material.Material) setup.MaterialMap {
	res := setup.MaterialMap{}
	for _, m := range materials {
		res[m.ID] = m
	}
	return res
}

func setPredefinedID(mat PredefinedMaterial, id shield.MaterialID) PredefinedMaterial {
	mat.ID = id
	return mat
}

func setCompoundID(mat CompoundMaterial, id shield.MaterialID) CompoundMaterial {
	mat.ID = id
	return mat
}
