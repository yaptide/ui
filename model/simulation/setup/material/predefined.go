package material

import "encoding/json"

// Predefined material type - choose material definition from predefined material list by name.
type Predefined struct {
	Name string `json:"name"`

	// Density of the medium in g/cm³ - optional.
	Density float64 `json:"density,omitempty"`

	// State of matter - optional
	StateOfMatter StateOfMatter `json:"stateOfMatter,omitempty"`

	// Load stopping power from external file.
	LoadExternalStoppingPower bool `json:"loadExternalStoppingPower,omitempty"`
}

// MarshalJSON json.Marshaller implementation.
func (p Predefined) MarshalJSON() ([]byte, error) {
	type Alias Predefined
	return json.Marshal(struct {
		materialType
		Alias
	}{
		materialType: predefinedType,
		Alias:        (Alias)(p),
	})
}
