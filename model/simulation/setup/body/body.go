// Package body implement Body model, which store basic Geometry description.
package body

import "encoding/json"

// ID is key type in Body map.
type ID int64

// Body store Geometry interface described by ID and Name.
type Body struct {
	ID       ID       `json:"id"`
	Name     string   `json:"name, omitempty"`
	Geometry Geometry `json:"geometry"`
}

// UnmarshalJSON custom Unmarshal function.
// GeometryType is recognized by geometry/type in json.
func (body *Body) UnmarshalJSON(b []byte) error {
	type rawBody struct {
		ID          ID              `json:"id"`
		Name        string          `json:"name, omitempty"`
		GeometryRaw json.RawMessage `json:"geometry"`
	}

	var raw rawBody
	err := json.Unmarshal(b, &raw)
	if err != nil {
		return err
	}
	body.ID = raw.ID
	body.Name = raw.Name

	geometry, err := unmarshalGeometry(raw.GeometryRaw)
	if err != nil {
		return err
	}
	body.Geometry = geometry

	return nil
}
