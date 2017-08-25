package material

import "encoding/json"

// Compound material type - create material by defining isotope mixture.
type Compound struct {
	Name string `json:"name"`

	// Density of the medium in g/cm³ - mandatory.
	Density float64 `json:"density"`

	// StateOfMatter - mandatory.
	StateOfMatter StateOfMatter `json:"stateOfMatter"`

	Elements []Element `json:"elements"`

	// Load stopping power from external file - optional. The file is selected
	// just like in case of Predefined material named by this string.
	ExternalStoppingPowerFromPredefined string `json:"externalStoppingPowerFromPredefined,omitempty"`
}

// Element is a basic building block of Compound.
type Element struct {
	Isotope string `json:"isotope"`

	RelativeStoichiometricFraction int64 `json:"relativeStoichiometricFraction"`

	// Override atomic mass - optional.
	AtomicMass float64 `json:"atomicMass,omitempty"`

	// Mean excitation energy (I-value) in eV - optional.
	IValue float64 `json:"iValue,omitempty"`
}

// MarshalJSON json.Marshaller implementation.
func (c Compound) MarshalJSON() ([]byte, error) {
	type Alias Compound
	return json.Marshal(struct {
		materialType
		Alias
	}{
		materialType: compoundType,
		Alias:        (Alias)(c),
	})

}
