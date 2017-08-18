package material

import "encoding/json"

// Voxel TODO
type Voxel struct {
}

// MarshalJSON json.Marshaller implementation.
func (v Voxel) MarshalJSON() ([]byte, error) {
	type Alias Voxel
	return json.Marshal(struct {
		materialType
		Alias
	}{
		materialType: voxelType,
		Alias:        (Alias)(v),
	})
}
