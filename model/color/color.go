// Package color define Color type which contains color value.
package color

// Color hex representation #RRGGBB.
type Color struct {
	R uint8 `json:"r"`
	G uint8 `json:"g"`
	B uint8 `json:"b"`
	A uint8 `json:"a"`
}

// New constructor.
func New(R uint8, G uint8, B uint8, A uint8) Color {
	return Color{R: R, G: G, B: B, A: A}
}

var (
	// White color.
	White = New(0xFF, 0xFF, 0xFF, 0xFF)

	//Gray color.
	Gray = New(0x80, 0x80, 0x80, 0xFF)
)
