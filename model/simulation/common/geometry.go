// Package common contains model for base component used in simulation and results model.
package common

// Point represent a point in space.
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

// Vec3DCylindricalInt 3-dimensional vector of integers in cylindrical cordinates.
type Vec3DCylindricalInt struct {
	Radius int64 `json:"radius"`
	Angle  int64 `json:"angle"`
	Z      int64 `json:"z"`
}

// Vec3D represent 3-dimensional vector.
type Vec3D struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

// Vec3DInt represent 3-dimensional vector of integers.
type Vec3DInt struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
	Z int64 `json:"z"`
}

// Range contain min and max value of certain quantity.
type Range struct {
	Min float64 `json:"min"`
	Max float64 `json:"max"`
}
