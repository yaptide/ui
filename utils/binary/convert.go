// Package binary contain utils usefull to process binary numbers.
package binary

import ()

// ReadNULLTerminatedString conver null terminated string represented by byte slice to go string.
func ReadNULLTerminatedString(input []byte) string {
	if len(input) == 0 {
		return ""
	}
	for index, value := range input {
		if value == byte(0) {
			return string(input[0:index])
		}
	}
	return string(input)
}
