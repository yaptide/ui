package body

// Body TODO
type Body struct {
	ID       string   `json:"id"`
	Name     string   `json:"name, omitempty"`
	Geometry Geometry `json:"geometry"`
}

// Geometry TODO
type Geometry interface {
}

// GenericGeometry TODO
type GenericGeometry struct {
	Type string `json:"type"`
}

// SphereGeometry TODO
type SphereGeometry struct {
	GenericGeometry
	Center Point   `json:"center"`
	Radius float64 `json:"radius"`
}

// CuboidGeometry TODO
type CuboidGeometry struct {
	GenericGeometry
	Center Point   `json:"center"`
	Width  float64 `json:"width"`
	Height float64 `json:"height"`
}

// Point TODO
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}
