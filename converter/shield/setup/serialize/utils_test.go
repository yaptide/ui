package serialize

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFloatToFixedWidthString(t *testing.T) {
	for _, tc := range []struct {
		Number   float64
		Width    int
		Expected string
	}{
		{1.2, 3, "1.2"},
		{1.2, 2, "1."},
		{10.2, 10, "10.2000000"},
		{12345.12345, 10, "12345.1234"},
		{0.123456789, 10, "0.12345678"},
		{1234567890, 10, "1234567890"},
		{0.1234567891, 10, "0.12345678"},
	} {
		assert.Equal(t, tc.Expected, floatToFixedWidthString(tc.Number, tc.Width))
	}

}
