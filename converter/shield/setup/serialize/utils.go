package serialize

import (
	"fmt"
	"strconv"
)

func floatToFixedWidthString(n float64, w int) string {
	wStr := strconv.Itoa(w)
	s := fmt.Sprintf("%"+wStr+"."+wStr+"f", n)
	return s[:w]
}
